require('dotenv').config();
const app = require('./app');
const { initializeDatabase } = require('./config/database');

const PORT = process.env.PORT || 3000;

initializeDatabase();

app.listen(PORT, () => {
  console.log(`\n Finance Dashboard API running on http://localhost:${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\nQuick start:\n  POST /api/auth/login  { email, password }`);
  console.log(`  GET  /api/health\n`);
});