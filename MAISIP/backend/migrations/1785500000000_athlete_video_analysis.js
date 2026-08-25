exports.shorthands = undefined;

exports.up = (pgm) => {
  // Create sports table
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS sports (
      id SERIAL PRIMARY KEY,
      sport_code VARCHAR(100) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create sport_activities table
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS sport_activities (
      id SERIAL PRIMARY KEY,
      sport_id INTEGER REFERENCES sports(id) ON DELETE CASCADE,
      activity_code VARCHAR(100) NOT NULL,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (sport_id, activity_code)
    );
  `);

  // Create videos table
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS videos (
      id SERIAL PRIMARY KEY,
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      original_filename VARCHAR(255),
      storage_path TEXT,
      duration_seconds NUMERIC,
      mime_type VARCHAR(100),
      file_size_bytes BIGINT,
      sha256_hash VARCHAR(64),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create video_analyses table
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS video_analyses (
      id SERIAL PRIMARY KEY,
      video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
      athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
      sport_code VARCHAR(100) NOT NULL,
      activity_code VARCHAR(100) NOT NULL,
      analyzer_version VARCHAR(100),
      scoring_version VARCHAR(100),
      analysis_status VARCHAR(50) DEFAULT 'PROCESSING',
      data_quality_score NUMERIC,
      performance_index NUMERIC,
      confidence_score NUMERIC,
      error_info TEXT,
      
      -- JSONB for extensible schemas
      metrics JSONB DEFAULT '{}'::jsonb,
      component_scores JSONB DEFAULT '{}'::jsonb,
      llm_report JSONB DEFAULT '{}'::jsonb,
      
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      
      UNIQUE(video_id, athlete_id, sport_code, activity_code, analyzer_version, scoring_version)
    );
  `);

  // Insert the skipping sport and double under activity as initial seeded data
  pgm.sql(`
    INSERT INTO sports (sport_code, name) 
    VALUES ('SKIPPING', 'Skipping') 
    ON CONFLICT (sport_code) DO NOTHING;
  `);

  pgm.sql(`
    INSERT INTO sport_activities (sport_id, activity_code, name) 
    SELECT id, 'DOUBLE_UNDER', 'Double Under' FROM sports WHERE sport_code = 'SKIPPING'
    ON CONFLICT (sport_id, activity_code) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.sql('DROP TABLE IF EXISTS video_analyses CASCADE');
  pgm.sql('DROP TABLE IF EXISTS videos CASCADE');
  pgm.sql('DROP TABLE IF EXISTS sport_activities CASCADE');
  pgm.sql('DROP TABLE IF EXISTS sports CASCADE');
};
