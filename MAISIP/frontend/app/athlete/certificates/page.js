'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MyCertificates() {
  const router = useRouter();
  const [documents, setDocuments] = useState({});
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
        if (data.success) {
          const profile = data.data;
          setDocuments({
            certificates: profile.achievements?.certificates_upload
          });
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
    return (
      <a 
        href={`http://localhost:5000${path}`} 
        target="_blank" 
        rel="noopener noreferrer" 
        style={{
          color: '#3b82f6', fontWeight: '600', fontSize: '14px', textDecoration: 'none',
          padding: '8px 12px', borderRadius: '8px', transition: 'background 0.2s',
          cursor: 'pointer'
        }}
        onMouseOver={(e) => e.target.style.background = 'rgba(59, 130, 246, 0.05)'}
        onMouseOut={(e) => e.target.style.background = 'transparent'}
      >
        View File
      </a>
    );
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#64748b' }}>Loading Certificates...</div>;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#0F172A', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
          My Certificates
        </h1>
        <p style={{ color: '#64748b', fontSize: '17px', margin: '0' }}>
          View and manage your uploaded Sports Certificates.
        </p>
      </header>

      <div style={{ background: '#ffffff', borderRadius: '24px', padding: '32px', border: '1px solid #E2E8F0', boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)' }}>
        <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', padding: '16px', border: '1px solid #E2E8F0', borderRadius: '12px', background: '#F8FAFC' }}>
            <div style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '10px', marginRight: '16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
            </div>
            <div style={{ flexGrow: 1 }}>
              <span style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: '#0F172A', marginBottom: '4px' }}>Sports Certificates</span>
              {documents.certificates ? (
                <span style={{ fontSize: '13px', color: '#10b981' }}>Uploaded</span>
              ) : (
                <span style={{ fontSize: '13px', color: '#64748b' }}>Not Uploaded</span>
              )}
            </div>
            {renderDocumentLink(documents.certificates)}
          </div>

        </div>
      </div>
    </div>
  );
}
