import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',             // Replace with your MySQL user
  password: '',     // Replace with your MySQL password
  database: 'gym_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
