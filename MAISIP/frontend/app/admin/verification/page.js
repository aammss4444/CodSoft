'use client';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import styles from './verification.module.css';

export default function VerificationCenter() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabFromUrl = searchParams.get('tab') || 'athletes';
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [athletes, setAthletes] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleAuthError = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    router.push('/');
  }, [router]);

  const fetchVerifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return handleAuthError();
      
      const athRes = await fetch('http://localhost:5000/api/verification/athletes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (athRes.status === 401 || athRes.status === 403) {
        handleAuthError();
        return;
      }
      const athData = await athRes.json();
      if (athData.success) setAthletes(athData.data);

      const instRes = await fetch('http://localhost:5000/api/verification/institutes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (instRes.status === 401 || instRes.status === 403) {
        handleAuthError();
        return;
      }
      const instData = await instRes.json();
      if (instData.success) setInstitutes(instData.data);

    } catch (error) {
      console.error('Error fetching verification data:', error);
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'institutes' || tab === 'athletes') {
      setTimeout(() => setActiveTab(tab), 0);
    }
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    router.push(`/admin/verification?tab=${tab}`);
  };

  const handleAthleteUpdate = async (athleteId, identity_verified, consent_verified, status, admin_feedback = null) => {
    try {
      const token = localStorage.getItem('authToken');
      const identity_status = status === 'Verified' ? 'verified' : 'rejected';
      const res = await fetch(`http://localhost:5000/api/verification/athletes/${athleteId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ identity_verified, consent_verified, identity_status, rejection_reason: admin_feedback })
      });
      if (res.ok) {
        fetchVerifications();
      } else {
        const errorData = await res.json();
        alert(`Failed to update verification: ${errorData.message || 'Unknown error'}`);
      }
    } catch (e) {
      alert('Failed to update verification.');
    }
  };

  const handleInstituteUpdate = async (instId, documents_verified, authority_approved, status) => {
    try {
      const token = localStorage.getItem('authToken');
      const identity_status = status === 'Verified' ? 'verified' : 'rejected';
      const res = await fetch(`http://localhost:5000/api/verification/institutes/${instId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ documents_verified, authority_approved, identity_status })
      });
      if (res.ok) {
        fetchVerifications();
      } else {
        const errorData = await res.json();
        alert(`Failed to update verification: ${errorData.message || 'Unknown error'}`);
      }
    } catch (e) {
      alert('Failed to update verification.');
    }
  };

  if (loading) return <div>Loading Verification Data...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.list}>
        {activeTab === 'athletes' && athletes.map(athlete => (
          <AthleteVerificationCard 
            key={athlete.id} 
            athlete={athlete} 
            onUpdate={handleAthleteUpdate} 
          />
        ))}

        {activeTab === 'institutes' && institutes.map(institute => (
          <InstituteVerificationCard 
            key={institute.id} 
            institute={institute} 
            onUpdate={handleInstituteUpdate} 
          />
        ))}

        {(activeTab === 'athletes' && athletes.length === 0) && (
          <div className={styles.emptyState}>
            <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <h3 className={styles.emptyTitle}>All Caught Up!</h3>
            <p className={styles.emptyDesc}>There are currently no athlete verification requests pending review. New requests will appear here once submitted.</p>
          </div>
        )}
        {(activeTab === 'institutes' && institutes.length === 0) && (
          <div className={styles.emptyState}>
            <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <h3 className={styles.emptyTitle}>All Caught Up!</h3>
            <p className={styles.emptyDesc}>There are currently no institute verification requests pending review. New registrations will be listed here once submitted.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AthleteVerificationCard({ athlete, onUpdate }) {
  const [identity, setIdentity] = useState(athlete.identity_verified || false);
  const [consent, setConsent] = useState(athlete.consent_verified || false);
  const isPending = athlete.identity_status !== 'verified';
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  const handleApprove = () => {
    onUpdate(athlete.id, identity, consent, 'Verified');
  };

  const handleReject = () => {
    if (!feedbackText.trim()) {
      alert("Please provide feedback for resubmission.");
      return;
    }
    onUpdate(athlete.id, identity, consent, 'Needs Resubmission', feedbackText);
  };

  const toggleExpand = async () => {
    if (!isExpanded && !details) {
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`http://localhost:5000/api/verification/athletes/${athlete.id}/details`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setDetails(data.data);
        }
      } catch (err) {
        console.error('Failed to load athlete details', err);
      } finally {
        setLoading(false);
      }
    }
    setIsExpanded(!isExpanded);
  };

  const renderDocLink = (path, label) => {
    if (!path) return <span style={{fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic'}}>Not Uploaded</span>;
    return (
      <a href={`http://localhost:5000${path}`} target="_blank" rel="noopener noreferrer" className={styles.docLink}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        {label}
      </a>
    );
  };

  return (
    <div className={styles.card} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div className={styles.cardHeader}>
        <div className={styles.info}>
          <div className={styles.name}>{athlete.full_name || 'Unknown Athlete'}</div>
          <div className={styles.subtext}>{athlete.email}</div>
          <div className={athlete.identity_status === 'verified' ? styles.statusVerified : styles.statusPending}>
            {athlete.identity_status === 'verified' ? 'Verified' : (athlete.identity_status || 'Pending').toUpperCase()}
          </div>
        </div>

        {isPending ? (
          <div className={styles.actions} style={{ minWidth: 'auto', flexDirection: 'row', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginRight: '16px' }}>
              <label className={styles.checkboxGroup}>
                <input type="checkbox" className={styles.checkbox} checked={identity} onChange={(e) => setIdentity(e.target.checked)} />
                <span className={styles.checkLabel}>Identity Verification</span>
              </label>
              <label className={styles.checkboxGroup}>
                <input type="checkbox" className={styles.checkbox} checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                <span className={styles.checkLabel}>Consent Verification</span>
              </label>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className={styles.rejectBtn}
                style={{ marginTop: 0 }}
                onClick={() => setShowFeedback(!showFeedback)}
              >
                Request Resubmission
              </button>
              <button 
                className={styles.approveBtn} 
                style={{ marginTop: 0 }}
                disabled={!identity || !consent}
                onClick={handleApprove}
              >
                Approve
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.actions} style={{ minWidth: 'auto' }}>
            <div className={styles.verifiedLabel}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              Fully Verified
            </div>
          </div>
        )}
      </div>

      {isPending && showFeedback && (
        <div className={styles.feedbackContainer}>
          <div className={styles.feedbackHeader}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e293b' }}>Provide feedback to the athlete</span>
          </div>
          <textarea 
            className={styles.feedbackInput} 
            placeholder="E.g., Your Aadhaar card is blurry. Please upload a clear scanned copy."
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
          ></textarea>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button className={styles.submitFeedbackBtn} onClick={handleReject}>Send Notification & Reject</button>
          </div>
        </div>
      )}

      <button className={styles.expandBtn} onClick={toggleExpand}>
        {isExpanded ? 'Hide Details' : 'View Full Details'}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isExpanded && (
        <div className={styles.expandedDetails}>
          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>Loading details...</div>
          ) : details ? (
            <div className={styles.detailsGrid}>
              <div className={styles.detailPanel}>
                <div className={styles.panelTitle}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
                  Identification Details
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>DOB & Age</span>
                  <span className={styles.infoValue}>
                    {details.date_of_birth ? new Date(details.date_of_birth).toLocaleDateString() : 'N/A'} ({details.age ? `${details.age} yrs` : 'N/A'})
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Gender & Blood Group</span>
                  <span className={styles.infoValue}>
                    {details.gender || 'N/A'} | {details.blood_group || 'N/A'}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Location</span>
                  <span className={styles.infoValue}>
                    {details.city ? `${details.city}, ${details.state}` : 'N/A'}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Primary Sport</span>
                  <span className={styles.infoValue}>{details.primary_sport || 'N/A'}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>ID Type & Number</span>
                  <span className={styles.infoValue}>
                    {details.national_id_type || 'N/A'} - {details.national_id_number || 'N/A'}
                  </span>
                </div>
                <div className={styles.infoRow} style={{ marginTop: '8px' }}>
                  <span className={styles.infoLabel}>Documents</span>
                  {renderDocLink(details.id_document, 'View ID Document')}
                  {renderDocLink(details.profile_picture, 'View Profile Photo')}
                </div>
              </div>

              <div className={styles.detailPanel}>
                <div className={styles.panelTitle}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  Consents & Signatures
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Agreed to Accuracy</span>
                  <span className={styles.infoValue}>{details.consent_accurate ? 'Yes' : 'No'}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Data Processing</span>
                  <span className={styles.infoValue}>{details.consent_data ? 'Yes' : 'No'}</span>
                </div>
                <div className={styles.infoRow} style={{ marginTop: '8px' }}>
                  <span className={styles.infoLabel}>Signatures Uploaded</span>
                  {renderDocLink(details.athlete_signature, 'Athlete Signature')}
                  {details.age < 18 && renderDocLink(details.parent_signature, 'Parent Signature')}
                </div>
              </div>

              <div className={styles.detailPanel}>
                <div className={styles.panelTitle}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
                  Institute Validation
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Institute Name</span>
                  <span className={styles.infoValue}>{details.institute_name || 'Independent (No Institute)'}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Coach Name</span>
                  <span className={styles.infoValue}>{details.coach_name || 'N/A'}</span>
                </div>
                <div className={styles.infoRow} style={{ marginTop: '8px' }}>
                  <span className={styles.infoLabel}>Documents</span>
                  {details.institute_name && renderDocLink(details.institute_signature, 'Institute Seal/Signature')}
                  {renderDocLink(details.certificates_upload, 'Uploaded Certificates')}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

function InstituteVerificationCard({ institute, onUpdate }) {
  const [documents, setDocuments] = useState(institute.documents_verified || false);
  const [authority, setAuthority] = useState(institute.authority_approved || false);
  const isPending = institute.identity_status !== 'verified';

  const [isExpanded, setIsExpanded] = useState(false);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleApprove = () => {
    onUpdate(institute.id, documents, authority, 'Verified');
  };

  const toggleExpand = async () => {
    if (!isExpanded && !details) {
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`http://localhost:5000/api/verification/institutes/${institute.id}/details`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setDetails(data.data);
        }
      } catch (err) {
        console.error('Failed to load institute details', err);
      } finally {
        setLoading(false);
      }
    }
    setIsExpanded(!isExpanded);
  };

  const renderDocLink = (path, label) => {
    if (!path) return <span style={{fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic'}}>Not Uploaded</span>;
    return (
      <a href={`http://localhost:5000${path}`} target="_blank" rel="noopener noreferrer" className={styles.docLink}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        {label}
      </a>
    );
  };

  return (
    <div className={styles.card} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div className={styles.cardHeader}>
        <div className={styles.info}>
          <div className={styles.name}>{institute.name || 'Unknown Institute'}</div>
          <div className={styles.subtext}>Reg: {institute.registration_id} | {institute.email}</div>
          <div className={institute.identity_status === 'verified' ? styles.statusVerified : styles.statusPending}>
            {institute.identity_status === 'verified' ? 'Verified' : (institute.identity_status || 'Pending').toUpperCase()}
          </div>
        </div>

        {isPending ? (
          <div className={styles.actions} style={{ minWidth: 'auto', flexDirection: 'row', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginRight: '16px' }}>
              <label className={styles.checkboxGroup}>
                <input type="checkbox" className={styles.checkbox} checked={documents} onChange={(e) => setDocuments(e.target.checked)} />
                <span className={styles.checkLabel}>Document Verification</span>
              </label>
              <label className={styles.checkboxGroup}>
                <input type="checkbox" className={styles.checkbox} checked={authority} onChange={(e) => setAuthority(e.target.checked)} />
                <span className={styles.checkLabel}>Authority Approval</span>
              </label>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className={styles.approveBtn} 
                style={{ marginTop: 0 }}
                disabled={!documents || !authority}
                onClick={handleApprove}
              >
                Approve
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.actions} style={{ minWidth: 'auto' }}>
            <div className={styles.verifiedLabel}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              Fully Verified
            </div>
          </div>
        )}
      </div>

      <button className={styles.expandBtn} onClick={toggleExpand}>
        {isExpanded ? 'Hide Details' : 'View Full Details'}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isExpanded && (
        <div className={styles.expandedDetails}>
          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>Loading institute dossier...</div>
          ) : details ? (
            <div className={styles.detailsGrid}>
              <div className={styles.detailPanel}>
                <div className={styles.panelTitle}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                  Institute Overview
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Organization Name</span>
                  <span className={styles.infoValue}>{details.org_name || 'N/A'}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Registration Number</span>
                  <span className={styles.infoValue}>{details.reg_number || 'N/A'}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Type & Established</span>
                  <span className={styles.infoValue}>
                    {details.organization_type || 'N/A'} | {details.year_established || 'N/A'}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Affiliation</span>
                  <span className={styles.infoValue}>
                    {details.gov_authority ? `${details.gov_authority} (${details.recognition_number})` : 'None'}
                  </span>
                </div>
              </div>

              <div className={styles.detailPanel}>
                <div className={styles.panelTitle}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  Contacts
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Admin</span>
                  <span className={styles.infoValue}>{details.admin_name} | {details.admin_mobile}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Admin Email</span>
                  <span className={styles.infoValue}>{details.admin_email}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Secondary Contact</span>
                  <span className={styles.infoValue}>{details.contact_name ? `${details.contact_name} | ${details.contact_mobile}` : 'N/A'}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Secondary Email</span>
                  <span className={styles.infoValue}>{details.contact_email || 'N/A'}</span>
                </div>
              </div>

              <div className={styles.detailPanel}>
                <div className={styles.panelTitle}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                  Sports & Infrastructure
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Primary Sports</span>
                  <span className={styles.infoValue}>{(Array.isArray(details.sports_offered) ? details.sports_offered.join(', ') : details.sports_offered) || 'N/A'}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Athletes & Coaches</span>
                  <span className={styles.infoValue}>{details.active_athletes || 0} Athletes | {details.num_coaches || 0} Coaches</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Facilities</span>
                  <span className={styles.infoValue}>
                    {details.indoor_facilities && 'Indoor '}
                    {details.outdoor_facilities && 'Outdoor '}
                    {details.hostel && 'Hostel '}
                    {details.medical_support && 'Medical '}
                  </span>
                </div>
              </div>

              <div className={styles.detailPanel}>
                <div className={styles.panelTitle}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  Documents
                </div>
                <div className={styles.infoRow} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', flexDirection: 'row', alignItems: 'center' }}>
                  {details.documents && details.documents.map((doc, idx) => (
                    <span key={idx}>{renderDocLink(doc.file_path, doc.document_type)}</span>
                  ))}
                  {(!details.documents || details.documents.length === 0) && (
                    <span className={styles.infoValue} style={{ color: '#94a3b8' }}>No documents uploaded</span>
                  )}
                </div>
              </div>

            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
