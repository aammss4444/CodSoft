'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InstituteDocuments() {
  const router = useRouter();
  const [institute, setInstitute] = useState(null);
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
          router.push('/');
          return;
        }

        const data = await res.json();
        if (data.success) {
          setInstitute(data.data);
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
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#64748b' }}>Loading Documents...</div>;
  }

  const documents = institute?.documents || [];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#0F172A', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
          Institute Documents
        </h1>
        <p style={{ color: '#64748b', fontSize: '17px', margin: '0' }}>
          View all uploaded official documents for {institute?.name || 'your institute'}.
        </p>
      </header>

      <div style={{ background: '#ffffff', borderRadius: '24px', padding: '32px', border: '1px solid #E2E8F0', boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)' }}>
        {documents.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {documents.map((doc, idx) => (
              <a 
                key={idx} 
                href={`http://localhost:5000${doc.file_path}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ textDecoration: 'none' }}
              >
                <div 
                  style={{ 
                    padding: '24px', border: '1px solid #e2e8f0', borderRadius: '16px', 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', 
                    background: '#f8fafc', transition: 'all 0.2s ease', cursor: 'pointer' 
                  }} 
                  onMouseOver={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.06)';
                  }} 
                  onMouseOut={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '16px', borderRadius: '14px', color: '#3b82f6' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '16px', fontWeight: '600', color: '#0F172A', marginBottom: '4px' }}>
                      {doc.document_type || 'Document'}
                    </span>
                    <span style={{ fontSize: '13px', color: '#10b981', fontWeight: '500' }}>Uploaded • View File</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <svg style={{ margin: '0 auto 16px auto', color: '#cbd5e1' }} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="15" x2="15" y2="15"></line></svg>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#334155', margin: '0 0 8px 0' }}>No Documents Found</h3>
            <p style={{ color: '#64748b', fontSize: '15px', margin: '0' }}>There are currently no official documents uploaded for this institute.</p>
          </div>
        )}
      </div>
    </div>
  );
}
