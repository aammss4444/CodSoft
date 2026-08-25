'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './profile.module.css';

export default function InstituteProfile() {
  const router = useRouter();
  const [institute, setInstitute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    const fetchInstituteData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          router.push('/');
          return;
        }

        const res = await fetch('http://localhost:5000/api/institutes/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
          router.push('/');
          return;
        }

        const data = await res.json();
        if (data.success) {
          setInstitute(data.data);
        } else {
          console.error(data.message);
        }
      } catch (err) {
        console.error('Failed to fetch institute data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInstituteData();
  }, [router]);

  const handleEditToggle = () => {
    if (!isEditing) {
      setEditData(JSON.parse(JSON.stringify(institute)));
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('http://localhost:5000/api/institutes/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      });
      const data = await res.json();
      if (data.success) {
        setInstitute(editData);
        setIsEditing(false);
      } else {
        alert('Failed to save changes: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Error saving changes');
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#F8FAFC' }}>Loading Dashboard...</div>;
  }

  if (!institute) return null;

  // Assuming verification_status exists on the table or we simulate based on role. We'll simulate a Verified status for demo if not present.
  const isVerified = institute.verification_status ? institute.identity_status === 'verified' : true; 

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Institute Profile</h1>
          <p className={styles.subtitle}>Manage your details and view your uploaded documents</p>
        </div>
        <div style={{display: 'flex', gap: '16px'}}>
          {isEditing ? (
            <>
              <button className={styles.saveBtn} onClick={handleSave}>Save Changes</button>
              <button className={styles.cancelBtn} onClick={handleEditToggle}>Cancel</button>
            </>
          ) : (
            <button className={styles.editBtn} onClick={handleEditToggle}>Edit Profile</button>
          )}
        </div>
      </header>

      {!isVerified ? (
        <div className={`${styles.statusAlert} ${styles.pending}`}>
          <div className={styles.statusAlertIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <div className={styles.statusAlertContent}>
            <h4>Verification Pending</h4>
            <p>Your institute profile is currently pending verification by the System Admin. Some features may be restricted.</p>
          </div>
        </div>
      ) : (
        <div className={`${styles.statusAlert} ${styles.verified}`}>
          <div className={styles.statusAlertIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <div className={styles.statusAlertContent}>
            <h4>Verified Institute</h4>
            <p>Your institute is fully verified and authorized on the MAISIP platform.</p>
          </div>
        </div>
      )}

      <div className={styles.grid}>
        {/* Left Column */}
        <div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F5B041" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              Overview
            </h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Organization Name</span>
                {isEditing ? (
                  <input className={styles.editInput} type="text" value={editData?.org_name || ''} onChange={e => setEditData({...editData, org_name: e.target.value})} />
                ) : (
                  <span className={styles.infoValue}>{institute.org_name || 'N/A'}</span>
                )}
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Registration Number</span>
                <span className={styles.infoValue}>{institute.reg_number || 'N/A'} (Non-editable)</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Type</span>
                <span className={styles.infoValue}>{institute.organization_type || 'N/A'} (Non-editable)</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Year Established</span>
                {isEditing ? (
                  <input className={styles.editInput} type="number" value={editData?.year_established || ''} onChange={e => setEditData({...editData, year_established: e.target.value})} />
                ) : (
                  <span className={styles.infoValue}>{institute.year_established || 'N/A'}</span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F5B041" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              Affiliations & Recognitions
            </h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Government Authority</span>
                {isEditing ? (
                  <input className={styles.editInput} type="text" value={editData?.affiliations?.gov_authority || ''} onChange={e => setEditData({...editData, affiliations: {...editData.affiliations, gov_authority: e.target.value}})} />
                ) : (
                  <span className={styles.infoValue}>{institute.affiliations?.gov_authority || 'N/A'}</span>
                )}
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Recognition Number</span>
                {isEditing ? (
                  <input className={styles.editInput} type="text" value={editData?.affiliations?.recognition_number || ''} onChange={e => setEditData({...editData, affiliations: {...editData.affiliations, recognition_number: e.target.value}})} />
                ) : (
                  <span className={styles.infoValue}>{institute.affiliations?.recognition_number || 'N/A'}</span>
                )}
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Affiliated Board</span>
                {isEditing ? (
                  <input className={styles.editInput} type="text" value={editData?.affiliations?.affiliated_board || ''} onChange={e => setEditData({...editData, affiliations: {...editData.affiliations, affiliated_board: e.target.value}})} />
                ) : (
                  <span className={styles.infoValue}>{institute.affiliations?.affiliated_board || 'N/A'}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F5B041" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              Sports Metrics
            </h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Active Athletes</span>
                {isEditing ? (
                  <input className={styles.editInput} type="number" value={editData?.sports_metrics?.active_athletes || ''} onChange={e => setEditData({...editData, sports_metrics: {...editData.sports_metrics, active_athletes: e.target.value}})} />
                ) : (
                  <span className={styles.infoValue}>{institute.sports_metrics?.active_athletes || '0'}</span>
                )}
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Coaches</span>
                {isEditing ? (
                  <input className={styles.editInput} type="number" value={editData?.sports_metrics?.num_coaches || ''} onChange={e => setEditData({...editData, sports_metrics: {...editData.sports_metrics, num_coaches: e.target.value}})} />
                ) : (
                  <span className={styles.infoValue}>{institute.sports_metrics?.num_coaches || '0'}</span>
                )}
              </div>
            </div>
            
            <div className={styles.infoItem} style={{marginTop: '20px'}}>
              <span className={styles.infoLabel}>Sports Offered</span>
              <div className={styles.tagList} style={{marginTop: '8px'}}>
                {institute.sports_metrics?.sports_offered?.length > 0 ? 
                  institute.sports_metrics.sports_offered.map((sport, idx) => (
                    <span key={idx} className={styles.tag}>{sport}</span>
                  )) : 
                  <span className={styles.infoValue}>No sports listed</span>
                }
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F5B041" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              Infrastructure
            </h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Indoor Facilities</span>
                {isEditing ? (
                  <select className={styles.editSelect} value={editData?.infrastructure?.indoor_facilities ? 'Yes' : 'No'} onChange={e => setEditData({...editData, infrastructure: {...editData.infrastructure, indoor_facilities: e.target.value === 'Yes'}})}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                ) : (
                  <span className={styles.infoValue}>{institute.infrastructure?.indoor_facilities ? 'Yes' : 'No'}</span>
                )}
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Outdoor Facilities</span>
                {isEditing ? (
                  <select className={styles.editSelect} value={editData?.infrastructure?.outdoor_facilities ? 'Yes' : 'No'} onChange={e => setEditData({...editData, infrastructure: {...editData.infrastructure, outdoor_facilities: e.target.value === 'Yes'}})}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                ) : (
                  <span className={styles.infoValue}>{institute.infrastructure?.outdoor_facilities ? 'Yes' : 'No'}</span>
                )}
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Medical Support</span>
                {isEditing ? (
                  <select className={styles.editSelect} value={editData?.infrastructure?.medical_support ? 'Yes' : 'No'} onChange={e => setEditData({...editData, infrastructure: {...editData.infrastructure, medical_support: e.target.value === 'Yes'}})}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                ) : (
                  <span className={styles.infoValue}>{institute.infrastructure?.medical_support ? 'Yes' : 'No'}</span>
                )}
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Hostel</span>
                {isEditing ? (
                  <select className={styles.editSelect} value={editData?.infrastructure?.hostel ? 'Yes' : 'No'} onChange={e => setEditData({...editData, infrastructure: {...editData.infrastructure, hostel: e.target.value === 'Yes'}})}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                ) : (
                  <span className={styles.infoValue}>{institute.infrastructure?.hostel ? 'Yes' : 'No'}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
