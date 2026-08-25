exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE audit_log (
      id BIGSERIAL PRIMARY KEY,
      entity_type VARCHAR(50) NOT NULL,
      entity_id UUID NOT NULL,
      action VARCHAR(50) NOT NULL,
      actor_id UUID REFERENCES users(id),
      diff JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TABLE audit_log;`);
};
