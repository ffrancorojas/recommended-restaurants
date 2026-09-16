import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import type { Restaurant, RestaurantFormData, RestaurantPage } from '@restaurantes/contracts';
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

  async list(userId: string, filters: ListRestaurantsDto): Promise<RestaurantPage> {
    const result = await this.db.query<RestaurantRow>(
      `SELECT ${columns} FROM restaurants WHERE user_id = $1
       AND concat_ws(' ', name, locality, dishes, notes, recommended_by) ILIKE $2
       AND locality ILIKE $3 AND price ILIKE $4
       AND (cardinality($5::text[]) = 0 OR type = ANY($5::text[]))
       AND (NOT $8::boolean OR visited)
       ORDER BY created_at DESC, id DESC LIMIT $6 OFFSET $7`,
      [userId, pattern(filters.query), pattern(filters.locality), pattern(filters.price),
        filters.types, filters.limit, filters.offset, filters.visitedOnly],
    );
    return { items: result.rows.map(serialize), limit: filters.limit, offset: filters.offset };
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
