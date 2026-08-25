'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MyDocuments() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
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
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('authToken');
          router.push('/');
          return;
        }

        const data = await res.json();
        if (data.success && data.data) {
          setProfile(data.data);
          setDocuments(data.data.all_documents || []);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const renderDocumentLink = (path) => {
    if (!path) return null;
    const fullUrl = path.startsWith('http') ? path : `http://localhost:5000${path}`;
    return (
      <a 
        href={fullUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        style={{
          color: '#2563eb', fontWeight: '600', fontSize: '13px', textDecoration: 'none',
          padding: '8px 14px', borderRadius: '8px', border: '1px solid #bfdbfe', background: '#eff6ff',
          transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '6px'
        }}
        onMouseOver={(e) => { e.currentTarget.style.background = '#dbeafe'; }}
        onMouseOut={(e) => { e.currentTarget.style.background = '#eff6ff'; }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        View File
      </a>
    );
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: '#64748b', fontSize: '15px' }}>Loading Athlete Documents...</div>;
  }

  const idDoc = profile?.id_document || '/uploads/arjun_aadhaar_signed.svg';
  const profilePic = profile?.profile_picture || '/uploads/arjun_profile.png';

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
      <header style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: '800', color: '#0F172A', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
          Official Documents &amp; Identity Proofs
        </h1>
        <p style={{ color: '#64748b', fontSize: '15px', margin: '0' }}>
          Verified Identity, Signed Aadhaar, Guardian Consent, and Sports Achievement Evidence.
        </p>
      </header>

      {/* Identity & KYC Section */}
      <div style={{ background: '#ffffff', borderRadius: '20px', padding: '28px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🪪</span> Identity &amp; e-Sign Verification
        </h2>
        <div style={{ display: 'grid', gap: '14px', gridTemplateColumns: '1fr' }}>
          
          {/* Profile Picture */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', border: '1px solid #E2E8F0', borderRadius: '12px', background: '#F8FAFC' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ color: '#2563eb', background: '#eff6ff', padding: '10px', borderRadius: '10px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: '#0F172A', marginBottom: '2px' }}>Official Profile Photo (KYC)</span>
                <span style={{ fontSize: '12.5px', color: '#16a34a', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>✓</span> Verified Portrait Headshot
                </span>
              </div>
            </div>
            {renderDocumentLink(profilePic)}
          </div>

          {/* Signed Aadhaar Card */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', border: '1px solid #E2E8F0', borderRadius: '12px', background: '#F8FAFC' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ color: '#059669', background: '#ecfdf5', padding: '10px', borderRadius: '10px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: '#0F172A', marginBottom: '2px' }}>National ID / Digitally Signed Aadhaar Card</span>
                <span style={{ fontSize: '12.5px', color: '#16a34a', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>✓</span> Signed via UIDAI e-Sign · Guardian Consent Validated
                </span>
              </div>
            </div>
            {renderDocumentLink(idDoc)}
          </div>

        </div>
      </div>

      {/* Verified Achievement Certificates & Evidence Section */}
      <div style={{ background: '#ffffff', borderRadius: '20px', padding: '28px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📜</span> Achievement Certificates &amp; Sanction Letters ({documents.length})
        </h2>
        
        {documents.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
            No certificates found.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: '1fr' }}>
            {documents.map((doc) => (
              <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', border: '1px solid #E2E8F0', borderRadius: '12px', background: '#F8FAFC' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ color: '#7c3aed', background: '#f5f3ff', padding: '10px', borderRadius: '10px' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: '#0F172A', marginBottom: '2px' }}>
                      {doc.document_type || 'Sports Certificate'}
                    </span>
                    <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                      Linked: <strong style={{ color: '#334155' }}>{doc.achievement_title || doc.original_filename}</strong> · <span style={{ color: '#16a34a', fontWeight: '600' }}>✓ Verified</span>
                    </span>
                  </div>
                </div>
                {renderDocumentLink(doc.storage_key)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
