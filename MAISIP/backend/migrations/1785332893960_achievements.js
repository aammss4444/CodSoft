exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE achievements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
      category achievement_category NOT NULL,
      subtype VARCHAR(100) NOT NULL,
      title VARCHAR(300) NOT NULL,
      level VARCHAR(50) NOT NULL,
      achievement_date DATE NOT NULL,
      age_at_achievement INT,
      is_team_achievement BOOLEAN NOT NULL DEFAULT false,
      short_description TEXT,
      reference_number VARCHAR(100),
      official_url TEXT,
      verification_status verification_status NOT NULL DEFAULT 'draft',
      current_step INT NOT NULL DEFAULT 1,
      verified_by UUID REFERENCES users(id),
      verified_at TIMESTAMPTZ,
      rejection_reason TEXT,
      qr_id UUID UNIQUE,
      locked BOOLEAN NOT NULL DEFAULT false,
      created_by UUID NOT NULL REFERENCES users(id),
      updated_by UUID REFERENCES users(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      deleted_at TIMESTAMPTZ,
      CONSTRAINT chk_no_future_achievement_date CHECK (achievement_date <= CURRENT_DATE)
    );
    CREATE INDEX idx_achievements_athlete ON achievements(athlete_id) WHERE deleted_at IS NULL;
    CREATE INDEX idx_achievements_status ON achievements(verification_status);
    CREATE UNIQUE INDEX idx_achievements_qr ON achievements(qr_id) WHERE qr_id IS NOT NULL;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TABLE achievements;`);
};
