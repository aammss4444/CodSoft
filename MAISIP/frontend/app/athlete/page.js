'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MindMapCanvas from '../components/MindMapCanvas';

export default function AthleteDigitalLedger() {
  const router = useRouter();
  const [mindmapData, setMindmapData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return router.push('/login');

        const res = await fetch(`http://localhost:5000/api/athletes/me/mindmap`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
          console.warn('Failed to fetch athlete mindmap:', res.status);
          setMindmapData(null);
          return;
        }

        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (data.success && data.data) {
            setMindmapData(data.data);
          }
        }
      } catch (err) {
        console.warn('Error fetching mindmap data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: '#64748b', fontSize: '15px', fontWeight: 500 }}>
        Loading your digital ledger mind map...
      </div>
    );
  }

  if (!mindmapData || !mindmapData.athlete) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80vh', gap: '16px', color: '#64748b' }}>
        <p style={{ fontSize: '16px', fontWeight: 600, color: '#334155' }}>Digital ledger mind map could not be loaded.</p>
        <button 
          onClick={() => router.push('/athlete/dashboard')} 
          style={{ padding: '8px 16px', borderRadius: '8px', background: '#0f172a', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13px' }}
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <MindMapCanvas 
      mindmapData={mindmapData} 
      onBack={() => router.push('/athlete/dashboard')} 
    />
  );
}
