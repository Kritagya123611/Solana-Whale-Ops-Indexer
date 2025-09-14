import { Pool } from 'pg';
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'whale_ops',
    password: 'password',
    port: 5432,
});
export default pool;
