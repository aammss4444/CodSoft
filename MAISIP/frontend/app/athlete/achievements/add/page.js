'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AppleDatePicker from '../../../components/AppleDatePicker';
import styles from './add.module.css';

const STEPS = [
  { id: 1, label: 'Athlete & Submitter' },
  { id: 2, label: 'Achievement Details' },
  { id: 3, label: 'Competition Details' },
  { id: 4, label: 'Result & Performance' },
  { id: 5, label: 'Documents & Evidence' },
  { id: 6, label: 'Verification & Visibility' },
  { id: 7, label: 'Review & Submit' }
];

const ACHIEVEMENT_CATEGORIES = [
  'Medal', 'Ranking', 'Certificate', 'Personal Best', 'Sports Record',
  'Competition Result', 'Selection', 'Participation', 'Award / Recognition',
  'Scholarship', 'Team Achievement', 'Other'
];

const ACHIEVEMENT_SUBTYPES = {
  'Medal': ['Gold Medal', 'Silver Medal', 'Bronze Medal', 'Other Medal'],
  'Ranking': ['Competition Ranking', 'District Ranking', 'State Ranking', 'National Ranking', 'International Ranking', 'Federation Ranking', 'Season Ranking'],
  'Certificate': ['Participation Certificate', 'Merit Certificate', 'Medal Certificate', 'Ranking Certificate', 'Selection Certificate', 'Record Certificate', 'Appreciation Certificate', 'Completion Certificate'],
  'Personal Best': ['New Personal Best', 'Season Best', 'Equal Personal Best', 'Improved Personal Best'],
  'Selection': ['District Team Selection', 'State Team Selection', 'National Camp Selection', 'National Team Selection', 'International Team Selection', 'Training Camp Selection', 'Scholarship Selection'],
  'Sports Record': ['Institute Record', 'District Record', 'State Record', 'University Record', 'National Record', 'International Record', 'Championship Record'],
  'Scholarship': ['Merit-Based Scholarship', 'Sports Quota Scholarship', 'Government Scholarship', 'Private / Corporate Scholarship', 'Institute / University Scholarship', 'Federation Scholarship', 'International Scholarship', 'Need-Based Sports Scholarship', 'Training Grant', 'Other Scholarship']
};

const SCHOLARSHIP_TYPES = ['Full Scholarship', 'Partial Scholarship', 'Tuition Waiver', 'Training Grant', 'Stipend', 'Equipment / Kit Grant', 'Travel Grant', 'Coaching Support', 'Other'];
const SCHOLARSHIP_STATUSES = ['Applied', 'Shortlisted', 'Awarded', 'Active', 'Completed', 'Renewed', 'Expired', 'Revoked'];

const ACHIEVEMENT_LEVELS = [
  'School', 'College', 'Academy', 'Club', 'Taluka', 'District', 'Divisional', 'State', 'Zonal', 'University', 'National', 'International', 'Federation', 'Open Championship'
];

const TEAM_RESULTS = [
  'Winner', 'Runner-up', 'Third Position', 'Qualified', 'Participated', 'Other'
];

const COMPETITION_FORMATS = ['Individual', 'Team', 'Relay', 'Doubles', 'Mixed', 'Other'];
const COMPETITION_ROUNDS = ['Qualification', 'Heat', 'Preliminary', 'League', 'Quarterfinal', 'Semifinal', 'Final', 'Knockout', 'Other'];
const COMPETITION_MODES = ['Offline', 'Online', 'Hybrid'];
const AGE_GROUPS = ['Under 12', 'Under 14', 'Under 16', 'Under 18', 'Under 21', 'Senior', 'Veteran', 'Open'];
const COUNTRIES = ['India', 'Other'];
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Puducherry', 'Chandigarh'
];


const RESULT_OPTIONS = [
  'Gold Medal', 'Silver Medal', 'Bronze Medal', 'First Position', 'Second Position', 'Third Position', 
  'Qualified', 'Selected', 'Winner', 'Runner-up', 'Finalist', 'Semifinalist', 'Participated', 
  'Record Created', 'Record Broken', 'Certificate Awarded', 'Other'
];

const MEASUREMENT_UNITS = [
  'Hours', 'Minutes', 'Seconds', 'Milliseconds', 'Metres', 'Centimetres', 'Kilometres', 
  'Kilograms', 'Points', 'Goals', 'Repetitions', 'Other'
];

const RECORD_TYPES = [
  'Institute Record', 'School Record', 'College Record', 'District Record', 'State Record', 
  'University Record', 'National Record', 'Asian Record', 'International Record', 
  'World Record', 'Championship Record', 'Personal Record'
];

export default function AddAchievementWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    submitter_role: 'Athlete',
    submitter_name: '',
    organization_name: '',
    institute_id: '',
    achievement_category: '',
    achievement_subtype: '',
    achievement_level: '',
    individual_or_team: 'Individual',
    achievement_reference_number: '',
    official_achievement_url: '',
    team_name: '',
    team_sport: '',
    team_role: '',
    team_result: '',
    team_captain: '',
    team_members_count: '',
    title: '',
    description: '',
    achievement_date: '',
    age_at_achievement: '',
    competition_name: '',
    competition_level: '',
    result_rank: '',
    performance_metric: '',
    visibility_level: 'Public',
    certificates_upload: null, // file path will be stored here after upload
    
    // Step 3 new fields
    event_registration_number: '',
    organized_by: '',
    recognized_by: '',
    governing_federation: '',
    competition_start_date: '',
    competition_end_date: '',
    venue_name: '',
    address: '',
    city: '',
    district: '',
    state: '',
    country: 'India',
    competition_format: '',
    competition_mode: '',
    age_group: '',
    weight_category: '',
    competition_round: '',
    official_result_link: '',
    event_brochure_available: '',
    // Step 4 new fields
    result_type: '',
    final_position_rank: '',
    total_participants: '',
    medal_type: '',
    score_points: '',
    result_declaration_date: '',
    official_result_number: '',
    result_remarks: '',
    performance_value: '',
    measurement_unit: '',
    timing: '',
    distance: '',
    height: '',
    weight_lifted: '',
    score: '',
    goals_points: '',
    attempts: '',
    valid_attempts: '',
    personal_best_achieved: 'No',
    prev_personal_best: '',
    new_personal_best: '',
    pb_unit: '',
    pb_improvement: '',
    pb_date: '',
    record_achieved: 'No',
    record_type: '',
    previous_record: '',
    new_record: '',
    record_holder_before: '',
    recognition_authority: '',
    record_certificate_number: '',
    record_recognition_date: '',
    ranking_position: '',
    previous_ranking: '',
    ranking_category: '',
    ranking_authority: '',
    ranking_period: '',
    ranking_publication_date: '',
    ranking_list_url: '',
    selected_for: '',
    selection_level: '',
    selection_authority: '',
    selection_date: '',
    camp_team_start_date: '',
    camp_team_end_date: '',
    selection_letter_number: '',

    // Scholarship fields
    scholarship_name: '',
    scholarship_provider: '',
    scholarship_type: '',
    scholarship_status: '',
    scholarship_amount: '',
    scholarship_currency: 'INR',
    scholarship_frequency: '',
    scholarship_start_date: '',
    scholarship_end_date: '',
    scholarship_duration_months: '',
    scholarship_criteria: '',
    scholarship_sport_basis: '',
    scholarship_reference_number: '',
    scholarship_letter_date: '',
    scholarship_conditions: '',
    scholarship_renewal: 'No',
    scholarship_benefits: '',

    // Step 5 new fields
    certificate_available: 'No',
    certificate_number: '',
    certificate_type: '',
    certificate_issue_date: '',
    issuing_authority: '',
    certificate_expiry_date: '',
    certificate_verification_url: '',
    qr_code_on_certificate: 'No',
    documents: [] // Array to hold uploaded document metadata
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return router.push('/');

        const res = await fetch('http://localhost:5000/api/athletes/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success && data.data) {
          setProfileData(data.data);
          
          // Pre-fill submitter name if default is Athlete
          setFormData(prev => ({
            ...prev,
            submitter_name: data.data.full_name || ''
          }));
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const handleRoleChange = (e) => {
    const role = e.target.value;
    setFormData(prev => {
      const newData = { ...prev, submitter_role: role };
      
      if (role === 'athlete') {
        newData.submitter_name = profileData?.full_name || '';
        newData.organization_name = '';
        newData.institute_id = '';
      } else {
        // Auto-fill from institute if available
        newData.submitter_name = profileData?.coach_details?.coach_name || '';
        newData.organization_name = profileData?.education?.school || profileData?.coach_details?.institute_name || '';
        newData.institute_id = profileData?.institute_id || profileData?.coach_details?.institute_athlete_id || '';
      }
      return newData;
    });
  };

  const calculateAgeAtDate = (dob, targetDate) => {
    if (!dob || !targetDate) return null;
    const birthDate = new Date(dob);
    const eventDate = new Date(targetDate);
    if (isNaN(birthDate.getTime()) || isNaN(eventDate.getTime())) return null;
    let age = eventDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = eventDate.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && eventDate.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : null;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'achievement_date' && value) {
        const dob = profileData?.date_of_birth || profileData?.dob;
        if (dob) {
          const calculatedAge = calculateAgeAtDate(dob, value);
          if (calculatedAge !== null) {
            updated.age_at_achievement = calculatedAge;
          }
        }
      }
      return updated;
    });
  };

  const handleCategoryChange = (category) => {
    setFormData(prev => ({
      ...prev,
      achievement_category: category,
      achievement_subtype: '' // Reset subtype when category changes
    }));
  };

  const handleNext = () => {
    if (currentStep === 3) {
      if (formData.competition_start_date && formData.competition_end_date) {
        if (new Date(formData.competition_end_date) < new Date(formData.competition_start_date)) {
          alert("Competition end date cannot be before the start date.");
          return;
        }
      }
      if (formData.achievement_date) {
        const achDate = new Date(formData.achievement_date);
        const today = new Date();
        if (achDate > today) {
          alert("Future achievement dates are not permitted.");
          return;
        }
        if (formData.competition_start_date) {
          const startDate = new Date(formData.competition_start_date);
          if (achDate < startDate) {
            alert("Achievement date should fall within or immediately after the event dates (cannot be before the start date).");
            return;
          }
        }
      }
      if (formData.country === 'India' && (!formData.state || !formData.district)) {
        alert("State and District are required for events in India.");
        return;
      }
    }
    if (currentStep < 7) setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('authToken');
      const payload = {
        ...formData,
        result_rank: formData.result_rank || formData.final_position_rank || formData.result_type || 'Participated',
        performance_metric: formData.performance_metric || formData.performance_value || '',
        evidence_url: formData.evidence_url || formData.official_result_link || formData.certificate_verification_url || ''
      };
      const res = await fetch('http://localhost:5000/api/athletes/me/achievements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        router.push('/athlete/achievements/my-achievements');
      } else {
        alert(data.message || 'Error submitting achievement');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting achievement');
    } finally {
      setSubmitting(false);
    }
  };

  const isStepIncomplete = (stepId) => {
    switch(stepId) {
      case 1:
        if (formData.submitter_role !== 'athlete') {
          return !formData.submitter_name || !formData.organization_name;
        }
        return false;
      case 2:
        return !formData.achievement_category || !formData.achievement_level || !formData.achievement_date || !formData.title;
      case 3:
        if (!formData.competition_name || !formData.competition_start_date || !formData.competition_end_date) return true;
        if (formData.country === 'India' && (!formData.state || !formData.district)) return true;
        return false;
      case 4:
        return !formData.result_type;
      case 5:
        // Assume incomplete if no evidence URL and no documents (for now just checking evidence url or just return false since it's optional)
        return false;
      case 6:
        return !formData.visibility_level;
      default:
        return false;
    }
  };

  if (loading) {
    return <div className={styles.pageContainer}>Loading...</div>;
  }

  return (
    <div className={styles.pageContainer}>

      <h1 className={styles.pageTitle}>Add New Achievement</h1>
      <p className={styles.pageSubtitle}>Create a verified entry in your Digital Achievement Ledger</p>

      {/* Stepper */}
      <div className={styles.stepperContainer}>
        {STEPS.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isIncomplete = isCompleted && isStepIncomplete(step.id);
          return (
            <div key={step.id} style={{ display: 'flex', alignItems: 'center', flexGrow: index === STEPS.length - 1 ? 0 : 1 }}>
              <div className={`${styles.stepItem} ${currentStep === step.id ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}>
                <div className={styles.stepNumber} style={isIncomplete ? { backgroundColor: '#FEF2F2', borderColor: '#EF4444', color: '#EF4444' } : {}}>
                  {isCompleted ? (
                    isIncomplete ? (
                      <span style={{fontWeight: 'bold', fontSize: '14px'}}>!</span>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    )
                  ) : step.id}
                </div>
                <span className={styles.stepLabel} style={isIncomplete ? { color: '#EF4444' } : {}}>{step.label}</span>
              </div>
              {index < STEPS.length - 1 && <div className={styles.stepDivider}></div>}
            </div>
          );
        })}
      </div>

      <div className={styles.mainLayout}>
        {/* Form Content */}
        <div className={styles.formSection}>
          
          {currentStep === 1 && (
            <>

              
              <div className={styles.card}>
                <h3 className={styles.subSectionTitle}>A. Athlete Information <span className={styles.subSectionSubtitle}>(Auto-filled from profile)</span></h3>
                <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
                  <div className={styles.avatarWrapper} style={{ width: '100px', height: '100px', flexShrink: 0 }}>
                    {profileData?.profile_picture ? (
                      <img src={`http://localhost:5000${profileData.profile_picture}`} alt="Avatar" className={styles.avatarImage} />
                    ) : (
                      <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#94a3b8' }}>{profileData?.full_name?.charAt(0)}</span>
                    )}
                  </div>
                  
                  <div className={styles.infoGrid} style={{ flexGrow: 1, gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Athlete ID</span>
                      <span className={styles.infoValue}>ATH-{profileData?.id}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Full Name</span>
                      <span className={styles.infoValue}>{profileData?.full_name || 'N/A'}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Date of Birth</span>
                      <span className={styles.infoValue}>{profileData?.date_of_birth ? new Date(profileData.date_of_birth).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Age</span>
                      <span className={styles.infoValue}>{profileData?.age ? `${profileData.age} Years` : 'N/A'}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Gender</span>
                      <span className={styles.infoValue}>{profileData?.gender || 'N/A'}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Sport</span>
                      <span className={styles.infoValue}>{profileData?.sports_profile?.primary_sport || 'N/A'}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Event / Position</span>
                      <span className={styles.infoValue}>{profileData?.sports_profile?.position || 'N/A'}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Age Category</span>
                      <span className={styles.infoValue}>Under 20</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Verification Status</span>
                      <span className={styles.statusBadge} style={{ alignSelf: 'flex-start' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        {profileData?.verification_status || 'Verified Athlete'}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Current Institute</span>
                      <span className={styles.infoValue}>{profileData?.education?.school || 'N/A'}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Institute ID</span>
                      <span className={styles.infoValue}>{profileData?.institute_id || 'N/A'}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Coach</span>
                      <span className={styles.infoValue}>{profileData?.coach_details?.coach_name || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.divider}></div>
                <h3 className={styles.subSectionTitle}>B. Entry Submitted By</h3>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Submitted By Role</label>
                    <select name="submitter_role" className={styles.select} value={formData.submitter_role} onChange={handleRoleChange}>
                      <option value="Athlete">Athlete</option>
                      <option value="School">School</option>
                      <option value="College / University">College / University</option>
                      <option value="Sports Academy">Sports Academy</option>
                      <option value="Sports Institution">Sports Institution</option>
                      <option value="Government-Approved Sports Facility">Government-Approved Sports Facility</option>
                    </select>
                  </div>
                  
                  {formData.submitter_role === 'athlete' ? (
                    <>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Athlete Name</label>
                        <input type="text" className={styles.input} value={profileData?.full_name || ''} disabled />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Athlete ID</label>
                        <input type="text" className={styles.input} value={profileData?.id ? `ATH-${profileData.id}` : ''} disabled />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Submitter Name</label>
                        <input type="text" name="submitter_name" className={styles.input} value={formData.submitter_name} onChange={handleInputChange} placeholder="e.g., Coach Name" />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Institute Name <span style={{fontSize: '11px', color: '#10B981', fontWeight: '500'}}>(Auto-filled)</span></label>
                        <input type="text" className={styles.input} value={formData.organization_name} disabled style={{ backgroundColor: '#F8FAFC', color: '#334155', cursor: 'not-allowed' }} />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Institute Code / ID <span style={{fontSize: '11px', color: '#10B981', fontWeight: '500'}}>(Auto-filled)</span></label>
                        <input type="text" className={styles.input} value={formData.institute_id} disabled style={{ backgroundColor: '#F8FAFC', color: '#334155', cursor: 'not-allowed' }} />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div className={styles.card}>
                <h3 className={styles.subSectionTitle}>A. Achievement Category</h3>
                <div className={styles.categoryGrid}>
                  {ACHIEVEMENT_CATEGORIES.map(category => (
                    <div 
                      key={category}
                      className={`${styles.categoryCard} ${formData.achievement_category === category ? styles.categoryCardActive : ''}`}
                      onClick={() => handleCategoryChange(category)}
                    >
                      {category}
                    </div>
                  ))}
                </div>
              </div>

              {formData.achievement_category && (
                <div className={styles.card} style={{ marginTop: '32px' }}>
                  <h3 className={styles.subSectionTitle}>B. Achievement Subtype</h3>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Select Subtype</label>
                      {ACHIEVEMENT_SUBTYPES[formData.achievement_category] ? (
                        <select name="achievement_subtype" className={styles.select} value={formData.achievement_subtype} onChange={handleInputChange}>
                          <option value="">Select Subtype</option>
                          {ACHIEVEMENT_SUBTYPES[formData.achievement_category].map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      ) : (
                        <input type="text" name="achievement_subtype" className={styles.input} value={formData.achievement_subtype} onChange={handleInputChange} placeholder="e.g., Specific detail (if applicable)" />
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className={styles.card} style={{ marginTop: '32px' }}>
                <h3 className={styles.subSectionTitle}>C. General Achievement Fields</h3>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                    <label className={styles.label}>Achievement Title</label>
                    <input type="text" name="title" className={styles.input} value={formData.title} onChange={handleInputChange} placeholder="e.g., Gold Medal in 400m Sprint" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Achievement Level</label>
                    <select name="achievement_level" className={styles.select} value={formData.achievement_level} onChange={handleInputChange}>
                      <option value="">Select Level</option>
                      {ACHIEVEMENT_LEVELS.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Achievement Date</label>
                    <AppleDatePicker name="achievement_date" value={formData.achievement_date} onChange={handleInputChange} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Athlete&apos;s Age When Received (Years)</label>
                    <input 
                      type="number" 
                      name="age_at_achievement" 
                      className={styles.input} 
                      value={formData.age_at_achievement} 
                      onChange={handleInputChange} 
                      min="1" 
                      max="120"
                      placeholder="e.g., 18" 
                    />
                    {profileData?.date_of_birth && formData.achievement_date && formData.age_at_achievement && (
                      <span style={{ fontSize: '11px', color: '#0284c7', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>⚡</span> Auto-calculated from DOB ({new Date(profileData.date_of_birth).toLocaleDateString('en-GB')})
                      </span>
                    )}
                  </div>
                  <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                    <label className={styles.label}>Individual or Team</label>
                    <div className={styles.radioGroup}>
                      <label className={styles.radioLabel}>
                        <input type="radio" name="individual_or_team" value="Individual" checked={formData.individual_or_team === 'Individual'} onChange={handleInputChange} />
                        Individual
                      </label>
                      <label className={styles.radioLabel}>
                        <input type="radio" name="individual_or_team" value="Team" checked={formData.individual_or_team === 'Team'} onChange={handleInputChange} />
                        Team
                      </label>
                    </div>
                  </div>
                  <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                    <label className={styles.label}>Short Description (Optional)</label>
                    <textarea name="description" className={styles.input} rows="3" value={formData.description} onChange={handleInputChange} placeholder="Secured first place in U18 category"></textarea>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Achievement Reference Number (Optional)</label>
                    <input type="text" name="achievement_reference_number" className={styles.input} value={formData.achievement_reference_number} onChange={handleInputChange} placeholder="MAA/2026/400M/044" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Official Achievement URL (Optional)</label>
                    <input type="url" name="official_achievement_url" className={styles.input} value={formData.official_achievement_url} onChange={handleInputChange} placeholder="https://..." />
                  </div>
                </div>
              </div>

              {formData.individual_or_team === 'Team' && (
                <div className={styles.card} style={{ marginTop: '32px' }}>
                  <h3 className={styles.subSectionTitle}>D. Team Achievement Fields</h3>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Team Name</label>
                      <input type="text" name="team_name" className={styles.input} value={formData.team_name} onChange={handleInputChange} placeholder="e.g., Tigers Club" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Team Sport</label>
                      <input type="text" name="team_sport" className={styles.input} value={formData.team_sport} onChange={handleInputChange} placeholder="e.g., Football" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Athlete Role/Position (Optional)</label>
                      <input type="text" name="team_role" className={styles.input} value={formData.team_role} onChange={handleInputChange} placeholder="e.g., Goalkeeper" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Team Result</label>
                      <select name="team_result" className={styles.select} value={formData.team_result} onChange={handleInputChange}>
                        <option value="">Select Result</option>
                        {TEAM_RESULTS.map(result => (
                          <option key={result} value={result}>{result}</option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Team Captain (Optional)</label>
                      <input type="text" name="team_captain" className={styles.input} value={formData.team_captain} onChange={handleInputChange} placeholder="e.g., John Doe" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Number of Team Members (Optional)</label>
                      <input type="number" name="team_members_count" className={styles.input} value={formData.team_members_count} onChange={handleInputChange} placeholder="11" />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {currentStep === 3 && (
            <>
              <div className={styles.card}>
                <h3 className={styles.subSectionTitle}>A. Event & Organization</h3>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                    <label className={styles.label}>Competition / Event Name</label>
                    <input type="text" name="competition_name" className={styles.input} value={formData.competition_name} onChange={handleInputChange} placeholder="e.g., Maharashtra State Athletics Championship" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Event Registration Number (Optional)</label>
                    <input type="text" name="event_registration_number" className={styles.input} value={formData.event_registration_number} onChange={handleInputChange} placeholder="MAA-2026-045" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Organized By</label>
                    <input type="text" name="organized_by" className={styles.input} value={formData.organized_by} onChange={handleInputChange} placeholder="e.g., Maharashtra Athletics Association" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Recognized By (Optional)</label>
                    <input type="text" name="recognized_by" className={styles.input} value={formData.recognized_by} onChange={handleInputChange} placeholder="e.g., Athletics Federation of India" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Governing Federation (Optional)</label>
                    <input type="text" name="governing_federation" className={styles.input} value={formData.governing_federation} onChange={handleInputChange} placeholder="e.g., AFI" />
                  </div>
                </div>
              </div>

              <div className={styles.card} style={{ marginTop: '32px' }}>
                <h3 className={styles.subSectionTitle}>B. Dates & Location</h3>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Competition Start Date</label>
                    <AppleDatePicker name="competition_start_date" value={formData.competition_start_date} onChange={handleInputChange} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Competition End Date</label>
                    <AppleDatePicker name="competition_end_date" value={formData.competition_end_date} onChange={handleInputChange} />
                  </div>
                  <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                    <label className={styles.label}>Venue Name</label>
                    <input type="text" name="venue_name" className={styles.input} value={formData.venue_name} onChange={handleInputChange} placeholder="e.g., Shiv Chhatrapati Sports Complex" />
                  </div>
                  <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                    <label className={styles.label}>Address (Optional)</label>
                    <textarea name="address" className={styles.input} rows="2" value={formData.address} onChange={handleInputChange} placeholder="Balewadi, Pune"></textarea>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Country</label>
                    <select name="country" className={styles.select} value={formData.country} onChange={handleInputChange}>
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  {formData.country === 'India' && (
                    <>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>State</label>
                        <select name="state" className={styles.select} value={formData.state} onChange={handleInputChange}>
                          <option value="">Select State</option>
                          {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>District</label>
                        <input type="text" name="district" className={styles.input} value={formData.district} onChange={handleInputChange} placeholder="e.g., Pune" />
                      </div>
                    </>
                  )}
                  <div className={styles.formGroup}>
                    <label className={styles.label}>City</label>
                    <input type="text" name="city" className={styles.input} value={formData.city} onChange={handleInputChange} placeholder="e.g., Pune" />
                  </div>
                </div>
              </div>

              <div className={styles.card} style={{ marginTop: '32px' }}>
                <h3 className={styles.subSectionTitle}>C. Competition Format & Categories</h3>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Competition Level</label>
                    <select name="competition_level" className={styles.select} value={formData.competition_level} onChange={handleInputChange}>
                      <option value="">Select Level</option>
                      {ACHIEVEMENT_LEVELS.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Competition Format</label>
                    <select name="competition_format" className={styles.select} value={formData.competition_format} onChange={handleInputChange}>
                      <option value="">Select Format</option>
                      {COMPETITION_FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Competition Mode (Optional)</label>
                    <select name="competition_mode" className={styles.select} value={formData.competition_mode} onChange={handleInputChange}>
                      <option value="">Select Mode</option>
                      {COMPETITION_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Age Group</label>
                    <select name="age_group" className={styles.select} value={formData.age_group} onChange={handleInputChange}>
                      <option value="">Select Age Group</option>
                      {AGE_GROUPS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Weight Category (Optional)</label>
                    <input type="text" name="weight_category" className={styles.input} value={formData.weight_category} onChange={handleInputChange} placeholder="e.g., 55 kg" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Competition Round (Optional)</label>
                    <select name="competition_round" className={styles.select} value={formData.competition_round} onChange={handleInputChange}>
                      <option value="">Select Round</option>
                      {COMPETITION_ROUNDS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className={styles.card} style={{ marginTop: '32px' }}>
                <h3 className={styles.subSectionTitle}>D. Additional Information</h3>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Official Result Link (Optional)</label>
                    <input type="url" name="official_result_link" className={styles.input} value={formData.official_result_link} onChange={handleInputChange} placeholder="https://..." />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Event Brochure Available? (Optional)</label>
                    <select name="event_brochure_available" className={styles.select} value={formData.event_brochure_available} onChange={handleInputChange}>
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}



          
          {currentStep === 4 && (
            <>
              <div className={styles.card}>
                <h3 className={styles.subSectionTitle}>A. General Result Fields</h3>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Result Type</label>
                    <select name="result_type" className={styles.select} value={formData.result_type} onChange={handleInputChange}>
                      <option value="">Select Result Type</option>
                      {RESULT_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Final Position/Rank (Optional)</label>
                    <input type="number" name="final_position_rank" className={styles.input} value={formData.final_position_rank} onChange={handleInputChange} placeholder="e.g., 1" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Total Participants (Optional)</label>
                    <input type="number" name="total_participants" className={styles.input} value={formData.total_participants} onChange={handleInputChange} placeholder="e.g., 24" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Score/Points (Optional)</label>
                    <input type="number" step="0.01" name="score_points" className={styles.input} value={formData.score_points} onChange={handleInputChange} placeholder="e.g., 92.50" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Result Declaration Date (Optional)</label>
                    <AppleDatePicker name="result_declaration_date" value={formData.result_declaration_date} onChange={handleInputChange} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Official Result Number (Optional)</label>
                    <input type="text" name="official_result_number" className={styles.input} value={formData.official_result_number} onChange={handleInputChange} placeholder="RES-2026-0087" />
                  </div>
                  <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                    <label className={styles.label}>Result Remarks (Optional)</label>
                    <textarea name="result_remarks" className={styles.input} rows="2" value={formData.result_remarks} onChange={handleInputChange} placeholder="Qualified with personal best"></textarea>
                  </div>
                </div>
              </div>

              <div className={styles.card} style={{ marginTop: '32px' }}>
                <h3 className={styles.subSectionTitle}>B. Performance Measurement</h3>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Performance Value (Optional)</label>
                    <input type="text" name="performance_value" className={styles.input} value={formData.performance_value} onChange={handleInputChange} placeholder="e.g., 46.72" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Measurement Unit (Optional)</label>
                    <select name="measurement_unit" className={styles.select} value={formData.measurement_unit} onChange={handleInputChange}>
                      <option value="">Select Unit</option>
                      {MEASUREMENT_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Timing (Optional)</label>
                    <input type="text" name="timing" className={styles.input} value={formData.timing} onChange={handleInputChange} placeholder="HH:MM:SS:MS" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Distance (Optional)</label>
                    <input type="number" step="0.01" name="distance" className={styles.input} value={formData.distance} onChange={handleInputChange} placeholder="e.g., 100.5" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Height (Optional)</label>
                    <input type="number" step="0.01" name="height" className={styles.input} value={formData.height} onChange={handleInputChange} placeholder="e.g., 2.15" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Weight Lifted (Optional)</label>
                    <input type="number" step="0.01" name="weight_lifted" className={styles.input} value={formData.weight_lifted} onChange={handleInputChange} placeholder="e.g., 150.0" />
                  </div>
                </div>
              </div>

              <div className={styles.card} style={{ marginTop: '32px' }}>
                <h3 className={styles.subSectionTitle}>C. Personal Best</h3>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Personal Best Achieved?</label>
                    <div className={styles.radioGroup}>
                      <label className={styles.radioLabel}>
                        <input type="radio" name="personal_best_achieved" value="Yes" checked={formData.personal_best_achieved === 'Yes'} onChange={handleInputChange} />
                        Yes
                      </label>
                      <label className={styles.radioLabel}>
                        <input type="radio" name="personal_best_achieved" value="No" checked={formData.personal_best_achieved === 'No'} onChange={handleInputChange} />
                        No
                      </label>
                    </div>
                  </div>
                </div>
                {formData.personal_best_achieved === 'Yes' && (
                  <div className={styles.formGrid} style={{ marginTop: '16px' }}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Previous Personal Best (Optional)</label>
                      <input type="text" name="prev_personal_best" className={styles.input} value={formData.prev_personal_best} onChange={handleInputChange} placeholder="e.g., 47.25" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>New Personal Best</label>
                      <input type="text" name="new_personal_best" className={styles.input} value={formData.new_personal_best} onChange={handleInputChange} placeholder="e.g., 46.72" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Unit</label>
                      <select name="pb_unit" className={styles.select} value={formData.pb_unit} onChange={handleInputChange}>
                        <option value="">Select Unit</option>
                        {MEASUREMENT_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Improvement</label>
                      <input type="text" name="pb_improvement" className={styles.input} value={formData.pb_improvement} onChange={handleInputChange} placeholder="e.g., 0.53" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Date Achieved (Optional)</label>
                      <AppleDatePicker name="pb_date" value={formData.pb_date} onChange={handleInputChange} />
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.card} style={{ marginTop: '32px' }}>
                <h3 className={styles.subSectionTitle}>D. Sports Record</h3>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Record Achieved?</label>
                    <div className={styles.radioGroup}>
                      <label className={styles.radioLabel}>
                        <input type="radio" name="record_achieved" value="Yes" checked={formData.record_achieved === 'Yes'} onChange={handleInputChange} />
                        Yes
                      </label>
                      <label className={styles.radioLabel}>
                        <input type="radio" name="record_achieved" value="No" checked={formData.record_achieved === 'No'} onChange={handleInputChange} />
                        No
                      </label>
                    </div>
                  </div>
                </div>
                {formData.record_achieved === 'Yes' && (
                  <div className={styles.formGrid} style={{ marginTop: '16px' }}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Record Type</label>
                      <select name="record_type" className={styles.select} value={formData.record_type} onChange={handleInputChange}>
                        <option value="">Select Record Type</option>
                        {RECORD_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Previous Record (Optional)</label>
                      <input type="text" name="previous_record" className={styles.input} value={formData.previous_record} onChange={handleInputChange} placeholder="e.g., 47.00" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>New Record</label>
                      <input type="text" name="new_record" className={styles.input} value={formData.new_record} onChange={handleInputChange} placeholder="e.g., 46.72" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Record Holder Before Event (Optional)</label>
                      <input type="text" name="record_holder_before" className={styles.input} value={formData.record_holder_before} onChange={handleInputChange} placeholder="e.g., John Doe" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Recognition Authority</label>
                      <input type="text" name="recognition_authority" className={styles.input} value={formData.recognition_authority} onChange={handleInputChange} placeholder="e.g., AFI" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Record Recognition Date (Optional)</label>
                      <AppleDatePicker name="record_recognition_date" value={formData.record_recognition_date} onChange={handleInputChange} />
                    </div>
                  </div>
                )}
              </div>

              {formData.achievement_category === 'Ranking' && (
                <div className={styles.card} style={{ marginTop: '32px' }}>
                  <h3 className={styles.subSectionTitle}>E. Ranking Details</h3>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Ranking Position</label>
                      <input type="number" name="ranking_position" className={styles.input} value={formData.ranking_position} onChange={handleInputChange} placeholder="e.g., 5" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Ranking Category</label>
                      <input type="text" name="ranking_category" className={styles.input} value={formData.ranking_category} onChange={handleInputChange} placeholder="e.g., U18 Boys" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Ranking Authority</label>
                      <input type="text" name="ranking_authority" className={styles.input} value={formData.ranking_authority} onChange={handleInputChange} placeholder="e.g., National Federation" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Ranking Period</label>
                      <input type="text" name="ranking_period" className={styles.input} value={formData.ranking_period} onChange={handleInputChange} placeholder="e.g., 2025-2026" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Ranking Publication Date (Optional)</label>
                      <AppleDatePicker name="ranking_publication_date" value={formData.ranking_publication_date} onChange={handleInputChange} />
                    </div>
                  </div>
                </div>
              )}

              {formData.achievement_category === 'Selection' && (
                <div className={styles.card} style={{ marginTop: '32px' }}>
                  <h3 className={styles.subSectionTitle}>F. Selection Details</h3>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Selected For</label>
                      <input type="text" name="selected_for" className={styles.input} value={formData.selected_for} onChange={handleInputChange} placeholder="e.g., National Camp" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Selection Level</label>
                      <select name="selection_level" className={styles.select} value={formData.selection_level} onChange={handleInputChange}>
                        <option value="">Select Level</option>
                        {ACHIEVEMENT_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Selection Authority</label>
                      <input type="text" name="selection_authority" className={styles.input} value={formData.selection_authority} onChange={handleInputChange} placeholder="e.g., AFI" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Selection Date (Optional)</label>
                      <AppleDatePicker name="selection_date" value={formData.selection_date} onChange={handleInputChange} />
                    </div>
                  </div>
                </div>
              )}

              {formData.achievement_category === 'Scholarship' && (
                <div className={styles.card} style={{ marginTop: '32px' }}>
                  <h3 className={styles.subSectionTitle}>G. Scholarship Details</h3>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                      <label className={styles.label}>Scholarship Name</label>
                      <input type="text" name="scholarship_name" className={styles.input} value={formData.scholarship_name} onChange={handleInputChange} placeholder="e.g., Khelo India Scholarship" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Scholarship Provider / Organization</label>
                      <input type="text" name="scholarship_provider" className={styles.input} value={formData.scholarship_provider} onChange={handleInputChange} placeholder="e.g., Ministry of Youth Affairs & Sports" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Scholarship Type</label>
                      <select name="scholarship_type" className={styles.select} value={formData.scholarship_type} onChange={handleInputChange}>
                        <option value="">Select Type</option>
                        {SCHOLARSHIP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Current Status</label>
                      <select name="scholarship_status" className={styles.select} value={formData.scholarship_status} onChange={handleInputChange}>
                        <option value="">Select Status</option>
                        {SCHOLARSHIP_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Scholarship Amount</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <select name="scholarship_currency" className={styles.select} value={formData.scholarship_currency} onChange={handleInputChange} style={{ width: '90px', flexShrink: 0 }}>
                          <option value="INR">₹ INR</option>
                          <option value="USD">$ USD</option>
                          <option value="EUR">€ EUR</option>
                          <option value="GBP">£ GBP</option>
                        </select>
                        <input type="number" name="scholarship_amount" className={styles.input} value={formData.scholarship_amount} onChange={handleInputChange} placeholder="e.g., 50000" style={{ flexGrow: 1 }} />
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Disbursement Frequency (Optional)</label>
                      <select name="scholarship_frequency" className={styles.select} value={formData.scholarship_frequency} onChange={handleInputChange}>
                        <option value="">Select Frequency</option>
                        <option value="One-Time">One-Time</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Bi-Annual">Bi-Annual (6 Months)</option>
                        <option value="Annual">Annual</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Scholarship Start Date</label>
                      <AppleDatePicker name="scholarship_start_date" value={formData.scholarship_start_date} onChange={handleInputChange} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Scholarship End Date (Optional)</label>
                      <AppleDatePicker name="scholarship_end_date" value={formData.scholarship_end_date} onChange={handleInputChange} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Duration (Months) (Optional)</label>
                      <input type="number" name="scholarship_duration_months" className={styles.input} value={formData.scholarship_duration_months} onChange={handleInputChange} placeholder="e.g., 12" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Reference / Sanction Number (Optional)</label>
                      <input type="text" name="scholarship_reference_number" className={styles.input} value={formData.scholarship_reference_number} onChange={handleInputChange} placeholder="e.g., KI/2026/MH/045" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Award / Sanction Letter Date (Optional)</label>
                      <AppleDatePicker name="scholarship_letter_date" value={formData.scholarship_letter_date} onChange={handleInputChange} />
                    </div>
                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                      <label className={styles.label}>Selection Criteria / Basis</label>
                      <input type="text" name="scholarship_criteria" className={styles.input} value={formData.scholarship_criteria} onChange={handleInputChange} placeholder="e.g., Top 3 finish in State Championship 2026" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Sport / Event Basis</label>
                      <input type="text" name="scholarship_sport_basis" className={styles.input} value={formData.scholarship_sport_basis} onChange={handleInputChange} placeholder="e.g., 400m Sprint — State Gold" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Renewable?</label>
                      <div className={styles.radioGroup}>
                        <label className={styles.radioLabel}>
                          <input type="radio" name="scholarship_renewal" value="Yes" checked={formData.scholarship_renewal === 'Yes'} onChange={handleInputChange} />
                          Yes
                        </label>
                        <label className={styles.radioLabel}>
                          <input type="radio" name="scholarship_renewal" value="No" checked={formData.scholarship_renewal === 'No'} onChange={handleInputChange} />
                          No
                        </label>
                      </div>
                    </div>
                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                      <label className={styles.label}>Benefits Covered (Optional)</label>
                      <textarea name="scholarship_benefits" className={styles.input} rows="3" value={formData.scholarship_benefits} onChange={handleInputChange} placeholder="e.g., Tuition fees, hostel accommodation, training equipment, travel allowance, coaching fees" />
                    </div>
                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                      <label className={styles.label}>Conditions / Terms (Optional)</label>
                      <textarea name="scholarship_conditions" className={styles.input} rows="2" value={formData.scholarship_conditions} onChange={handleInputChange} placeholder="e.g., Must maintain 75% attendance and represent the state in National Championship" />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {currentStep === 5 && (
            <>
              <div className={styles.card}>
                <h3 className={styles.subSectionTitle}>A. Certificate Details</h3>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Certificate Available?</label>
                    <div className={styles.radioGroup}>
                      <label className={styles.radioLabel}>
                        <input type="radio" name="certificate_available" value="Yes" checked={formData.certificate_available === 'Yes'} onChange={handleInputChange} />
                        Yes
                      </label>
                      <label className={styles.radioLabel}>
                        <input type="radio" name="certificate_available" value="No" checked={formData.certificate_available === 'No'} onChange={handleInputChange} />
                        No
                      </label>
                    </div>
                  </div>
                </div>
                {formData.certificate_available === 'Yes' && (
                  <div className={styles.formGrid} style={{ marginTop: '16px' }}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Certificate Number</label>
                      <input type="text" name="certificate_number" className={styles.input} value={formData.certificate_number} onChange={handleInputChange} placeholder="e.g., CERT-1234" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Certificate Type</label>
                      <input type="text" name="certificate_type" className={styles.input} value={formData.certificate_type} onChange={handleInputChange} placeholder="e.g., Merit" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Certificate Issue Date</label>
                      <AppleDatePicker name="certificate_issue_date" value={formData.certificate_issue_date} onChange={handleInputChange} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Issuing Authority</label>
                      <input type="text" name="issuing_authority" className={styles.input} value={formData.issuing_authority} onChange={handleInputChange} placeholder="e.g., AFI" />
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.card} style={{ marginTop: '32px' }}>
                <h3 className={styles.subSectionTitle}>B. Document Uploads (Max 10MB each)</h3>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>
                  Upload valid files (PDF, JPG, PNG, MP4). Limit 5 additional documents.
                </p>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                    <label className={styles.label}>Upload Document</label>
                    <input type="file" id="fileUpload" className={styles.input} accept=".pdf,.jpg,.png,.mp4" onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      if (file.size > 10 * 1024 * 1024) {
                        alert("File exceeds 10MB limit.");
                        return;
                      }

                      const uploadData = new FormData();
                      uploadData.append('file', file);
                      try {
                        const token = localStorage.getItem('authToken');
                        const res = await fetch('http://localhost:5000/api/upload', {
                          method: 'POST',
                          headers: { Authorization: `Bearer ${token}` },
                          body: uploadData
                        });
                        const data = await res.json();
                        if (data.success) {
                          const docType = prompt("Enter Document Type (e.g., Achievement Certificate, Official Result Sheet):", "Achievement Certificate") || "Additional Evidence";
                          setFormData(prev => ({
                            ...prev,
                            documents: [...prev.documents, { ...data.data, document_type: docType }]
                          }));
                          document.getElementById('fileUpload').value = ""; // reset input
                        } else {
                          alert(data.message || 'Upload failed');
                        }
                      } catch (err) {
                        console.error('Upload Error:', err);
                        alert('Error uploading file');
                      }
                    }} />
                  </div>
                  
                  {formData.documents.length > 0 && (
                    <div style={{ gridColumn: '1 / -1', marginTop: '16px' }}>
                      <label className={styles.label}>Uploaded Documents</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                        {formData.documents.map((doc, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div>
                              <div style={{ fontWeight: '600', color: '#0f172a' }}>{doc.document_type}</div>
                              <div style={{ fontSize: '13px', color: '#64748b' }}>{doc.original_file_name} ({(doc.file_size / 1024 / 1024).toFixed(2)} MB)</div>
                              <div style={{ fontSize: '11px', color: '#94a3b8' }}>SHA-256: {doc.sha256_hash.substring(0, 16)}...</div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <a href={`http://localhost:5000/uploads/${doc.internal_storage_name}`} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', fontSize: '14px', textDecoration: 'none' }}>[Preview]</a>
                              <button type="button" onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  documents: prev.documents.filter((_, i) => i !== idx)
                                }));
                              }} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '14px', cursor: 'pointer' }}>[Remove]</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}


          {currentStep === 6 && (
            <>

              <div className={styles.card}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                    <label className={styles.label}>Visibility Level</label>
                    <select name="visibility_level" className={styles.select} value={formData.visibility_level} onChange={handleInputChange}>
                      <option value="Public">Public (Visible to everyone)</option>
                      <option value="Scouts Only">Scouts & Institutes Only</option>
                      <option value="Private">Private</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {currentStep === 7 && (
            <>

              <div className={styles.card}>
                <h3 className={styles.subSectionTitle}>Summary</h3>
                <div className={styles.infoGrid} style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Achievement Title</span>
                    <span className={styles.infoValue}>{formData.title || 'N/A'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Achievement Date</span>
                    <span className={styles.infoValue}>{formData.achievement_date || 'N/A'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Age at Achievement</span>
                    <span className={styles.infoValue}>{formData.age_at_achievement ? `${formData.age_at_achievement} Years` : 'N/A'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Competition Name</span>
                    <span className={styles.infoValue}>{formData.competition_name || 'N/A'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Result / Rank</span>
                    <span className={styles.infoValue}>{formData.result_rank || 'N/A'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Submitted By Role</span>
                    <span className={styles.infoValue}>{formData.submitter_role}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Submitter Name</span>
                    <span className={styles.infoValue}>{formData.submitter_name || 'N/A'}</span>
                  </div>
                  {formData.achievement_category === 'Scholarship' && (
                    <>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Scholarship Name</span>
                        <span className={styles.infoValue}>{formData.scholarship_name || 'N/A'}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Provider</span>
                        <span className={styles.infoValue}>{formData.scholarship_provider || 'N/A'}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Type</span>
                        <span className={styles.infoValue}>{formData.scholarship_type || 'N/A'}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Amount</span>
                        <span className={styles.infoValue}>{formData.scholarship_amount ? `${formData.scholarship_currency} ${Number(formData.scholarship_amount).toLocaleString()}` : 'N/A'}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Status</span>
                        <span className={styles.infoValue}>{formData.scholarship_status || 'N/A'}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Duration</span>
                        <span className={styles.infoValue}>
                          {formData.scholarship_start_date || 'N/A'} — {formData.scholarship_end_date || 'N/A'}
                          {formData.scholarship_duration_months ? ` (${formData.scholarship_duration_months} months)` : ''}
                        </span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Renewable</span>
                        <span className={styles.infoValue}>{formData.scholarship_renewal}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Navigation Buttons */}
          <div className={styles.formActions}>
            {currentStep > 1 && (
              <button className={styles.btnSecondary} onClick={handleBack}>
                Previous Step
              </button>
            )}
            
            {currentStep < 7 ? (
              <button className={styles.btnPrimary} onClick={handleNext}>
                Continue to Next Step
              </button>
            ) : (
              <button className={styles.btnPrimary} onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Achievement'}
              </button>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className={styles.sidebar}>
          
          {/* Progress Card */}
          <div className={styles.sidebarCard}>
            <h3 className={styles.sidebarTitle}>Achievement Creation</h3>
            <div className={styles.progressLabel}>
              <span>Form Progress</span>
              <span>Step {currentStep} of 7</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${(currentStep / 7) * 100}%` }}></div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#0f172a' }}>
              {Math.round((currentStep / 7) * 100)}%
            </div>
          </div>

          {/* Athlete Summary Card */}
          <div className={styles.sidebarCard}>
            <h3 className={styles.sidebarTitle}>Athlete Summary</h3>
            <div className={styles.summaryProfile}>
              <div className={styles.summaryAvatar}>
                {profileData?.profile_picture ? (
                  <img src={`http://localhost:5000${profileData.profile_picture}`} alt="Avatar" className={styles.avatarImage} />
                ) : (
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#94a3b8' }}>{profileData?.full_name?.charAt(0)}</span>
                )}
              </div>
              <div className={styles.summaryInfo}>
                <span className={styles.summaryName}>{profileData?.full_name || 'N/A'}</span>
                <span className={styles.summaryId}>ATH-{profileData?.id}</span>
                <span className={styles.summaryDetails}>
                  {profileData?.sports_profile?.primary_sport || 'N/A'} • {profileData?.sports_profile?.position || 'N/A'}
                </span>
                <span className={styles.summaryDetails}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: 'middle', color: '#64748b' }}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                  {profileData?.education?.school || 'N/A'}
                </span>
                <span className={styles.statusBadge} style={{ marginTop: '8px', alignSelf: 'flex-start' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  {profileData?.verification_status || 'Verified Athlete'}
                </span>
              </div>
            </div>
          </div>

          {/* Help Card */}
          <div className={styles.sidebarCard}>
            <h3 className={styles.sidebarTitle}>Need Help?</h3>
            <p className={styles.helpText}>For any assistance, contact your institute admin or coach.</p>
            <button className={styles.supportBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              Contact Support
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
