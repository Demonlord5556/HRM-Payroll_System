const bcrypt = require('bcryptjs');
const pool = require('./config/database');
(async () => {
  const hash = await bcrypt.hash('Temp@12345', 12);
  await pool.query(
    "UPDATE users SET password_hash=?, is_temp_password=1, must_change_password=1 WHERE employee_id='EMP000001'",
    [hash]
  );
  console.log('password set');
  process.exit(0);
})();
