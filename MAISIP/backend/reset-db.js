const { Client } = require('pg');
require('dotenv').config();

async function resetDb() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    await client.connect();
    console.log('Connected. Resetting schema...');
    await client.query('DROP SCHEMA public CASCADE;');
    await client.query('CREATE SCHEMA public;');
    console.log('Schema reset successfully.');
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await client.end();
  }
}

resetDb();
