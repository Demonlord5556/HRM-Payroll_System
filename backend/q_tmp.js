const pool = require('./config/database');
(async () => {
  const [u] = await pool.query(
    "SELECT u.id,u.employee_id,u.email,u.role_id,r.name as role,u.must_change_password,u.is_temp_password, e.id as emp_id, e.first_name, e.last_name FROM users u JOIN roles r ON u.role_id=r.id LEFT JOIN employees e ON e.user_id=u.id WHERE r.name='EMPLOYEE' LIMIT 5"
  );
  console.log(JSON.stringify(u, null, 2));
  process.exit(0);
})();
