'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './athleteProfile.module.css';

export default function InstituteAthleteDetail({ params }) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

        const res = await fetch(`http://localhost:5000/api/institutes/me/athletes/${id}`, {
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

          // Set Documents (Read-only for now)
          setDocuments(profile.documents || []);

        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router, id]);


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
          <p className={styles.subtitle}>Viewing details for {formData.first_name || formData.last_name ? `${formData.first_name || ''} ${formData.last_name || ''}`.trim() : 'Athlete'}</p>
        </div>
        <button className={styles.saveBtn} onClick={() => router.push('/institute/athletes')} style={{background: '#64748b', color: '#fff'}}>
          Back to List
        </button>
      </header>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F5B041" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          Basic Information
        </h3>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>First Name</label>
            <div className={styles.readOnlyData}>{formData.first_name || 'Not Set'}</div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Middle Name</label>
            <div className={styles.readOnlyData}>{formData.middle_name || 'Not Set'}</div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Last Name</label>
            <div className={styles.readOnlyData}>{formData.last_name || 'Not Set'}</div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Date of Birth</label>
            <div className={styles.readOnlyData}>{formData.date_of_birth || 'Not Set'}</div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Gender</label>
            <div className={styles.readOnlyData}>{formData.gender || 'Not Set'}</div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Blood Group</label>
            <div className={styles.readOnlyData}>{formData.blood_group || 'Not Set'}</div>
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
            <div className={styles.readOnlyData}>{formData.mobile_number || 'Not Set'}</div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Address Line 1</label>
            <div className={styles.readOnlyData}>{formData.address_line_1 || 'Not Set'}</div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Address Line 2</label>
            <div className={styles.readOnlyData}>{formData.address_line_2 || 'Not Set'}</div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>City</label>
            <div className={styles.readOnlyData}>{formData.city || 'Not Set'}</div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>State</label>
            <div className={styles.readOnlyData}>{formData.state || 'Not Set'}</div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Pincode</label>
            <div className={styles.readOnlyData}>{formData.pincode || 'Not Set'}</div>
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
            <div className={styles.readOnlyData}>{formData.education.school || 'Not Set'}</div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Grade/Standard</label>
            <div className={styles.readOnlyData}>{formData.education.grade || 'Not Set'}</div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Board (e.g. CBSE, State Board)</label>
            <div className={styles.readOnlyData}>{formData.education.board || 'Not Set'}</div>
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
            <div className={styles.readOnlyData}>{formData.sports_profile.primary_sport || 'Not Set'}</div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Position/Event</label>
            <div className={styles.readOnlyData}>{formData.sports_profile.position || 'Not Set'}</div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Preferred Hand/Foot</label>
            <div className={styles.readOnlyData}>{formData.sports_profile.preferred_hand_foot || 'Not Set'}</div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Height (cm)</label>
            <div className={styles.readOnlyData}>{formData.sports_profile.height_cm || 'Not Set'}</div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Weight (kg)</label>
            <div className={styles.readOnlyData}>{formData.sports_profile.weight_kg || 'Not Set'}</div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F5B041" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          Submitted Documents
        </h3>
        <div className={styles.documentList} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {documents && documents.length > 0 ? (
            documents.map((doc, idx) => (
              <a key={idx} href={`http://localhost:5000${doc.file_path}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', background: '#f8fafc', transition: 'transform 0.2s ease' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', textAlign: 'center' }}>
                    {doc.document_type || 'Document'}
                  </span>
                </div>
              </a>
            ))
          ) : (
            <p style={{ color: '#64748b', fontSize: '15px' }}>No documents uploaded.</p>
          )}
        </div>
      </div>
    </div>
  );
}
