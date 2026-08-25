'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './athletes.module.css';

export default function RegisteredAthletes() {
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
          <h1 className={styles.title}>Registered Athletes</h1>
          <p className={styles.subtitle}>View and manage all athletes registered by your institute</p>
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
  );
}
