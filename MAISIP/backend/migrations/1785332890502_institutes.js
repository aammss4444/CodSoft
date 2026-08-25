exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE institutes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id),
      name VARCHAR(200) NOT NULL,
      registration_id VARCHAR(50) UNIQUE,
      address TEXT,
      city VARCHAR(100),
      state VARCHAR(100),
      identity_status identity_status NOT NULL DEFAULT 'pending',
      identity_verified_by UUID REFERENCES users(id),
      identity_verified_at TIMESTAMPTZ,
      identity_rejection_reason TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX idx_institutes_status ON institutes(identity_status);
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TABLE institutes;`);
};
