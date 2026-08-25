CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    athlete_id INTEGER REFERENCES athletes(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    achievement_date DATE,
    age_at_achievement INTEGER,
    certificates_upload VARCHAR(255),
    
    -- Submitter info
    submitter_role VARCHAR(100) DEFAULT 'Athlete',
    submitter_name VARCHAR(255),
    organization_name VARCHAR(255),
    institute_id VARCHAR(100),
    
    -- Verification info
    verification_status VARCHAR(50) DEFAULT 'Pending',
    verified_by INTEGER,
    verified_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    -- New fields for 7-step wizard
    competition_name VARCHAR(255),
    competition_level VARCHAR(100),
    result_rank VARCHAR(100),
    performance_metric VARCHAR(255),
    visibility_level VARCHAR(50) DEFAULT 'Public',
    evidence_url TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
