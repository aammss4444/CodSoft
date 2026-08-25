'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  Position,
  Handle
} from 'reactflow';
import 'reactflow/dist/style.css';
import styles from './MindMapCanvas.module.css';

// ============================================
// HELPER FUNCTIONS
// ============================================

function fmtDate(dateStr) {
  if (!dateStr || dateStr === 'Pending' || dateStr === '—') return dateStr || '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function getYear(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '—' : d.getFullYear();
  } catch {
    return '—';
  }
}

function calculateCurrentAge(dobStr) {
  if (!dobStr) return 'Age — (current)';
  try {
    const dob = new Date(dobStr);
    if (isNaN(dob.getTime())) return 'Age — (current)';
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return `Age ${age} (current)`;
  } catch {
    return 'Age — (current)';
  }
}

function calculateAgeAndBracket(dobStr, achDateStr, fallbackAge = null) {
  let age = fallbackAge;
  if (dobStr && achDateStr) {
    try {
      const dob = new Date(dobStr);
      const achDate = new Date(achDateStr);
      if (!isNaN(dob.getTime()) && !isNaN(achDate.getTime())) {
        age = achDate.getFullYear() - dob.getFullYear();
        const m = achDate.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && achDate.getDate() < dob.getDate())) {
          age--;
        }
      }
    } catch {
      // fallback
    }
  }

  if (age === null || age === undefined || isNaN(age)) {
    return { ageText: '—', bracket: '—', combined: '—' };
  }

  let bracket = 'Senior';
  if (age <= 10) bracket = 'U-10';
  else if (age <= 12) bracket = 'U-12';
  else if (age <= 14) bracket = 'U-14';
  else if (age <= 16) bracket = 'U-16';
  else if (age <= 18) bracket = 'U-18';
  else if (age <= 20) bracket = 'U-20';

  return {
    age,
    bracket,
    combined: `${bracket} · ${getYear(achDateStr)}`
  };
}

function getInitials(name) {
  if (!name) return 'AT';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getCategoryConfig(category) {
  const cat = (category || '').toLowerCase();

  if (cat.includes('certificate')) {
    return {
      label: 'Certificate',
      key: 'Certificate',
      order: 2,
      color: '#0A84FF', // Apple Blue
      bg: '#E5F1FF',
      border: '#0A84FF'
    };
  }
  if (cat.includes('selection')) {
    return {
      label: 'Selection',
      key: 'Selection',
      order: 3,
      color: '#BF5AF2', // Apple Purple
      bg: '#F4E5FF',
      border: '#BF5AF2'
    };
  }
  if (cat.includes('scholarship')) {
    return {
      label: 'Scholarship',
      key: 'Scholarship',
      order: 5,
      color: '#30D158', // Apple Green
      bg: '#E5FFE9',
      border: '#30D158'
    };
  }
  if (cat.includes('participation')) {
    return {
      label: 'Participation',
      key: 'Participation',
      order: 6,
      color: '#059669', // Emerald Apple Green
      bg: '#D1FAE5',
      border: '#34D399'
    };
  }
  if (cat.includes('personal') || cat.includes('best') || cat.includes('record')) {
    return {
      label: 'Personal Best',
      key: 'Personal Best',
      order: 4,
      color: '#FF9F0A', // Apple Orange
      bg: '#FFF2E5',
      border: '#FF9F0A'
    };
  }
  if (cat.includes('medal') || cat.includes('award') || cat.includes('championship')) {
    return {
      label: 'Medal',
      key: 'Medal',
      order: 1,
      color: '#FF453A', // Apple Red
      bg: '#FFE8E5',
      border: '#FF453A'
    };
  }
  return {
    label: 'Other',
    key: 'Other',
    order: 7,
    color: '#8E8E93', // Apple Gray
    bg: '#F2F2F7',
    border: '#8E8E93'
  };
}

function getCategoryIcon(key) {
  switch (key) {
    case 'Medal':
      return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>;
    case 'Certificate':
      return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
    case 'Selection':
    case 'Participation':
      return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
    case 'Personal Best':
      return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
    case 'Scholarship':
      return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>;
    default:
      return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
  }
}

// ============================================
// CUSTOM NODE COMPONENTS
// ============================================

function RootNode({ data }) {
  return (
    <div className={styles.rootNode}>
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
      <div className={styles.rootAvatar}>{data.initials}</div>
      <div className={styles.rootName}>{data.name}</div>
      <div className={styles.rootId}>{data.athleteId}</div>
      <div className={styles.rootAgePill}>{data.age}</div>
      <div className={styles.rootSubline}>
        {data.sport}<br />{data.institute}
      </div>
    </div>
  );
}

function CategoryNode({ data }) {
  const cfg = data.categoryConfig;
  return (
    <div
      className={styles.categoryNode}
      style={{
        borderColor: cfg.border,
        backgroundColor: cfg.bg,
      }}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
      <div className={styles.catNodeIcon} style={{ color: cfg.color }}>
        {getCategoryIcon(cfg.key)}
      </div>
      <div className={styles.catNodeLabel}>
        {cfg.label}
      </div>
    </div>
  );
}

function AchievementNode({ data }) {
  const cfg = data.categoryConfig;
  return (
    <div
      className={styles.achievementNode}
      style={{
        borderColor: cfg.border,
      }}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />

      <div className={styles.achHeaderRow}>
        <span className={styles.achAgeBadge} style={{ color: cfg.color }}>{data.ageBracket}</span>
        {/* "i" Icon Trigger for Details */}
        <button
          className={styles.infoIconBtn}
          onClick={(e) => { e.stopPropagation(); data.onShowDetails(); }}
          title="View Details"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
        </button>
      </div>
      <div className={styles.achTitle}>{data.title}</div>
      <div className={styles.achFooterRow}>
        <span className={styles.achSubtitle}>{data.subtitle}</span>
      </div>

      {/* Popover */}
      {data.isSelectedForDetails && (
        <PopoverDetails
          ach={data.rawAch}
          athlete={data.athlete}
          onClose={data.onCloseDetails}
          catCfg={cfg}
        />
      )}
    </div>
  );
}

const nodeTypes = {
  rootNode: RootNode,
  categoryNode: CategoryNode,
  achievementNode: AchievementNode,
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function MindMapCanvas({ mindmapData, onBack, dashboardPath }) {
  const [selectedAchievementId, setSelectedAchievementId] = useState(null);

  // Remove padding from parent contentArea to ensure full-bleed canvas
  useEffect(() => {
    const contentArea = document.querySelector('[class*="contentArea"]');
    let originalPadding = '';
    if (contentArea) {
      originalPadding = contentArea.style.padding;
      contentArea.style.padding = '0';
    }
    return () => {
      if (contentArea) {
        contentArea.style.padding = originalPadding;
      }
    };
  }, []);

  const { nodes: builtNodes, edges: builtEdges } = useMemo(() => {
    if (!mindmapData) return { nodes: [], edges: [] };

    const rawNodes = [];
    const { athlete, achievements } = mindmapData;

    const athleteDob = athlete.date_of_birth || athlete.dateOfBirth;
    const athleteName = athlete.full_name || athlete.name || 'Athlete';
    const athleteInitials = getInitials(athleteName);
    const athleteSport = athlete.primary_sport || athlete.sport || 'Athletics';
    const athleteInstitute = athlete.institute_name || athlete.instituteName || 'MH State Sports Academy';
    const athleteIdStr = athlete.mai_id || athlete.maiId || (athlete.id ? `ATH-MH-2023-00${String(athlete.id).slice(0, 4)}` : 'ATH-MH-2023-004521');
    const currentAgeText = calculateCurrentAge(athleteDob);

    // LEVEL 0
    const rootId = 'root';
    rawNodes.push({
      id: rootId,
      parentId: null,
      type: 'rootNode',
      data: {
        name: athleteName,
        initials: athleteInitials,
        sport: athleteSport,
        institute: athleteInstitute,
        athleteId: athleteIdStr,
        age: currentAgeText,
      },
      sortOrder: -1
    });

    // GROUP ACHIEVEMENTS BY CATEGORY
    const categorized = {};
    achievements.forEach(ach => {
      const catCfg = getCategoryConfig(ach.category || ach.achievement_category);
      if (!categorized[catCfg.key]) categorized[catCfg.key] = [];
      categorized[catCfg.key].push({ ach, catCfg });
    });

    const totalCats = Object.keys(categorized).length;
    let catIndex = 0;

    // Iterate over categories in a fixed order (Medal, Cert, Selection, PB, Scholarship)
    Object.keys(categorized).sort((a, b) => {
      const orderA = getCategoryConfig(a).order;
      const orderB = getCategoryConfig(b).order;
      return orderA - orderB;
    }).forEach(catKey => {
      const items = categorized[catKey];
      // Sort chronologically
      items.sort((a, b) => {
        const dA = new Date(a.ach.achievement_date || a.ach.date || 0);
        const dB = new Date(b.ach.achievement_date || b.ach.date || 0);
        return dA - dB;
      });

      const catNodeY = (catIndex - (totalCats - 1) / 2) * 118;
      const achRowY = (catIndex - (totalCats - 1) / 2) * 154;

      // Add Category Node
      const catId = `cat-${catKey.replace(/\s+/g, '-')}`;
      const categoryConfig = getCategoryConfig(catKey);
      
      rawNodes.push({
        id: catId,
        parentId: rootId,
        type: 'categoryNode',
        edgeColor: categoryConfig.border,
        position: { x: 300, y: catNodeY },
        zIndex: 2,
        data: {
          categoryConfig: categoryConfig,
          hasChildren: items.length > 0,
          isExpanded: true,
        }
      });

      // Chain them
      for (let i = 0; i < items.length; i++) {
        const { ach, catCfg } = items[i];
        const achDate = ach.achievement_date || ach.date;
        const achAgeInfo = calculateAgeAndBracket(athleteDob, achDate, ach.age_at_achievement || ach.ageAtAchievement);

        const isFirst = i === 0;
        const parentId = isFirst ? catId : `ach-${items[i - 1].ach.id}`;

        let subtitle = ach.sport || athleteSport;
        if (catCfg.key === 'Medal') {
          subtitle = `${ach.result_type || 'Selected'} · ${ach.competition_name || 'Event'}`;
        } else if (catCfg.key === 'Certificate') {
          subtitle = ach.subtitle || ach.result_type || 'Certificate';
        } else if (catCfg.key === 'Selection') {
          subtitle = ach.selected_for || 'State Team Selection';
        } else if (catCfg.key === 'Personal Best') {
          subtitle = `${ach.new_personal_best || ach.performance_value} — ${ach.venue_name || 'Camp'}`;
        } else if (catCfg.key === 'Scholarship') {
          subtitle = ach.scholarship_amount ? `Annual Stipend · ₹${ach.scholarship_amount}/yr` : 'Annual Stipend · ₹60,000/yr';
        }

        const hasChildren = i < items.length - 1;

        const isSelectedForDetails = selectedAchievementId === ach.id;
        rawNodes.push({
          id: `ach-${ach.id}`,
          parentId: parentId,
          type: 'achievementNode',
          edgeColor: catCfg.border,
          position: { x: 240 + ((i + 1) * 280), y: achRowY },
          zIndex: isSelectedForDetails ? 100 : 1,
          data: {
            rawAch: ach,
            athlete: mindmapData.athlete,
            title: ach.title || 'Untitled Achievement',
            subtitle: subtitle,
            ageBracket: achAgeInfo.combined,
            categoryConfig: catCfg,
            isExpanded: true,
            hasChildren,
            isSelectedForDetails,
            onShowDetails: () => setSelectedAchievementId(ach.id),
            onCloseDetails: () => setSelectedAchievementId(null)
          }
        });
      }
      catIndex++;
    });

    const nodes = rawNodes.map(d => ({
      id: d.id,
      type: d.type,
      position: d.position || { x: 0, y: 0 },
      zIndex: d.zIndex,
      data: d.data,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      draggable: false,
    }));

    const edges = [];
    rawNodes.forEach(node => {
      if (node.parentId) {
        edges.push({
          id: `e-${node.parentId}-${node.id}`,
          source: node.parentId,
          target: node.id,
          type: 'default',
          style: {
            stroke: node.edgeColor || '#cbd5e1',
            strokeWidth: 2,
            opacity: 0.6
          },
        });
      }
    });

    return { nodes, edges };
  }, [mindmapData, selectedAchievementId]);


  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    setNodes(builtNodes);
    setEdges(builtEdges);
  }, [builtNodes, builtEdges, setNodes, setEdges]);

  return (
    <div className={styles.mindmapPage}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <button onClick={onBack} className={styles.backBtn} title="Back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <div className={styles.topBarTitle}>
              Digital Ledger — Mind Map
            </div>
            {mindmapData && mindmapData.athlete && (
              <div className={styles.topBarSubtitle}>
                {mindmapData.athlete.full_name || mindmapData.athlete.name}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mind Map Canvas */}
      <div className={styles.flowContainer}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onPaneClick={() => setSelectedAchievementId(null)}
          defaultViewport={{ x: 50, y: (typeof window !== 'undefined' ? window.innerHeight / 2 : 500) - 80, zoom: 0.8 }}
          minZoom={0.2}
          maxZoom={2}
          nodesDraggable={false}
          panOnDrag={true}
          zoomOnDoubleClick={false}
          zoomOnScroll={false}
          panOnScroll={true}
          proOptions={{ hideAttribution: true }}
        />
      </div>

    </div>
  );
}

// ============================================
// POPOVER DETAILS COMPONENT (Apple UI Polish)
// ============================================
function PopoverDetails({ ach, athlete, onClose, catCfg }) {
  const achDate = ach.achievement_date || ach.date;
  const athleteDob = athlete.date_of_birth || athlete.dateOfBirth;
  const achAgeInfo = calculateAgeAndBracket(athleteDob, achDate, ach.age_at_achievement || ach.ageAtAchievement);

  return (
    <div className={`${styles.popoverContainer} nowheel nodrag`} onWheelCapture={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
      <div className={styles.popoverCaret} />

      <div className={styles.popoverHeader}>
        <div className={styles.popoverCatTag} style={{ color: catCfg.color, background: catCfg.bg }}>
          {catCfg.label}
        </div>
        <button className={styles.popoverCloseBtn} onClick={(e) => { e.stopPropagation(); onClose(); }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <h2 className={styles.popoverTitle}>{ach.title || 'Untitled Achievement'}</h2>
      <p className={styles.popoverSubtitle}>
        {ach.result_type || 'Selected'} · {ach.competition_name || 'Event'} · {achAgeInfo.bracket} · {getYear(achDate)}
      </p>

      <div className={styles.popoverScrollable}>
        {/* Result Block */}
        <div className={styles.detailBlock}>
          <h3 className={styles.detailBlockTitle}>RESULT</h3>
          <div className={styles.detailGrid}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Position</span>
              <span className={styles.detailValue}>{ach.final_position_rank ? `${ach.final_position_rank} Place` : (ach.result_type || '—')}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Result</span>
              <span className={styles.detailValue}>{ach.result_type || '—'}</span>
            </div>
            {ach.performance_value && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Time / Score</span>
                <span className={styles.detailValue}>{ach.performance_value}</span>
              </div>
            )}
            {ach.participants && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Participants</span>
                <span className={styles.detailValue}>{ach.participants}</span>
              </div>
            )}
          </div>
        </div>

        {/* Competition Block */}
        <div className={styles.detailBlock}>
          <h3 className={styles.detailBlockTitle}>COMPETITION & EVENT</h3>
          <div className={styles.detailGrid}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Event</span>
              <span className={styles.detailValue}>{ach.competition_name || '—'}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Venue</span>
              <span className={styles.detailValue}>{ach.venue_name || '—'}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Date</span>
              <span className={styles.detailValue}>{fmtDate(ach.achievement_date || ach.date)}</span>
            </div>
          </div>
        </div>

        {/* Verification Block */}
        <div className={styles.detailBlock}>
          <h3 className={styles.detailBlockTitle}>VERIFICATION</h3>
          <div className={styles.detailGrid}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Status</span>
              <span className={styles.statusVerified}>{ach.verification_status || 'Verified'}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Issued By</span>
              <span className={styles.detailValue}>{ach.issued_by || 'Maharashtra Sports Department'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
