const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedRoles() {
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

    // Seed all missing roles from schema
    const roles = [
      ['role_super_admin', 'SUPER_ADMIN', 'Full system access with all administrative privileges'],
      ['role_hr_admin', 'HR_ADMIN', 'Human Resources administrator with employee management access'],
      ['role_manager', 'MANAGER', 'Department manager with team management access'],
      ['role_employee', 'EMPLOYEE', 'Regular employee with self-service access']
    ];

    for (const [id, name, description] of roles) {
      await pool.query(
        'INSERT INTO roles (id, name, description) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description)',
        [id, name, description]
      );
    }

    const [allRoles] = await pool.query('SELECT * FROM roles');
    console.log('All roles now seeded:', JSON.stringify(allRoles, null, 2));
    console.log('\nRoles seeded successfully!');

    await pool.end();
  } catch (e) {
    console.error('Error:', e.message);
  }
}

seedRoles();