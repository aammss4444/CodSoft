'use client';
import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import styles from './AthleteIdCard.module.css';

export default function AthleteIdCard({ athleteInfo, sportsProfile, athleteId }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);

  useEffect(() => {
    // If user uploaded a photo, create an object URL for it
    if (athleteInfo?.photo instanceof File) {
      const url = URL.createObjectURL(athleteInfo.photo);
      setTimeout(() => setPhotoUrl(url), 0);
      return () => URL.revokeObjectURL(url);
    }
  }, [athleteInfo?.photo]);

  const toggleFlip = () => setIsFlipped(!isFlipped);

  // Format DOB safely
  const dob = athleteInfo?.dob ? new Date(athleteInfo.dob).toLocaleDateString('en-GB') : '15-08-2001';
  const name = athleteInfo?.firstName ? `${athleteInfo.firstName} ${athleteInfo.lastName}` : 'ROHIT PATIL';
  const sport = sportsProfile?.primarySport || 'Athletics';
  const discipline = sportsProfile?.discipline ? `- ${sportsProfile.discipline}` : '- 400m';
  const gender = athleteInfo?.gender || 'MALE';
  const displayId = athleteId || 'MAHAT2025001';

  return (
    <div className={`${styles.cardContainer} ${isFlipped ? styles.flipped : ''}`} onClick={toggleFlip}>
      <div className={styles.cardInner}>
        
        {/* FRONT OF CARD */}
        <div className={styles.cardFront}>
          {/* Background SVG Waves */}
          <svg className={styles.svgLayer} viewBox="0 0 600 380" preserveAspectRatio="none">
            {/* Top Navy Wave */}
            <path 
              d="M0,0 L600,0 L600,120 C500,160 400,180 300,140 C200,100 100,140 0,160 Z" 
              fill="#071F36" 
            />
            {/* Top Gold Wave underneath Navy */}
            <path 
              d="M0,160 C100,140 200,100 300,140 C400,180 500,160 600,120 L600,135 C500,175 400,195 300,155 C200,115 100,155 0,175 Z" 
              fill="#D4AF37" 
            />
          </svg>

          <div className={styles.cardContent}>
            {/* HEADER */}
            <div className={styles.header}>
              <div className={styles.logoArea}>
                <svg className={styles.logoIcon} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                <div className={styles.logoText}>MAHARASHTRA</div>
                <div className={styles.logoSub}>SPORTS ECOSYSTEM</div>
              </div>
              <div className={styles.headerTitle}>
                <div className={styles.mainTitle}>MAHARASHTRA SPORTS ECOSYSTEM</div>
                <div className={styles.subTitle}>Empowering Athletes. Strengthening Maharashtra.</div>
                <div className={styles.cardType}>ATHLETE ID CARD</div>
              </div>
            </div>

            {/* MIDDLE (Photo & Details) */}
            <div className={styles.middleSection}>
              <div className={styles.photoFrame}>
                {photoUrl ? (
                  <img src={photoUrl} alt="Athlete" className={styles.photoImage} />
                ) : (
                  <svg className={styles.photoPlaceholder} width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                )}
              </div>
              <div className={styles.athleteDetails}>
                <h2 className={styles.athleteName}>{name}</h2>
                <p className={styles.athleteSport}>{sport} {discipline}</p>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>DOB :</span>
                    <span className={styles.detailValue}>{dob}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>GENDER :</span>
                    <span className={styles.detailValue}>{gender}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className={styles.footer}>
              <div className={styles.idBanner}>
                <span className={styles.idLabel}>ATHLETE ID</span>
                <div className={styles.idDivider}></div>
                <span className={styles.idValue}>{displayId}</span>
              </div>
              
              <div className={styles.signatureArea}>
                {/* Fake Signature SVG for aesthetics */}
                <svg className={styles.signatureImage} viewBox="0 0 200 60" fill="none" stroke="#0F172A" strokeWidth="2" strokeLinecap="round">
                  <path d="M20,40 Q40,10 60,30 T100,20 T140,40 T180,20" />
                  <path d="M50,45 L150,45" strokeWidth="1" stroke="#cbd5e1" />
                </svg>
                <div className={styles.signatureLine}></div>
                <div className={styles.signatureTitle}>AUTHORIZED SIGNATORY</div>
                <div className={styles.signatureSub}>Maharashtra Sports Ecosystem</div>
              </div>
            </div>
          </div>
        </div>

        {/* BACK OF CARD */}
        <div className={styles.cardBack}>
          <div className={styles.qrCodeContainer}>
            <QRCode value={`https://maisip.in/athlete/${displayId}`} size={160} level="H" />
          </div>
          <h3 className={styles.backTitle}>Scan to Verify</h3>
          <p className={styles.backInstruction}>
            This QR code contains the official digital record of the athlete. Scan it using any standard QR reader to verify authenticity on the MAISIP platform.
          </p>
          <div className={styles.flipHint}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.92-10.26l5.08-5.08"/>
            </svg>
            Click to flip card
          </div>
        </div>

      </div>
    </div>
  );
}
