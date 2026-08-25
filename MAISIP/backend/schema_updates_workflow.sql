CREATE TABLE IF NOT EXISTS achievement_status_history (
    id SERIAL PRIMARY KEY,
    achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by_role VARCHAR(100),
    changed_by_id INTEGER,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure verification_status is available
ALTER TABLE achievements ALTER COLUMN verification_status SET DEFAULT 'Draft';
