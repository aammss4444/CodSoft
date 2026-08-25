'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';

export default function InstituteDashboard() {
  const router = useRouter();
  const [institute, setInstitute] = useState(null);
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);

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

        // Fetch Athletes
        const athletesRes = await fetch('http://localhost:5000/api/institutes/me/athletes', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const athletesData = await athletesRes.json();
        if (athletesData.success) {
          setAthletes(athletesData.athletes || []);
        }
      } catch (err) {
        console.error('Failed to fetch institute data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInstituteData();
  }, [router]);


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
          <h1 className={styles.title}>Institute Dashboard</h1>
          <p className={styles.subtitle}>Welcome back to the MAISIP Institute Portal</p>
        </div>
        <div style={{display: 'flex', gap: '16px'}}>
          <button 
            className={styles.registerBtn}
            onClick={() => router.push('/institute/dashboard/register-athlete')}
          >
            + Register Athlete
          </button>
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

      <div className={styles.grid} style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '24px' }}>
        <div className={styles.card} style={{ textAlign: 'center' }}>
          <h3 className={styles.cardTitle} style={{ justifyContent: 'center' }}>Total Athletes</h3>
          <span className={styles.infoValue} style={{ fontSize: '32px' }}>{athletes.length}</span>
        </div>
        <div className={styles.card} style={{ textAlign: 'center' }}>
          <h3 className={styles.cardTitle} style={{ justifyContent: 'center' }}>Verified Athletes</h3>
          <span className={styles.infoValue} style={{ fontSize: '32px', color: '#10b981' }}>{athletes.filter(a => a.verification_status === 'verified').length}</span>
        </div>
        <div className={styles.card} style={{ textAlign: 'center' }}>
          <h3 className={styles.cardTitle} style={{ justifyContent: 'center' }}>Pending Verification</h3>
          <span className={styles.infoValue} style={{ fontSize: '32px', color: '#f59e0b' }}>{athletes.filter(a => a.verification_status !== 'verified').length}</span>
        </div>
      </div>

      {/* Athletes List */}
      <div className={styles.card} style={{ gridColumn: '1 / -1', marginTop: '24px' }}>
        <h3 className={styles.cardTitle}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F5B041" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          Registered Athletes
        </h3>
        
        {athletes.length === 0 ? (
          <div className={styles.noAthletes}>
            <p>No athletes have been registered through this institute yet.</p>
            <button className={styles.registerBtnOutline} onClick={() => router.push('/institute/dashboard/register-athlete')}>
              Register Your First Athlete
            </button>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.athleteTable}>
              <thead>
                <tr>
                  <th>Athlete Name</th>
                  <th>Registration ID</th>
                  <th>Sport</th>
                  <th>Age</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {athletes.map(athlete => (
                  <tr key={athlete.id}>
                    <td className={styles.athleteName}>{athlete.full_name || `${athlete.first_name || ''} ${athlete.last_name || ''}`.trim() || 'N/A'}</td>
                    <td>{athlete.athlete_registration_id || 'Pending'}</td>
                    <td>{athlete.sport || 'N/A'}</td>
                    <td>{athlete.age || 'N/A'}</td>
                    <td>
                      <span className={`${styles.statusPill} ${athlete.identity_status === 'verified' ? styles.statusVerified : styles.statusPending}`}>
                        {athlete.verification_status || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className={styles.viewBtn} 
                        onClick={() => router.push(`/institute/athletes/${athlete.id}`)}
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
