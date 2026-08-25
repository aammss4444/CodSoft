const fs = require('fs');
const path = require('path');
const pool = require('./db/db');

async function runSchemaUpdates() {
    console.log('Connecting to database...');
    let client;
    try {
        console.log('Running verification schema updates...');
        client = await pool.getClient();
        
        // Run verification schema
        const verificationSqlPath = path.join(__dirname, 'schema_updates_verification.sql');
        const verificationSql = fs.readFileSync(verificationSqlPath, 'utf8');
        await client.query(verificationSql);
        console.log('Verification table schema applied successfully.');
        
    } catch (err) {
        console.error('Error running schema updates:', err);
    } finally {
        if (client) client.release();
        // Since pool in this codebase doesn't have .end(), or we just process exit
        console.log('Database connection closed.');
        process.exit(0);
    }
}

runSchemaUpdates();
