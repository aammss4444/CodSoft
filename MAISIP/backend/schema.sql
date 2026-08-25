-- Table creation script will be run ON the sports_platform database.

CREATE TABLE athletes (
    id SERIAL PRIMARY KEY,
    source VARCHAR(255),
    organization_name VARCHAR(255),
    institute_id VARCHAR(255),
    
    -- Step 2: Basic Info
    first_name VARCHAR(255),
    middle_name VARCHAR(255),
    last_name VARCHAR(255),
    date_of_birth DATE,
    age INTEGER,
    gender VARCHAR(50),
    blood_group VARCHAR(10),
    profile_picture TEXT,
    
    -- Step 3: Identification
    national_id_type VARCHAR(100),
    national_id_number VARCHAR(100),
    birth_certificate_number VARCHAR(100),
    passport_number VARCHAR(100),
    id_document TEXT,

    -- Step 4: Parent Info
    father_name VARCHAR(255),
    mother_name VARCHAR(255),
    guardian_name VARCHAR(255),
    guardian_contact VARCHAR(20),

    -- Step 5: Contact
    mobile_number VARCHAR(20),
    email_address VARCHAR(255),
    address_line_1 TEXT,
    address_line_2 TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    country VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE athlete_education (
    id SERIAL PRIMARY KEY,
    athlete_id INTEGER REFERENCES athletes(id) ON DELETE CASCADE,
    school VARCHAR(255),
    grade VARCHAR(100),
    board VARCHAR(100)
);

CREATE TABLE athlete_sports_profile (
    id SERIAL PRIMARY KEY,
    athlete_id INTEGER REFERENCES athletes(id) ON DELETE CASCADE,
    primary_sport VARCHAR(100),
    secondary_sports TEXT[],
    position VARCHAR(100),
    preferred_hand_foot VARCHAR(50),
    skill_level VARCHAR(100),
    language VARCHAR(100),
    experience INTEGER,
    height_cm NUMERIC,
    weight_kg NUMERIC,
    jersey_size VARCHAR(20),
    disability VARCHAR(100),
    medical_conditions TEXT,
    allergies TEXT
);

CREATE TABLE athlete_coach_details (
    id SERIAL PRIMARY KEY,
    athlete_id INTEGER REFERENCES athletes(id) ON DELETE CASCADE,
    coach_name VARCHAR(255),
    coach_id VARCHAR(100),
    institute_name VARCHAR(255),
    institute_athlete_id VARCHAR(100),
    date_joined DATE
);

CREATE TABLE athlete_achievements (
    id SERIAL PRIMARY KEY,
    athlete_id INTEGER REFERENCES athletes(id) ON DELETE CASCADE,
    previous_competitions TEXT,
    achievement_level VARCHAR(100),
    awards_medals TEXT,
    personal_best_records TEXT,
    certificates_upload TEXT
);

CREATE TABLE athlete_emergency_contacts (
    id SERIAL PRIMARY KEY,
    athlete_id INTEGER REFERENCES athletes(id) ON DELETE CASCADE,
    emergency_contact_name VARCHAR(255),
    relationship VARCHAR(100),
    mobile_number VARCHAR(20),
    alternate_contact_number VARCHAR(20)
);

CREATE TABLE athlete_consents_signatures (
    id SERIAL PRIMARY KEY,
    athlete_id INTEGER REFERENCES athletes(id) ON DELETE CASCADE,
    consent_accurate BOOLEAN,
    consent_data BOOLEAN,
    consent_share BOOLEAN,
    consent_notifications BOOLEAN,
    parent_consent_registration BOOLEAN,
    parent_consent_ai BOOLEAN,
    athlete_signature TEXT,
    parent_signature TEXT,
    institute_signature TEXT,
    registration_date DATE
);

-- ==============================================================
-- INSTITUTE REGISTRATION TABLES
-- ==============================================================

CREATE TABLE institutes (
    id SERIAL PRIMARY KEY,
    organization_type VARCHAR(100),
    org_name VARCHAR(255) NOT NULL,
    reg_number VARCHAR(100),
    year_established INTEGER,
    official_website VARCHAR(255),
    org_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE institute_affiliations (
    id SERIAL PRIMARY KEY,
    institute_id INTEGER REFERENCES institutes(id) ON DELETE CASCADE,
    gov_authority VARCHAR(255),
    recognition_number VARCHAR(100),
    affiliated_board VARCHAR(255),
    validity_approval DATE
);

CREATE TABLE institute_locations (
    id SERIAL PRIMARY KEY,
    institute_id INTEGER REFERENCES institutes(id) ON DELETE CASCADE,
    address_line_1 TEXT,
    address_line_2 TEXT,
    city VARCHAR(100),
    district VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    pincode VARCHAR(20),
    latitude NUMERIC,
    longitude NUMERIC
);

CREATE TABLE institute_contacts (
    id SERIAL PRIMARY KEY,
    institute_id INTEGER REFERENCES institutes(id) ON DELETE CASCADE,
    contact_name VARCHAR(255),
    contact_designation VARCHAR(100),
    contact_mobile VARCHAR(20),
    contact_email VARCHAR(255),
    contact_alt_mobile VARCHAR(20),
    admin_name VARCHAR(255),
    admin_designation VARCHAR(100),
    admin_mobile VARCHAR(20),
    admin_email VARCHAR(255),
    admin_id_type VARCHAR(100),
    admin_id_number VARCHAR(100)
);

CREATE TABLE institute_sports_metrics (
    id SERIAL PRIMARY KEY,
    institute_id INTEGER REFERENCES institutes(id) ON DELETE CASCADE,
    active_athletes INTEGER,
    num_coaches INTEGER,
    num_certified_coaches INTEGER,
    sports_offered TEXT[],
    age_categories TEXT[]
);

CREATE TABLE institute_infrastructure (
    id SERIAL PRIMARY KEY,
    institute_id INTEGER REFERENCES institutes(id) ON DELETE CASCADE,
    facility_types TEXT[],
    indoor_facilities BOOLEAN DEFAULT FALSE,
    outdoor_facilities BOOLEAN DEFAULT FALSE,
    medical_support BOOLEAN DEFAULT FALSE,
    hostel BOOLEAN DEFAULT FALSE,
    equipment_availability VARCHAR(100)
);

CREATE TABLE institute_consents (
    id SERIAL PRIMARY KEY,
    institute_id INTEGER REFERENCES institutes(id) ON DELETE CASCADE,
    consent_accuracy BOOLEAN,
    consent_guidelines BOOLEAN,
    consent_audits BOOLEAN,
    consent_data_sharing BOOLEAN,
    auth_name VARCHAR(255),
    auth_designation VARCHAR(100),
    auth_signature TEXT,
    auth_date DATE
);

CREATE TABLE institute_documents (
    id SERIAL PRIMARY KEY,
    institute_id INTEGER REFERENCES institutes(id) ON DELETE CASCADE,
    document_type VARCHAR(100),
    file_path TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
