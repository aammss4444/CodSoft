'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import idStyles from '../dashboard/idcard.module.css'; // Just use the same CSS file for now
import QRCode from 'react-qr-code';

export default function AthleteIdCard() {
  const router = useRouter();
  const [athlete, setAthlete] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          router.push('/');
          return;
        }

        const res = await fetch('http://localhost:5000/api/athletes/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await res.json();
        if (data.success) {
          setAthlete(data.data);
        } else {
          router.push('/');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#F8FAFC' }}>Loading ID Card...</div>;
  }

  if (!athlete) return null;

  const isVerified = athlete.identity_status === 'verified';

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0px 24px 40px 24px' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#0F172A', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>My ID Card</h1>
        <p style={{ color: '#64748b', fontSize: '17px', margin: '0' }}>Your Official Athlete Identity Card</p>
      </header>

      {athlete.verification_status === 'Needs Resubmission' && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '16px', marginBottom: '24px', display: 'flex', gap: '12px' }}>
          <div style={{ color: '#DC2626' }}>⚠️</div>
          <div>
            <h4 style={{ margin: '0 0 8px 0', color: '#991B1B' }}>Action Required: Document Resubmission</h4>
            <p style={{ margin: '0' }}>The Administrator has reviewed your profile and requested updates before approval.</p>
          </div>
        </div>
      )}

      {athlete.identity_status === 'pending' && (
        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '12px', padding: '16px', marginBottom: '24px', display: 'flex', gap: '12px' }}>
          <div style={{ color: '#D97706' }}>⏳</div>
          <div>
            <h4 style={{ margin: '0 0 4px 0', color: '#92400E' }}>Verification Pending</h4>
            <p style={{ margin: '0' }}>Your account is currently pending verification by the Admin. Your Official Athlete Card will be generated and displayed here once verified.</p>
          </div>
        </div>
      )}

      {isVerified && (
        <div className={idStyles.idCardWrapper}>
          <div className={idStyles.idCard}>
            
            <div className={idStyles.topBanner}>
              ATHLETE IDENTITY CARD
            </div>

            <div className={idStyles.cardContent}>
              <div className={idStyles.leftColumn}>
                <div className={idStyles.photoContainer}>
                   <img src={athlete.profile_picture ? `http://localhost:5000${athlete.profile_picture}` : 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png'} alt="Profile" />
                </div>
              </div>

              <div className={idStyles.middleColumn}>
                 <h2 className={idStyles.athleteName}>{athlete.full_name || 'Unknown Athlete'}</h2>
                 <h3 className={idStyles.athleteRole}>ATHLETE</h3>
                 
                 <div className={idStyles.divider}></div>
                 
                 <div className={idStyles.detailsGrid}>
                   <div className={idStyles.detailRow}>
                      <span className={idStyles.detailLabel}>DATE OF BIRTH</span>
                      <span className={idStyles.detailValue}>: {new Date(athlete.date_of_birth).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</span>
                   </div>
                   <div className={idStyles.detailRow}>
                      <span className={idStyles.detailLabel}>GENDER</span>
                      <span className={idStyles.detailValue}>: {athlete.gender?.toUpperCase()}</span>
                   </div>
                   <div className={idStyles.detailRow}>
                      <span className={idStyles.detailLabel}>SPORT</span>
                      <span className={idStyles.detailValue}>: {(athlete.primary_sport || athlete.sports_profile?.primary_sport || 'ATHLETICS').toUpperCase()}</span>
                   </div>
                   <div className={idStyles.detailRow}>
                      <span className={idStyles.detailLabel}>NATIONALITY</span>
                      <span className={idStyles.detailValue}>: INDIAN</span>
                   </div>
                   <div className={idStyles.detailRow}>
                      <span className={idStyles.detailLabel}>ISSUE DATE</span>
                      <span className={idStyles.detailValue}>: {new Date(athlete.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</span>
                   </div>
                   <div className={idStyles.detailRow}>
                      <span className={idStyles.detailLabel}>VALID THRU</span>
                      <span className={idStyles.detailValue}>: {new Date(new Date(athlete.created_at).setFullYear(new Date(athlete.created_at).getFullYear() + 2)).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</span>
                   </div>
                 </div>
              </div>

              <div className={idStyles.rightColumn}>
                 <div className={idStyles.federationLogo}>
                   <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3 5h5l-4 4 1 6-5-3-5 3 1-6-4-4h5l3-5z"/></svg>
                 </div>
                 <div className={idStyles.federationName}>
                   MAISIP SPORTS<br/>FEDERATION
                 </div>
                 <div className={idStyles.federationMotto}>
                   STRIVE • PERFORM • ACHIEVE
                 </div>
                 
                 <div className={idStyles.qrContainer}>
                   <QRCode value={`ATH-2026-${athlete.id.toString().padStart(4, '0')}`} size={80} />
                 </div>
                 
                 <div className={idStyles.signatureContainer}>
                   <div className={idStyles.signatureImg}>{(athlete.full_name || 'U').charAt(0)}. {(athlete.full_name || '').split(' ').slice(1).join(' ')}</div>
                   <div className={idStyles.signatureLine}></div>
                   <div className={idStyles.signatureText}>AUTHORISED SIGNATORY</div>
                 </div>
              </div>
            </div>
            
            <div className={idStyles.bottomBanner}>
              <div className={idStyles.bottomBannerLabel}>ATHLETE ID</div>
              <div className={idStyles.bottomBannerValue}>ATH-2026-{athlete.id.toString().padStart(4, '0')}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
