import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'child_process';
import supertest from 'supertest';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let container;
let app;
let db;
let api;

// State to share between tests
let instituteAToken;
let instituteBToken;
let systemAdminToken;
let instituteA_AthleteId;
let draftAchievementId;

beforeAll(async () => {
  container = await new PostgreSqlContainer("postgres:15-alpine").start();
  
  process.env.DB_HOST = container.getHost();
  process.env.DB_PORT = container.getPort();
  process.env.DB_USER = container.getUsername();
  process.env.DB_PASSWORD = container.getPassword();
  process.env.DB_NAME = container.getDatabase();
  process.env.JWT_SECRET = 'testsecret';
  process.env.JWT_REFRESH_SECRET = 'testrefreshsecret';
  
  execSync('npx node-pg-migrate up', { 
    env: { ...process.env, DATABASE_URL: container.getConnectionUri() },
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit'
  });

  // Dynamically import db and server AFTER setting process.env so they connect to Testcontainers
  const dbModule = await import('../db/db.js');
  db = dbModule.default || dbModule;
  
  const serverModule = await import('../server.js');
  app = serverModule.default || serverModule;
  
  api = supertest(app);

  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    
    // Create Users
    const uInstA = await client.query(`INSERT INTO users (email, password_hash, role) VALUES ('insta@test.com', 'hash', 'institute') RETURNING id`);
    const uInstB = await client.query(`INSERT INTO users (email, password_hash, role) VALUES ('instb@test.com', 'hash', 'institute') RETURNING id`);
    const uAdmin = await client.query(`INSERT INTO users (email, password_hash, role) VALUES ('admin@test.com', 'hash', 'system_admin') RETURNING id`);
    
    // Create Institutes
    await client.query(`INSERT INTO institutes (user_id, name, registration_id, identity_status) VALUES ($1, 'Inst A', 'REG-A', 'verified')`, [uInstA.rows[0].id]);
    await client.query(`INSERT INTO institutes (user_id, name, registration_id, identity_status) VALUES ($1, 'Inst B', 'REG-B', 'verified')`, [uInstB.rows[0].id]);
    
    // Create an Athlete owned by Inst A
    const uAth = await client.query(`INSERT INTO users (email, password_hash, role) VALUES ('ath@test.com', 'hash', 'athlete') RETURNING id`);
    const athInstRes = await client.query(`SELECT id FROM institutes WHERE user_id = $1`, [uInstA.rows[0].id]);
    const instA_Id = athInstRes.rows[0].id;
    
    const ath = await client.query(`
      INSERT INTO athletes (user_id, full_name, primary_sport, identity_status, current_institute_id) 
      VALUES ($1, 'Test Athlete', 'Archery', 'verified', $2) RETURNING id
    `, [uAth.rows[0].id, instA_Id]);
    instituteA_AthleteId = ath.rows[0].id;
    
    // Create Draft Achievement
    const ach = await client.query(`
      INSERT INTO achievements (athlete_id, category, subtype, title, level, achievement_date, created_by, verification_status)
      VALUES ($1, 'medal', 'Gold', 'Test Medal', 'National', '2023-01-01', $2, 'draft') RETURNING id
    `, [instituteA_AthleteId, uInstA.rows[0].id]);
    draftAchievementId = ach.rows[0].id;

    await client.query('COMMIT');

    // Generate tokens manually using jsonwebtoken for testing
    instituteAToken = jwt.sign({ id: uInstA.rows[0].id, role: 'institute', instituteId: instA_Id }, process.env.JWT_SECRET);
    
    const athInstBRes = await client.query(`SELECT id FROM institutes WHERE user_id = $1`, [uInstB.rows[0].id]);
    instituteBToken = jwt.sign({ id: uInstB.rows[0].id, role: 'institute', instituteId: athInstBRes.rows[0].id }, process.env.JWT_SECRET);
    
    systemAdminToken = jwt.sign({ id: uAdmin.rows[0].id, role: 'system_admin' }, process.env.JWT_SECRET);

  } finally {
    client.release();
  }
}, 60000);

afterAll(async () => {
  if (db && db.pool) {
    await db.pool.end();
  }
  if (container) {
    await container.stop();
  }
});

describe('Integration Tests', () => {

  it('RBAC: Institute B cannot read Institute A athlete', async () => {
    const res = await api
      .get(`/api/institutes/me/athletes/${instituteA_AthleteId}`)
      .set('Authorization', `Bearer ${instituteBToken}`);
    
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('RBAC: Institute A can read their own athlete', async () => {
    const res = await api
      .get(`/api/institutes/me/athletes/${instituteA_AthleteId}`)
      .set('Authorization', `Bearer ${instituteAToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('409 Conflict: Verified achievement rejects PATCH modifications', async () => {
    const verifyRes = await api
      .put(`/api/verification/achievements/${draftAchievementId}/status`)
      .set('Authorization', `Bearer ${systemAdminToken}`)
      .send({ verification_status: 'verified' });
      
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);

    const patchRes = await api
      .patch(`/api/institutes/me/athletes/${instituteA_AthleteId}/achievements/${draftAchievementId}/base`)
      .set('Authorization', `Bearer ${instituteAToken}`)
      .send({ title: 'Hacked Title' });
    
    expect(patchRes.status).toBe(409);
    expect(patchRes.body.message).toMatch(/cannot be modified/i);
  });

  it('QR ID is generated safely and unpredictably on verification', async () => {
    const client = await db.getClient();
    let qrIds = [];
    try {
      await client.query('BEGIN');
      
      for (let i = 0; i < 5; i++) {
        const ach = await client.query(`
          INSERT INTO achievements (athlete_id, category, subtype, title, level, achievement_date, created_by, verification_status)
          VALUES ($1, 'medal', 'Gold', 'Test Medal ${i}', 'National', '2023-01-01', $1, 'draft') RETURNING id
        `, [instituteA_AthleteId]);
        
        const res = await api
          .put(`/api/verification/achievements/${ach.rows[0].id}/status`)
          .set('Authorization', `Bearer ${systemAdminToken}`)
          .send({ verification_status: 'verified' });
          
        expect(res.status).toBe(200);
        expect(res.body.qr_id).toBeDefined();
        qrIds.push(res.body.qr_id);
      }
      
      await client.query('ROLLBACK');
    } finally {
      client.release();
    }

    const uniqueQRs = new Set(qrIds);
    expect(uniqueQRs.size).toBe(5);

    const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    for (const qr of qrIds) {
      expect(qr).toMatch(uuidV4Regex);
    }
  });

});
