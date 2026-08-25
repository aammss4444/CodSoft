'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return dateStr; }
};

export default function VerificationPage({ params }) {
  const resolvedParams = React.use(params);
  const qrId = resolvedParams.qrId;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVerificationData = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/public/verify/${qrId}`);
        const result = await res.json();
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message || 'Record not found');
        }
      } catch (err) {
        setError('Unable to reach verification server.');
      } finally {
        setLoading(false);
      }
    };
    fetchVerificationData();
  }, [qrId]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-divider)', borderTop: '3px solid var(--color-accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '16px', color: 'var(--color-text-secondary)', fontSize: '15px' }}>Verifying Secure Ledger...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: '600', color: 'var(--color-text-primary)', margin: '0 0 8px 0' }}>Verification Failed</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px' }}>{error}</p>
      </div>
    );
  }

  const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://maisip.verify/${qrId}`;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: '60px 20px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '800px', animation: `fadeIn var(--duration-base) var(--ease-out-apple)` }}>
        
        {/* Certificate Card */}
        <div style={{ 
          background: 'var(--color-surface)', 
          borderRadius: 'var(--radius-card)', 
          boxShadow: 'var(--shadow-card)',
          overflow: 'hidden',
          transition: `transform var(--duration-base) var(--ease-out-apple)`
        }}>
          
          {/* Header Banner */}
          <div style={{ background: '#F0FDF4', padding: '24px 32px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid #DCFCE3' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <div>
              <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '600', color: '#166534' }}>Verified Achievement</h2>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#15803D' }}>Digital Ledger Authenticated</span>
            </div>
          </div>

          <div style={{ padding: '40px', display: 'grid', gridTemplateColumns: '1fr 200px', gap: '40px' }}>
            
            {/* Main Content */}
            <div>
              <div style={{ marginBottom: '32px' }}>
                <div style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-accent)', fontWeight: '600', marginBottom: '8px' }}>
                  {data.category} • {data.sport || 'General'}
                </div>
                <h1 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--color-text-primary)', margin: '0 0 8px 0', lineHeight: 1.2 }}>
                  {data.title}
                </h1>
                <div style={{ fontSize: '18px', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
                  Achieved by {data.athlete_name}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Date of Achievement</div>
                  <div style={{ fontSize: '16px', color: 'var(--color-text-primary)', fontWeight: '500' }}>{formatDate(data.achievement_date)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Competition Level</div>
                  <div style={{ fontSize: '16px', color: 'var(--color-text-primary)', fontWeight: '500' }}>{data.level}</div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Issuing Authority</div>
                  <div style={{ fontSize: '16px', color: 'var(--color-text-primary)', fontWeight: '500' }}>{data.issued_by}</div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Athlete MAI-ID</div>
                  <div style={{ fontSize: '16px', color: 'var(--color-text-primary)', fontWeight: '500', fontFamily: 'monospace' }}>{data.athlete_mai_id}</div>
                </div>
              </div>
            </div>

            {/* QR Side */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderLeft: '1px solid var(--color-divider)', paddingLeft: '40px' }}>
              <div style={{ padding: '16px', background: '#FFF', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '16px' }}>
                <QRCode value={currentUrl} size={140} level="H" />
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                Scan to verify authenticity
              </div>
              <div style={{ marginTop: '24px', fontSize: '11px', color: 'var(--color-text-secondary)', textAlign: 'center', wordBreak: 'break-all' }}>
                <strong>QR ID:</strong><br/>{data.qr_id}
              </div>
              <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                <strong>Verified On:</strong><br/>{formatDate(data.verified_at)}
              </div>
            </div>

          </div>
        </div>

        {/* Footer info */}
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
          This digital ledger record is cryptographically verified by the Ministry of Youth Affairs and Sports.
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
