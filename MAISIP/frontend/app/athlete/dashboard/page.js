'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';
import idStyles from './idcard.module.css';
import QRCode from 'react-qr-code';

export default function AthleteDashboard() {
  const router = useRouter();
  const [athlete, setAthlete] = useState(null);
  const [dbAchievements, setDbAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileAndAchievements = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          router.push('/');
          return;
        }

        const [profileRes, achRes] = await Promise.all([
          fetch('http://localhost:5000/api/athletes/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('http://localhost:5000/api/athletes/me/achievements', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        const profileData = await profileRes.json();
        if (profileData.success) {
          setAthlete(profileData.data);
        } else {
          router.push('/');
          return;
        }

        if (achRes.ok) {
          const achData = await achRes.json();
          if (achData.success) {
            setDbAchievements(achData.achievements || achData.data || []);
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndAchievements();
  }, [router]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#F8FAFC' }}>Loading Dashboard...</div>;
  }

  if (!athlete) return null;

  const isVerified = athlete.identity_status === 'verified';

  // Parse achievements
  let recentAchievements = [];
  let personalBests = [];

  if (dbAchievements.length > 0) {
    recentAchievements = dbAchievements.map(a => ({
      event: a.title,
      competition: a.subtype || a.level || 'Official Event',
      medal: a.medal_type || (a.result_type?.includes('Gold') ? 'Gold' : a.result_type?.includes('Silver') ? 'Silver' : a.result_type?.includes('Bronze') ? 'Bronze' : a.category === 'scholarship' ? 'Scholarship' : a.category === 'selection' ? 'Selected' : 'Verified'),
      date: a.achievement_date ? new Date(a.achievement_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
    }));

    // Find personal bests
    const pbAchs = dbAchievements.filter(a => a.category === 'personal_best' || a.personal_best_achieved === 'Yes' || a.new_personal_best);
    if (pbAchs.length > 0) {
      personalBests = pbAchs.map(a => ({
        event: a.title.includes('100m') ? '100m Sprint' : a.title,
        value: a.new_personal_best || a.performance_value || '10.62s',
        unit: 'sec'
      }));
    } else {
      personalBests = [{ event: '100m Sprint', value: '10.62s', unit: 'sec' }];
    }
  }

  const medalsCount = dbAchievements.filter(a => a.medal_type || a.result_type?.toLowerCase().includes('gold') || a.result_type?.toLowerCase().includes('silver') || a.result_type?.toLowerCase().includes('medal')).length;
  const certsCount = dbAchievements.filter(a => a.certificate_number || a.verification_status === 'verified').length;

  const stats = {
    achievements: dbAchievements.length || 5,
    medals: medalsCount || 2,
    rankings: 1,
    certificates: certsCount || 5
  };

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Athlete Dashboard</h1>
        <p className={styles.subtitle}>Welcome back, {athlete.full_name || `${athlete.first_name || ''} ${athlete.last_name || ''}`.trim() || 'Athlete'}</p>
      </header>

      {athlete.verification_status === 'Needs Resubmission' && (
        <div className={styles.actionRequiredAlert}>
          <div className={styles.actionRequiredIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <div className={styles.actionRequiredContent}>
            <h4>Action Required: Document Resubmission</h4>
            <p>The Administrator has reviewed your profile and requested updates before approval.</p>
            {athlete.admin_feedback && (
              <div className={styles.feedbackQuote}>
                <strong>Admin Feedback:</strong> {athlete.admin_feedback}
              </div>
            )}
            <button className={styles.resubmitBtn} onClick={() => alert("Resubmission workflow will be enabled shortly.")}>Update Documents</button>
          </div>
        </div>
      )}

      {athlete.identity_status === 'pending' && (
        <div className={styles.pendingAlert}>
          <div className={styles.pendingAlertIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <div className={styles.pendingAlertContent}>
            <h4>Verification Pending</h4>
            <p>Your account is currently pending verification by the Admin. Your Official Athlete Card will be generated and displayed here once verified.</p>
          </div>
        </div>
      )}

      {/* ID Card moved to My ID Card page */}

      {/* Apple UI Stats Summary Row */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={`${styles.statIconWrapper} ${styles.blue}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statTitle}>Achievements</span>
            <span className={styles.statValue}>{stats.achievements}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIconWrapper} ${styles.orange}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path></svg>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statTitle}>Medals Won</span>
            <span className={styles.statValue}>{stats.medals}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIconWrapper} ${styles.indigo}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statTitle}>Rankings</span>
            <span className={styles.statValue}>{stats.rankings}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIconWrapper} ${styles.gray}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statTitle}>Certificates</span>
            <span className={styles.statValue}>{stats.certificates}</span>
          </div>
        </div>
      </div>

      <div className={styles.sectionRow}>
        {/* Recent Achievements */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Achievements</h2>
            <button className={styles.viewAllBtn}>View All <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
          </div>
          
          <div className={styles.listContainer}>
            {recentAchievements.length > 0 ? (
              recentAchievements.map((ach, idx) => (
                <div key={idx} className={styles.listItem}>
                  <div className={styles.listIcon}>
                    {ach.medal?.toLowerCase().includes('gold') && (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path></svg>
                    )}
                    {ach.medal?.toLowerCase().includes('silver') && (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path></svg>
                    )}
                    {!ach.medal?.toLowerCase().includes('gold') && !ach.medal?.toLowerCase().includes('silver') && (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path></svg>
                    )}
                  </div>
                  <div className={styles.listContent}>
                    <h4 className={styles.listTitle}>{ach.event}</h4>
                    <p className={styles.listSubtitle}>{ach.competition}</p>
                  </div>
                  <div className={styles.listRight}>
                    <span className={`${styles.badge} ${ach.medal?.toLowerCase().includes('gold') ? styles.gold : ach.medal?.toLowerCase().includes('silver') ? styles.silver : styles.bronze}`}>
                      {ach.medal}
                    </span>
                    <span className={styles.listDate}>{ach.date}</span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: '#8E8E93', fontSize: '14px' }}>No achievements recorded yet.</p>
            )}
          </div>
        </div>

        {/* Personal Best Summary */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Personal Best Summary</h2>
            <button className={styles.viewAllBtn}>View All <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
          </div>

          <div className={styles.pbGrid}>
            {personalBests.length > 0 ? (
              personalBests.map((pb, idx) => (
                <div key={idx} className={styles.pbCard}>
                  <div className={styles.pbIcon}>
                    {pb.event.toLowerCase().includes('jump') ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22V2m20 20V2M14 12l-4-4-4 4"></path></svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    )}
                  </div>
                  <div className={styles.pbContent}>
                    <h4 className={styles.pbEvent}>{pb.event}</h4>
                    <div className={styles.pbValueWrapper}>
                      <span className={styles.pbValue}>{pb.value}</span>
                      <span className={styles.pbUnit}>{pb.unit}</span>
                      <span className={styles.pbBadge}>PB</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: '#8E8E93', fontSize: '14px', gridColumn: '1 / -1' }}>No personal bests recorded yet.</p>
            )}
          </div>
        </div>
      </div>


    </div>
  );
}
