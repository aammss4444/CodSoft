const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function checkSchema() {
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: 'sports_platform',
    password: process.env.DB_PASSWORD || 'Amey@p4444',
    port: process.env.DB_PORT || 5432,
  });

  try {
    await client.connect();
    
    // Check users table
    const usersRes = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users';
    `);
    console.log("USERS TABLE SCHEMA:");
    console.table(usersRes.rows);

    // Check athletes table
    const athletesRes = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'athletes';
    `);
    console.log("ATHLETES TABLE SCHEMA:");
    console.table(athletesRes.rows);

    // Check institutes table
    const institutesRes = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'institutes';
    `);
    console.log("INSTITUTES TABLE SCHEMA:");
    console.table(institutesRes.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

checkSchema();
