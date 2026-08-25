'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppleDatePicker from '../components/AppleDatePicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './registration.module.css';
import AthleteIdCard from './AthleteIdCard';

const sources = [
  { 
    id: 'school', 
    label: 'School / College', 
    requiresInstituteInfo: true, 
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg> 
  },
  { 
    id: 'academy', 
    label: 'Sports Academy / Institution', 
    requiresInstituteInfo: true, 
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg> 
  },
  { 
    id: 'gov', 
    label: 'Government Approved Facility', 
    requiresInstituteInfo: true, 
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg> 
  },
  { 
    id: 'parent', 
    label: 'Parent / Guardian', 
    requiresInstituteInfo: false, 
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> 
  },
  { 
    id: 'self', 
    label: 'Self Registration', 
    requiresInstituteInfo: false, 
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> 
  },
  { 
    id: 'coach', 
    label: 'Coach', 
    requiresInstituteInfo: false, 
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 14h6"></path><path d="M9 10h6"></path><path d="M9 18h6"></path></svg> 
  }
];

export default function RegistrationPage({ prefillData = null }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(prefillData ? 2 : 1);
  const [selectedSource, setSelectedSource] = useState(prefillData?.source || null);
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [generatedId, setGeneratedId] = useState('');
  
  // Institute selection data
  const [adminData, setAdminData] = useState({
    orgName: prefillData?.orgName || '',
    instituteId: prefillData?.instituteId || ''
  });

  const [institutesList, setInstitutesList] = useState([]);

  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/institutes');
        const data = await response.json();
        if (data.success) {
          setInstitutesList(data.institutes);
        }
      } catch (err) {
        console.error('Failed to fetch institutes:', err);
      }
    };
    fetchInstitutes();
  }, []);

  const [athleteInfo, setAthleteInfo] = useState({
    uniqueId: 'ATH-2026-PENDING',
    firstName: '',
    middleName: '',
    lastName: '',
    gender: '',
    dob: '',
    age: '',
    nationality: '',
    bloodGroup: '',
    photo: null
  });

  useEffect(() => {
    if (athleteInfo.dob) {
      const birthDate = new Date(athleteInfo.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setTimeout(() => setAthleteInfo(prev => ({ ...prev, age: age >= 0 ? age : '' })), 0);
    } else {
      setTimeout(() => setAthleteInfo(prev => ({ ...prev, age: '' })), 0);
    }
  }, [athleteInfo.dob]);

  const [identificationDetails, setIdentificationDetails] = useState({
    nationalIdType: '',
    nationalIdNumber: '',
    birthCertificateNumber: '',
    passportNumber: '',
    idDocument: null
  });

  const [parentDetails, setParentDetails] = useState({
    name: '', relationship: '', mobile: '', email: '', occupation: '', address: '', idProof: null
  });
  const [parentMobileVerified, setParentMobileVerified] = useState(false);

  const [contactInfo, setContactInfo] = useState({
    mobile: '', email: '', address1: '', address2: '', city: '', district: '', state: '', country: '', pin: ''
  });
  const [contactMobileVerified, setContactMobileVerified] = useState(false);

  const [educationInfo, setEducationInfo] = useState({
    school: '', grade: '', board: ''
  });

  const [sportsProfile, setSportsProfile] = useState({
    primarySport: '', secondarySports: [], position: '', preferredHandFoot: '', skillLevel: '', language: '', experience: ''
  });
  const [secondarySportInput, setSecondarySportInput] = useState('');

  const [physicalAttributes, setPhysicalAttributes] = useState({
    height: '', weight: '', jerseySize: '', medicalConditions: '', allergies: '', disability: ''
  });

  const [coachDetails, setCoachDetails] = useState({
    coachName: '', coachId: '', instituteName: '', instituteAthleteId: '', dateJoined: ''
  });

  const [achievements, setAchievements] = useState({
    competitions: [], achievementLevel: '', awards: [], personalRecords: '', certificate: null
  });
  const [competitionInput, setCompetitionInput] = useState('');
  const [awardInput, setAwardInput] = useState('');

  const [emergencyContact, setEmergencyContact] = useState({
    name: '', relationship: '', mobile: '', alternateMobile: ''
  });

  const [consents, setConsents] = useState({
    accurate: false, data: false, share: false, notifications: false, parentRegistration: false, parentAI: false
  });

  const [signatures, setSignatures] = useState({
    athleteSignature: null, parentSignature: null, instituteSignature: null, registrationDate: new Date().toISOString().split('T')[0]
  });

  const isStepValid = (step) => {
    switch (step) {
      case 1: return selectedSource !== null;
      case 2: return athleteInfo.firstName.trim() !== '' && athleteInfo.dob !== null && athleteInfo.gender !== '' && athleteInfo.bloodGroup !== '' && athleteInfo.photo !== null;
      case 3: return identificationDetails.nationalIdType !== '' && identificationDetails.nationalIdNumber.trim() !== '' && identificationDetails.idDocument !== null;
      case 4: 
        if (athleteInfo.age !== '' && athleteInfo.age < 18) {
          return parentDetails.name.trim() !== '' && parentDetails.relationship !== '' && parentDetails.mobile.trim() !== '' && parentDetails.address.trim() !== '';
        }
        return parentDetails.name.trim() !== '' && parentDetails.relationship !== '' && parentDetails.mobile.trim() !== '';
      case 5: return contactInfo.mobile.trim() !== '' && contactInfo.address1.trim() !== '' && contactInfo.city.trim() !== '' && contactInfo.district.trim() !== '' && contactInfo.state.trim() !== '' && contactInfo.pin.trim() !== '';
      case 6: return educationInfo.school.trim() !== ''; 
      case 7: return sportsProfile.primarySport !== '' && sportsProfile.skillLevel !== '';
      case 8: return physicalAttributes.height.trim() !== '' && physicalAttributes.weight.trim() !== '';
      case 9: return coachDetails.coachName.trim() !== ''; 
      case 10: return achievements.achievementLevel !== '' || achievements.personalRecords.trim() !== '' || achievements.competitions.length > 0;
      case 11: return emergencyContact.name.trim() !== '' && emergencyContact.relationship !== '' && emergencyContact.mobile.trim() !== '';
      case 12: return consents.accurate && consents.data && consents.share; // Basic consents
      case 13: return signatures.registrationDate !== '' && signatures.athleteSignature !== null && (athleteInfo.age !== '' && athleteInfo.age < 18 ? signatures.parentSignature !== null : true);
      default: return true;
    }
  };

  const handleSubmit = async () => {
    // Validate all steps before submission
    for (let i = 1; i <= 13; i++) {
      if (!isStepValid(i)) {
        alert(`Please complete all required fields in Step ${i} before submitting.`);
        setCurrentStep(i);
        return;
      }
    }

    try {
      const payload = {
        source: selectedSource?.id,
        organizationName: adminData?.orgName,
        instituteId: adminData?.instituteId,
        basicInfo: {
          firstName: athleteInfo.firstName,
          middleName: athleteInfo.middleName,
          lastName: athleteInfo.lastName,
          dateOfBirth: athleteInfo.dob,
          age: athleteInfo.age,
          gender: athleteInfo.gender,
          bloodGroup: athleteInfo.bloodGroup,
        },
        identificationDetails,
        parentInfo: parentDetails,
        contactInfo,
        educationInfo,
        sportsProfile,
        physicalAttributes,
        coachDetails,
        achievements,
        emergencyContact,
        consents,
        signatures,
        createdByRole: prefillData?.createdByRole || null,
        createdByUserId: prefillData?.createdByUserId || null,
        linkedInstituteId: prefillData?.linkedInstituteId || null,
        instituteRegistrationId: prefillData?.instituteRegistrationId || null
      };

      const uploadData = new FormData();
      uploadData.append('payload', JSON.stringify(payload));
      
      if (athleteInfo.photo) uploadData.append('profilePhoto', athleteInfo.photo);
      if (identificationDetails.idDocument) uploadData.append('idDoc', identificationDetails.idDocument);
      if (achievements.certificate) uploadData.append('certUpload', achievements.certificate);
      if (signatures.athleteSignature) uploadData.append('athleteSig', signatures.athleteSignature);
      if (signatures.parentSignature) uploadData.append('parentSig', signatures.parentSignature);
      if (signatures.instituteSignature) uploadData.append('instituteSig', signatures.instituteSignature);

      const response = await fetch('http://localhost:5000/api/registration/submit', {
        method: 'POST',
        body: uploadData
      });
      const data = await response.json();
      if (data.success) {
        setGeneratedId(data.athleteId);
        if (data.credentials) {
          setCredentials(data.credentials);
        }
        setIsSubmitted(true);
      } else {
        alert('Registration Error: ' + data.message);
      }
    } catch (err) {
      console.error('Failed to submit full registration:', err);
      alert('Failed to submit registration. Please ensure the backend server and database are running.');
    }
  };

  const handleSourceSelect = (source) => {
    setSelectedSource(source);
    setAdminData({ orgName: '', instituteId: '' });
  };

  const handleNext = () => {
    if (!selectedSource) return;
    setCurrentStep(2);
  };

  const [credentials, setCredentials] = useState(null);

  if (isSubmitted) {
    return (
      <div className={styles.pageContainer} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>Registration Successful!</h2>
        <p style={{ color: '#64748b', marginBottom: '40px', textAlign: 'center', maxWidth: '600px' }}>
          Your application has been received and is pending verification by an Admin.<br/>
          Your Official Athlete Card will be generated automatically once your account is verified.
        </p>
        
        {credentials && (
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '32px', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#0F172A' }}>Athlete Dashboard Access</h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>Please save these credentials to access your dashboard:</p>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Username (Email)</span>
              <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '6px', fontSize: '14px', fontWeight: '600', color: '#334155', marginTop: '4px' }}>
                {credentials.email}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Temporary Password</span>
              <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '6px', fontSize: '14px', fontWeight: '600', color: '#334155', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{credentials.tempPassword}</span>
              </div>
            </div>
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <button 
            className="primary-button" 
            onClick={() => window.location.href = '/'} 
            style={{ background: '#F5B041', color: '#000', border: 'none', padding: '12px 32px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
          >
            Go to Login
          </button>
          <button 
            className="secondary-button" 
            onClick={() => window.location.reload()} 
            style={{ background: '#fff', color: '#0F172A', border: '1px solid #E2E8F0', padding: '12px 32px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
          >
            Register Another Athlete
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.formWrapper}>
        
        {currentStep === 1 && (
          <div className={styles.header}>
            <h1 className={styles.title}>Athlete Registration Form</h1>
            <p className={styles.subtitle}>Create a Unique Digital Identity for Every Athlete</p>
          </div>
        )}

        <div style={{ textAlign: 'center', marginBottom: '16px', fontWeight: '600', color: '#4B5563', fontSize: '0.95rem' }}>
          Step {currentStep} of 13: {
            ["Registration Source", "Basic Info", "Identification", "Parent/Guardian", "Contact Details", "Education Info", "Sports Profile", "Physical Attributes", "Coach Details", "Achievement History", "Emergency Contact", "Consent", "Signature"][currentStep - 1]
          }
        </div>
        <div className={styles.stepIndicator}>
          <div className={styles.stepLineBg}></div>
          <div className={styles.stepLineFill} style={{ width: `${((currentStep - 1) / 12) * 100}%` }}></div>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(step => {
            const isCompleted = currentStep > step;
            const isValid = isStepValid(step);
            const isError = isCompleted && !isValid;

            return (
              <div 
                key={step} 
                className={`${styles.step} ${isCompleted && isValid ? styles.completed : isError ? styles.error : currentStep === step ? styles.active : styles.future}`}
                onClick={() => { if (step < currentStep) setCurrentStep(step); }}
                title={["Source", "Basic Info", "ID", "Parents", "Contact", "Education", "Sports", "Physical", "Coach", "Achievements", "Emergency", "Consent", "Signature"][step - 1]}
              >
                <span className={styles.stepNumber}>
                  {isError ? (
                    <span style={{ fontWeight: 'bold' }}>!</span>
                  ) : isCompleted ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  ) : (
                    step
                  )}
                </span>
              </div>
            );
          })}
        </div>

        <div className={styles.section}>
          {currentStep === 1 && (
            <div className="animate-fade-in">
              <h2 className={styles.sectionTitle}>Section 1: Registration Source</h2>
              
              <div className={styles.inputGroup} style={{ marginBottom: '24px' }}>
                <label className={styles.inputLabel}>Athlete Registration Created By</label>
              </div>

              <div className={styles.cardsGrid}>
                {sources.map((source) => (
                  <div 
                    key={source.id}
                    className={`${styles.sourceCard} ${selectedSource?.id === source.id ? styles.selected : ''}`}
                    onClick={() => handleSourceSelect(source)}
                  >
                    <div className={styles.cardIcon}>{source.icon}</div>
                    <div className={styles.cardLabel}>{source.label}</div>
                  </div>
                ))}
              </div>

              {selectedSource?.requiresInstituteInfo && (
                <div className={styles.autoFields}>
                  {prefillData?.orgName ? (
                    <>
                      <p>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Institute details have been auto-populated from your account.
                      </p>
                      <div className={styles.formRow}>
                        <div className={styles.inputGroup}>
                          <label className={styles.inputLabel}>Institute Name</label>
                          <input type="text" className={`${styles.appleInput} ${styles.readOnlyInput}`} value={adminData.orgName} readOnly />
                        </div>
                        <div className={styles.inputGroup}>
                          <label className={styles.inputLabel}>Institute Code</label>
                          <input type="text" className={`${styles.appleInput} ${styles.readOnlyInput}`} value={adminData.instituteId} readOnly />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <p>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                        Select your registering institute to auto-populate the details.
                      </p>
                      <div className={styles.formRow}>
                        <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                          <label className={styles.inputLabel}>Select Registering Institute <span style={{color: '#EF4444'}}>*</span></label>
                          <div className={styles.selectWrapper}>
                            <select 
                              className={`${styles.appleSelect} ${styles.premiumSelect}`}
                              value={adminData.instituteId}
                              onChange={(e) => {
                                const selected = institutesList.find(inst => inst.reg_number === e.target.value);
                                if (selected) {
                                  setAdminData({
                                    orgName: selected.org_name,
                                    instituteId: selected.reg_number
                                  });
                                } else {
                                  setAdminData({ orgName: '', instituteId: '' });
                                }
                              }}
                            >
                              <option value="">-- Choose an Institute --</option>
                              {institutesList.map(inst => (
                                <option key={inst.id} value={inst.reg_number}>
                                  {inst.org_name} ({inst.reg_number})
                                </option>
                              ))}
                            </select>
                            <div className={styles.selectIcon}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className={styles.actions}>
                <button 
                  className="primary-button" 
                  onClick={handleNext}
                  disabled={!selectedSource}
                  style={{ 
                    backgroundColor: '#111827', 
                    color: '#ffffff',
                    border: 'none',
                    opacity: !selectedSource ? 0.5 : 1, 
                    cursor: !selectedSource ? 'not-allowed' : 'pointer' 
                  }}
                >
                  Continue to Step 2
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="animate-fade-in">
              <h2 className={styles.sectionTitle}>2. Athlete Basic Information</h2>
              
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Athlete Unique ID <span style={{color: '#EF4444'}}>*</span></label>
                  <input type="text" className={`${styles.appleInput} ${styles.readOnlyInput}`} value={athleteInfo.uniqueId} readOnly />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>First Name <span style={{color: '#EF4444'}}>*</span></label>
                  <input type="text" className={styles.appleInput} value={athleteInfo.firstName} onChange={e => setAthleteInfo({...athleteInfo, firstName: e.target.value})} />
                </div>
                
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Middle Name</label>
                  <input type="text" className={styles.appleInput} value={athleteInfo.middleName} onChange={e => setAthleteInfo({...athleteInfo, middleName: e.target.value})} />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Last Name <span style={{color: '#EF4444'}}>*</span></label>
                  <input type="text" className={styles.appleInput} value={athleteInfo.lastName} onChange={e => setAthleteInfo({...athleteInfo, lastName: e.target.value})} />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Gender <span style={{color: '#EF4444'}}>*</span></label>
                  <select className={styles.appleSelect} value={athleteInfo.gender} onChange={e => setAthleteInfo({...athleteInfo, gender: e.target.value})}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Date of Birth <span style={{color: '#EF4444'}}>*</span></label>
                  <div className={styles.datePickerWrapper}>
                    <AppleDatePicker
                      name="dob"
                      value={athleteInfo.dob}
                      onChange={e => setAthleteInfo({...athleteInfo, dob: e.target.value})}
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Age <span style={{color: '#EF4444'}}>*</span></label>
                  <input type="text" className={`${styles.appleInput} ${styles.readOnlyInput}`} value={athleteInfo.age} readOnly placeholder="Auto Calculated" />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Nationality <span style={{color: '#EF4444'}}>*</span></label>
                  <select className={styles.appleSelect} value={athleteInfo.nationality} onChange={e => setAthleteInfo({...athleteInfo, nationality: e.target.value})}>
                    <option value="">Select Nationality</option>
                    <option value="Indian">Indian</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Blood Group</label>
                  <select className={styles.appleSelect} value={athleteInfo.bloodGroup} onChange={e => setAthleteInfo({...athleteInfo, bloodGroup: e.target.value})}>
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Profile Photograph <span style={{color: '#EF4444'}}>*</span></label>
                  <input type="file" className={styles.appleInput} accept="image/*" onChange={e => setAthleteInfo({...athleteInfo, photo: e.target.files[0]})} />
                </div>
              </div>

              <div className={styles.actions} style={{ justifyContent: 'space-between', marginTop: '32px' }}>
                <button className="primary-button" onClick={() => setCurrentStep(1)} style={{ background: '#ffffff', border: '1px solid #D1D5DB', color: '#111827' }}>
                  Back
                </button>
                <button className="primary-button" onClick={() => setCurrentStep(3)}>
                  Continue to Step 3
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="animate-fade-in">
              <h2 className={styles.sectionTitle}>3. Identification Details</h2>
              
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>National ID Type <span style={{color: '#EF4444'}}>*</span></label>
                  <select className={styles.appleSelect} value={identificationDetails.nationalIdType} onChange={e => setIdentificationDetails({...identificationDetails, nationalIdType: e.target.value})}>
                    <option value="">Select ID Type</option>
                    <option value="Birth Certificate">Birth Certificate</option>
                    <option value="Aadhaar Card">Aadhaar Card</option>
                    <option value="Passport">Passport</option>
                    <option value="Student ID">Student ID</option>
                    <option value="Government Sports ID">Government Sports ID</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>National ID Number <span style={{color: '#EF4444'}}>*</span></label>
                  <input type="text" className={styles.appleInput} value={identificationDetails.nationalIdNumber} onChange={e => setIdentificationDetails({...identificationDetails, nationalIdNumber: e.target.value})} placeholder="Enter ID Number" />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>
                    Birth Certificate Number 
                    {athleteInfo.age !== '' && athleteInfo.age < 18 && <span style={{color: '#EF4444'}}> * (Required for Minors)</span>}
                  </label>
                  <input type="text" className={styles.appleInput} value={identificationDetails.birthCertificateNumber} onChange={e => setIdentificationDetails({...identificationDetails, birthCertificateNumber: e.target.value})} placeholder="Enter Birth Certificate Number" />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Passport Number</label>
                  <input type="text" className={styles.appleInput} value={identificationDetails.passportNumber} onChange={e => setIdentificationDetails({...identificationDetails, passportNumber: e.target.value})} placeholder="Enter Passport Number (Optional)" />
                </div>

                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.inputLabel}>Identification Document Upload <span style={{color: '#EF4444'}}>*</span></label>
                  <div className={styles.fileUploadWrapper}>
                    <input type="file" className={styles.appleInput} style={{background: 'transparent', border: 'none', boxShadow: 'none'}} accept=".pdf,image/*" onChange={e => setIdentificationDetails({...identificationDetails, idDocument: e.target.files[0]})} />
                    <p style={{fontSize: '0.85rem', color: '#6B7280', marginTop: '8px'}}>Upload a clear scanned copy of your selected National ID (PDF, JPG, PNG)</p>
                  </div>
                </div>
              </div>

              <div className={styles.actions} style={{ justifyContent: 'space-between', marginTop: '32px' }}>
                <button className="primary-button" onClick={() => setCurrentStep(2)} style={{ background: '#ffffff', border: '1px solid #D1D5DB', color: '#111827' }}>
                  Back
                </button>
                <button className="primary-button" onClick={() => setCurrentStep(4)}>
                  Continue to Step 4
                </button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="animate-fade-in">
              <h2 className={styles.sectionTitle}>4. Parent / Guardian Details</h2>
              <p style={{ color: '#6B7280', marginBottom: '24px', fontStyle: 'italic' }}>(Mandatory for athletes below 18 years of age)</p>
              
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>
                    Parent / Guardian Name 
                    {athleteInfo.age !== '' && athleteInfo.age < 18 && <span style={{color: '#EF4444'}}> *</span>}
                  </label>
                  <input type="text" className={styles.appleInput} value={parentDetails.name} onChange={e => setParentDetails({...parentDetails, name: e.target.value})} placeholder="Enter Full Name" />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>
                    Relationship 
                    {athleteInfo.age !== '' && athleteInfo.age < 18 && <span style={{color: '#EF4444'}}> *</span>}
                  </label>
                  <select className={styles.appleSelect} value={parentDetails.relationship} onChange={e => setParentDetails({...parentDetails, relationship: e.target.value})}>
                    <option value="">Select Relationship</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Legal Guardian">Legal Guardian</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>
                    Mobile Number 
                    {athleteInfo.age !== '' && athleteInfo.age < 18 && <span style={{color: '#EF4444'}}> *</span>}
                  </label>
                  <div className={styles.otpWrapper}>
                    <input type="tel" className={`${styles.appleInput} ${styles.otpInput}`} value={parentDetails.mobile} onChange={e => {
                      setParentDetails({...parentDetails, mobile: e.target.value});
                      setParentMobileVerified(false);
                    }} placeholder="Enter Mobile Number" />
                    {parentMobileVerified ? (
                      <div className={styles.verifiedBadge}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Verified
                      </div>
                    ) : (
                      <button className={styles.verifyBtn} onClick={() => {
                        if (parentDetails.mobile.length > 5) {
                          const code = prompt("Simulating OTP SMS... Enter any 4-digit code to verify:");
                          if (code) setParentMobileVerified(true);
                        } else {
                          alert("Please enter a valid mobile number first.");
                        }
                      }}>Verify OTP</button>
                    )}
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Email Address</label>
                  <input type="email" className={styles.appleInput} value={parentDetails.email} onChange={e => setParentDetails({...parentDetails, email: e.target.value})} placeholder="Enter Email (Optional)" />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Occupation</label>
                  <input type="text" className={styles.appleInput} value={parentDetails.occupation} onChange={e => setParentDetails({...parentDetails, occupation: e.target.value})} placeholder="Enter Occupation (Optional)" />
                </div>

                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.inputLabel}>
                    Address
                    {athleteInfo.age !== '' && athleteInfo.age < 18 && <span style={{color: '#EF4444'}}> *</span>}
                  </label>
                  <textarea className={styles.appleTextarea} value={parentDetails.address} onChange={e => setParentDetails({...parentDetails, address: e.target.value})} placeholder="Enter Full Residential Address"></textarea>
                </div>

                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.inputLabel}>
                    Parent/Guardian ID Proof
                    {athleteInfo.age !== '' && athleteInfo.age < 18 && <span style={{color: '#EF4444'}}> *</span>}
                  </label>
                  <div className={styles.fileUploadWrapper}>
                    <input type="file" className={styles.appleInput} style={{background: 'transparent', border: 'none', boxShadow: 'none'}} accept=".pdf,image/*" onChange={e => setParentDetails({...parentDetails, idProof: e.target.files[0]})} />
                    <p style={{fontSize: '0.85rem', color: '#6B7280', marginTop: '8px'}}>Upload a clear scanned copy of ID Proof (PDF, JPG, PNG)</p>
                  </div>
                </div>
              </div>

              <div className={styles.actions} style={{ justifyContent: 'space-between', marginTop: '32px' }}>
                <button className="primary-button" onClick={() => setCurrentStep(3)} style={{ background: '#ffffff', border: '1px solid #D1D5DB', color: '#111827' }}>
                  Back
                </button>
                <button className="primary-button" onClick={() => setCurrentStep(5)}>
                  Continue to Step 5
                </button>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="animate-fade-in">
              <h2 className={styles.sectionTitle}>5. Contact Information</h2>
              
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Mobile Number <span style={{color: '#EF4444'}}>*</span></label>
                  <div className={styles.otpWrapper}>
                    <input type="tel" className={`${styles.appleInput} ${styles.otpInput}`} value={contactInfo.mobile} onChange={e => {
                      setContactInfo({...contactInfo, mobile: e.target.value});
                      setContactMobileVerified(false);
                    }} placeholder="Enter Athlete's Mobile" />
                    {contactMobileVerified ? (
                      <div className={styles.verifiedBadge}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Verified
                      </div>
                    ) : (
                      <button className={styles.verifyBtn} onClick={() => {
                        if (contactInfo.mobile.length > 5) {
                          const code = prompt("Simulating OTP SMS... Enter any 4-digit code to verify:");
                          if (code) setContactMobileVerified(true);
                        } else {
                          alert("Please enter a valid mobile number first.");
                        }
                      }}>Verify OTP</button>
                    )}
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Email Address</label>
                  <input type="email" className={styles.appleInput} value={contactInfo.email} onChange={e => setContactInfo({...contactInfo, email: e.target.value})} placeholder="Enter Athlete's Email (Optional)" />
                </div>

                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.inputLabel}>Address Line 1 <span style={{color: '#EF4444'}}>*</span></label>
                  <input type="text" className={styles.appleInput} value={contactInfo.address1} onChange={e => setContactInfo({...contactInfo, address1: e.target.value})} placeholder="House/Flat No, Street Name" />
                </div>

                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.inputLabel}>Address Line 2</label>
                  <input type="text" className={styles.appleInput} value={contactInfo.address2} onChange={e => setContactInfo({...contactInfo, address2: e.target.value})} placeholder="Area, Landmark (Optional)" />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>City / Town <span style={{color: '#EF4444'}}>*</span></label>
                  <input type="text" className={styles.appleInput} value={contactInfo.city} onChange={e => setContactInfo({...contactInfo, city: e.target.value})} placeholder="Enter City/Town" />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>District <span style={{color: '#EF4444'}}>*</span></label>
                  <input type="text" className={styles.appleInput} value={contactInfo.district} onChange={e => setContactInfo({...contactInfo, district: e.target.value})} placeholder="Enter District" />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>State <span style={{color: '#EF4444'}}>*</span></label>
                  <select className={styles.appleSelect} value={contactInfo.state} onChange={e => setContactInfo({...contactInfo, state: e.target.value})}>
                    <option value="">Select State</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Country <span style={{color: '#EF4444'}}>*</span></label>
                  <select className={styles.appleSelect} value={contactInfo.country} onChange={e => setContactInfo({...contactInfo, country: e.target.value})}>
                    <option value="">Select Country</option>
                    <option value="India">India</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>PIN / Postal Code <span style={{color: '#EF4444'}}>*</span></label>
                  <input type="text" className={styles.appleInput} value={contactInfo.pin} onChange={e => setContactInfo({...contactInfo, pin: e.target.value})} placeholder="Enter PIN Code" />
                </div>
              </div>

              <div className={styles.actions} style={{ justifyContent: 'space-between', marginTop: '32px' }}>
                <button className="primary-button" onClick={() => setCurrentStep(4)} style={{ background: '#ffffff', border: '1px solid #D1D5DB', color: '#111827' }}>
                  Back
                </button>
                <button className="primary-button" onClick={() => setCurrentStep(6)}>
                  Continue to Step 6
                </button>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="animate-fade-in">
              <h2 className={styles.sectionTitle}>6. Education Information</h2>
              
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Current School / College</label>
                  <input type="text" className={styles.appleInput} value={educationInfo.school} onChange={e => setEducationInfo({...educationInfo, school: e.target.value})} placeholder="Enter Institution Name" />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Class / Grade</label>
                  <input type="text" className={styles.appleInput} value={educationInfo.grade} onChange={e => setEducationInfo({...educationInfo, grade: e.target.value})} placeholder="e.g. 10th Standard, B.A." />
                </div>

                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.inputLabel}>Education Board / University</label>
                  <input type="text" className={styles.appleInput} value={educationInfo.board} onChange={e => setEducationInfo({...educationInfo, board: e.target.value})} placeholder="e.g. CBSE, State Board, Mumbai University" />
                </div>
              </div>

              <div className={styles.actions} style={{ justifyContent: 'space-between', marginTop: '32px' }}>
                <button className="primary-button" onClick={() => setCurrentStep(5)} style={{ background: '#ffffff', border: '1px solid #D1D5DB', color: '#111827' }}>
                  Back
                </button>
                <button className="primary-button" onClick={() => setCurrentStep(7)}>
                  Continue to Step 7
                </button>
              </div>
            </div>
          )}

          {currentStep === 7 && (
            <div className="animate-fade-in">
              <h2 className={styles.sectionTitle}>7. Sports Profile</h2>
              
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Primary Sport <span style={{color: '#EF4444'}}>*</span></label>
                  <select className={styles.appleSelect} value={sportsProfile.primarySport} onChange={e => setSportsProfile({...sportsProfile, primarySport: e.target.value})}>
                    <option value="">Select Primary Sport</option>
                    <option value="Athletics">Athletics</option>
                    <option value="Badminton">Badminton</option>
                    <option value="Basketball">Basketball</option>
                    <option value="Cricket">Cricket</option>
                    <option value="Football">Football</option>
                    <option value="Tennis">Tennis</option>
                    <option value="Swimming">Swimming</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Secondary Sport(s)</label>
                  <div className={styles.multiSelectWrapper}>
                    <input 
                      type="text" 
                      className={styles.appleInput} 
                      value={secondarySportInput} 
                      onChange={e => setSecondarySportInput(e.target.value)} 
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && secondarySportInput.trim() !== '') {
                          e.preventDefault();
                          if (!sportsProfile.secondarySports.includes(secondarySportInput.trim())) {
                            setSportsProfile({
                              ...sportsProfile,
                              secondarySports: [...sportsProfile.secondarySports, secondarySportInput.trim()]
                            });
                          }
                          setSecondarySportInput('');
                        }
                      }}
                      placeholder="Type sport and press Enter" 
                    />
                    {sportsProfile.secondarySports.length > 0 && (
                      <div className={styles.pillsContainer}>
                        {sportsProfile.secondarySports.map((sport, idx) => (
                          <div key={idx} className={styles.tagPill}>
                            {sport}
                            <div className={styles.removePill} onClick={() => {
                              setSportsProfile({
                                ...sportsProfile,
                                secondarySports: sportsProfile.secondarySports.filter(s => s !== sport)
                              });
                            }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Playing Position / Event</label>
                  <input type="text" className={styles.appleInput} value={sportsProfile.position} onChange={e => setSportsProfile({...sportsProfile, position: e.target.value})} placeholder="e.g. Forward, 100m Sprint" />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Preferred Hand / Foot</label>
                  <select className={styles.appleSelect} value={sportsProfile.preferredHandFoot} onChange={e => setSportsProfile({...sportsProfile, preferredHandFoot: e.target.value})}>
                    <option value="">Select</option>
                    <option value="Right">Right</option>
                    <option value="Left">Left</option>
                    <option value="Both">Both (Ambidextrous)</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Current Skill Level <span style={{color: '#EF4444'}}>*</span></label>
                  <select className={styles.appleSelect} value={sportsProfile.skillLevel} onChange={e => setSportsProfile({...sportsProfile, skillLevel: e.target.value})}>
                    <option value="">Select Skill Level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Elite">Elite</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Dominant Language</label>
                  <select className={styles.appleSelect} value={sportsProfile.language} onChange={e => setSportsProfile({...sportsProfile, language: e.target.value})}>
                    <option value="">Select Language</option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Marathi">Marathi</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Years of Experience</label>
                  <input type="number" className={styles.appleInput} value={sportsProfile.experience} onChange={e => setSportsProfile({...sportsProfile, experience: e.target.value})} placeholder="e.g. 5" min="0" />
                </div>
              </div>

              <div className={styles.actions} style={{ justifyContent: 'space-between', marginTop: '32px' }}>
                <button className="primary-button" onClick={() => setCurrentStep(6)} style={{ background: '#ffffff', border: '1px solid #D1D5DB', color: '#111827' }}>
                  Back
                </button>
                <button className="primary-button" onClick={() => setCurrentStep(8)}>
                  Continue to Step 8
                </button>
              </div>
            </div>
          )}

          {currentStep === 8 && (
            <div className="animate-fade-in">
              <h2 className={styles.sectionTitle}>8. Physical Attributes</h2>
              
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Height (cm)</label>
                  <input type="number" className={styles.appleInput} value={physicalAttributes.height} onChange={e => setPhysicalAttributes({...physicalAttributes, height: e.target.value})} placeholder="e.g. 175" min="0" />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Weight (kg)</label>
                  <input type="number" className={styles.appleInput} value={physicalAttributes.weight} onChange={e => setPhysicalAttributes({...physicalAttributes, weight: e.target.value})} placeholder="e.g. 68.5" min="0" step="0.1" />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Jersey / Kit Size</label>
                  <select className={styles.appleSelect} value={physicalAttributes.jerseySize} onChange={e => setPhysicalAttributes({...physicalAttributes, jerseySize: e.target.value})}>
                    <option value="">Select Size</option>
                    <option value="XS">Extra Small (XS)</option>
                    <option value="S">Small (S)</option>
                    <option value="M">Medium (M)</option>
                    <option value="L">Large (L)</option>
                    <option value="XL">Extra Large (XL)</option>
                    <option value="XXL">XXL</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Disability Category</label>
                  <select className={styles.appleSelect} value={physicalAttributes.disability} onChange={e => setPhysicalAttributes({...physicalAttributes, disability: e.target.value})}>
                    <option value="">None</option>
                    <option value="Physical">Physical Impairment</option>
                    <option value="Visual">Visual Impairment</option>
                    <option value="Intellectual">Intellectual Impairment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.inputLabel}>Medical Conditions (if any)</label>
                  <textarea className={styles.appleTextarea} value={physicalAttributes.medicalConditions} onChange={e => setPhysicalAttributes({...physicalAttributes, medicalConditions: e.target.value})} placeholder="Please describe any pre-existing medical conditions..."></textarea>
                </div>

                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.inputLabel}>Allergies (if any)</label>
                  <textarea className={styles.appleTextarea} value={physicalAttributes.allergies} onChange={e => setPhysicalAttributes({...physicalAttributes, allergies: e.target.value})} placeholder="Please list any allergies..."></textarea>
                </div>
              </div>

              <div className={styles.actions} style={{ justifyContent: 'space-between', marginTop: '32px' }}>
                <button className="primary-button" onClick={() => setCurrentStep(7)} style={{ background: '#ffffff', border: '1px solid #D1D5DB', color: '#111827' }}>
                  Back
                </button>
                <button className="primary-button" onClick={() => setCurrentStep(9)}>
                  Continue to Step 9
                </button>
              </div>
            </div>
          )}

          {currentStep === 9 && (
            <div className="animate-fade-in">
              <h2 className={styles.sectionTitle}>9. Coach & Institution Details</h2>
              
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Current Coach Name</label>
                  <input type="text" className={styles.appleInput} value={coachDetails.coachName} onChange={e => setCoachDetails({...coachDetails, coachName: e.target.value})} placeholder="Enter Coach Name" />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Coach Registration ID</label>
                  <input type="text" className={styles.appleInput} value={coachDetails.coachId} onChange={e => setCoachDetails({...coachDetails, coachId: e.target.value})} placeholder="Enter Coach ID" />
                </div>

                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.inputLabel}>Institute Name</label>
                  <div style={{ position: 'relative' }}>
                    <input type="text" className={styles.appleInput} value={coachDetails.instituteName} onChange={e => setCoachDetails({...coachDetails, instituteName: e.target.value})} placeholder="Search Institute Name..." />
                    <svg style={{ position: 'absolute', right: '16px', top: '14px', color: '#9CA3AF' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Institute Athlete ID</label>
                  <input type="text" className={styles.appleInput} value={coachDetails.instituteAthleteId} onChange={e => setCoachDetails({...coachDetails, instituteAthleteId: e.target.value})} placeholder="Enter Athlete ID" />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Date Joined Institute</label>
                  <div className={styles.datePickerWrapper}>
                    <AppleDatePicker
                      name="dateJoined"
                      value={coachDetails.dateJoined}
                      onChange={e => setCoachDetails({...coachDetails, dateJoined: e.target.value})}
                      placeholder="DD-MM-YYYY"
                    />
                  </div>
                </div>
              </div>

              <div className={styles.actions} style={{ justifyContent: 'space-between', marginTop: '32px' }}>
                <button className="primary-button" onClick={() => setCurrentStep(8)} style={{ background: '#ffffff', border: '1px solid #D1D5DB', color: '#111827' }}>
                  Back
                </button>
                <button className="primary-button" onClick={() => setCurrentStep(10)}>
                  Continue to Step 10
                </button>
              </div>
            </div>
          )}

          {currentStep === 10 && (
            <div className="animate-fade-in">
              <h2 className={styles.sectionTitle}>10. Competition & Achievement History</h2>
              
              <div className={styles.formRow}>
                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.inputLabel}>Previous Competitions Participated</label>
                  <div className={styles.multiSelectWrapper}>
                    <input type="text" className={styles.appleInput} value={competitionInput} onChange={e => setCompetitionInput(e.target.value)} onKeyDown={(e) => {
                      if (e.key === 'Enter' && competitionInput.trim() !== '') {
                        e.preventDefault();
                        if (!achievements.competitions.includes(competitionInput.trim())) {
                          setAchievements({...achievements, competitions: [...achievements.competitions, competitionInput.trim()]});
                        }
                        setCompetitionInput('');
                      }
                    }} placeholder="Type competition name and press Enter" />
                    {achievements.competitions.length > 0 && (
                      <div className={styles.pillsContainer}>
                        {achievements.competitions.map((comp, idx) => (
                          <div key={idx} className={styles.tagPill}>{comp}
                            <div className={styles.removePill} onClick={() => setAchievements({...achievements, competitions: achievements.competitions.filter(c => c !== comp)})}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Achievement Level</label>
                  <select className={styles.appleSelect} value={achievements.achievementLevel} onChange={e => setAchievements({...achievements, achievementLevel: e.target.value})}>
                    <option value="">Select Level</option>
                    <option value="District">District</option>
                    <option value="State">State</option>
                    <option value="National">National</option>
                    <option value="International">International</option>
                  </select>
                </div>

                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.inputLabel}>Awards & Medals</label>
                  <div className={styles.multiSelectWrapper}>
                    <input type="text" className={styles.appleInput} value={awardInput} onChange={e => setAwardInput(e.target.value)} onKeyDown={(e) => {
                      if (e.key === 'Enter' && awardInput.trim() !== '') {
                        e.preventDefault();
                        if (!achievements.awards.includes(awardInput.trim())) {
                          setAchievements({...achievements, awards: [...achievements.awards, awardInput.trim()]});
                        }
                        setAwardInput('');
                      }
                    }} placeholder="Type award/medal and press Enter" />
                    {achievements.awards.length > 0 && (
                      <div className={styles.pillsContainer}>
                        {achievements.awards.map((award, idx) => (
                          <div key={idx} className={styles.tagPill}>{award}
                            <div className={styles.removePill} onClick={() => setAchievements({...achievements, awards: achievements.awards.filter(a => a !== award)})}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.inputLabel}>Personal Best Records</label>
                  <textarea className={styles.appleTextarea} value={achievements.personalRecords} onChange={e => setAchievements({...achievements, personalRecords: e.target.value})} placeholder="Describe personal bests..."></textarea>
                </div>

                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.inputLabel}>Certificates Upload</label>
                  <div className={styles.appleFileDropzone}>
                    <input type="file" className={styles.fileInputHidden} onChange={e => setAchievements({...achievements, certificate: e.target.files[0]})} accept=".pdf,.png,.jpg,.jpeg" />
                    <div className={styles.dropzoneContent}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                      <span className={styles.dropzoneText}>Click to upload certificate</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.actions} style={{ justifyContent: 'space-between', marginTop: '32px' }}>
                <button className="primary-button" onClick={() => setCurrentStep(9)} style={{ background: '#ffffff', border: '1px solid #D1D5DB', color: '#111827' }}>Back</button>
                <button className="primary-button" onClick={() => setCurrentStep(11)}>Continue to Step 11</button>
              </div>
            </div>
          )}

          {currentStep === 11 && (
            <div className="animate-fade-in">
              <h2 className={styles.sectionTitle}>11. Emergency Contact Information</h2>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Emergency Contact Name <span style={{color: '#EF4444'}}>*</span></label>
                  <input type="text" className={styles.appleInput} value={emergencyContact.name} onChange={e => setEmergencyContact({...emergencyContact, name: e.target.value})} placeholder="Contact Name" />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Relationship <span style={{color: '#EF4444'}}>*</span></label>
                  <select className={styles.appleSelect} value={emergencyContact.relationship} onChange={e => setEmergencyContact({...emergencyContact, relationship: e.target.value})}>
                    <option value="">Select Relationship</option>
                    <option value="Parent">Parent</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Mobile Number <span style={{color: '#EF4444'}}>*</span></label>
                  <input type="text" className={styles.appleInput} value={emergencyContact.mobile} onChange={e => setEmergencyContact({...emergencyContact, mobile: e.target.value})} placeholder="Mobile Number" />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Alternate Contact Number</label>
                  <input type="text" className={styles.appleInput} value={emergencyContact.alternateMobile} onChange={e => setEmergencyContact({...emergencyContact, alternateMobile: e.target.value})} placeholder="Optional Alternate Number" />
                </div>
              </div>
              <div className={styles.actions} style={{ justifyContent: 'space-between', marginTop: '32px' }}>
                <button className="primary-button" onClick={() => setCurrentStep(10)} style={{ background: '#ffffff', border: '1px solid #D1D5DB', color: '#111827' }}>Back</button>
                <button className="primary-button" onClick={() => setCurrentStep(12)}>Continue to Step 12</button>
              </div>
            </div>
          )}

          {currentStep === 12 && (
            <div className="animate-fade-in">
              <h2 className={styles.sectionTitle}>12. Consent & Declaration</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px' }}>Athlete Consent</h3>
                <label style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ marginTop: '4px' }} checked={consents.accurate} onChange={e => setConsents({...consents, accurate: e.target.checked})} />
                  <span style={{ color: '#374151', lineHeight: '1.5' }}>I confirm that the information provided is accurate.</span>
                </label>
                <label style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ marginTop: '4px' }} checked={consents.data} onChange={e => setConsents({...consents, data: e.target.checked})} />
                  <span style={{ color: '#374151', lineHeight: '1.5' }}>I consent to the collection and use of my personal and sports-related data.</span>
                </label>
                <label style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ marginTop: '4px' }} checked={consents.share} onChange={e => setConsents({...consents, share: e.target.checked})} />
                  <span style={{ color: '#374151', lineHeight: '1.5' }}>I authorize the platform to share my profile with authorized institutions, coaches, scouts, and scholarship providers.</span>
                </label>
                <label style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ marginTop: '4px' }} checked={consents.notifications} onChange={e => setConsents({...consents, notifications: e.target.checked})} />
                  <span style={{ color: '#374151', lineHeight: '1.5' }}>I agree to receive notifications related to competitions, training, and opportunities.</span>
                </label>

                {(athleteInfo.age !== '' && athleteInfo.age < 18) && (
                  <div style={{ marginTop: '24px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px', color: '#EF4444' }}>Parent / Guardian Consent (Mandatory for minors)</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <label style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer' }}>
                        <input type="checkbox" style={{ marginTop: '4px' }} checked={consents.parentRegistration} onChange={e => setConsents({...consents, parentRegistration: e.target.checked})} />
                        <span style={{ color: '#374151', lineHeight: '1.5' }}>I provide consent for the registration and processing of my child&apos;s information.</span>
                      </label>
                      <label style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer' }}>
                        <input type="checkbox" style={{ marginTop: '4px' }} checked={consents.parentAI} onChange={e => setConsents({...consents, parentAI: e.target.checked})} />
                        <span style={{ color: '#374151', lineHeight: '1.5' }}>I authorize participation in AI-based performance assessments and talent identification.</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.actions} style={{ justifyContent: 'space-between', marginTop: '32px' }}>
                <button className="primary-button" onClick={() => setCurrentStep(11)} style={{ background: '#ffffff', border: '1px solid #D1D5DB', color: '#111827' }}>Back</button>
                <button className="primary-button" onClick={() => setCurrentStep(13)}>Continue to Step 13</button>
              </div>
            </div>
          )}

          {currentStep === 13 && (
            <div className="animate-fade-in">
              <h2 className={styles.sectionTitle}>13. Digital Signature</h2>
              <div className={styles.formRow}>
                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.inputLabel}>Athlete Signature (Upload Image)</label>
                  <div className={styles.appleFileDropzone}>
                    <input type="file" className={styles.fileInputHidden} onChange={e => setSignatures({...signatures, athleteSignature: e.target.files[0]})} accept="image/*" />
                    <div className={styles.dropzoneContent}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                      <span className={styles.dropzoneText}>Click to upload signature</span>
                    </div>
                  </div>
                </div>

                {(athleteInfo.age !== '' && athleteInfo.age < 18) && (
                  <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                    <label className={styles.inputLabel}>Parent / Guardian Signature (for minors)</label>
                    <div className={styles.appleFileDropzone}>
                      <input type="file" className={styles.fileInputHidden} onChange={e => setSignatures({...signatures, parentSignature: e.target.files[0]})} accept="image/*" />
                      <div className={styles.dropzoneContent}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        <span className={styles.dropzoneText}>Click to upload signature</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.inputLabel}>Authorized Institute Representative Signature (if applicable)</label>
                  <div className={styles.appleFileDropzone}>
                    <input type="file" className={styles.fileInputHidden} onChange={e => setSignatures({...signatures, instituteSignature: e.target.files[0]})} accept="image/*" />
                    <div className={styles.dropzoneContent}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                      <span className={styles.dropzoneText}>Click to upload signature</span>
                    </div>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Registration Date</label>
                  <AppleDatePicker 
                    name="registrationDate" 
                    value={signatures.registrationDate} 
                    onChange={e => setSignatures({...signatures, registrationDate: e.target.value})} 
                    disabled 
                  />
                </div>
              </div>

              <div className={styles.actions} style={{ justifyContent: 'space-between', marginTop: '32px' }}>
                <button className="primary-button" onClick={() => setCurrentStep(12)} style={{ background: '#ffffff', border: '1px solid #D1D5DB', color: '#111827' }}>Back</button>
                <button className="primary-button" onClick={handleSubmit} style={{ background: '#10B981', color: 'white' }}>Submit Registration</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
