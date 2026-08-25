const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function init() {
  console.log("Connecting to default postgres database...");
  const defaultClient = new Client({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: 'postgres',
    password: process.env.DB_PASSWORD || 'Amey@p4444',
    port: process.env.DB_PORT || 5432,
  });

  try {
    await defaultClient.connect();
    
    // Check if database exists
    const res = await defaultClient.query("SELECT 1 FROM pg_database WHERE datname = 'sports_platform'");
    if (res.rowCount === 0) {
      console.log("Creating sports_platform database...");
      await defaultClient.query('CREATE DATABASE sports_platform');
    } else {
      console.log("Database sports_platform already exists.");
    }
  } catch (err) {
    console.error("Error setting up database:", err);
  } finally {
    await defaultClient.end();
  }

  console.log("Connecting to sports_platform to execute schema...");
  const platformClient = new Client({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: 'sports_platform',
    password: process.env.DB_PASSWORD || 'Amey@p4444',
    port: process.env.DB_PORT || 5432,
  });

  try {
    await platformClient.connect();
    
    // Read schema file
    const schemaSQL = fs.readFileSync(path.join(__dirname, '../schema.sql'), 'utf-8');
    
    console.log("Running schema script...");
    await platformClient.query(schemaSQL);
    console.log("Schema applied successfully.");
  } catch (err) {
    console.error("Error running schema:", err);
  } finally {
    await platformClient.end();
  }
}

init();
