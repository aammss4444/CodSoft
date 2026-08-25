-- Add Verification Fields to Athletes
ALTER TABLE athletes 
ADD COLUMN IF NOT EXISTS identity_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS consent_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'Pending';

-- Add Verification Fields to Institutes
ALTER TABLE institutes
ADD COLUMN IF NOT EXISTS documents_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS authority_approved BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'Pending';
