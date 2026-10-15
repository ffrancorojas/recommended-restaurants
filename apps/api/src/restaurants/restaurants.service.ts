import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import ExcelJS from 'exceljs';
import { PRICE_RANGES, RESTAURANT_RATINGS } from '@restaurantes/contracts';
import type { Restaurant, RestaurantFormData, RestaurantPage, RestaurantType, User } from '@restaurantes/contracts';
import { DATABASE } from '../database/database.module';
import { CreateRestaurantDto, ListRestaurantsDto, UpdateRestaurantDto } from './restaurant.dto';

const columns = `id, name, locality, dishes, price, type, notes, visited, opinion, rating,
  recommended_by AS "recommendedBy", created_at AS "createdAt"`;
type RestaurantRow = Omit<Restaurant, 'createdAt'> & { createdAt: Date };
const serialize = (row: RestaurantRow): Restaurant => ({ ...row, createdAt: row.createdAt.toISOString() });
const fields: Record<keyof RestaurantFormData, string> = {
  name: 'name', locality: 'locality', dishes: 'dishes', price: 'price',
  type: 'type', notes: 'notes', recommendedBy: 'recommended_by',
  visited: 'visited', opinion: 'opinion', rating: 'rating',
};
const pattern = (text: string) => `%${text.replace(/[\\%_]/g, '\\$&')}%`;

@Injectable()
export class RestaurantsService {
  constructor(@Inject(DATABASE) private readonly db: Pool) {}

  async exportExcel(user: User): Promise<Buffer> {
    const result = await this.db.query<RestaurantRow>(
      `SELECT ${columns} FROM restaurants WHERE user_id = $1
       ORDER BY created_at DESC, id DESC`,
      [user.id],
    );

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Restaurantes recomendados';
    workbook.created = new Date();

    const userSheet = workbook.addWorksheet('Usuario');
    userSheet.columns = [
      { header: 'ID', key: 'id', width: 38 },
      { header: 'Nombre', key: 'name', width: 28 },
      { header: 'Correo electrónico', key: 'email', width: 36 },
      { header: 'Alias', key: 'nick', width: 24 },
      { header: 'Fecha de creación', key: 'createdAt', width: 22 },
    ];
    userSheet.addRow({
      id: user.id,
      name: user.name,
      email: user.email,
      nick: user.nick ?? '',
      createdAt: new Date(user.createdAt),
    });
    userSheet.getColumn('createdAt').numFmt = 'dd/mm/yyyy hh:mm';

    const restaurantSheet = workbook.addWorksheet('Restaurantes');
    restaurantSheet.columns = [
      { header: 'ID', key: 'id', width: 18 },
      { header: 'Nombre', key: 'name', width: 30 },
      { header: 'Localidad', key: 'locality', width: 24 },
      { header: 'Platos recomendados', key: 'dishes', width: 40 },
      { header: 'Precio', key: 'price', width: 20 },
      { header: 'Tipos de comida', key: 'type', width: 30 },
      { header: 'Observaciones', key: 'notes', width: 44 },
      { header: 'Recomendado por', key: 'recommendedBy', width: 24 },
      { header: 'Visitado', key: 'visited', width: 12 },
      { header: 'Opinión', key: 'opinion', width: 44 },
      { header: 'Valoración', key: 'rating', width: 20 },
      { header: 'Fecha de creación', key: 'createdAt', width: 22 },
    ];

    for (const restaurant of result.rows.map(serialize)) {
      restaurantSheet.addRow({
        ...restaurant,
        price: PRICE_RANGES.find(({ value }) => value === restaurant.price)?.label ?? '',
        type: restaurant.type.join(', '),
        visited: restaurant.visited ? 'Sí' : 'No',
        rating: RESTAURANT_RATINGS.find(({ value }) => value === restaurant.rating)?.label ?? '',
        createdAt: new Date(restaurant.createdAt),
      });
    }

    for (const sheet of [userSheet, restaurantSheet]) {
      sheet.getRow(1).font = { bold: true };
      sheet.views = [{ state: 'frozen', ySplit: 1 }];
      sheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: sheet.columnCount },
      };
    }
    restaurantSheet.getColumn('createdAt').numFmt = 'dd/mm/yyyy hh:mm';

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  async list(userId: string, filters: ListRestaurantsDto): Promise<RestaurantPage> {
    const where = `user_id = $1
       AND concat_ws(' ', name, locality, dishes, notes, recommended_by) ILIKE $2
       AND locality ILIKE $3 AND ($4 = '' OR price = $4)
       AND (cardinality($5::text[]) = 0 OR type && $5::text[])
       AND (NOT $6::boolean OR visited)`;
    const filterValues = [
      userId,
      pattern(filters.query),
      pattern(filters.locality),
      filters.price,
      filters.types,
      filters.visitedOnly,
    ];
    const count = await this.db.query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM restaurants WHERE ${where}`,
      filterValues,
    );
    const total = Number(count.rows[0]?.total ?? 0);
    const lastPageOffset = Math.max(0, Math.ceil(total / filters.limit) - 1) * filters.limit;
    const offset = Math.min(filters.offset, lastPageOffset);
    const result = await this.db.query<RestaurantRow>(
      `SELECT ${columns} FROM restaurants WHERE ${where}
       ORDER BY created_at DESC, id DESC LIMIT $7 OFFSET $8`,
      [...filterValues, filters.limit, offset],
    );
    return { items: result.rows.map(serialize), limit: filters.limit, offset, total };
  }

  async listTypes(userId: string): Promise<RestaurantType[]> {
    const result = await this.db.query<{ type: RestaurantType }>(
      `SELECT DISTINCT restaurant_type AS type
       FROM restaurants
       CROSS JOIN LATERAL unnest(restaurants.type) AS restaurant_type
       WHERE user_id = $1
       ORDER BY restaurant_type`,
      [userId],
    );
    return result.rows.map(({ type }) => type);
  }

  async listRecommenders(userId: string): Promise<string[]> {
    const result = await this.db.query<{ recommender: string }>(
      `SELECT MIN(BTRIM(recommended_by)) AS recommender
       FROM restaurants
       WHERE user_id = $1 AND BTRIM(recommended_by) <> ''
       GROUP BY LOWER(BTRIM(recommended_by))
       ORDER BY LOWER(MIN(BTRIM(recommended_by))), MIN(BTRIM(recommended_by))`,
      [userId],
    );
    return result.rows.map(({ recommender }) => recommender);
  }

  async get(userId: string, id: string): Promise<Restaurant> {
    const result = await this.db.query<RestaurantRow>(
      `SELECT ${columns} FROM restaurants WHERE id = $1 AND user_id = $2`, [id, userId],
    );
    if (!result.rows[0]) throw new NotFoundException('Restaurante no encontrado.');
    return serialize(result.rows[0]);
  }

  async create(userId: string, data: CreateRestaurantDto): Promise<Restaurant> {
    const result = await this.db.query<RestaurantRow>(
      `INSERT INTO restaurants (user_id, name, locality, dishes, price, type, notes, recommended_by, visited, opinion, rating)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING ${columns}`,
      [userId, data.name, data.locality, data.dishes, data.price, data.type, data.notes, data.recommendedBy, data.visited, data.opinion, data.rating],
    );
    return serialize(result.rows[0]);
  }

  async update(userId: string, id: string, data: UpdateRestaurantDto): Promise<Restaurant> {
    const keys = (Object.keys(fields) as (keyof RestaurantFormData)[]).filter((key) => data[key] !== undefined);
    if (!keys.length) return this.get(userId, id);
    const assignments = keys.map((key, index) => `${fields[key]} = $${index + 3}`);
    const result = await this.db.query<RestaurantRow>(
      `UPDATE restaurants SET ${assignments.join(', ')}, updated_at = now()
       WHERE id = $1 AND user_id = $2 RETURNING ${columns}`,
      [id, userId, ...keys.map((key) => data[key])],
    );
    if (!result.rows[0]) throw new NotFoundException('Restaurante no encontrado.');
    return serialize(result.rows[0]);
  }

  async remove(userId: string, id: string): Promise<void> {
    const result = await this.db.query('DELETE FROM restaurants WHERE id = $1 AND user_id = $2', [id, userId]);
    if (!result.rowCount) throw new NotFoundException('Restaurante no encontrado.');
  }
}
