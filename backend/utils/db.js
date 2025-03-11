import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

<<<<<<< Updated upstream
export default pool;
=======
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to database');
    connection.release();
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
})();

export default pool;
>>>>>>> Stashed changes
