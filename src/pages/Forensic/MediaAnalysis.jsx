import React, { useState, useEffect, useCallback } from 'react';

const MediaAnalysis = () => {
    const [file, setFile] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [showHeatmap, setShowHeatmap] = useState(false);

    // Queue State
    const [aiQueue, setAiQueue] = useState([]);
    const [queueLoading, setQueueLoading] = useState(true);
    const [selectedCaseId, setSelectedCaseId] = useState(null);
    const [verificationStatus, setVerificationStatus] = useState(null); // 'clean' or 'verified'

    // Fetch AI-Flagged + Evidence Analysis Cases
    const fetchQueue = useCallback(() => {
        setQueueLoading(true);
        Promise.all([
            fetch('/api/complaints?status=AI-Flagged').then(r => r.json()),
            fetch('/api/complaints?status=Evidence%20Analysis').then(r => r.json())
        ])
            .then(([flagged, analysis]) => {
                const all = [...(Array.isArray(flagged) ? flagged : []), ...(Array.isArray(analysis) ? analysis : [])];
                // Deduplicate by _id and sort newest first
                const seen = new Set();
                const unique = all.filter(c => !seen.has(c._id) && seen.add(c._id));
                unique.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setAiQueue(unique);
            })
            .catch(err => console.error("Queue fetch failed", err))
            .finally(() => setQueueLoading(false));
    }, []);

    useEffect(() => {
        fetchQueue();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchQueue, 30000);
        return () => clearInterval(interval);
    }, [fetchQueue]);


    const handleSelectCase = (c) => {
        setSelectedCaseId(c._id);
        setVerificationStatus(null);
        // Simulate loading evidence from backend (in real app, fetch image URL)
        // For now, we reset file to force manual upload or simulate loaded state
        const safeScore = (parseFloat(c.ai_confidence_score) || 0) * 100;
        setResult({
            score: safeScore.toFixed(1),
            verdict: c.ai_analysis_result === 'Fake' ? 'Deepfake Detected' : 'Authentic',
            manipulationType: c.ai_analysis_result === 'Fake' ? 'Face Swap (GANs)' : 'None Detected',
            confidence: safeScore > 90 ? 'Very High' : safeScore > 70 ? 'High' : safeScore > 50 ? 'Medium' : 'Low',
            isAutomated: true,
            // Build the URL to the evidence image served from backend via Vite proxy
            evidenceUrl: c.evidence ? (c.evidence === 'mongodb' ? `/api/complaints/${c._id}/evidence` : `/${c.evidence.replace(/\\/g, '/').replace(/^\//, '')}`) : null
        });
        // In a real app we would setFile(c.evidenceUrl)
    };

    const handleFileUpload = (e) => {
        setFile(e.target.files[0]);
        setResult(null);
        setShowHeatmap(false);
        setSelectedCaseId(null); // Clear selected case if manual upload
    };

    const runAnalysis = async () => {
        if (!file) return;
        setAnalyzing(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const AI_SERVER_URL = import.meta.env.VITE_AI_SERVER_URL || 'http://localhost:8000';
            const res = await fetch(`${AI_SERVER_URL}/detect`, {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error("AI Service Failed");

            const data = await res.json();

            setResult({
                score: (data.confidence_score * 100).toFixed(1),
                verdict: data.label === 'Fake' ? 'Deepfake Detected' : 'Authentic',
                manipulationType: data.label === 'Fake' ? 'Face Swap (GANs)' : 'None Detected',
                confidence: data.confidence_score > 0.8 ? 'High' : 'Medium'
            });

        } catch (err) {
            alert("Analysis failed. Ensure AI server is running.");
        } finally {
            setAnalyzing(false);
        }
    };

    const handleVerify = async () => {
        if (!selectedCaseId) return;

        // 1. Update Backend Status
        try {
            await fetch(`/api/complaints/${selectedCaseId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Deepfake Verified' })
            });

            // 2. UI Updates
            setVerificationStatus('verified');
            alert("🔒 INCIDENT VERIFIED\n\n- Forensic artifacts preserved.\n- Raw image scheduled for secure deletion to protect victim privacy.");

            // Remove from queue
            setAiQueue(prev => prev.filter(c => c._id !== selectedCaseId));
            setSelectedCaseId(null);
            setResult(null);

        } catch (err) {
            alert("Verification Failed");
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.titleGroup}>
                    <h2 style={{ color: '#003366', margin: 0, fontSize: '24px', fontWeight: '800' }}>🎞️ Media Forensics Lab</h2>
                    <span style={styles.badgeTop}>RESTRICTED ACCESS</span>
                </div>
                <p style={{ color: '#627D98', margin: '5px 0 0', fontSize: '14px' }}>Advanced Deepfake Detection & Metadata Reconstruction</p>
            </div>

            <div style={styles.grid}>
                {/* 1. AI Case Queue Sidebar */}
                <div style={styles.panel}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h3 style={styles.sectionTitle}>📥 AI Case Queue</h3>
                        <button
                            onClick={fetchQueue}
                            style={{ background: 'none', border: '1px solid #3182CE', color: '#3182CE', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            {queueLoading ? '⟳ Loading...' : '↻ Refresh'}
                        </button>
                    </div>
                    {queueLoading && aiQueue.length === 0 ? (
                        <p style={{ color: '#A0AEC0', fontSize: '13px' }}>Fetching cases...</p>
                    ) : aiQueue.length === 0 ? (
                        <p style={{ color: '#A0AEC0', fontSize: '13px' }}>No flagged cases pending.</p>
                    ) : (
                        <div style={styles.queueList}>
                            {aiQueue.map(c => (
                                <div
                                    key={c._id}
                                    style={selectedCaseId === c._id ? styles.queueItemActive : styles.queueItem}
                                    onClick={() => handleSelectCase(c)}
                                >
                                    <div style={styles.queueId}>
                                        {c.caseRef || `CASE #${c._id.slice(-6).toUpperCase()}`}
                                    </div>
                                    <span style={{ ...styles.queueStatus, background: c.status === 'AI-Flagged' ? '#FFF5F5' : '#EBF8FF', color: c.status === 'AI-Flagged' ? '#C53030' : '#2B6CB0' }}>
                                        {c.status === 'AI-Flagged' ? `🚨 AI FLAGGED (${((parseFloat(c.ai_confidence_score) || 0) * 100).toFixed(0)}%)` : '🔬 Evidence Analysis'}
                                    </span>
                                    <div style={{ fontSize: '12px', color: '#718096', marginTop: '5px' }}>
                                        {c.description.substring(0, 30)}...
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Left Panel: Upload & Preview */}
                <div style={styles.panel}>
                    {!selectedCaseId && (
                        <div style={styles.uploadZone}>
                            <input type="file" onChange={handleFileUpload} accept="image/*,video/*" />
                            <p style={{ marginTop: '10px', fontSize: '13px', color: '#718096' }}>Upload suspect media (JPG, MP4)</p>
                        </div>
                    )}

                    {(file || selectedCaseId) && (
                        <div style={styles.previewContainer}>
                            <h4 style={styles.sectionTitle}>Evidence Preview</h4>
                            <div style={styles.imageWrapper}>
                                {file ? (
                                    file.type.startsWith('image') ? (
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt="Evidence"
                                            style={styles.previewImage}
                                        />
                                    ) : (
                                        <video controls style={styles.previewImage}>
                                            <source src={URL.createObjectURL(file)} />
                                        </video>
                                    )
                                ) : (
                                    result && result.evidenceUrl ? (
                                        <img
                                            src={result.evidenceUrl}
                                            alt="Evidence"
                                            style={styles.previewImage}
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    ) : (
                                        <div style={{ ...styles.previewImage, background: '#2D3748', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                            [ CONFIDENTIAL EVIDENCE LOADED ]
                                        </div>
                                    )
                                )}

                                {/* Deepfake Overlay Heatmap */}
                                {showHeatmap && (
                                    <div style={styles.heatmapOverlay}>
                                        <div style={styles.heatSpot1} />
                                        <div style={styles.heatSpot2} />
                                        <div style={styles.scanline} />
                                    </div>
                                )}
                            </div>

                            {result && (
                                <div style={styles.controls}>
                                    <label style={styles.toggleLabel}>
                                        <input
                                            type="checkbox"
                                            checked={showHeatmap}
                                            onChange={() => setShowHeatmap(!showHeatmap)}
                                        />
                                        Show Manipulation Heatmap
                                    </label>
                                </div>
                            )}
                        </div>
                    )}

                    {!selectedCaseId && (
                        <button
                            onClick={runAnalysis}
                            style={analyzing ? styles.btnDisabled : styles.btn}
                            disabled={analyzing || !file}
                        >
                            {analyzing ? 'Processing (GAN Analysis)...' : 'Run Forensics'}
                        </button>
                    )}
                </div>

                {/* Right Panel: Analysis Results */}
                <div style={styles.panel}>
                    <h3 style={{ ...styles.sectionTitle, borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>Analysis Report</h3>

                    {analyzing && (
                        <div style={styles.loading}>
                            <div style={styles.spinner}></div>
                            <p>Scanning pixel anomalies...</p>
                        </div>
                    )}

                    {!result && !analyzing && <p style={{ color: '#A0AEC0', textAlign: 'center', marginTop: '50px' }}>Select a case or upload media</p>}

                    {result && (
                        <div style={styles.resultContainer}>
                            <div style={{
                                ...styles.verdictBox,
                                background: result.score > 80 ? '#FFF5F5' : '#F0FFF4',
                                borderColor: result.score > 80 ? '#FC8181' : '#68D391',
                                color: result.score > 80 ? '#C53030' : '#276749'
                            }}>
                                <span style={{ fontSize: '24px', display: 'block', marginBottom: '5px' }}>
                                    {result.score > 80 ? '⚠️ TAMPERING DETECTED' : '✅ AUTHENTIC MEDIA'}
                                </span>
                                Probability Score: <strong>{result.score}%</strong>
                            </div>

                            <div style={styles.detailsList}>
                                <div style={styles.detailItem}>
                                    <span>Method:</span> <strong>{result.manipulationType}</strong>
                                </div>
                                <div style={styles.detailItem}>
                                    <span>AI Confidence:</span> <strong>{result.confidence}</strong>
                                </div>
                            </div>

                            {selectedCaseId && (
                                <button onClick={handleVerify} style={styles.btnVerify}>
                                    ✅ VERIFY &amp; SEAL RESULT
                                </button>
                            )}
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
    badgeTop: { background: '#FFF5F5', color: '#C53030', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', border: '1px solid #FEB2B2', letterSpacing: '1px' },

    // Fixed Grid: 3 Equal Columns that fill height cleanly
    grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', flex: 1, minHeight: 0, padding: '0 10px 10px', boxSizing: 'border-box' },

    panel: { background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', border: '1px solid #EDF2F7', WebkitOverflowScrolling: 'touch' },
    sectionTitle: { margin: '0 0 10px 0', fontSize: '16px', color: '#2D3748', borderBottom: '2px solid #EDF2F7', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' },

    queueList: { display: 'flex', flexDirection: 'column', gap: '10px' },
    queueItem: { padding: '15px', borderRadius: '12px', border: '1px solid #E2E8F0', cursor: 'pointer', transition: 'all 0.2s', background: '#F7FAFC' },
    queueItemActive: { padding: '15px', borderRadius: '12px', border: '2px solid #3182CE', cursor: 'pointer', background: 'white', boxShadow: '0 4px 12px rgba(49, 130, 206, 0.1)' },
    queueId: { fontWeight: 'bold', color: '#1A365D', fontSize: '14px', marginBottom: '8px', fontFamily: 'monospace' },
    queueStatus: { padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', display: 'inline-block' },

    uploadZone: { border: '2px dashed #CBD5E0', padding: '40px 20px', borderRadius: '12px', textAlign: 'center', background: '#F7FAFC', transition: 'all 0.2s', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '150px' },

    previewContainer: { flex: 1, display: 'flex', flexDirection: 'column', gap: '15px', minHeight: '250px' },
    imageWrapper: { position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E2E8F0', background: '#1A202C', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px', flex: 1 },
    previewImage: { width: '100%', height: '100%', maxHeight: '350px', objectFit: 'contain', display: 'block' },

    // Heatmap Styles
    heatmapOverlay: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', mixBlendMode: 'screen', overflow: 'hidden' },
    heatSpot1: { position: 'absolute', top: '30%', left: '40%', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,50,50,0.9) 0%, rgba(255,0,0,0) 70%)', animation: 'pulseHeat 2s infinite alternate' },
    heatSpot2: { position: 'absolute', bottom: '20%', right: '30%', width: '90px', height: '90px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,100,0,0.8) 0%, rgba(255,0,0,0) 70%)', animation: 'pulseHeat 3s infinite alternate-reverse' },
    scanline: { position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'rgba(49, 130, 206, 0.5)', boxShadow: '0 0 10px rgba(49, 130, 206, 0.8)', animation: 'scan 3s linear infinite' },

    controls: { display: 'flex', gap: '10px', background: '#F7FAFC', padding: '12px 15px', borderRadius: '10px', border: '1px solid #E2E8F0' },
    toggleLabel: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: '#4A5568' },

    btn: { padding: '16px', background: 'linear-gradient(135deg, #003366 0%, #1A365D 100%)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', boxShadow: '0 4px 15px rgba(0,51,102,0.2)' },
    btnDisabled: { padding: '16px', background: '#CBD5E0', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'not-allowed', fontSize: '15px' },
    btnVerify: { padding: '14px', background: '#38A169', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', width: '100%', marginTop: '15px', transition: 'background 0.2s', boxShadow: '0 4px 10px rgba(56, 161, 105, 0.2)' },

    loading: { textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#4A5568' },
    spinner: { width: '40px', height: '40px', border: '3px solid #E2E8F0', borderTop: '3px solid #3182CE', borderRadius: '50%', marginBottom: '15px', animation: 'spin 1s linear infinite' },

    resultContainer: { display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 },
    verdictBox: { padding: '25px 20px', borderRadius: '12px', border: '2px solid', textAlign: 'center', background: '#FAFAFA' },
    detailsList: { display: 'flex', flexDirection: 'column', gap: '12px', background: '#F7FAFC', padding: '20px', border: '1px solid #E2E8F0', borderRadius: '12px' },
    detailItem: { display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#4A5568', paddingBottom: '10px', borderBottom: '1px dashed #CBD5E0' },
};

export default MediaAnalysis;
