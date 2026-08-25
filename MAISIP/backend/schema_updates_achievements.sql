ALTER TABLE achievements
ADD COLUMN competition_name VARCHAR(255),
ADD COLUMN competition_level VARCHAR(100),
ADD COLUMN result_rank VARCHAR(100),
ADD COLUMN performance_metric VARCHAR(255),
ADD COLUMN visibility_level VARCHAR(50) DEFAULT 'Public',
ADD COLUMN evidence_url TEXT;
