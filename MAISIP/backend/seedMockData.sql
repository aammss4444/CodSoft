-- Seed a mock Athlete
INSERT INTO athletes (first_name, last_name, email_address, mobile_number, identity_verified, consent_verified, verification_status)
VALUES 
('Arjun', 'Deshmukh', 'arjun.d@example.com', '9876543210', false, false, 'Pending'),
('Priya', 'Patil', 'priya.p@example.com', '8765432109', true, true, 'Verified');

-- Seed a mock Institute
INSERT INTO institutes (org_name, organization_type, reg_number, documents_verified, authority_approved, verification_status)
VALUES 
('Pune Sports Academy', 'Private Academy', 'REG-PUN-001', false, false, 'Pending');

INSERT INTO institute_contacts (institute_id, admin_name, admin_email)
VALUES 
(1, 'Rahul Sharma', 'admin@punesports.com');
