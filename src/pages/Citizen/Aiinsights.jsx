import React from 'react';

const AIInsights = ({ user }) => {
  const [reports, setReports] = React.useState([]);

  React.useEffect(() => {
    // Fetch user complaints that have AI results
    if (user?.email) {
      fetch(`/api/complaints/${user.email}`)
        .then(res => res.json())
        .then(data => {
          // Filter only Deepfake cases with AI results
          const aiCases = data.filter(c => c.type === 'Deepfake' && c.ai_analysis_result);
          setReports(aiCases);
        })
        .catch(err => console.error("Failed to fetch reports:", err));
    }
  }, [user]);

  return (
    <div style={styles.card}>
      <h2>📑 AI Analysis Reports</h2>
      <p style={{ marginBottom: '20px', color: '#666' }}>AI-generated confidence scores and forensic analysis (Read-Only).</p>

      {reports.length === 0 ? (
        <div style={styles.reportPlaceholder}>
          <p>No reports generated yet. File a "Deepfake" or "Fraud" case to begin AI analysis.</p>
        </div>
      ) : (
        <div style={styles.list}>
          {reports.map(report => (
            <div key={report._id} style={styles.reportCard}>
              <div style={styles.reportHeader}>
                <span style={styles.caseId}>Case #{report._id.slice(-6).toUpperCase()}</span>
                <span style={styles.date}>{new Date(report.createdAt).toLocaleDateString()}</span>
              </div>

              <div style={styles.resultRow}>
                <div style={styles.metric}>
                  <label>Verdict</label>
                  <span style={{
                    ...styles.badge,
                    background: report.status === 'Deepfake Verified' ? '#000' : (report.ai_analysis_result === 'Fake' ? '#FED7D7' : '#C6F6D5'),
                    color: report.status === 'Deepfake Verified' ? '#0f0' : (report.ai_analysis_result === 'Fake' ? '#822727' : '#22543D'),
                    border: report.status === 'Deepfake Verified' ? '1px solid #0f0' : 'none'
                  }}>
                    {report.status === 'Deepfake Verified' ? '🛡️ VERIFIED & SECURED' : (report.ai_analysis_result === 'Fake' ? '⚠️ MANIPULATED' : '✅ AUTHENTIC')}
                  </span>
                </div>

                <div style={styles.metric}>
                  <label>Confidence Score</label>
                  <div style={styles.progressBar}>
                    <div style={{
                      ...styles.progressFill,
                      width: `${(report.ai_confidence_score || 0) * 100}%`,
                      background: report.ai_analysis_result === 'Fake' ? '#E53E3E' : '#38A169'
                    }} />
                  </div>
                  <span style={styles.scoreValue}>{((report.ai_confidence_score || 0) * 100).toFixed(1)}%</span>
                </div>
              </div>

              {/* Specific Privacy Message for Verified Deepfakes */}
              {report.status === 'Deepfake Verified' && (
                <div style={styles.privacyMessage}>
                  <strong>🔒 Incident Verified.</strong> AI analysis confirmed by Expert.
                  To protect victim privacy, raw media is scheduled for secure deletion soon.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  card: { background: 'white', padding: '30px', borderRadius: '15px', height: '100%', overflowY: 'auto' },
  reportPlaceholder: { background: '#F8FAFC', padding: '20px', borderRadius: '10px', marginTop: '20px', color: '#627D98', textAlign: 'center' },
  list: { display: 'flex', flexDirection: 'column', gap: '15px' },
  reportCard: { border: '1px solid #E2E8F0', borderRadius: '10px', padding: '20px' },
  reportHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid #F7FAFC', paddingBottom: '10px' },
  caseId: { fontWeight: 'bold', color: '#2D3748' },
  date: { fontSize: '13px', color: '#718096' },
  resultRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  metric: { display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 },
  badge: { padding: '5px 10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', display: 'inline-block', textAlign: 'center', maxWidth: '120px' },
  progressBar: { height: '8px', background: '#EDF2F7', borderRadius: '4px', overflow: 'hidden', width: '80%' },
  progressFill: { height: '100%' },
  scoreValue: { fontSize: '12px', fontWeight: 'bold', marginTop: '2px' },
  privacyMessage: { marginTop: '15px', padding: '10px', background: '#2D3748', color: '#63B3ED', fontSize: '13px', borderRadius: '6px', borderLeft: '4px solid #63B3ED' }
};

export default AIInsights;