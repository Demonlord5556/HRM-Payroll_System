const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedAdmin() {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hr_payroll_system',
      port: parseInt(process.env.DB_PORT) || 3306,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0
    });

    // Check existing roles
    const [roles] = await pool.query('SELECT * FROM roles');
    console.log('Existing roles:', JSON.stringify(roles, null, 2));

    // Ensure SUPER_ADMIN role exists
    await pool.query(
      'INSERT INTO roles (id, name, description) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)',
      ['role_super_admin', 'SUPER_ADMIN', 'Full system access with all administrative privileges']
    );
    console.log('SUPER_ADMIN role ensured.');

    // Insert admin user with plain text password (SUPER_ADMIN bypasses bcrypt)
    await pool.query(
      'INSERT INTO users (id, employee_id, email, password_hash, role_id, is_temp_password, must_change_password, is_active) VALUES (?, ?, ?, ?, ?, 0, 0, 1) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)',
      ['user_admin', 'ADMIN001', 'admin@hrpayroll.com', 'Admin@123', 'role_super_admin']
    );
    console.log('Admin user inserted/updated successfully!');

    // Verify
    const [users] = await pool.query('SELECT id, employee_id, email, LEFT(password_hash, 30) as pwd_prefix FROM users WHERE id = ?', ['user_admin']);
    console.log('Verified user:', JSON.stringify(users, null, 2));

    console.log('\n========================================');
    console.log('  Admin Login Credentials:');
    console.log('    Employee ID: ADMIN001');
    console.log('    Email: admin@hrpayroll.com');
    console.log('    Password: Admin@123');
    console.log('========================================\n');

    await pool.end();
  } catch (e) {
    console.error('Error:', e.message);
  }
}

seedAdmin();