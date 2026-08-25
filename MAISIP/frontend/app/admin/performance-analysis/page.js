'use client';
import { useState } from 'react';


export default function PerformanceAnalysisPage() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('IDLE'); // IDLE, PROCESSING, COMPLETED, ERROR
  const [result, setResult] = useState(null);
  const [aiResults, setAiResults] = useState(null);
  const [progressMsg, setProgressMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMsg('Please select a video file.');
      return;
    }
    
    setErrorMsg('');
    setStatus('PROCESSING');
    setProgressMsg('Starting analysis...');
    setAiResults(null);
    setResult(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Assume athleteId is 1 and videoId is 1 for testing purposes
      formData.append('athleteId', '1');
      formData.append('videoId', '1');
      
      const token = localStorage.getItem('token') || '';
      
      const startRes = await fetch('http://localhost:5000/api/athlete-analysis', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!startRes.ok) {
        const errorData = await startRes.json();
        throw new Error(errorData.message || 'Upload failed.');
      }
      
      const responseData = await startRes.json();
      const jobId = responseData.data.analysisId;
      pollStatus(jobId);
    } catch (err) {
      console.error(err);
      setStatus('ERROR');
      setErrorMsg(err.message || 'Upload failed.');
    }
  };

  const pollStatus = async (jobId) => {
    const token = localStorage.getItem('token') || '';
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/athlete-analysis/${jobId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!res.ok) {
          throw new Error('Analysis not found');
        }
        
        const responseData = await res.json();
        const data = responseData.data;
        
        if (data.progress) {
          setProgressMsg(data.progress);
        }
        if (data.ai_results) {
          setAiResults(data.ai_results);
        }
        if (data.status === 'completed' || data.analysis_status === 'COMPLETED') {
          clearInterval(interval);
          setStatus('COMPLETED');
          setResult(data.results || data);
        } else if (data.status === 'error' || data.analysis_status === 'FAILED') {
          clearInterval(interval);
          setStatus('ERROR');
          setErrorMsg(data.message || data.error_info || 'Analysis failed.');
        }
      } catch (err) {
        // Just keep polling
      }
    }, 3000);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif', color: '#333' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111' }}>Sport Performance Analysis</h1>
      
      <div style={{ marginBottom: '2rem', background: '#f5f5f5', padding: '1.5rem', borderRadius: '8px' }}>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>Video File (approx 30s):</label>
          <input type="file" accept="video/mp4,video/x-m4v,video/*" onChange={handleFileChange} style={{ width: '100%', color: '#333' }} />
        </div>
        
        <button 
          onClick={handleUpload}
          disabled={status === 'PROCESSING'}
          style={{ 
            padding: '0.75rem 1.5rem', 
            background: status === 'PROCESSING' ? '#ccc' : '#0066cc', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: status === 'PROCESSING' ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {status === 'PROCESSING' ? 'Analyzing Video...' : 'Start Analysis'}
        </button>
        
        {status === 'PROCESSING' && (
          <div style={{ marginTop: '1rem', fontStyle: 'italic', color: '#666' }}>
            {progressMsg}
          </div>
        )}
        
        {errorMsg && <div style={{ color: 'red', marginTop: '1rem' }}>{errorMsg}</div>}
      </div>

      {aiResults && (
        <div style={{ background: '#eef', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Step 1: AI Video Detection</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'white', padding: '1rem', borderRadius: '4px', borderLeft: `4px solid ${aiResults.decision === 'ACCEPT' ? '#4CAF50' : '#f44336'}` }}>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>Authenticity Decision</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: aiResults.decision === 'ACCEPT' ? '#4CAF50' : '#f44336' }}>{aiResults.decision}</div>
            </div>
            <div style={{ background: 'white', padding: '1rem', borderRadius: '4px', borderLeft: '4px solid #0066cc' }}>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>AI Confidence Score</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{aiResults.overall_score?.toFixed(1) || 'N/A'} / 100</div>
            </div>
          </div>
        </div>
      )}

      {status === 'COMPLETED' && result && (
        <div style={{ background: '#eef', padding: '1.5rem', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111' }}>Step 2: Analysis Results</h2>
          
          <div style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: '#444' }}>
            Detected: <strong>{result.sport || 'Unknown Sport'}</strong> - <strong>{result.activity || 'Unknown Activity'}</strong>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'white', padding: '1rem', borderRadius: '4px', borderLeft: '4px solid #0066cc' }}>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>Performance Index</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{(result.performanceIndex || result.performance_index)?.toFixed(1) || 'N/A'}</div>
            </div>
            <div style={{ background: 'white', padding: '1rem', borderRadius: '4px', borderLeft: '4px solid #4CAF50' }}>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>Confidence Score</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{(result.confidenceScore || result.confidence_score)?.toFixed(1) || 'N/A'}</div>
            </div>
          </div>
          
          <div style={{ background: 'white', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>LLM Summary</h3>
            <p style={{ lineHeight: '1.5' }}>{result.llmReport?.summary || result.llm_report?.summary || 'No summary available.'}</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: 'white', padding: '1rem', borderRadius: '4px' }}>
              <h3 style={{ fontWeight: 'bold', color: '#2e7d32', marginBottom: '0.5rem' }}>Strengths</h3>
              <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                {(result.llmReport?.strengths || result.llm_report?.strengths || []).map((s, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{s}</li>)}
              </ul>
            </div>
            <div style={{ background: 'white', padding: '1rem', borderRadius: '4px' }}>
              <h3 style={{ fontWeight: 'bold', color: '#c62828', marginBottom: '0.5rem' }}>Areas for Improvement</h3>
              <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                {(result.llmReport?.areasForImprovement || result.llm_report?.areasForImprovement || []).map((s, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{s}</li>)}
              </ul>
            </div>
          </div>
          
          <div style={{ marginTop: '1rem', background: 'white', padding: '1rem', borderRadius: '4px' }}>
             <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Recommendations</h3>
             <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                {(result.llmReport?.recommendations || result.llm_report?.recommendations || []).map((s, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{s}</li>)}
              </ul>
          </div>
          
          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#999', textAlign: 'right' }}>
            Scoring Version: {result.scoringVersion || result.scoring_version}
          </div>
        </div>
      )}
    </div>
  );
}
