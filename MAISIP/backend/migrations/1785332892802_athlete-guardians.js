exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE athlete_guardians (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
      guardian_name VARCHAR(200) NOT NULL,
      relation VARCHAR(50) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      email VARCHAR(255),
      consent_given_at TIMESTAMPTZ,
      consent_document_key TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TABLE athlete_guardians;`);
};
