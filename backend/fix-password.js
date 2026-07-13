require('dotenv').config();
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

async function resetAdminPassword() {
  try {
    const newHash = await bcrypt.hash('Admin@123', 12);
    pool.query(
      'UPDATE users SET password_hash = ? WHERE employee_id = "ADMIN001"',
      [newHash],
      (err, results) => {
        if (err) {
          console.error('Database Error:', err.message);
          process.exit(1);
        }
        console.log('✅ SUCCESS: Admin password has been securely reset to Admin@123');
        process.exit(0);
      }
    );
  } catch (err) {
    console.error('Hashing Error:', err);
    process.exit(1);
  }
}

resetAdminPassword();