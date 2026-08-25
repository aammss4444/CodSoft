CREATE TABLE IF NOT EXISTS achievement_verifications (
    id SERIAL PRIMARY KEY,
    achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
    verifier_id INTEGER,
    verifier_name VARCHAR(255),
    verifier_user_id VARCHAR(100),
    designation VARCHAR(255),
    organization VARCHAR(255),
    verification_method VARCHAR(100),
    checklist JSONB,
    remarks TEXT,
    digital_signature VARCHAR(255),
    status_decision VARCHAR(50),
    locked BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
