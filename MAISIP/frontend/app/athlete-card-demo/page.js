'use client';
import AthleteIdCard from '../registration/AthleteIdCard';

export default function DemoCardPage() {
  const demoAthleteInfo = {
    firstName: 'ROHIT',
    lastName: 'PATIL',
    dob: '2001-08-15',
    gender: 'MALE',
    photo: null, // Will trigger placeholder
  };

  const demoSportsProfile = {
    primarySport: 'Athletics',
    discipline: '400m Sprint',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc', padding: '40px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>Athlete ID Card Demo</h1>
      <p style={{ color: '#64748b', marginBottom: '40px' }}>Click on the card to flip it and view the QR Code</p>
      
      <AthleteIdCard 
        athleteInfo={demoAthleteInfo} 
        sportsProfile={demoSportsProfile} 
        athleteId="MAHAT2025001" 
      />
    </div>
  );
}
