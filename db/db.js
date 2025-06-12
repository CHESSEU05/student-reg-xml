const mysql = require('mysql2');

// Create a connection pool for efficient reuse
const pool = mysql.createPool({
  host: 'localhost',       // your MySQL host
  user: 'root',   // replace with your MySQL username
  password: '', // replace with your MySQL password
  database: 'db_student_registration_sys',  // the database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ MySQL connection error:', err);
  } else {
    console.log('✅ Connected to MySQL database');
    connection.release();
  }
});

module.exports = pool.promise(); // use promise-based pool for modern async/await support
