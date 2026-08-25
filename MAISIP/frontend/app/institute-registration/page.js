'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './institute-registration.module.css';
import AppleDatePicker from '../components/AppleDatePicker';
import MapModal from './MapModal';


const FileDropzone = ({ id, label, required, uploadedFile, onUpload }) => (
  <div className={styles.inputGroup}>
    <label className={styles.inputLabel}>{label} {required && <span style={{color: 'red'}}>*</span>}</label>
    <div 
      className={styles.fileUploadWrapper}
      onClick={() => document.getElementById(id).click()}
      style={{
        cursor: 'pointer',
        borderColor: uploadedFile ? '#10B981' : '',
        backgroundColor: uploadedFile ? 'rgba(16, 185, 129, 0.05)' : ''
      }}
    >
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: uploadedFile ? '#10B981' : '#9CA3AF', marginBottom: '12px'}}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line>
      </svg>
      <p style={{margin: '0 0 8px 0', fontWeight: '600', color: uploadedFile ? '#065F46' : '#374151'}}>
        {uploadedFile ? uploadedFile.name : 'Click to upload or drag and drop'}
      </p>
      {!uploadedFile && <p style={{margin: '0', fontSize: '0.85rem', color: '#6B7280'}}>PDF, JPG or PNG (MAX. 5MB)</p>}
      <input 
        type="file" 
        id={id} 
        style={{display: 'none'}} 
        onChange={(e) => onUpload(id, e.target.files[0])}
      />
    </div>
  </div>
);


export default function InstituteRegistrationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [registrationSuccessData, setRegistrationSuccessData] = useState(null);
  const [verifiedFields, setVerifiedFields] = useState({
    contactMobile: false,
    contactEmail: false,
    adminMobile: false,
    adminEmail: false
  });

  // Form Data State
  const [formData, setFormData] = useState({
    // Step 2
    orgName: '', regNumber: '', yearEstablished: '', officialWebsite: '', orgDescription: '',
    // Step 3
    govAuthority: '', recognitionNumber: '', affiliatedBoard: '', validityApproval: null,
    // Step 4
    address1: '', address2: '', city: '', district: '', state: '', country: 'India', pincode: '', latitude: '', longitude: '',
    // Step 5
    contactName: '', contactDesignation: '', contactMobile: '', contactEmail: '', contactAlt: '',
    // Step 6
    adminName: '', adminDesignation: '', adminMobile: '', adminEmail: '', adminIdType: '', adminIdNumber: '',
    // Step 7
    activeAthletes: '', numCoaches: '', numCertifiedCoaches: '',
    // Step 8
    indoorFacilities: false, outdoorFacilities: false, medicalSupport: false, hostel: false, equipmentAvailability: '',
    // Step 10
    consent1: false, consent2: false, consent3: false, consent4: false,
    // Step 11
    authName: '', authDesignation: '', authSignature: '', authDate: null
  });

  // Multi-Select States
  const [sportsOffered, setSportsOffered] = useState([]);
  const [ageCategories, setAgeCategories] = useState([]);
  const [facilityTypes, setFacilityTypes] = useState([]);

  // File Upload State
  const [uploadedFiles, setUploadedFiles] = useState({});

  const handleFileUpload = (id, file) => {
    if (file) {
      setUploadedFiles(prev => ({ ...prev, [id]: file }));
    }
  };

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDateChange = (date, name) => {
    setFormData(prev => ({ ...prev, [name]: date }));
  };

  const handleVerify = (field) => {
    if (!formData[field]) {
      alert(`Please enter your ${field.includes('Email') ? 'email' : 'mobile number'} before verifying.`);
      return;
    }
    const code = window.prompt(`A 4-digit OTP has been sent to ${formData[field]}. Please enter it below to verify:`, "1234");
    if (code) {
      setVerifiedFields(prev => ({ ...prev, [field]: true }));
    }
  };

  // Select Handlers
  const toggleArrayItem = (setter, item) => {
    setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const handleSubmit = async () => {
    // Validate all steps before submission
    for (let i = 1; i <= 11; i++) {
      if (!isStepValid(i)) {
        alert(`Please complete all required fields in Step ${i} before submitting.`);
        setCurrentStep(i);
        return;
      }
    }

    try {
      const payload = {
        selectedType: selectedType?.id,
        sportsOffered,
        ageCategories,
        facilityTypes,
        ...formData
      };

      const uploadData = new FormData();
      uploadData.append('payload', JSON.stringify(payload));
      
      Object.keys(uploadedFiles).forEach(key => {
        uploadData.append(key, uploadedFiles[key]);
      });

      const response = await fetch('http://localhost:5000/api/institute/submit', {
        method: 'POST',
        body: uploadData
      });
      
      const data = await response.json();
      if (data.success) {
        setRegistrationSuccessData({
          instituteId: data.instituteId,
          email: data.credentials.email,
          tempPassword: data.credentials.tempPassword
        });
      } else {
        alert('Registration Error: ' + data.message);
      }
    } catch (error) {
      console.error('Failed to submit institute registration:', error);
      alert('Failed to submit registration. Please ensure the backend server and database are running.');
    }
  };

  // Options Data
  const organizationTypes = [
    { id: 'school', label: 'School', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg> },
    { id: 'college', label: 'College / University', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg> },
    { id: 'academy', label: 'Sports Academy', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg> },
    { id: 'institution', label: 'Sports Institution', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="10" width="16" height="10" rx="2" ry="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M12 10V4"></path><path d="M8 4h8"></path></svg> },
    { id: 'gov', label: 'Government-Approved Sports Facility', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> }
  ];

  const govAuthorities = ['Ministry of Youth Affairs and Sports', 'State Sports Department', 'Education Board', 'University Grants Commission (UGC)', 'Sports Federation', 'Local Government Authority'];
  const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Gujarat', 'Tamil Nadu'];
  const idTypes = ['Aadhaar Card', 'PAN Card', 'Voter ID', 'Passport', 'Driving License'];
  const sportsOptions = ['Cricket', 'Football', 'Hockey', 'Badminton', 'Tennis', 'Athletics', 'Swimming', 'Basketball', 'Volleyball', 'Kabaddi', 'Kho Kho', 'Wrestling'];
  const ageCategoryOptions = ['Under 8', 'Under 10', 'Under 12', 'Under 14', 'Under 16', 'Under 18', 'Senior'];
  const facilityOptions = ['Track', 'Field', 'Gymnasium', 'Pool', 'Court', 'Indoor Arena'];

  const stepTitles = [
    "Organization Type", "Basic Organization Details", "Government Recognition", "Address Details",
    "Contact Person", "Administrator Details", "Sports Information", "Infrastructure & Facilities",
    "Document Uploads", "Declaration & Consent", "Digital Authorization"
  ];

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 11));
  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const isStepValid = (step) => {
    switch (step) {
      case 1: return selectedType !== null;
      case 2: return formData.orgName.trim() !== '' && formData.regNumber.trim() !== '' && formData.yearEstablished.trim() !== '';
      case 3: return formData.govAuthority.trim() !== '' && formData.recognitionNumber.trim() !== '';
      case 4: return formData.address1.trim() !== '' && formData.city.trim() !== '' && formData.state.trim() !== '' && formData.pincode.trim() !== '';
      case 5: return formData.contactName.trim() !== '' && formData.contactMobile.trim() !== '' && formData.contactEmail.trim() !== '';
      case 6: return formData.adminName.trim() !== '' && formData.adminMobile.trim() !== '' && formData.adminEmail.trim() !== '' && formData.adminIdType.trim() !== '' && formData.adminIdNumber.trim() !== '';
      case 7: return formData.activeAthletes.trim() !== '' && formData.numCoaches.trim() !== '' && sportsOffered.length > 0 && ageCategories.length > 0;
      case 8: return facilityTypes.length > 0;
      case 9: return !!(uploadedFiles.regCert && uploadedFiles.govCert && uploadedFiles.panCert && uploadedFiles.addressProof && uploadedFiles.sigLetter);
      case 10: return formData.consent1 && formData.consent2 && formData.consent3 && formData.consent4;
      case 11: return formData.authName.trim() !== '' && formData.authDesignation.trim() !== '' && formData.authDate !== null;
      default: return true;
    }
  };
return (
    <div className={styles.pageContainer}>
      <div className={styles.formWrapper}>
        
        {registrationSuccessData ? (
          <div className={`${styles.section} ${styles.successContainer}`}>
            <div className={styles.successIconWrapper}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <h1 className={styles.successTitle}>Registration Successful!</h1>
            <p className={styles.successSubtitle}>Your institute has been registered successfully. We have automatically generated an administrator account for you to access your dashboard.</p>
            
            <div className={styles.credentialsCard}>
              <div className={styles.credentialsHeader}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                Your Dashboard Credentials
              </div>
              <div className={styles.credentialsBody}>
                <div className={styles.credentialRow}>
                  <span className={styles.credentialLabel}>Institute ID</span>
                  <span className={styles.credentialValue}>{registrationSuccessData.instituteId}</span>
                </div>
                <div className={styles.credentialRow}>
                  <span className={styles.credentialLabel}>Login Email</span>
                  <span className={styles.credentialValue}>{registrationSuccessData.email}</span>
                </div>
                <div className={styles.credentialRow}>
                  <span className={styles.credentialLabel}>Temporary Password</span>
                  <div className={styles.passwordWrapper}>
                    <span className={styles.credentialValue} style={{ letterSpacing: '2px', fontWeight: '700', color: '#111827' }}>
                      {registrationSuccessData.tempPassword}
                    </span>
                    <span className={styles.passwordHint}>Please change this after your first login.</span>
                  </div>
                </div>
              </div>
            </div>

            <button 
              className={styles.dashboardBtn}
              onClick={() => router.push('/admin/dashboard')}
            >
              Go to Dashboard Login
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px' }}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </div>
        ) : (
          <>
        
        {currentStep === 1 && (
          <div className={styles.header}>
            <h1 className={styles.title}>Institute Registration</h1>
          </div>
        )}

        {/* --- Stepper UI --- */}
        <div style={{ textAlign: 'center', marginBottom: '16px', fontWeight: '600', color: '#4B5563', fontSize: '0.95rem' }}>
          Step {currentStep} of 11: {stepTitles[currentStep - 1]}
        </div>
        <div className={styles.stepIndicator}>
          <div className={styles.stepLineBg}></div>
          <div className={styles.stepLineFill} style={{ width: `${((currentStep - 1) / 10) * 100}%` }}></div>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(step => {
            const isCompleted = currentStep > step;
            const isValid = isStepValid(step);
            const isError = isCompleted && !isValid;
            
            return (
              <div 
                key={step} 
                className={`${styles.step} ${isCompleted && isValid ? styles.completed : isError ? styles.error : currentStep === step ? styles.active : styles.future}`}
                onClick={() => { if (step < currentStep) setCurrentStep(step); }}
                title={stepTitles[step - 1]}
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

        {/* --- Form Sections --- */}
        <div className={styles.section}>
          
          {/* SECTION 1 */}
          {currentStep === 1 && (
            <div className="animate-fade-in">
              <h2 className={styles.sectionTitle}>1. Organization Type</h2>
              <div className={styles.inputGroup} style={{ marginBottom: '24px' }}>
                <label className={styles.inputLabel}>Select Organization Category <span style={{color: 'red'}}>*</span></label>
              </div>
              <div className={styles.cardsGrid}>
                {organizationTypes.map((type) => (
                  <div 
                    key={type.id}
                    className={`${styles.sourceCard} ${selectedType?.id === type.id ? styles.selected : ''}`}
                    onClick={() => setSelectedType(type)}
                  >
                    <div className={styles.cardIcon}>{type.icon}</div>
                    <div className={styles.cardLabel}>{type.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2 */}
          {currentStep === 2 && (
            <div className="animate-fade-in">
              <h2 className={styles.sectionTitle}>2. Basic Organization Details</h2>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Organization Name <span style={{color: 'red'}}>*</span></label>
                  <input type="text" className={styles.appleInput} name="orgName" value={formData.orgName} onChange={handleInputChange} placeholder="Enter full organization name" />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Registration / Affiliation Number <span style={{color: 'red'}}>*</span></label>
                  <input type="text" className={styles.appleInput} name="regNumber" value={formData.regNumber} onChange={handleInputChange} placeholder="E.g. REG-12345" />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Year of Establishment <span style={{color: 'red'}}>*</span></label>
                  <input type="number" className={styles.appleInput} name="yearEstablished" value={formData.yearEstablished} onChange={handleInputChange} placeholder="YYYY" min="1800" max="2030" />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Official Website</label>
                  <input type="url" className={styles.appleInput} name="officialWebsite" value={formData.officialWebsite} onChange={handleInputChange} placeholder="https://www.example.com" />
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Organization Description</label>
                <textarea className={`${styles.appleInput} ${styles.appleTextarea}`} name="orgDescription" value={formData.orgDescription} onChange={handleInputChange} placeholder="Briefly describe the organization..." />
              </div>
              <FileDropzone id="orgLogo" label="Organization Logo" required={false}  uploadedFile={uploadedFiles['orgLogo']} onUpload={handleFileUpload} />
            </div>
          )}

          {/* SECTION 3 */}
          {currentStep === 3 && (
            <div className="animate-fade-in">
              <h2 className={styles.sectionTitle}>3. Government Recognition & Accreditation</h2>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Governing Authority <span style={{color: 'red'}}>*</span></label>
                  <select className={styles.appleSelect} name="govAuthority" value={formData.govAuthority} onChange={handleInputChange}>
                    <option value="">Select Authority</option>
                    {govAuthorities.map(auth => <option key={auth} value={auth}>{auth}</option>)}
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Recognition / Approval Number <span style={{color: 'red'}}>*</span></label>
                  <input type="text" className={styles.appleInput} name="recognitionNumber" value={formData.recognitionNumber} onChange={handleInputChange} placeholder="Enter number" />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Affiliated Board / University / Federation <span style={{color: 'red'}}>*</span></label>
                  <input type="text" className={styles.appleInput} name="affiliatedBoard" value={formData.affiliatedBoard} onChange={handleInputChange} placeholder="Enter board/federation name" />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Validity of Approval <span style={{color: 'red'}}>*</span></label>
                  <div className={styles.datePickerWrapper}>
                    <AppleDatePicker 
                      name="validityApproval"
                      value={formData.validityApproval} 
                      onChange={(e) => setFormData(prev => ({ ...prev, validityApproval: e.target.value }))}
                      placeholder="DD-MM-YYYY"
                    />
                  </div>
                </div>
              </div>
              <FileDropzone id="approvalCert" label="Approval Certificate" required={true}  uploadedFile={uploadedFiles['approvalCert']} onUpload={handleFileUpload} />
            </div>
          )}

          {/* SECTION 4 */}
          {currentStep === 4 && (
            <div className="animate-fade-in">
              <h2 className={styles.sectionTitle}>4. Address Details</h2>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Address Line 1 <span style={{color: 'red'}}>*</span></label>
                  <input type="text" className={styles.appleInput} name="address1" value={formData.address1} onChange={handleInputChange} placeholder="Street address" />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Address Line 2</label>
                  <input type="text" className={styles.appleInput} name="address2" value={formData.address2} onChange={handleInputChange} placeholder="Apartment, suite, etc." />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>City / Town <span style={{color: 'red'}}>*</span></label>
                  <input type="text" className={styles.appleInput} name="city" value={formData.city} onChange={handleInputChange} placeholder="City name" />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>District <span style={{color: 'red'}}>*</span></label>
                  <input type="text" className={styles.appleInput} name="district" value={formData.district} onChange={handleInputChange} placeholder="District name" />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>State <span style={{color: 'red'}}>*</span></label>
                  <select className={styles.appleSelect} name="state" value={formData.state} onChange={handleInputChange}>
                    <option value="">Select State</option>
                    {states.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Country <span style={{color: 'red'}}>*</span></label>
                  <select className={styles.appleSelect} name="country" value={formData.country} onChange={handleInputChange}>
                    <option value="India">India</option>
                  </select>
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>PIN / Postal Code <span style={{color: 'red'}}>*</span></label>
                  <input type="text" className={styles.appleInput} name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="e.g. 400001" />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Latitude & Longitude</label>
                  <div style={{display: 'flex', gap: '8px'}}>
                    <input type="text" className={styles.appleInput} name="latitude" value={formData.latitude} onChange={handleInputChange} placeholder="Lat" />
                    <input type="text" className={styles.appleInput} name="longitude" value={formData.longitude} onChange={handleInputChange} placeholder="Long" />
                    <button 
                      type="button" 
                      onClick={() => setShowMapModal(true)} 
                      style={{
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '6px', 
                        padding: '0 16px', 
                        backgroundColor: '#F8FAFC', 
                        color: '#0F172A', 
                        border: '1px solid #E2E8F0', 
                        borderRadius: '12px', 
                        fontWeight: '600', 
                        fontSize: '14px', 
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#F1F5F9'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
                      onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      Open Map
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5 */}
          {currentStep === 5 && (
            <div className="animate-fade-in">
              <h2 className={styles.sectionTitle}>5. Contact Person Details</h2>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Full Name <span style={{color: 'red'}}>*</span></label>
                  <input type="text" className={styles.appleInput} name="contactName" value={formData.contactName} onChange={handleInputChange} placeholder="Contact person's name" />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Designation <span style={{color: 'red'}}>*</span></label>
                  <input type="text" className={styles.appleInput} name="contactDesignation" value={formData.contactDesignation} onChange={handleInputChange} placeholder="E.g. Principal, Director" />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Mobile Number <span style={{color: 'red'}}>*</span></label>
                  <div className={styles.otpWrapper}>
                    <input type="tel" className={`${styles.appleInput} ${styles.otpInput}`} name="contactMobile" value={formData.contactMobile} onChange={handleInputChange} placeholder="+91" disabled={verifiedFields.contactMobile} />
                    {verifiedFields.contactMobile ? (
                      <button type="button" className={styles.verifyBtn} style={{backgroundColor: '#10b981', color: 'white', borderColor: '#10b981'}}>Verified ✓</button>
                    ) : (
                      <button type="button" className={styles.verifyBtn} onClick={() => handleVerify('contactMobile')}>Verify</button>
                    )}
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Email Address <span style={{color: 'red'}}>*</span></label>
                  <div className={styles.otpWrapper}>
                    <input type="email" className={`${styles.appleInput} ${styles.otpInput}`} name="contactEmail" value={formData.contactEmail} onChange={handleInputChange} placeholder="email@example.com" disabled={verifiedFields.contactEmail} />
                    {verifiedFields.contactEmail ? (
                      <button type="button" className={styles.verifyBtn} style={{backgroundColor: '#10b981', color: 'white', borderColor: '#10b981'}}>Verified ✓</button>
                    ) : (
                      <button type="button" className={styles.verifyBtn} onClick={() => handleVerify('contactEmail')}>Verify</button>
                    )}
                  </div>
                </div>
              </div>
              <div className={styles.inputGroup} style={{maxWidth: '50%'}}>
                <label className={styles.inputLabel}>Alternate Contact Number</label>
                <input type="tel" className={styles.appleInput} name="contactAlt" value={formData.contactAlt} onChange={handleInputChange} placeholder="+91" />
              </div>
            </div>
          )}

          {/* SECTION 6 */}
          {currentStep === 6 && (
            <div className="animate-fade-in">
              <h2 className={styles.sectionTitle}>6. Administrator Details</h2>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Administrator Name <span style={{color: 'red'}}>*</span></label>
                  <input type="text" className={styles.appleInput} name="adminName" value={formData.adminName} onChange={handleInputChange} placeholder="Name" />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Designation <span style={{color: 'red'}}>*</span></label>
                  <input type="text" className={styles.appleInput} name="adminDesignation" value={formData.adminDesignation} onChange={handleInputChange} placeholder="Designation" />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Mobile Number <span style={{color: 'red'}}>*</span></label>
                  <div className={styles.otpWrapper}>
                    <input type="tel" className={`${styles.appleInput} ${styles.otpInput}`} name="adminMobile" value={formData.adminMobile} onChange={handleInputChange} placeholder="+91" disabled={verifiedFields.adminMobile} />
                    {verifiedFields.adminMobile ? (
                      <button type="button" className={styles.verifyBtn} style={{backgroundColor: '#10b981', color: 'white', borderColor: '#10b981'}}>Verified ✓</button>
                    ) : (
                      <button type="button" className={styles.verifyBtn} onClick={() => handleVerify('adminMobile')}>Verify</button>
                    )}
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Email Address <span style={{color: 'red'}}>*</span></label>
                  <div className={styles.otpWrapper}>
                    <input type="email" className={`${styles.appleInput} ${styles.otpInput}`} name="adminEmail" value={formData.adminEmail} onChange={handleInputChange} placeholder="admin@example.com" disabled={verifiedFields.adminEmail} />
                    {verifiedFields.adminEmail ? (
                      <button type="button" className={styles.verifyBtn} style={{backgroundColor: '#10b981', color: 'white', borderColor: '#10b981'}}>Verified ✓</button>
                    ) : (
                      <button type="button" className={styles.verifyBtn} onClick={() => handleVerify('adminEmail')}>Verify</button>
                    )}
                  </div>
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Government ID Type <span style={{color: 'red'}}>*</span></label>
                  <select className={styles.appleSelect} name="adminIdType" value={formData.adminIdType} onChange={handleInputChange}>
                    <option value="">Select ID Type</option>
                    {idTypes.map(id => <option key={id} value={id}>{id}</option>)}
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Government ID Number <span style={{color: 'red'}}>*</span></label>
                  <input type="text" className={styles.appleInput} name="adminIdNumber" value={formData.adminIdNumber} onChange={handleInputChange} placeholder="ID Number" />
                </div>
              </div>
              <FileDropzone id="adminIdProof" label="ID Proof Upload" required={true}  uploadedFile={uploadedFiles['adminIdProof']} onUpload={handleFileUpload} />
            </div>
          )}

          {/* SECTION 7 */}
          {currentStep === 7 && (
            <div className="animate-fade-in">
              <h2 className={styles.sectionTitle}>7. Sports Information</h2>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Sports Offered <span style={{color: 'red'}}>*</span></label>
                <div className={styles.multiSelectWrapper}>
                  <div className={styles.pillsContainer}>
                    {sportsOffered.map(sport => (
                      <span key={sport} className={styles.tagPill}>
                        {sport}
                        <div className={styles.removePill} onClick={() => toggleArrayItem(setSportsOffered, sport)}>✕</div>
                      </span>
                    ))}
                  </div>
                  <select className={styles.appleSelect} onChange={(e) => {
                    if (e.target.value) toggleArrayItem(setSportsOffered, e.target.value);
                    e.target.value = '';
                  }}>
                    <option value="">+ Add Sport</option>
                    {sportsOptions.filter(s => !sportsOffered.includes(s)).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Age Categories Supported <span style={{color: 'red'}}>*</span></label>
                <div className={styles.multiSelectWrapper}>
                  <div className={styles.pillsContainer}>
                    {ageCategories.map(cat => (
                      <span key={cat} className={styles.tagPill}>
                        {cat}
                        <div className={styles.removePill} onClick={() => toggleArrayItem(setAgeCategories, cat)}>✕</div>
                      </span>
                    ))}
                  </div>
                  <select className={styles.appleSelect} onChange={(e) => {
                    if (e.target.value) toggleArrayItem(setAgeCategories, e.target.value);
                    e.target.value = '';
                  }}>
                    <option value="">+ Add Age Category</option>
                    {ageCategoryOptions.filter(a => !ageCategories.includes(a)).map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Number of Active Athletes <span style={{color: 'red'}}>*</span></label>
                  <input type="number" className={styles.appleInput} name="activeAthletes" value={formData.activeAthletes} onChange={handleInputChange} placeholder="0" />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Number of Coaches</label>
                  <input type="number" className={styles.appleInput} name="numCoaches" value={formData.numCoaches} onChange={handleInputChange} placeholder="0" />
                </div>
              </div>
              <div className={styles.inputGroup} style={{maxWidth: '50%'}}>
                <label className={styles.inputLabel}>Number of Certified Coaches</label>
                <input type="number" className={styles.appleInput} name="numCertifiedCoaches" value={formData.numCertifiedCoaches} onChange={handleInputChange} placeholder="0" />
              </div>
            </div>
          )}

          {/* SECTION 8 */}
          {currentStep === 8 && (
            <div className="animate-fade-in">
              <h2 className={styles.sectionTitle}>8. Infrastructure & Facilities</h2>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Facility Type <span style={{color: 'red'}}>*</span></label>
                <div className={styles.multiSelectWrapper}>
                  <div className={styles.pillsContainer}>
                    {facilityTypes.map(fac => (
                      <span key={fac} className={styles.tagPill}>
                        {fac}
                        <div className={styles.removePill} onClick={() => toggleArrayItem(setFacilityTypes, fac)}>✕</div>
                      </span>
                    ))}
                  </div>
                  <select className={styles.appleSelect} onChange={(e) => {
                    if (e.target.value) toggleArrayItem(setFacilityTypes, e.target.value);
                    e.target.value = '';
                  }}>
                    <option value="">+ Add Facility Type</option>
                    {facilityOptions.filter(f => !facilityTypes.includes(f)).map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <label className={styles.checkboxGroup}>
                  <input type="checkbox" className={styles.checkbox} name="indoorFacilities" checked={formData.indoorFacilities} onChange={handleInputChange} />
                  <span style={{fontWeight: 600, color: '#374151'}}>Indoor Facilities Available</span>
                </label>
                <label className={styles.checkboxGroup}>
                  <input type="checkbox" className={styles.checkbox} name="outdoorFacilities" checked={formData.outdoorFacilities} onChange={handleInputChange} />
                  <span style={{fontWeight: 600, color: '#374151'}}>Outdoor Facilities Available</span>
                </label>
              </div>

              <div className={styles.formRow}>
                <label className={styles.checkboxGroup}>
                  <input type="checkbox" className={styles.checkbox} name="medicalSupport" checked={formData.medicalSupport} onChange={handleInputChange} />
                  <span style={{fontWeight: 600, color: '#374151'}}>Medical Support Available</span>
                </label>
                <label className={styles.checkboxGroup}>
                  <input type="checkbox" className={styles.checkbox} name="hostel" checked={formData.hostel} onChange={handleInputChange} />
                  <span style={{fontWeight: 600, color: '#374151'}}>Hostel / Accommodation</span>
                </label>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Equipment Availability</label>
                <textarea className={`${styles.appleInput} ${styles.appleTextarea}`} name="equipmentAvailability" value={formData.equipmentAvailability} onChange={handleInputChange} placeholder="List available training equipment..." />
              </div>
              <FileDropzone id="facilityPhotos" label="Facility Photos" required={false}  uploadedFile={uploadedFiles['facilityPhotos']} onUpload={handleFileUpload} />
            </div>
          )}

          {/* SECTION 9 */}
          {currentStep === 9 && (
            <div className="animate-fade-in">
              <h2 className={styles.sectionTitle}>9. Document Uploads</h2>
              <div className={styles.formRow}>
                <FileDropzone id="regCert" label="Registration Certificate" required={true}  uploadedFile={uploadedFiles['regCert']} onUpload={handleFileUpload} />
                <FileDropzone id="govCert" label="Government Approval Certificate" required={true}  uploadedFile={uploadedFiles['govCert']} onUpload={handleFileUpload} />
              </div>
              <div className={styles.formRow}>
                <FileDropzone id="panCert" label="PAN / Tax Registration Certificate" required={true}  uploadedFile={uploadedFiles['panCert']} onUpload={handleFileUpload} />
                <FileDropzone id="addressProof" label="Address Proof" required={true}  uploadedFile={uploadedFiles['addressProof']} onUpload={handleFileUpload} />
              </div>
              <div className={styles.formRow}>
                <FileDropzone id="sigLetter" label="Authorized Signatory Letter" required={true}  uploadedFile={uploadedFiles['sigLetter']} onUpload={handleFileUpload} />
                <FileDropzone id="orgLogo9" label="Organization Logo" required={false}  uploadedFile={uploadedFiles['orgLogo9']} onUpload={handleFileUpload} />
              </div>
            </div>
          )}

          {/* SECTION 10 */}
          {currentStep === 10 && (
            <div className="animate-fade-in">
              <h2 className={styles.sectionTitle}>10. Declaration & Consent</h2>
              <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                <label className={styles.checkboxGroup}>
                  <input type="checkbox" className={styles.checkbox} name="consent1" checked={formData.consent1} onChange={handleInputChange} />
                  <span style={{fontWeight: 500, color: '#374151'}}>We confirm that all information provided is accurate and complete.</span>
                </label>
                <label className={styles.checkboxGroup}>
                  <input type="checkbox" className={styles.checkbox} name="consent2" checked={formData.consent2} onChange={handleInputChange} />
                  <span style={{fontWeight: 500, color: '#374151'}}>We agree to create athlete profiles only after obtaining consent from athletes or their parents/guardians.</span>
                </label>
                <label className={styles.checkboxGroup}>
                  <input type="checkbox" className={styles.checkbox} name="consent3" checked={formData.consent3} onChange={handleInputChange} />
                  <span style={{fontWeight: 500, color: '#374151'}}>We agree to comply with applicable data privacy, child protection, and sports governance regulations.</span>
                </label>
                <label className={styles.checkboxGroup}>
                  <input type="checkbox" className={styles.checkbox} name="consent4" checked={formData.consent4} onChange={handleInputChange} />
                  <span style={{fontWeight: 500, color: '#374151'}}>We understand that false information may result in suspension or termination of platform access.</span>
                </label>
              </div>
            </div>
          )}

          {/* SECTION 11 */}
          {currentStep === 11 && (
            <div className="animate-fade-in">
              <h2 className={styles.sectionTitle}>11. Digital Authorization</h2>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Name of Authorized Signatory <span style={{color: 'red'}}>*</span></label>
                  <input type="text" className={styles.appleInput} name="authName" value={formData.authName} onChange={handleInputChange} placeholder="Full Name" />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Designation <span style={{color: 'red'}}>*</span></label>
                  <input type="text" className={styles.appleInput} name="authDesignation" value={formData.authDesignation} onChange={handleInputChange} placeholder="E.g. Principal, Director" />
                </div>
              </div>
              <div className={styles.formRow}>
                <FileDropzone id="authSignature" label="Digital Signature / e-Sign" required={true}  uploadedFile={uploadedFiles['authSignature']} onUpload={handleFileUpload} />
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Date <span style={{color: 'red'}}>*</span></label>
                  <div className={styles.datePickerWrapper}>
                    <AppleDatePicker 
                      name="authDate"
                      value={formData.authDate} 
                      onChange={(e) => setFormData({...formData, authDate: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- Navigation Buttons --- */}
          <div className={styles.formActions}>
            {currentStep > 1 ? (
              <button 
                className="primary-button" 
                onClick={handlePrev}
                style={{ background: '#ffffff', border: '1px solid #D1D5DB', color: '#111827' }}
              >
                Back
              </button>
            ) : <div></div>}
            
            {currentStep < 11 ? (
              <button 
                className="primary-button" 
                onClick={handleNext}
                disabled={currentStep === 1 && !selectedType}
                style={{ 
                  backgroundColor: '#111827', 
                  border: 'none', 
                  color: '#ffffff',
                  opacity: (currentStep === 1 && !selectedType) ? 0.5 : 1, 
                  cursor: (currentStep === 1 && !selectedType) ? 'not-allowed' : 'pointer' 
                }}
              >
                Continue to Step {currentStep + 1}
              </button>
            ) : (
              <button 
                className="primary-button" 
                onClick={handleSubmit}
                style={{ background: '#10B981', color: '#ffffff' }}
              >
                Submit Registration
              </button>
            )}
          </div>

        </div>
        </>
        )}
      </div>

      {showMapModal && (
        <MapModal
          onClose={() => setShowMapModal(false)}
          initialLat={formData.latitude}
          initialLng={formData.longitude}
          onSave={(lat, lng) => {
            setFormData(prev => ({
              ...prev,
              latitude: lat.toFixed(6),
              longitude: lng.toFixed(6)
            }));
            setShowMapModal(false);
          }}
        />
      )}
    </div>
  );
}
