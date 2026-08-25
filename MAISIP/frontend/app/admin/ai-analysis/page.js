import AiVideoAnalyzer from '../../../components/ai-analysis/AiVideoAnalyzer';

export default function AdminAiAnalysisPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Admin: AI Deepfake Detection</h1>
      <AiVideoAnalyzer />
    </div>
  );
}
