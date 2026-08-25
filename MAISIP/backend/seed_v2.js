const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'sports_platform',
  password: process.env.DB_PASSWORD || 'your_db_password',
  port: process.env.DB_PORT || 5432,
});

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Clean existing data to avoid conflicts if run multiple times
    await client.query('TRUNCATE TABLE users CASCADE');

    // Users: 1 system admin, 1 institute, 1 athlete
    const adminPassword = await bcrypt.hash('admin123', 12);
    const institutePassword = await bcrypt.hash('institute123', 12);
    const athletePassword = await bcrypt.hash('athlete123', 12);

    await client.query(`
      INSERT INTO users (username, email, password_hash, role) 
      VALUES ('admin', 'admin@example.com', $1, 'system_admin')
    `, [adminPassword]);

    const instUserRes = await client.query(`
      INSERT INTO users (username, email, password_hash, role) 
      VALUES ('institute_admin', 'institute@example.com', $1, 'institute') RETURNING id
    `, [institutePassword]);
    const instUserId = instUserRes.rows[0].id;

    const athUserRes = await client.query(`
      INSERT INTO users (username, email, password_hash, role) 
      VALUES ('athlete_john', 'athlete@example.com', $1, 'athlete') RETURNING id
    `, [athletePassword]);
    const athUserId = athUserRes.rows[0].id;

    // Institute
    const instRes = await client.query(`
      INSERT INTO institutes (user_id, name, registration_id, address, city, state, identity_status)
      VALUES ($1, 'National Sports Academy', 'NSA-123', '123 Stadium Road', 'Mumbai', 'Maharashtra', 'verified') RETURNING id
    `, [instUserId]);
    const instId = instRes.rows[0].id;

    // Athlete (Minor)
    const athRes = await client.query(`
      INSERT INTO athletes (user_id, mai_id, full_name, date_of_birth, gender, primary_sport, playing_position, age_category, current_institute_id, identity_status)
      VALUES ($1, 'MAI-1001', 'John Doe', '2010-05-15', 'Male', 'Football', 'Striker', 'U-17', $2, 'verified') RETURNING id
    `, [athUserId, instId]);
    const athId = athRes.rows[0].id;

    // Guardian
    await client.query(`
      INSERT INTO athlete_guardians (athlete_id, guardian_name, relation, phone, email, consent_given_at)
      VALUES ($1, 'Jane Doe', 'Mother', '+919876543210', 'jane.doe@example.com', now())
    `, [athId]);

    // Achievements (1 draft, 1 submitted, 2 verified)
    const ach1 = await client.query(`
      INSERT INTO achievements (athlete_id, category, subtype, title, level, achievement_date, is_team_achievement, verification_status, created_by, current_step)
      VALUES ($1, 'medal', 'Gold', 'National U-17 Championship', 'National', '2023-01-10', true, 'draft', $2, 2) RETURNING id
    `, [athId, athUserId]);

    const ach2 = await client.query(`
      INSERT INTO achievements (athlete_id, category, subtype, title, level, achievement_date, is_team_achievement, verification_status, created_by, current_step)
      VALUES ($1, 'certificate', 'Participation', 'State Camp', 'State', '2023-05-20', false, 'submitted', $2, 7) RETURNING id
    `, [athId, athUserId]);

    const ach3 = await client.query(`
      INSERT INTO achievements (athlete_id, category, subtype, title, level, achievement_date, is_team_achievement, verification_status, created_by, current_step, qr_id, locked)
      VALUES ($1, 'ranking', 'Top 10', 'National Ranking Tournament', 'National', '2023-10-15', false, 'verified', $2, 7, gen_random_uuid(), true) RETURNING id
    `, [athId, athUserId]);

    const ach4 = await client.query(`
      INSERT INTO achievements (athlete_id, category, subtype, title, level, achievement_date, is_team_achievement, verification_status, created_by, current_step, qr_id, locked)
      VALUES ($1, 'personal_best', '100m Dash', 'Regional Meet', 'Regional', '2024-02-10', false, 'verified', $2, 7, gen_random_uuid(), true) RETURNING id
    `, [athId, athUserId]);

    // Seed registrations, issuances, competitions, results for ach3 and ach4 to show full tree in mindmap
    for (let id of [ach3.rows[0].id, ach4.rows[0].id]) {
      const regRes = await client.query(`
        INSERT INTO achievement_registrations (achievement_id, submitted_by_role, submitter_name, submitted_under)
        VALUES ($1, 'school', 'National Sports Academy', 'National Sports Academy') RETURNING id
      `, [id]);
      
      await client.query(`
        INSERT INTO achievement_issuances (registration_id, issued_by, reference_number, issued_date)
        VALUES ($1, 'Football Federation', 'REF-001', '2023-10-20')
      `, [regRes.rows[0].id]);

      await client.query(`
        INSERT INTO competition_events (achievement_id, name, organized_by, venue_name, city, district, state, country, level, format, age_group, start_date, end_date)
        VALUES ($1, 'Tournament', 'Federation', 'Stadium', 'Delhi', 'New Delhi', 'Delhi', 'India', 'National', 'Knockout', 'U-17', '2023-10-10', '2023-10-15')
      `, [id]);

      await client.query(`
        INSERT INTO result_performances (achievement_id, result_type, final_position, total_participants, is_personal_best)
        VALUES ($1, 'Rank', 8, 100, true)
      `, [id]);
    }

    await client.query('COMMIT');
    console.log('Seed completed successfully! Added 1 Institute, 1 Athlete (with guardian), and 4 Achievements.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
