import AiVideoAnalyzer from '../../../components/ai-analysis/AiVideoAnalyzer';

export default function AthleteAiAnalysisPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Athlete: Verify Video Authenticity</h1>
      <AiVideoAnalyzer />
    </div>
  );
}
