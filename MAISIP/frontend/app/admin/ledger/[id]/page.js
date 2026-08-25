'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Helper to format date strings
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return dateStr; }
};

// Helper: render a detail field (only if value exists)
const DetailField = ({ label, value, isLink, isDoc }) => {
  if (!value || value === 'N/A') return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
      {isLink ? (
        <a href={value} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: '#3b82f6', fontWeight: '500', textDecoration: 'none', wordBreak: 'break-all' }}>
          {value.length > 60 ? value.substring(0, 60) + '…' : value}
        </a>
      ) : isDoc ? (
        <a href={`http://localhost:5000${value}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: '#3b82f6', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
          View Document
        </a>
      ) : (
        <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: '500' }}>{value}</span>
      )}
    </div>
  );
};

// Section header component
const SectionHeader = ({ icon, title, color = '#0f172a' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: color + '12', display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
      {icon}
    </div>
    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color, letterSpacing: '-0.01em' }}>{title}</h4>
  </div>
);

// Detail grid wrapper
const DetailGrid = ({ children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
    {children}
  </div>
);

export default function AchievementDetail({ params }) {
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  const [ach, setAch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState({ open: false, type: '', comments: '' });
  
  // Verification Panel State
  const [verificationDecision, setVerificationDecision] = useState('');
  const [verificationMethod, setVerificationMethod] = useState('');
  const [verificationRemarks, setVerificationRemarks] = useState('');
  const [lockAfterApproval, setLockAfterApproval] = useState(true);
  const [checklist, setChecklist] = useState({
    identity: false, certificate: false, issuer: false,
    result: false, authenticity: false, organizer: false,
    federation: false, performance: false, duplicate: false
  });
  
  const [adminUser, setAdminUser] = useState({ name: 'System Admin', id: 'ADMIN-001', role: 'System Admin' });

  const handleCheck = (key) => setChecklist(prev => ({ ...prev, [key]: !prev[key] }));

  useEffect(() => {
    // Load admin profile from localStorage
    try {
      const userStr = localStorage.getItem('authUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        setAdminUser({
          name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.username,
          id: user.username,
          role: user.role || 'System Admin'
        });
      }
    } catch (e) {
      console.error('Failed to parse authUser');
    }

    const fetchAchievement = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`http://localhost:5000/api/verification/achievements/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setAch(data.data);
        }
      } catch (err) {
        console.error('Error fetching achievement:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAchievement();
  }, [id]);

  const handleStatusChange = async (newStatus, comments = '') => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`http://localhost:5000/api/verification/achievements/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: newStatus, 
          comments: comments || verificationRemarks,
          checklist: Object.keys(checklist).filter(k => checklist[k]),
          method: verificationMethod,
          verifierName: adminUser.name,
          verifierUserId: adminUser.id,
          designation: adminUser.role,
          organization: 'MAISIP System Administration',
          lockAfterApproval: lockAfterApproval
        })
      });
      const data = await res.json();
      if (data.success) {
        setAch({ 
          ...ach, 
          verification_status: data.data.verification_status, 
          rejection_reason: data.data.rejection_reason 
        });
        setActionModal({ open: false, type: '', comments: '' });
      } else {
        alert(data.message || 'Failed to update verification status.');
      }
    } catch (err) {
      console.error('Error updating achievement status:', err);
      alert('An error occurred while updating status.');
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading details...</div>;
  }

  if (!ach) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2 style={{ color: '#0f172a' }}>Achievement Not Found</h2>
        <button onClick={() => router.push('/admin/ledger')} style={{ marginTop: '16px', background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Back to Ledger</button>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const s = status || 'Draft';
    if (s === 'Approved') return <span style={{ background: '#d1fae5', color: '#059669', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>Approved</span>;
    if (s === 'Rejected') return <span style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>Rejected</span>;
    if (s === 'Under Review') return <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>Under Review</span>;
    if (s === 'Correction Required') return <span style={{ background: '#ffedd5', color: '#ea580c', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>Correction Req.</span>;
    if (s === 'Digitally Signed') return <span style={{ background: '#e0e7ff', color: '#4f46e5', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>Digitally Signed</span>;
    if (s === 'Verified & Locked') return <span style={{ background: '#f1f5f9', color: '#0f172a', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>Verified & Locked</span>;
    return <span style={{ background: '#f1f5f9', color: '#64748b', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>{s}</span>;
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => router.push('/admin/ledger')} style={{ background: '#f1f5f9', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#e2e8f0'} onMouseOut={e => e.currentTarget.style.background = '#f1f5f9'}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </button>
          <div>
            <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.02em' }}>Verification Panel</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '14px', color: '#64748b' }}>Review athlete achievement requests and publish status to athlete and institute views.</span>
            </div>
          </div>
        </div>
        <div style={{ background: '#fef9c3', border: '1px solid #fde047', color: '#854d0e', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          Visible only to Verifying Authority
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', background: '#fff', padding: '16px 24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
           {getStatusBadge(ach.verification_status)}
        </div>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>
          Request ID: VR-2026-{String(ach.id).padStart(6, '0')}
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

            {/* Section 1: Submitter Information */}
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
              <SectionHeader 
                title="Submitter Information" 
                color="#6366f1"
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>}
              />
              <DetailGrid>
                <DetailField label="Submitted By Role" value={ach.submitter_role} />
                <DetailField label="Submitter Name" value={ach.submitter_name} />
                <DetailField label="Organization / Institute" value={ach.organization_name} />
                <DetailField label="Institute Code / ID" value={ach.institute_id} />
              </DetailGrid>
            </div>

            {/* Section 2: Achievement Details */}
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
              <SectionHeader 
                title="Achievement Details" 
                color="#f59e0b"
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path></svg>}
              />
              <DetailGrid>
                <DetailField label="Title" value={ach.title} />
                <DetailField label="Category" value={ach.achievement_category} />
                <DetailField label="Subtype" value={ach.achievement_subtype} />
                <DetailField label="Level" value={ach.achievement_level} />
                <DetailField label="Achievement Date" value={formatDate(ach.achievement_date)} />
                <DetailField label="Age at Achievement" value={ach.age_at_achievement ? `${ach.age_at_achievement} Years` : '-'} />
                <DetailField label="Individual / Team" value={ach.individual_or_team} />
                <DetailField label="Reference Number" value={ach.achievement_reference_number} />
                <DetailField label="Official URL" value={ach.official_achievement_url} isLink />
              </DetailGrid>
              {ach.description && (
                <div style={{ marginTop: '12px', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Description</span>
                  {ach.description}
                </div>
              )}
            </div>

            {/* Section 3: Team Details (if applicable) */}
            {ach.individual_or_team === 'Team' && (
              <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
                <SectionHeader 
                  title="Team Details" 
                  color="#8b5cf6"
                  icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>}
                />
                <DetailGrid>
                  <DetailField label="Team Name" value={ach.team_name} />
                  <DetailField label="Team Sport" value={ach.team_sport} />
                  <DetailField label="Athlete Role" value={ach.team_role} />
                  <DetailField label="Team Result" value={ach.team_result} />
                  <DetailField label="Team Captain" value={ach.team_captain} />
                  <DetailField label="Members Count" value={ach.team_members_count} />
                </DetailGrid>
              </div>
            )}

            {/* Section 4: Competition Details */}
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
              <SectionHeader 
                title="Competition Details" 
                color="#0ea5e9"
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>}
              />
              <DetailGrid>
                <DetailField label="Competition Name" value={ach.competition_name} />
                <DetailField label="Competition Level" value={ach.competition_level} />
                <DetailField label="Event Registration #" value={ach.event_registration_number} />
                <DetailField label="Organized By" value={ach.organized_by} />
                <DetailField label="Recognized By" value={ach.recognized_by} />
                <DetailField label="Governing Federation" value={ach.governing_federation} />
                <DetailField label="Start Date" value={formatDate(ach.competition_start_date)} />
                <DetailField label="End Date" value={formatDate(ach.competition_end_date)} />
                <DetailField label="Venue" value={ach.venue_name} />
                <DetailField label="City" value={ach.city} />
                <DetailField label="District" value={ach.district} />
                <DetailField label="State" value={ach.state} />
                <DetailField label="Country" value={ach.country} />
                <DetailField label="Format" value={ach.competition_format} />
                <DetailField label="Mode" value={ach.competition_mode} />
                <DetailField label="Age Group" value={ach.age_group} />
                <DetailField label="Weight Category" value={ach.weight_category} />
                <DetailField label="Round" value={ach.competition_round} />
                <DetailField label="Official Result Link" value={ach.official_result_link} isLink />
              </DetailGrid>
              {ach.address && (
                <div style={{ marginTop: '12px', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', fontSize: '13px', color: '#475569' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Address</span>
                  {ach.address}
                </div>
              )}
            </div>

            {/* Section 5: Result & Performance */}
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
              <SectionHeader 
                title="Result & Performance" 
                color="#10b981"
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>}
              />
              <DetailGrid>
                <DetailField label="Result / Rank" value={ach.result_rank} />
                <DetailField label="Result Type" value={ach.result_type} />
                <DetailField label="Final Position" value={ach.final_position_rank} />
                <DetailField label="Total Participants" value={ach.total_participants} />
                <DetailField label="Medal Type" value={ach.medal_type} />
                <DetailField label="Score / Points" value={ach.score_points} />
                <DetailField label="Result Declaration Date" value={formatDate(ach.result_declaration_date)} />
                <DetailField label="Official Result #" value={ach.official_result_number} />
                <DetailField label="Performance Value" value={ach.performance_value} />
                <DetailField label="Measurement Unit" value={ach.measurement_unit} />
                <DetailField label="Timing" value={ach.timing} />
                <DetailField label="Distance" value={ach.distance} />
                <DetailField label="Height" value={ach.height} />
                <DetailField label="Weight Lifted" value={ach.weight_lifted} />
                <DetailField label="Score" value={ach.score} />
                <DetailField label="Goals / Points" value={ach.goals_points} />
                <DetailField label="Attempts" value={ach.attempts} />
                <DetailField label="Valid Attempts" value={ach.valid_attempts} />
                <DetailField label="Performance Metric" value={ach.performance_metric} />
              </DetailGrid>
              {ach.result_remarks && (
                <div style={{ marginTop: '12px', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', fontSize: '13px', color: '#475569' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Result Remarks</span>
                  {ach.result_remarks}
                </div>
              )}
            </div>

            {/* Section 6: Personal Best */}
            {ach.personal_best_achieved === 'Yes' && (
              <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
                <SectionHeader 
                  title="Personal Best" 
                  color="#ec4899"
                  icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>}
                />
                <DetailGrid>
                  <DetailField label="Previous PB" value={ach.prev_personal_best} />
                  <DetailField label="New PB" value={ach.new_personal_best} />
                  <DetailField label="PB Unit" value={ach.pb_unit} />
                  <DetailField label="Improvement" value={ach.pb_improvement} />
                  <DetailField label="PB Date" value={formatDate(ach.pb_date)} />
                </DetailGrid>
              </div>
            )}

            {/* Section 7: Record */}
            {ach.record_achieved === 'Yes' && (
              <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
                <SectionHeader 
                  title="Record Achieved" 
                  color="#ef4444"
                  icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>}
                />
                <DetailGrid>
                  <DetailField label="Record Type" value={ach.record_type} />
                  <DetailField label="Previous Record" value={ach.previous_record} />
                  <DetailField label="New Record" value={ach.new_record} />
                  <DetailField label="Previous Holder" value={ach.record_holder_before} />
                  <DetailField label="Recognition Authority" value={ach.recognition_authority} />
                  <DetailField label="Certificate #" value={ach.record_certificate_number} />
                  <DetailField label="Recognition Date" value={formatDate(ach.record_recognition_date)} />
                </DetailGrid>
              </div>
            )}

            {/* Section 8: Ranking */}
            {ach.ranking_position && (
              <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
                <SectionHeader 
                  title="Ranking Details" 
                  color="#f97316"
                  icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>}
                />
                <DetailGrid>
                  <DetailField label="Ranking Position" value={ach.ranking_position} />
                  <DetailField label="Previous Ranking" value={ach.previous_ranking} />
                  <DetailField label="Category" value={ach.ranking_category} />
                  <DetailField label="Authority" value={ach.ranking_authority} />
                  <DetailField label="Period" value={ach.ranking_period} />
                  <DetailField label="Publication Date" value={formatDate(ach.ranking_publication_date)} />
                  <DetailField label="Ranking List URL" value={ach.ranking_list_url} isLink />
                </DetailGrid>
              </div>
            )}

            {/* Section 9: Selection */}
            {ach.selected_for && (
              <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
                <SectionHeader 
                  title="Selection Details" 
                  color="#14b8a6"
                  icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>}
                />
                <DetailGrid>
                  <DetailField label="Selected For" value={ach.selected_for} />
                  <DetailField label="Selection Level" value={ach.selection_level} />
                  <DetailField label="Selection Authority" value={ach.selection_authority} />
                  <DetailField label="Selection Date" value={formatDate(ach.selection_date)} />
                  <DetailField label="Camp/Team Start" value={formatDate(ach.camp_team_start_date)} />
                  <DetailField label="Camp/Team End" value={formatDate(ach.camp_team_end_date)} />
                  <DetailField label="Selection Letter #" value={ach.selection_letter_number} />
                </DetailGrid>
              </div>
            )}

            {/* Section 10: Certificate & Documents */}
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
              <SectionHeader 
                title="Documents & Evidence" 
                color="#3b82f6"
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>}
              />
              <DetailGrid>
                <DetailField label="Certificate Available" value={ach.certificate_available} />
                <DetailField label="Certificate Number" value={ach.certificate_number} />
                <DetailField label="Certificate Type" value={ach.certificate_type} />
                <DetailField label="Issue Date" value={formatDate(ach.certificate_issue_date)} />
                <DetailField label="Issuing Authority" value={ach.issuing_authority} />
                <DetailField label="Expiry Date" value={formatDate(ach.certificate_expiry_date)} />
                <DetailField label="Verification URL" value={ach.certificate_verification_url} isLink />
                <DetailField label="QR Code on Certificate" value={ach.qr_code_on_certificate} />
                <DetailField label="Evidence URL" value={ach.evidence_url} isLink />
                <DetailField label="Visibility Level" value={ach.visibility_level} />
              </DetailGrid>

              {/* Main certificate upload */}
              {ach.certificates_upload && (
                <div style={{ marginTop: '16px', padding: '12px 16px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e40af' }}>Uploaded Certificate</span>
                  </div>
                  <a href={`http://localhost:5000${ach.certificates_upload}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', fontWeight: '600', color: '#3b82f6', textDecoration: 'none', padding: '4px 12px', background: '#fff', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                    Open File
                  </a>
                </div>
              )}

              {/* Additional documents */}
              {ach.documents && ach.documents.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Additional Documents ({ach.documents.length})</span>
                  {ach.documents.map((doc, idx) => (
                    <div key={idx} style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: '#334155' }}>{doc.original_file_name || 'Document'}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{doc.document_type || doc.mime_type || ''} {doc.file_size ? `• ${(doc.file_size / 1024).toFixed(0)} KB` : ''}</div>
                      </div>
                      <a href={`http://localhost:5000/uploads/documents/${doc.internal_storage_name}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', fontWeight: '600', color: '#3b82f6', textDecoration: 'none', padding: '4px 10px', background: '#fff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        View
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {!ach.certificates_upload && (!ach.documents || ach.documents.length === 0) && !ach.evidence_url && (
                <div style={{ marginTop: '12px', padding: '16px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca', textAlign: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#b91c1c', fontWeight: '500' }}>⚠ No documents or evidence uploaded for this achievement</span>
                </div>
              )}
            </div>

          </div>
        </div>

    {/* Section 11: System-Generated Ledger Information */}
    {ach.ledger_metadata && (
          <div style={{ padding: '32px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <SectionHeader 
              title="System-Generated Ledger Information" 
              color="#475569"
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>}
            />
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>
              The following cryptographic hashes and metadata identifiers are generated by the system for audit and immutability purposes. These fields cannot be manually edited.
            </p>
            <DetailGrid>
              <DetailField label="Ledger Entry ID" value={ach.ledger_metadata.ledger_entry_id} />
              <DetailField label="Achievement ID" value={ach.ledger_metadata.achievement_id} />
              <DetailField label="Athlete ID" value={ach.ledger_metadata.athlete_id} />
              <DetailField label="Institute ID" value={ach.ledger_metadata.institute_id} />
              <DetailField label="Current Version" value={ach.ledger_metadata.current_version} />
              <DetailField label="Original Version ID" value={ach.ledger_metadata.original_version_id} />
              <DetailField label="Created By User ID" value={ach.ledger_metadata.created_by_user_id} />
              <DetailField label="Submitted By User ID" value={ach.ledger_metadata.submitted_by_user_id} />
              <DetailField label="Verifier User ID" value={ach.ledger_metadata.verifier_user_id} />
              <DetailField label="Created Timestamp" value={formatDate(ach.ledger_metadata.created_timestamp)} />
              <DetailField label="Submitted Timestamp" value={formatDate(ach.ledger_metadata.submitted_timestamp)} />
              <DetailField label="Verified Timestamp" value={ach.ledger_metadata.verified_timestamp !== 'Pending' ? formatDate(ach.ledger_metadata.verified_timestamp) : 'Pending'} />
              <DetailField label="Locked Timestamp" value={ach.ledger_metadata.locked_timestamp !== 'Unlocked' ? formatDate(ach.ledger_metadata.locked_timestamp) : 'Unlocked'} />
              <DetailField label="Record Status" value={ach.ledger_metadata.record_status} />
              <DetailField label="QR Verification ID" value={ach.ledger_metadata.qr_verification_id} />
              <DetailField label="Audit Trail ID" value={ach.ledger_metadata.audit_trail_id} />
            </DetailGrid>
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '12px', background: '#e2e8f0', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace', color: '#334155', wordBreak: 'break-all' }}>
                <strong style={{ color: '#0f172a' }}>Achievement Data Hash (SHA-256):</strong><br/>
                {ach.ledger_metadata.achievement_data_hash}
              </div>
              <div style={{ padding: '12px', background: '#e2e8f0', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace', color: '#334155', wordBreak: 'break-all' }}>
                <strong style={{ color: '#0f172a' }}>Document Hashes (SHA-256):</strong><br/>
                {ach.ledger_metadata.document_hashes}
              </div>
              <div style={{ padding: '12px', background: '#e2e8f0', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace', color: '#334155', wordBreak: 'break-all' }}>
                <strong style={{ color: '#0f172a' }}>Digital Signature Reference:</strong><br/>
                {ach.ledger_metadata.digital_signature_reference}
              </div>
            </div>
          </div>
        )}
        
        {/* Verification Panel Section */}
        {['Verified & Locked', 'Digitally Signed', 'Approved', 'Rejected'].includes(ach.verification_status) ? (
          <div style={{ padding: '32px', borderTop: '1px solid #e2e8f0', background: '#f0fdf4', textAlign: 'center' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px auto', display: 'block' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>Verification Completed</h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>This achievement has been marked as {ach.verification_status}. No further actions are required.</p>
          </div>
        ) : (
        <div style={{ padding: '32px', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
            
            {/* 1. Verification Decision */}
            <div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>1. Verification Decision</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: `2px solid ${verificationDecision === 'Approved' ? '#10b981' : '#e2e8f0'}`, borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <input type="radio" name="decision" checked={verificationDecision === 'Approved'} onChange={() => setVerificationDecision('Approved')} style={{ accentColor: '#10b981', width: '18px', height: '18px' }} />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: verificationDecision === 'Approved' ? '#10b981' : '#475569' }}>Approve</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: `2px solid ${verificationDecision === 'Rejected' ? '#ef4444' : '#e2e8f0'}`, borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <input type="radio" name="decision" checked={verificationDecision === 'Rejected'} onChange={() => setVerificationDecision('Rejected')} style={{ accentColor: '#ef4444', width: '18px', height: '18px' }} />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: verificationDecision === 'Rejected' ? '#ef4444' : '#475569' }}>Reject</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: `2px solid ${verificationDecision === 'Correction Required' ? '#f59e0b' : '#e2e8f0'}`, borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <input type="radio" name="decision" checked={verificationDecision === 'Correction Required'} onChange={() => setVerificationDecision('Correction Required')} style={{ accentColor: '#f59e0b', width: '18px', height: '18px' }} />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: verificationDecision === 'Correction Required' ? '#f59e0b' : '#475569' }}>Request Correction</span>
                </label>
              </div>
            </div>

            {/* 2. Verification Checklist */}
            <div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>2. Verification Checklist</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { k: 'identity', l: 'Athlete identity verified' },
                  { k: 'certificate', l: 'Certificate verified' },
                  { k: 'issuer', l: 'Certificate issuer verified' },
                  { k: 'result', l: 'Official result verified' },
                  { k: 'authenticity', l: 'Competition authenticity verified' },
                  { k: 'organizer', l: 'Organizer verified' },
                  { k: 'federation', l: 'Federation recognition verified' },
                  { k: 'performance', l: 'Performance value verified' },
                  { k: 'duplicate', l: 'Duplicate record check completed' }
                ].map((item) => (
                  <label key={item.k} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={checklist[item.k]} onChange={() => handleCheck(item.k)} style={{ width: '16px', height: '16px', accentColor: '#3b82f6' }} />
                    <span style={{ fontSize: '13px', color: '#475569' }}>{item.l}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 3. Verification Method */}
            <div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>3. Verification Method</h3>
              <select 
                value={verificationMethod} 
                onChange={e => setVerificationMethod(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', color: '#334155', marginBottom: '16px', outline: 'none' }}
              >
                <option value="">-- Select verification method --</option>
                <option value="Official API verification">Official API verification</option>
                <option value="QR code verification">QR code verification</option>
                <option value="Organizer confirmation">Organizer confirmation</option>
                <option value="Manual document review">Manual document review</option>
                <option value="Physical document verification">Physical document verification</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
          </div>

          <div style={{ marginTop: '32px', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>4. Verifier Fields</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Verifier Name</label>
                  <input type="text" value={adminUser.name} readOnly style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#334155' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Verifier User ID</label>
                  <input type="text" value={adminUser.id} readOnly style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#334155' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Designation</label>
                  <input type="text" value={adminUser.role} readOnly style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#334155' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Organization</label>
                  <input type="text" value="MAISIP System Administration" readOnly style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#334155' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Verification Date</label>
                  <input type="text" value={new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} readOnly style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#334155' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Digital Signature</label>
                  <input type="text" value={ach.digital_signature || 'Generated during approval'} readOnly style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }} />
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <label style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Verification Remarks <span style={{ color: '#ef4444' }}>*</span></label>
                  <textarea 
                    value={verificationRemarks}
                    onChange={e => setVerificationRemarks(e.target.value)}
                    placeholder="Enter verification remarks (required)"
                    style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', resize: 'none', fontFamily: 'inherit' }}
                  />
                  <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'right' }}>{verificationRemarks.length} / 1000 characters</div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#334155', flex: 1 }}>Lock After Approval</span>
                  <div 
                    onClick={() => setLockAfterApproval(!lockAfterApproval)}
                    style={{ width: '44px', height: '24px', background: lockAfterApproval ? '#10b981' : '#cbd5e1', borderRadius: '24px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}
                  >
                    <div style={{ width: '20px', height: '20px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: lockAfterApproval ? '22px' : '2px', transition: 'left 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: lockAfterApproval ? '#10b981' : '#94a3b8' }}>{lockAfterApproval ? 'ON' : 'OFF'}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
              <button 
                onClick={() => handleStatusChange('Approved')}
                disabled={!verificationDecision || verificationDecision !== 'Approved' || !verificationRemarks}
                style={{ 
                  flex: 1, 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: (verificationDecision === 'Approved' && verificationRemarks) ? '#10b981' : '#a7f3d0', 
                  color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '15px', fontWeight: '600', 
                  cursor: (verificationDecision === 'Approved' && verificationRemarks) ? 'pointer' : 'not-allowed', transition: 'background 0.2s' 
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                {lockAfterApproval ? 'Approve & Lock' : 'Approve'}
              </button>
              
              <button 
                onClick={() => handleStatusChange('Rejected')}
                disabled={!verificationDecision || verificationDecision !== 'Rejected' || !verificationRemarks}
                style={{ 
                  flex: 1, 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: '#fff', color: (verificationDecision === 'Rejected' && verificationRemarks) ? '#ef4444' : '#fca5a5', 
                  border: `1px solid ${(verificationDecision === 'Rejected' && verificationRemarks) ? '#ef4444' : '#fca5a5'}`, 
                  padding: '12px', borderRadius: '8px', fontSize: '15px', fontWeight: '600', 
                  cursor: (verificationDecision === 'Rejected' && verificationRemarks) ? 'pointer' : 'not-allowed', transition: 'all 0.2s' 
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                Reject
              </button>
              
              <button 
                onClick={() => handleStatusChange('Correction Required')}
                disabled={!verificationDecision || verificationDecision !== 'Correction Required' || !verificationRemarks}
                style={{ 
                  flex: 1, 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: '#fff', color: (verificationDecision === 'Correction Required' && verificationRemarks) ? '#f59e0b' : '#fcd34d', 
                  border: `1px solid ${(verificationDecision === 'Correction Required' && verificationRemarks) ? '#f59e0b' : '#fcd34d'}`, 
                  padding: '12px', borderRadius: '8px', fontSize: '15px', fontWeight: '600', 
                  cursor: (verificationDecision === 'Correction Required' && verificationRemarks) ? 'pointer' : 'not-allowed', transition: 'all 0.2s' 
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                Request Correction
              </button>
            </div>
          </div>
        </div>
    )}
  </div>
</div>
  );
}
