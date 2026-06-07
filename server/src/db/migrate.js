require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./pool');

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  try {
    await pool.query(sql);
    console.log('Migration başarıyla tamamlandı.');
  } catch (err) {
    console.error('Migration hatası:', err.message);
  } finally {
    await pool.end();
  }
}

migrate();
