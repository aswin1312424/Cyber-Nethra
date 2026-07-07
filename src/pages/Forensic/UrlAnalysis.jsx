import React, { useState } from 'react';

const UrlAnalysis = () => {
    const [urlInput, setUrlInput] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);

    const runAnalysis = async () => {
        if (!urlInput.trim()) return;
        setAnalyzing(true);
        setResult(null);

        try {
            const AI_SERVER_URL = import.meta.env.VITE_AI_SERVER_URL || 'http://localhost:8000';
            const res = await fetch(`${AI_SERVER_URL}/detect-url`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: urlInput })
            });

            if (!res.ok) throw new Error("AI Service Failed");

            const data = await res.json();

            if (data.error) {
                alert(data.error);
                return;
            }

            setResult({
                label: data.label, // "Safe" or "Malicious"
                score: (data.confidence_score * 100).toFixed(1),
                confidence: data.confidence_score > 0.8 ? 'High' : 'Medium'
            });

        } catch (err) {
            alert("Analysis failed. Ensure AI server is running or URL is correct.");
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.titleGroup}>
                    <h2 style={{ color: '#003366', margin: 0, fontSize: '24px', fontWeight: '800' }}>🔗 Intelligent URL Scanner</h2>
                    <span style={styles.badgeTop}>WEB FORENSICS</span>
                </div>
                <p style={{ color: '#627D98', margin: '5px 0 0', fontSize: '14px' }}>Real-time machine learning detection of malicious phishing links and deceptive domains.</p>
            </div>

            <div className="responsive-stack" style={styles.grid}>
                {/* Left Panel: Input */}
                <div style={styles.panel}>
                    <h3 style={styles.sectionTitle}>Target URL</h3>
                    <div style={styles.inputContainer}>
                        <input
                            style={styles.input}
                            type="text"
                            placeholder="e.g. https://suspicious-login-update.com"
                            value={urlInput}
                            onChange={e => setUrlInput(e.target.value)}
                        />
                        <button
                            onClick={runAnalysis}
                            style={analyzing || !urlInput.trim() ? styles.btnDisabled : styles.btn}
                            disabled={analyzing || !urlInput.trim()}
                        >
                            {analyzing ? 'Scanning...' : 'Analyze Domain'}
                        </button>
                    </div>
                </div>

                {/* Right Panel: Analysis Results */}
                <div style={styles.panel}>
                    <h3 style={{ ...styles.sectionTitle, borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>Analysis Report</h3>

                    {analyzing && (
                        <div style={styles.loading}>
                            <div style={styles.spinner}></div>
                            <p>Extracting domain features...</p>
                        </div>
                    )}

                    {!result && !analyzing && <p style={{ color: '#A0AEC0', textAlign: 'center', marginTop: '30px' }}>Enter a URL to begin scan</p>}

                    {result && (
                        <div style={styles.resultContainer}>
                            <div style={{
                                ...styles.verdictBox,
                                background: result.label === 'Malicious' ? '#FFF5F5' : '#F0FFF4',
                                borderColor: result.label === 'Malicious' ? '#FC8181' : '#68D391',
                                color: result.label === 'Malicious' ? '#C53030' : '#276749'
                            }}>
                                <span style={{ fontSize: '24px', display: 'block', marginBottom: '5px' }}>
                                    {result.label === 'Malicious' ? '⚠️ MALICIOUS URL DETECTED' : '✅ SAFE DOMAIN'}
                                </span>
                                Probability Score: <strong>{result.score}%</strong>
                            </div>

                            <div style={styles.detailsList}>
                                <div style={styles.detailItem}>
                                    <span>Verdict:</span> <strong>{result.label}</strong>
                                </div>
                                <div style={styles.detailItem}>
                                    <span>AI Confidence:</span> <strong>{result.confidence}</strong>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { height: '100%', display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' },
    header: { padding: '10px 20px', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' },
    titleGroup: { display: 'flex', alignItems: 'center', gap: '15px' },
    badgeTop: { background: '#FAF5FF', color: '#805AD5', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', border: '1px solid #D6BCFA', letterSpacing: '1px' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', flex: 1, minHeight: 0, padding: '0 10px 10px', boxSizing: 'border-box' },
    panel: { background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', border: '1px solid #EDF2F7' },
    sectionTitle: { margin: '0 0 10px 0', fontSize: '16px', color: '#2D3748', borderBottom: '2px solid #EDF2F7', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' },

    inputContainer: { display: 'flex', flexDirection: 'column', gap: '15px' },
    input: { padding: '15px', borderRadius: '10px', border: '1px solid #CBD5E0', fontSize: '16px', width: '100%', boxSizing: 'border-box' },

    btn: { padding: '16px', background: 'linear-gradient(135deg, #003366 0%, #1A365D 100%)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', boxShadow: '0 4px 15px rgba(0,51,102,0.2)' },
    btnDisabled: { padding: '16px', background: '#CBD5E0', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'not-allowed', fontSize: '15px' },

    loading: { textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#4A5568' },
    spinner: { width: '40px', height: '40px', border: '3px solid #E2E8F0', borderTop: '3px solid #3182CE', borderRadius: '50%', marginBottom: '15px', animation: 'spin 1s linear infinite' },

    resultContainer: { display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 },
    verdictBox: { padding: '25px 20px', borderRadius: '12px', border: '2px solid', textAlign: 'center', background: '#FAFAFA' },
    detailsList: { display: 'flex', flexDirection: 'column', gap: '12px', background: '#F7FAFC', padding: '20px', border: '1px solid #E2E8F0', borderRadius: '12px' },
    detailItem: { display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#4A5568', paddingBottom: '10px', borderBottom: '1px dashed #CBD5E0' },
};

// Inject Global Styles
if (typeof document !== 'undefined' && !document.getElementById('url-lab-styles')) {
    const style = document.createElement('style');
    style.id = 'url-lab-styles';
    style.innerHTML = `
        @keyframes spin { to { transform: rotate(360deg); } }
    `;
    document.head.appendChild(style);
}

export default UrlAnalysis;
