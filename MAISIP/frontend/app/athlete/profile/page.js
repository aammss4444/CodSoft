'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppleDatePicker from '../../components/AppleDatePicker';
import styles from './profile.module.css';

export default function AthleteProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null); // To store original data for View Mode
  const [formData, setFormData] = useState({
    first_name: '', middle_name: '', last_name: '',
    date_of_birth: '', age: '', gender: '', blood_group: '',
    mobile_number: '', address_line_1: '', address_line_2: '',
    city: '', state: '', pincode: '', country: '',
    education: { school: '', grade: '', board: '' },
    sports_profile: { primary_sport: '', position: '', preferred_hand_foot: '', height_cm: '', weight_kg: '' }
  });
  const [documents, setDocuments] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          router.push('/');
          return;
        }

        const res = await fetch('http://localhost:5000/api/athletes/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('authToken');
          router.push('/');
          return;
        }

        const data = await res.json();
        if (data.success) {
          const profile = data.data;
          
          // Helper to format date for input type="date"
          const formatDate = (dateStr) => {
            if (!dateStr) return '';
            const d = new Date(dateStr);
            return isNaN(d) ? '' : d.toISOString().split('T')[0];
          };

          const nameParts = (profile.full_name || '').trim().split(/\s+/);
          const inferredFirst = nameParts[0] || '';
          const inferredLast = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
          const inferredMiddle = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';

          setFormData({
            first_name: profile.first_name || inferredFirst,
            middle_name: profile.middle_name || inferredMiddle,
            last_name: profile.last_name || inferredLast,
            date_of_birth: formatDate(profile.date_of_birth),
            age: profile.age || '',
            gender: profile.gender || '',
            blood_group: profile.blood_group || '',
            mobile_number: profile.mobile_number || '',
            address_line_1: profile.address_line_1 || '',
            address_line_2: profile.address_line_2 || '',
            city: profile.city || '',
            state: profile.state || '',
            pincode: profile.pincode || '',
            country: profile.country || '',
            education: {
              school: profile.education?.school || '',
              grade: profile.education?.grade || '',
              board: profile.education?.board || ''
            },
            sports_profile: {
              primary_sport: profile.sports_profile?.primary_sport || '',
              position: profile.sports_profile?.position || '',
              preferred_hand_foot: profile.sports_profile?.preferred_hand_foot || '',
              height_cm: profile.sports_profile?.height_cm || '',
              weight_kg: profile.sports_profile?.weight_kg || ''
            }
          });
          setProfileData(profile);

          // Set Documents (Read-only for now)
          setDocuments({
            id_document: profile.id_document,
            profile_picture: profile.profile_picture,
            certificates: profile.achievements?.certificates_upload
          });

        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleInputChange = (e, section = null) => {
    const { name, value } = e.target;
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const calculatedFullName = `${formData.first_name || ''} ${formData.middle_name || ''} ${formData.last_name || ''}`.replace(/\s+/g, ' ').trim();
      const payload = {
        ...formData,
        full_name: calculatedFullName || formData.first_name || formData.last_name || ''
      };

      const res = await fetch('http://localhost:5000/api/athletes/me', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        alert('Profile updated successfully!');
        setProfileData(data.data);
        setIsEditing(false);
      } else {
        alert('Failed to update profile: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const renderDocumentLink = (path, name) => {
    if (!path) return <span className={styles.documentStatus}>Not Uploaded</span>;
    return (
      <a href={`http://localhost:5000${path}`} target="_blank" rel="noopener noreferrer" className={styles.documentAction}>
        View File
      </a>
    );
  };

  if (loading) {
    return <div className={styles.loading}>Loading Profile...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Athlete Profile</h1>
          <p className={styles.subtitle}>Manage your details and view your uploaded documents</p>
        </div>
        {!isEditing ? (
          <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className={styles.cancelBtn} onClick={() => setIsEditing(false)}>
              Cancel
            </button>
            <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </header>

      {isEditing && profileData?.identity_status === 'verified' && (
        <div className={styles.verifiedBanner}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <div>
            <strong>Verified Athlete</strong>
            <p>Your profile is fully verified and authorized on the MAISIP platform.</p>
          </div>
        </div>
      )}

      {isEditing ? (
        // EDIT MODE (Original Form)
        <>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F5B041" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              Basic Information
            </h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>First Name</label>
                <input type="text" name="first_name" className={styles.input} value={formData.first_name} onChange={handleInputChange} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Middle Name</label>
                <input type="text" name="middle_name" className={styles.input} value={formData.middle_name} onChange={handleInputChange} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Last Name</label>
                <input type="text" name="last_name" className={styles.input} value={formData.last_name} onChange={handleInputChange} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Date of Birth</label>
                <AppleDatePicker name="date_of_birth" value={formData.date_of_birth} onChange={handleInputChange} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Gender</label>
                <div className={styles.readOnlyInput}>
                  {formData.gender || 'Not Set'}
                  <svg className={styles.lockIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Blood Group</label>
                <div className={styles.readOnlyInput}>
                  {formData.blood_group || 'Not Set'}
                  <svg className={styles.lockIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F5B041" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              Contact Details
            </h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Mobile Number</label>
                <input type="text" name="mobile_number" className={styles.input} value={formData.mobile_number} onChange={handleInputChange} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Address Line 1</label>
                <input type="text" name="address_line_1" className={styles.input} value={formData.address_line_1} onChange={handleInputChange} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Address Line 2</label>
                <input type="text" name="address_line_2" className={styles.input} value={formData.address_line_2} onChange={handleInputChange} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>City</label>
                <input type="text" name="city" className={styles.input} value={formData.city} onChange={handleInputChange} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>State</label>
                <input type="text" name="state" className={styles.input} value={formData.state} onChange={handleInputChange} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Pincode</label>
                <input type="text" name="pincode" className={styles.input} value={formData.pincode} onChange={handleInputChange} />
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F5B041" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
              Education
            </h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>School/Institute Name</label>
                <input type="text" name="school" className={styles.input} value={formData.education.school} onChange={(e) => handleInputChange(e, 'education')} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Grade/Standard</label>
                <input type="text" name="grade" className={styles.input} value={formData.education.grade} onChange={(e) => handleInputChange(e, 'education')} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Board (e.g. CBSE, State Board)</label>
                <input type="text" name="board" className={styles.input} value={formData.education.board} onChange={(e) => handleInputChange(e, 'education')} />
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F5B041" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              Sports Profile
            </h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Primary Sport</label>
                <input type="text" name="primary_sport" className={styles.input} value={formData.sports_profile.primary_sport} onChange={(e) => handleInputChange(e, 'sports_profile')} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Position/Event</label>
                <input type="text" name="position" className={styles.input} value={formData.sports_profile.position} onChange={(e) => handleInputChange(e, 'sports_profile')} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Preferred Hand/Foot</label>
                <select name="preferred_hand_foot" className={styles.select} value={formData.sports_profile.preferred_hand_foot} onChange={(e) => handleInputChange(e, 'sports_profile')}>
                  <option value="">Select</option>
                  <option value="Right">Right</option>
                  <option value="Left">Left</option>
                  <option value="Both">Both</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Height (cm)</label>
                <input type="number" name="height_cm" className={styles.input} value={formData.sports_profile.height_cm} onChange={(e) => handleInputChange(e, 'sports_profile')} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Weight (kg)</label>
                <input type="number" name="weight_kg" className={styles.input} value={formData.sports_profile.weight_kg} onChange={(e) => handleInputChange(e, 'sports_profile')} />
              </div>
            </div>
          </div>
        </>
      ) : (
        // VIEW MODE (Premium Layout)
        <div>
          {/* Profile Header */}
          <div className={styles.profileHeaderCard}>
            <div className={styles.profileAvatarWrapper}>
              {documents.profile_picture ? (
                <img src={`http://localhost:5000${documents.profile_picture}`} alt="Profile" className={styles.profileAvatarImage} />
              ) : (
                <span className={styles.profileAvatarText}>
                  {profileData?.full_name?.charAt(0) || 'A'}
                </span>
              )}
            </div>
            <div className={styles.profileHeaderInfo}>
              <div className={styles.profileHeaderBadges}>
                <span className={styles.badgeSport}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                  {profileData?.sports_profile?.primary_sport || 'Athlete'}
                </span>
                {profileData?.identity_status === 'verified' ? (
                  <span className={styles.badgeVerified}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    Verified
                  </span>
                ) : (
                  <span className={styles.badgePending}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    Pending Verification
                  </span>
                )}
              </div>
              <h2 className={styles.profileHeaderName}>
                {profileData?.full_name || 'N/A'}
              </h2>
            </div>
          </div>

          <div className={styles.viewGrid}>
            <div className={styles.premiumCard}>
              <h3 className={styles.premiumCardTitle}>Personal Details</h3>
              <div className={styles.premiumInfoGrid}>
                <div className={styles.premiumInfoItem}>
                  <span className={styles.premiumInfoLabel}>Date of Birth</span>
                  <span className={styles.premiumInfoValue}>{profileData?.date_of_birth ? new Date(profileData.date_of_birth).toLocaleDateString() : <span className={styles.premiumInfoValueEmpty}>Not set</span>}</span>
                </div>
                <div className={styles.premiumInfoItem}>
                  <span className={styles.premiumInfoLabel}>Gender</span>
                  <span className={styles.premiumInfoValue}>{profileData?.gender || <span className={styles.premiumInfoValueEmpty}>Not set</span>}</span>
                </div>
                <div className={styles.premiumInfoItem}>
                  <span className={styles.premiumInfoLabel}>Blood Group</span>
                  <span className={styles.premiumInfoValue}>{profileData?.blood_group || <span className={styles.premiumInfoValueEmpty}>Not set</span>}</span>
                </div>
              </div>
            </div>

            <div className={styles.premiumCard}>
              <h3 className={styles.premiumCardTitle}>Sports Metrics</h3>
              <div className={styles.premiumInfoGrid}>
                <div className={styles.premiumInfoItem}>
                  <span className={styles.premiumInfoLabel}>Position/Event</span>
                  <span className={styles.premiumInfoValue}>
                    {profileData?.sports_profile?.position || profileData?.playing_position || <span className={styles.premiumInfoValueEmpty}>Not set</span>}
                  </span>
                </div>
                <div className={styles.premiumInfoItem}>
                  <span className={styles.premiumInfoLabel}>Height (cm)</span>
                  <span className={styles.premiumInfoValue}>
                    {profileData?.sports_profile?.height_cm || profileData?.height_cm || <span className={styles.premiumInfoValueEmpty}>Not set</span>}
                  </span>
                </div>
                <div className={styles.premiumInfoItem}>
                  <span className={styles.premiumInfoLabel}>Weight (kg)</span>
                  <span className={styles.premiumInfoValue}>
                    {profileData?.sports_profile?.weight_kg || profileData?.weight_kg || <span className={styles.premiumInfoValueEmpty}>Not set</span>}
                  </span>
                </div>
                <div className={styles.premiumInfoItem}>
                  <span className={styles.premiumInfoLabel}>Preferred Hand/Foot</span>
                  <span className={styles.premiumInfoValue}>
                    {profileData?.sports_profile?.preferred_hand_foot || profileData?.preferred_hand_foot || <span className={styles.premiumInfoValueEmpty}>Not set</span>}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.premiumCard} style={{ gridColumn: '1 / -1' }}>
              <h3 className={styles.premiumCardTitle}>Contact & Education</h3>
              <div className={styles.premiumInfoGrid}>
                <div className={styles.premiumInfoItem}>
                  <span className={styles.premiumInfoLabel}>Mobile Number</span>
                  <span className={styles.premiumInfoValue}>
                    {profileData?.mobile_number || profileData?.guardian_phone || <span className={styles.premiumInfoValueEmpty}>Not set</span>}
                  </span>
                </div>
                <div className={styles.premiumInfoItem}>
                  <span className={styles.premiumInfoLabel}>Location</span>
                  <span className={styles.premiumInfoValue}>
                    {profileData?.city || profileData?.state ? `${profileData?.city || ''}${profileData?.city && profileData?.state ? ', ' : ''}${profileData?.state || ''}` : (profileData?.address_line_1 || <span className={styles.premiumInfoValueEmpty}>Not set</span>)}
                  </span>
                </div>
                <div className={styles.premiumInfoItem}>
                  <span className={styles.premiumInfoLabel}>Institute Name</span>
                  <span className={styles.premiumInfoValue}>
                    {profileData?.education?.school || profileData?.education_school || profileData?.institute_name || <span className={styles.premiumInfoValueEmpty}>Not set</span>}
                  </span>
                </div>
                <div className={styles.premiumInfoItem}>
                  <span className={styles.premiumInfoLabel}>Education Board</span>
                  <span className={styles.premiumInfoValue}>
                    {profileData?.education?.board || profileData?.education_board || <span className={styles.premiumInfoValueEmpty}>Not set</span>}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
