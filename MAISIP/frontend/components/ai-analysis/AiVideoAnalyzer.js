'use client';

import React, { useState, useEffect } from 'react';
import styles from './AiVideoAnalyzer.module.css';

export default function AiVideoAnalyzer() {
  const [file, setFile] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, uploading, processing, completed, error
  const [llmProvider, setLlmProvider] = useState('gpt-4o');
  const [results, setResults] = useState(null);
  const [sportResults, setSportResults] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let intervalId;

    if (status === 'processing' && jobId) {
      intervalId = setInterval(async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/athlete-analysis/${jobId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
          });
          if (res.ok) {
            const responseData = await res.json();
            const data = responseData.data;
            if (data.status === 'completed' || data.analysis_status === 'COMPLETED') {
              setResults(data.ai_results || data.results?.ai_results || data);
              setSportResults(data.results || data);
              setStatus('completed');
              clearInterval(intervalId);
            } else if (data.status === 'error') {
              setError(data.message || 'An error occurred during analysis.');
              setStatus('error');
              clearInterval(intervalId);
            }
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 5000); // Poll every 5 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [status, jobId]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setError(null);
      setResults(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus('uploading');
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('llmProvider', llmProvider);

    try {
      const res = await fetch('http://localhost:5000/api/athlete-analysis', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: formData,
      });

      if (!res.ok) {
        let errorMsg = 'Upload failed';
        try {
          const errorData = await res.json();
          errorMsg = errorData.message || errorMsg;
        } catch (e) {}
        throw new Error(errorMsg);
      }

      const responseData = await res.json();
      setJobId(responseData.data?.analysisId || responseData.job_id);
      setStatus('processing');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  const resetAnalyzer = () => {
    setFile(null);
    setJobId(null);
    setStatus('idle');
    setResults(null);
    setSportResults(null);
    setError(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>AI Analysis & Sport Metrics</h2>
        <p>Comprehensive video analysis: Authenticity & Performance</p>
      </div>

      {(status === 'idle' || status === 'error') && (
        <>
          <div className={styles.uploadArea}>
            <div className={styles.uploadIcon}>📁</div>
            <h3>Drag and drop your video here</h3>
            <p>or click to browse</p>
            <input 
              type="file" 
              accept="video/*" 
              className={styles.fileInput} 
              onChange={handleFileChange} 
            />
          </div>
          
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.75rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Analysis Engine
            </label>
            <div style={{ 
              display: 'inline-flex', 
              background: '#f1f1f2', 
              padding: '4px', 
              borderRadius: '12px',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
            }}>
              {[
                { id: 'gpt-4o', label: 'GPT-4o (Cloud)' },
                { id: 'llama3', label: 'Llama 3 (Local)' },
                { id: 'mock', label: 'Mock (Offline)' }
              ].map(provider => {
                const isActive = llmProvider === provider.id;
                return (
                  <button
                    key={provider.id}
                    onClick={() => setLlmProvider(provider.id)}
                    style={{
                      padding: '0.5rem 1.25rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: isActive ? '#ffffff' : 'transparent',
                      color: isActive ? '#000000' : '#666666',
                      fontWeight: isActive ? '600' : '500',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)' : 'none',
                      margin: '0 2px'
                    }}
                  >
                    {provider.label}
                  </button>
                );
              })}
            </div>
          </div>
          
          {file && (
            <div style={{ marginTop: '1rem', fontWeight: 'bold', textAlign: 'center' }}>
              Selected: {file.name}
            </div>
          )}
          
          <div style={{ textAlign: 'center' }}>
            <button 
              className={styles.uploadBtn} 
              onClick={handleUpload}
              disabled={!file}
            >
              Start AI Analysis
            </button>
          </div>
        </>
      )}

      {error && (
        <div className={styles.errorBox}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {(status === 'uploading' || status === 'processing') && (
        <div className={styles.processingState}>
          <div className={styles.spinner}></div>
          <div className={styles.processingText}>
            {status === 'uploading' ? 'Uploading Video...' : 'AI Models Crunching Video...'}
          </div>
          <div className={styles.processingSubtext}>
            Analyzing temporal consistency, spatial anomalies, and metadata footprints. <br/>
            This takes a few minutes (Please do not close this page).
          </div>
        </div>
      )}

      {status === 'completed' && results && (
        <div className={styles.resultsDashboard}>
          <div className={styles.resultHeader}>
            <div className={`${styles.decisionBadge} ${results.decision === 'REJECT' ? styles.reject : styles.accept}`}>
              {results.decision === 'REJECT' ? 'AI GENERATED (REJECT)' : 'AUTHENTIC (ACCEPT)'}
            </div>
            <div className={styles.overallScore}>
              Confidence Score: <strong>{results.overall_score.toFixed(1)} / 100</strong>
            </div>
          </div>

          <div className={styles.metricsGrid}>
            {[
              { label: 'Spatial Quality', value: results.component_scores.spatial_score, weight: '30%', desc: 'Detects pixel-level AI anomalies and synthetic textures in individual frames.' },
              { label: 'Temporal Flow', value: results.component_scores.temporal_score, weight: '20%', desc: 'Analyzes motion consistency and physics across consecutive frames.' },
              { label: 'Lighting Consistency', value: results.component_scores.lighting_score, weight: '15%', desc: 'Checks for unnatural shadows, flickering, and brightness shifts.' },
              { label: 'Pose Biometrics', value: results.component_scores.pose_score || 100, weight: '15%', desc: 'Tracks unnatural skeletal movements and biomechanical glitches.' },
              { label: 'Audio Integrity', value: results.component_scores.audio_score, weight: '10%', desc: 'Scans for synthetic voice cloning, splicing, and digital clipping.' },
              { label: 'EXIF Metadata', value: results.component_scores.metadata_confidence || 0, weight: '10%', desc: 'Verifies original camera hardware tags and flags known AI software signatures.' }
            ].map((metric, idx) => {
              const score = typeof metric.value === 'number' ? metric.value : 0;
              // Determine color based on score
              let progressColor = '#34c759'; // Green (Authentic)
              if (score < 60) progressColor = '#ff3b30'; // Red (Fake/Anomaly)
              else if (score < 85) progressColor = '#ff9f0a'; // Orange (Warning)
              
              return (
                <div key={idx} className={styles.metricCard}>
                  <div className={styles.metricHeader}>
                    <div className={styles.metricValue} style={{ color: progressColor }}>{score.toFixed(0)}</div>
                    <div className={styles.metricWeightBadge}>{metric.weight} Weight</div>
                  </div>
                  <div className={styles.metricLabel}>{metric.label}</div>
                  <div className={styles.progressBarContainer}>
                    <div 
                      className={styles.progressBarFill} 
                      style={{ 
                        width: `${Math.min(100, Math.max(0, score))}%`,
                        backgroundColor: progressColor 
                      }}
                    />
                  </div>
                  <div className={styles.metricDesc}>{metric.desc}</div>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button className={styles.uploadBtn} onClick={resetAnalyzer}>
              Analyze Another Video
            </button>
          </div>
        </div>
      )}

      {status === 'completed' && sportResults && sportResults.sport && (
        <div className={styles.resultsDashboard} style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111' }}>Sport Performance Results</h2>
          
          <div style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: '#444' }}>
            Detected: <strong>{sportResults.sport || 'Unknown Sport'}</strong> - <strong>{sportResults.activity || 'Unknown Activity'}</strong>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'white', padding: '1rem', borderRadius: '4px', borderLeft: '4px solid #0066cc', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>Performance Index</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111' }}>{(sportResults.performanceIndex || sportResults.performance_index)?.toFixed(1) || 'N/A'}</div>
            </div>
            <div style={{ background: 'white', padding: '1rem', borderRadius: '4px', borderLeft: '4px solid #4CAF50', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>Confidence Score</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111' }}>{(sportResults.confidenceScore || sportResults.confidence_score)?.toFixed(1) || 'N/A'}</div>
            </div>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#111' }}>Scoring Breakdown</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {sportResults.componentScores && Object.entries(sportResults.componentScores).map(([key, data]) => {
                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                return (
                  <div key={key} style={{ background: 'white', padding: '1rem', borderRadius: '4px', border: '1px solid #eaeaea', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem', textTransform: 'capitalize' }}>{label}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0066cc' }}>
                        {typeof data.score === 'number' ? data.score.toFixed(1) : data.score}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#999' }}>/ 100</div>
                    </div>
                    {data.supportingMetrics && data.supportingMetrics.length > 0 && (
                      <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '0.5rem', borderTop: '1px solid #f0f0f0', paddingTop: '0.5rem' }}>
                        Based on: {data.supportingMetrics.map(m => m.replace(/([A-Z])/g, ' $1').toLowerCase()).join(', ')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#111' }}>Biomechanical Metrics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {sportResults.metrics && Object.entries(sportResults.metrics).map(([key, data]) => {
                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                const isAvail = data.availability === 'AVAILABLE';
                return (
                  <div key={key} style={{ background: 'white', padding: '1rem', borderRadius: '4px', border: '1px solid #eaeaea', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>{label}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: isAvail ? '#333' : '#aaa' }}>
                      {isAvail ? (typeof data.value === 'number' ? data.value.toFixed(2) : data.value) : 'N/A'}
                      {isAvail && data.unit && <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: '4px', fontWeight: 'normal' }}>{data.unit}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div style={{ background: 'white', padding: '1rem', borderRadius: '4px', marginBottom: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '0.5rem', color: '#111' }}>LLM Summary</h3>
            <p style={{ lineHeight: '1.5', color: '#333' }}>{sportResults.llmReport?.summary || sportResults.llm_report?.summary || 'No summary available.'}</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: 'white', padding: '1rem', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontWeight: 'bold', color: '#2e7d32', marginBottom: '0.5rem' }}>Strengths</h3>
              <ul style={{ paddingLeft: '1.5rem', margin: 0, color: '#333' }}>
                {(sportResults.llmReport?.strengths || sportResults.llm_report?.strengths || []).map((s, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{s}</li>)}
              </ul>
            </div>
            <div style={{ background: 'white', padding: '1rem', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontWeight: 'bold', color: '#c62828', marginBottom: '0.5rem' }}>Areas for Improvement</h3>
              <ul style={{ paddingLeft: '1.5rem', margin: 0, color: '#333' }}>
                {(sportResults.llmReport?.areasForImprovement || sportResults.llm_report?.areasForImprovement || []).map((s, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{s}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
