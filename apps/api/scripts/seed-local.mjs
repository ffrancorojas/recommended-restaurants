import pg from 'pg';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL no está configurada.');

const hostname = new URL(databaseUrl).hostname;
if (!['localhost', '127.0.0.1', '[::1]'].includes(hostname)) {
  throw new Error('Los datos mock solo se pueden cargar en una base de datos local.');
}

const userId = '00000000-0000-4000-8000-000000000001';
const mockRestaurants = [
  {
    name: 'La Esquina Verde', locality: 'Madrid', dishes: 'Tortilla, croquetas de setas',
    price: '20to40', type: ['Tapas', 'Vegetariano'], notes: 'Terraza tranquila; reservar para cenar.',
    recommendedBy: 'Alex', visited: true, opinion: 'Las croquetas estaban buenísimas.', rating: 'loved',
  },
  {
    name: 'Nori y Mar', locality: 'Madrid', dishes: 'Nigiri de salmón, ramen',
    price: '40to60', type: ['Japonés', 'Sushi'], notes: 'Menú del día entre semana.',
    recommendedBy: 'Lucía', visited: true, opinion: 'Buen producto y servicio rápido.', rating: 'liked',
  },
  {
    name: 'Forno Piccolo', locality: 'Alcalá de Henares', dishes: 'Pizza de burrata, tiramisú',
    price: '20to40', type: ['Italiano'], notes: 'La masa necesita unas horas; mejor reservar.',
    recommendedBy: 'Marcos', visited: false, opinion: '', rating: '',
  },
  {
    name: 'Brasa del Barrio', locality: 'Madrid', dishes: 'Presa ibérica, patatas asadas',
    price: '60to80', type: ['Carne'], notes: 'Para una comida larga de fin de semana.',
    recommendedBy: 'Ana', visited: false, opinion: '', rating: '',
  },
  {
    name: 'Casa Limón', locality: 'Getafe', dishes: 'Tacos al pastor, guacamole',
    price: '20to40', type: ['Mexicano'], notes: 'Opciones vegetarianas disponibles.',
    recommendedBy: 'Alex', visited: true, opinion: 'Los tacos picantes son los mejores.', rating: 'liked',
  },
  {
    name: 'Marea Baja', locality: 'Madrid', dishes: 'Arroz meloso, calamares',
    price: '40to60', type: ['Pescado', 'Mediterráneo'], notes: 'Restaurante ficticio para pruebas locales.',
    recommendedBy: 'Lucía', visited: false, opinion: '', rating: '',
  },
];

const pool = new pg.Pool({ connectionString: databaseUrl, connectionTimeoutMillis: 5000 });
const client = await pool.connect();

try {
  await client.query('BEGIN');
  await client.query(
    `INSERT INTO users (id, firebase_uid, email, name, email_verified_at)
     VALUES ($1, 'local-development', 'local@localhost.invalid', 'Usuario local', now())
     ON CONFLICT (id) DO NOTHING`,
    [userId],
  );
  await client.query(`CREATE TABLE IF NOT EXISTS local_dev_seed_state (
    seed_name text PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
  )`);
  const marker = await client.query(
    `INSERT INTO local_dev_seed_state (seed_name) VALUES ('restaurants-v1')
     ON CONFLICT DO NOTHING RETURNING seed_name`,
  );
  if (marker.rowCount) {
    const existing = await client.query('SELECT 1 FROM restaurants WHERE user_id = $1 LIMIT 1', [userId]);
    if (!existing.rowCount) {
      for (const restaurant of mockRestaurants) {
        await client.query(
          `INSERT INTO restaurants (
            user_id, name, locality, dishes, price, type, notes, recommended_by, visited, opinion, rating
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            userId, restaurant.name, restaurant.locality, restaurant.dishes, restaurant.price,
            restaurant.type, restaurant.notes, restaurant.recommendedBy, restaurant.visited,
            restaurant.opinion, restaurant.rating,
          ],
        );
      }
      console.log(`Se cargaron ${mockRestaurants.length} restaurantes de ejemplo locales.`);
    } else {
      console.log('La base local ya contiene restaurantes; se conservaron sus datos.');
    }
  } else {
    console.log('Los datos de ejemplo locales ya estaban inicializados.');
  }
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
  await pool.end();
}
