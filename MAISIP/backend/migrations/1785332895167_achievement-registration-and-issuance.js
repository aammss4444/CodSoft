exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE achievement_registrations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      achievement_id UUID NOT NULL UNIQUE REFERENCES achievements(id) ON DELETE CASCADE,
      submitted_by_role submitter_role NOT NULL,
      submitter_name VARCHAR(200) NOT NULL,
      submitted_under VARCHAR(200) NOT NULL,
      entry_date TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE achievement_issuances (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      registration_id UUID NOT NULL UNIQUE REFERENCES achievement_registrations(id) ON DELETE CASCADE,
      issued_by VARCHAR(200) NOT NULL,
      reference_number VARCHAR(100),
      issued_date DATE,
      status verification_status NOT NULL DEFAULT 'submitted'
    );
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP TABLE achievement_issuances;
    DROP TABLE achievement_registrations;
  `);
};
