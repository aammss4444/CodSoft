'use client';
import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import styles from './details.module.css';
import QRCode from 'react-qr-code';

export default function AchievementDetails({ params }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          router.push('/');
          return;
        }

        const res = await fetch(`http://localhost:5000/api/institutes/me/athletes/${unwrappedParams.id}/achievements/${unwrappedParams.achId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) {
          console.warn('Failed to fetch details:', res.status);
          setData(null);
          return;
        }

        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const result = await res.json();
          if (result.success) {
            setData(result);
          } else {
            console.error('Failed to fetch details:', result.message);
          }
        }
      } catch (err) {
        console.error('Error fetching details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (unwrappedParams.id && unwrappedParams.achId) {
      fetchDetails();
    }
  }, [unwrappedParams.id, unwrappedParams.achId, router]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#64748b' }}>Loading details...</div>;
  }

  if (!data || !data.achievement) {
    return <div style={{ padding: '48px', textAlign: 'center', color: '#ef4444' }}>Failed to load achievement details.</div>;
  }

  const { achievement, history, documents } = data;
  const isVerified = ['Verified', 'Verified & Locked', 'Approved', 'Digitally Signed'].includes(achievement.verification_status);

  // Find feedback for correction/rejection
  const feedbackHistory = history.find(h => h.new_status === 'Correction Required' || h.new_status === 'Rejected');

  // Timestamps for status
  const submittedTime = achievement.created_at ? new Date(achievement.created_at).toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'}) : '-';
  const verifiedTime = achievement.verified_at ? new Date(achievement.verified_at).toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'}) : '-';

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Achievement Details</h1>
          {isVerified ? (
            <span className={styles.verifiedBadge}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Verified & Locked
            </span>
          ) : (
            <span className={styles.unverifiedBadge}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              {achievement.verification_status}
            </span>
          )}
        </div>
        <div className={styles.actions}>
          <button className={styles.actionBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Download Certificate
          </button>
          <button className={styles.actionBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
            Share / Verify
          </button>
        </div>
      </div>
      <div className={styles.ledgerInfo} style={{marginBottom: '24px'}}>
        <span>Ledger ID: LED-MH-{new Date().getFullYear()}-{achievement.id.toString().padStart(5, '0')}</span>
        <span>Version 1.0</span>
      </div>

      <div className={styles.mainLayout}>
        {/* LEFT COLUMN */}
        <div className={styles.leftColumn}>
          <div className={`${styles.card} ${styles.overviewCard}`}>
            <div className={styles.medalIcon}>
              {achievement.medal_type?.toLowerCase().includes('gold') || achievement.result_rank === '1' || achievement.result_rank?.toLowerCase().includes('1st') ? '🥇' : 
               achievement.medal_type?.toLowerCase().includes('silver') || achievement.result_rank === '2' || achievement.result_rank?.toLowerCase().includes('2nd') ? '🥈' : 
               achievement.medal_type?.toLowerCase().includes('bronze') || achievement.result_rank === '3' || achievement.result_rank?.toLowerCase().includes('3rd') ? '🥉' : '🏅'}
            </div>
            <div className={styles.overviewInfo} style={{width: '100%'}}>
              <h2>{achievement.title || achievement.competition_name || 'Unnamed Achievement'}</h2>
              <h3>{achievement.competition_name}</h3>
              <div className={styles.sportTag}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 22V2m20 20V2M14 12l-4-4-4 4"></path></svg>
                Athletics • {achievement.event_name || achievement.performance_metric || 'Event'}
              </div>
              
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Achievement Level</span>
                  <span className={styles.statValue}>{achievement.competition_level || achievement.achievement_level || '-'}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Result</span>
                  <span className={styles.statValue}>{achievement.medal_type || achievement.result_rank || achievement.result_type || '-'}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Achievement Date</span>
                  <span className={styles.statValue}>{achievement.achievement_date ? new Date(achievement.achievement_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Age at Achievement</span>
                  <span className={styles.statValue}>{achievement.age_at_achievement ? `${achievement.age_at_achievement} Years` : '-'}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className={styles.tabsContainer}>
              <button className={`${styles.tab} ${activeTab === 'Overview' ? styles.activeTab : ''}`} onClick={() => setActiveTab('Overview')}>Overview</button>
              <button className={`${styles.tab} ${activeTab === 'Performance' ? styles.activeTab : ''}`} onClick={() => setActiveTab('Performance')}>Performance</button>
              <button className={`${styles.tab} ${activeTab === 'Documents' ? styles.activeTab : ''}`} onClick={() => setActiveTab('Documents')}>Documents ({documents.length || 0})</button>
              <button className={`${styles.tab} ${activeTab === 'Verification' ? styles.activeTab : ''}`} onClick={() => setActiveTab('Verification')}>Verification</button>
              <button className={`${styles.tab} ${activeTab === 'Audit Trail' ? styles.activeTab : ''}`} onClick={() => setActiveTab('Audit Trail')}>Audit Trail</button>
            </div>
            
            <div className={styles.contentSection}>
              {activeTab === 'Overview' && (
                <>
                  {feedbackHistory && (achievement.verification_status === 'Correction Required' || achievement.verification_status === 'Rejected') && (
                    <div className={styles.feedbackAlert}>
                      <div className={styles.feedbackHeader}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        Admin Feedback ({achievement.verification_status})
                      </div>
                      <p className={styles.feedbackText}>{feedbackHistory.comments}</p>
                      {achievement.verification_status === 'Correction Required' && (
                        <button className={styles.actionBtn} style={{ marginTop: '16px', borderColor: '#E11D48', color: '#E11D48' }} onClick={() => alert('Editing will be enabled soon.')}>
                          Update Achievement
                        </button>
                      )}
                    </div>
                  )}

                  <h3 className={styles.sectionHeader}>Competition / Event Details</h3>
                  <div className={styles.detailsGrid}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Event Name</span>
                      <span className={styles.detailValue}>{achievement.competition_name || '-'}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Organized By</span>
                      <span className={styles.detailValue}>{achievement.organized_by || '-'}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Venue</span>
                      <span className={styles.detailValue}>{achievement.venue_name || '-'}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Date</span>
                      <span className={styles.detailValue}>
                        {achievement.competition_start_date ? new Date(achievement.competition_start_date).toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'}) : '-'} 
                        {achievement.competition_end_date ? ` - ${new Date(achievement.competition_end_date).toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'})}` : ''}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>City</span>
                      <span className={styles.detailValue}>{achievement.city || '-'}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>District</span>
                      <span className={styles.detailValue}>{achievement.district || '-'}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>State</span>
                      <span className={styles.detailValue}>{achievement.state || '-'}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Country</span>
                      <span className={styles.detailValue}>{achievement.country || '-'}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Age Group</span>
                      <span className={styles.detailValue}>{achievement.age_group || '-'}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Competition Format</span>
                      <span className={styles.detailValue}>{achievement.competition_format || achievement.individual_or_team || '-'}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Competition Round</span>
                      <span className={styles.detailValue}>{achievement.competition_round || '-'}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Total Participants</span>
                      <span className={styles.detailValue}>{achievement.total_participants || '-'}</span>
                    </div>
                  </div>

                  <h3 className={styles.sectionHeader}>Result & Performance Details</h3>
                  <div className={styles.detailsGrid}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Final Position</span>
                      <span className={styles.detailValue}>{achievement.final_position_rank || achievement.result_rank || '-'}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Medal</span>
                      <span className={styles.detailValue}>{achievement.medal_type || '-'}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Timing / Performance</span>
                      <span className={styles.detailValue}>{achievement.timing || achievement.performance_value || '-'}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Personal Best</span>
                      <span className={styles.detailValue}>
                        {achievement.new_personal_best ? <span style={{color: '#059669', background: '#ECFDF5', padding: '2px 8px', borderRadius: '12px'}}>Yes</span> : 'No'}
                      </span>
                    </div>
                    {achievement.new_personal_best && (
                      <>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Previous Best</span>
                          <span className={styles.detailValue}>{achievement.prev_personal_best || '-'}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>New Personal Best</span>
                          <span className={styles.detailValue}>{achievement.new_personal_best || '-'}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Improvement</span>
                          <span className={styles.detailValue}>{achievement.pb_improvement || '-'}</span>
                        </div>
                      </>
                    )}
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Record Achieved</span>
                      <span className={styles.detailValue}>{achievement.record_achieved || 'No'}</span>
                    </div>
                  </div>

                  <h3 className={styles.sectionHeader} style={{borderBottom: 'none', marginBottom: '8px'}}>Description</h3>
                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                    {achievement.description || 'No description provided.'}
                  </p>
                </>
              )}
              {activeTab !== 'Overview' && (
                <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                  <p>Details for {activeTab} will be available in the next iteration.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className={styles.rightColumn}>
          <div className={styles.card}>
            <div className={styles.qrHeader}>QR Code (Public Verification)</div>
            <div className={styles.qrContent}>
              {isVerified ? (
                <>
                  <div className={styles.qrBox}>
                    <QRCode value={`https://maisip.verify/led-mh-${new Date().getFullYear()}-${achievement.id}`} size={96} />
                  </div>
                  <div className={styles.qrText}>
                    <h4>Scan to verify</h4>
                    <p>This record is verified and secured in the Digital Achievement Ledger.</p>
                    <span className={styles.verifiedBadge} style={{ display: 'inline-flex', padding: '2px 8px', fontSize: '11px' }}>Verified & Valid</span>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', padding: '24px 0', width: '100%' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginBottom: '8px', opacity: 0.5 }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  <br/>
                  QR Code will be generated<br/>once verified by the authority.
                </div>
              )}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.qrHeader}>Achievement Status</div>
            <div className={styles.timeline}>
              <div className={styles.timelineStep}>
                <div className={`${styles.timelineIcon} ${styles.completed}`}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
                <span className={styles.timelineLabel}>Submitted</span>
                <span className={styles.timelineDate}>{submittedTime}</span>
              </div>
              <div className={styles.timelineStep}>
                <div className={`${styles.timelineIcon} ${achievement.verification_status === 'submitted' || achievement.verification_status === 'submitted' || achievement.verification_status === 'draft' ? styles.current : styles.completed}`}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div>
                <span className={styles.timelineLabel}>{achievement.verification_status === 'draft' ? 'Draft Saved' : 'Under Review'}</span>
                <span className={styles.timelineDate}>{submittedTime}</span>
              </div>
              <div className={styles.timelineStep}>
                <div className={`${styles.timelineIcon} ${isVerified ? styles.completed : ''}`}>{isVerified && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>}</div>
                <span className={styles.timelineLabel}>Verified</span>
                <span className={styles.timelineDate}>{verifiedTime}</span>
              </div>
              <div className={styles.timelineStep}>
                <div className={`${styles.timelineIcon} ${isVerified ? styles.completed : ''}`}>{isVerified && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>}</div>
                <span className={styles.timelineLabel}>Locked</span>
                <span className={styles.timelineDate}>{verifiedTime}</span>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.verifyList}>
              <div className={styles.verifyRow}>
                <span className={styles.verifyLabel}>Verified By</span>
                <span className={styles.verifyValue}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" style={{flexShrink: 0}}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  {achievement.recognized_by || achievement.governing_federation || 'System Admin'}
                </span>
              </div>
              <div className={styles.verifyRow}>
                <span className={styles.verifyLabel}>Verifier Name</span>
                <span className={styles.verifyValue}>{achievement.verified_by || 'Admin'}</span>
              </div>
              <div className={styles.verifyRow}>
                <span className={styles.verifyLabel}>Designation</span>
                <span className={styles.verifyValue}>Admin Officer</span>
              </div>
              <div className={styles.verifyRow}>
                <span className={styles.verifyLabel}>Verified On</span>
                <span className={styles.verifyValue}>{achievement.verified_at ? new Date(achievement.verified_at).toLocaleString('en-GB') : '-'}</span>
              </div>
              <div className={styles.verifyRow}>
                <span className={styles.verifyLabel}>Digital Signature</span>
                <span className={styles.verifyValue} style={{flexDirection: 'column', alignItems: 'flex-start'}}>
                  {isVerified ? (
                    <>
                      <span className={styles.verifiedBadge} style={{ padding: '2px 8px', fontSize: '11px', display: 'inline-flex' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Verified
                      </span>
                      <div className={styles.signature}>Admin Auth</div>
                    </>
                  ) : '-'}
                </span>
              </div>
              <div className={styles.verifyRow} style={{marginTop: '8px', paddingTop: '16px', borderTop: '1px solid #F1F5F9'}}>
                <span className={styles.verifyLabel}>Reference No.</span>
                <span className={styles.verifyValue}>{achievement.achievement_reference_number || `VER/${new Date().getFullYear()}/0456`}</span>
              </div>
            </div>
          </div>

          <div className={styles.card} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
            <div className={styles.verifyRow}>
              <span className={styles.verifyLabel}>Visibility</span>
              <span className={styles.verifyValue}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="3" style={{flexShrink: 0}}><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle></svg>
                {achievement.visibility_level || 'Institute & Federation'}
              </span>
            </div>
            <div className={styles.verifyRow}>
              <span className={styles.verifyLabel}>Last Updated</span>
              <span className={styles.verifyValue} style={{fontSize: '11px', color: '#64748b'}}>
                {achievement.updated_at ? new Date(achievement.updated_at).toLocaleString('en-GB') : (achievement.created_at ? new Date(achievement.created_at).toLocaleString('en-GB') : '-')}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
