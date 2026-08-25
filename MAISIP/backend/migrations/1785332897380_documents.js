exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE documents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
      document_type VARCHAR(50) NOT NULL,
      original_filename VARCHAR(255) NOT NULL,
      storage_key TEXT NOT NULL,
      mime_type VARCHAR(100) NOT NULL,
      file_size_bytes INT NOT NULL,
      sha256_hash CHAR(64) NOT NULL,
      uploaded_by UUID NOT NULL REFERENCES users(id),
      uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      verification_status verification_status NOT NULL DEFAULT 'submitted',
      replaced_at TIMESTAMPTZ,
      CONSTRAINT chk_max_file_size CHECK (file_size_bytes <= 10 * 1024 * 1024)
    );
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TABLE documents;`);
};
