exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE athletes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id),
      mai_id VARCHAR(30) UNIQUE,
      full_name VARCHAR(200) NOT NULL,
      date_of_birth DATE NOT NULL,
      is_minor BOOLEAN NOT NULL DEFAULT false,
      gender VARCHAR(20) NOT NULL,
      primary_sport VARCHAR(100) NOT NULL,
      playing_position VARCHAR(100),
      age_category VARCHAR(50),
      current_institute_id UUID REFERENCES institutes(id),
      profile_photo_url TEXT,
      identity_status identity_status NOT NULL DEFAULT 'pending',
      identity_verified_by UUID REFERENCES users(id),
      identity_verified_at TIMESTAMPTZ,
      identity_rejection_reason TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      deleted_at TIMESTAMPTZ
    );
    CREATE INDEX idx_athletes_institute ON athletes(current_institute_id);
    CREATE INDEX idx_athletes_status ON athletes(identity_status);
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TABLE athletes;`);
};
