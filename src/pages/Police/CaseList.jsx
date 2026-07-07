import React, { useState, useEffect } from 'react';

const CaseList = () => {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCase, setSelectedCase] = useState(null);

    useEffect(() => {
        const fetchCases = async () => {
            try {
                const res = await fetch('/api/complaints');
                const data = await res.json();
                if (res.ok) setCases(data);
            } catch (err) {
                console.error("Failed to fetch cases");
            } finally {
                setLoading(false);
            }
        };
        fetchCases();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'AI-Flagged': return { bg: '#FFF5F5', text: '#C53030', border: '#FC8181' };
            case 'Resolved': return { bg: '#F0FFF4', text: '#276749', border: '#68D391' };
            case 'Deepfake Verified': return { bg: '#EBF8FF', text: '#2B6CB0', border: '#63B3ED' };
            default: return { bg: '#FFFCF0', text: '#975A16', border: '#F6AD55' };
        }
    };

    const getEvidenceUrl = (c) => {
        if (!c || !c.evidence) return null;
        const SERVER_URL = import.meta.env.VITE_BACKEND_URL || '';
        if (c.evidence === 'mongodb') return `${SERVER_URL}/api/complaints/${c._id}/evidence`;
        return `${SERVER_URL}/${c.evidence.replace(/\\/g, '/')}`;
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>📁 All Cases</h2>
            <p style={styles.sub}>Full registry of reported cybercrime incidents.</p>

            <div style={styles.layout}>
                {/* Case List */}
                <div style={styles.listPanel}>
                    {loading && <p style={{ color: '#A0AEC0' }}>Loading cases...</p>}
                    {!loading && cases.length === 0 && <p style={{ color: '#A0AEC0' }}>No cases found.</p>}
                    {cases.map(c => {
                        const colors = getStatusColor(c.status);
                        return (
                            <div
                                key={c._id}
                                style={{
                                    ...styles.caseRow,
                                    borderLeft: selectedCase?._id === c._id ? '4px solid #3182CE' : '4px solid transparent',
                                    background: selectedCase?._id === c._id ? '#EBF8FF' : 'white'
                                }}
                                onClick={() => setSelectedCase(c)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={styles.caseId}>CASE #{c._id.slice(-6).toUpperCase()}</div>
                                        <div style={styles.caseType}>{c.type}</div>
                                        <div style={styles.caseDesc}>{c.description.substring(0, 60)}...</div>
                                    </div>
                                    <span style={{
                                        ...styles.badge,
                                        background: colors.bg,
                                        color: colors.text,
                                        border: `1px solid ${colors.border}`
                                    }}>
                                        {c.status}
                                    </span>
                                </div>

                                {/* Evidence thumbnail if available */}
                                {c.evidence && (
                                    <img
                                        src={getEvidenceUrl(c)}
                                        alt="Evidence"
                                        style={styles.thumbnail}
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Case Detail Panel */}
                <div style={styles.detailPanel}>
                    {!selectedCase ? (
                        <div style={{ color: '#A0AEC0', textAlign: 'center', marginTop: '80px' }}>
                            <p style={{ fontSize: '40px' }}>📋</p>
                            <p>Select a case to view details</p>
                        </div>
                    ) : (
                        <div>
                            <h3 style={styles.detailTitle}>Case #{selectedCase._id.slice(-6).toUpperCase()}</h3>

                            <div style={styles.detailRow}>
                                <span style={styles.label}>Type:</span>
                                <span>{selectedCase.type}</span>
                            </div>
                            <div style={styles.detailRow}>
                                <span style={styles.label}>Status:</span>
                                <span style={{ color: getStatusColor(selectedCase.status).text, fontWeight: 'bold' }}>
                                    {selectedCase.status}
                                </span>
                            </div>
                            <div style={styles.detailRow}>
                                <span style={styles.label}>Filed by:</span>
                                <span>{selectedCase.email}</span>
                            </div>
                            <div style={{ ...styles.detailRow, flexDirection: 'column', alignItems: 'flex-start', gap: '5px' }}>
                                <span style={styles.label}>Description:</span>
                                <p style={{ margin: 0, color: '#4A5568', lineHeight: 1.6 }}>{selectedCase.description}</p>
                            </div>

                            {/* AI Analysis Results */}
                            {selectedCase.ai_analysis_result && (
                                <div style={styles.aiBox}>
                                    <h4 style={styles.aiTitle}>🤖 AI Analysis</h4>
                                    <div style={styles.detailRow}>
                                        <span style={styles.label}>Verdict:</span>
                                        <strong style={{ color: selectedCase.ai_analysis_result === 'Fake' ? '#C53030' : '#276749' }}>
                                            {selectedCase.ai_analysis_result === 'Fake' ? '⚠️ Deepfake Detected' : '✅ Authentic'}
                                        </strong>
                                    </div>
                                    <div style={styles.detailRow}>
                                        <span style={styles.label}>Confidence:</span>
                                        <strong>{((parseFloat(selectedCase.ai_confidence_score) || 0) * 100).toFixed(1)}%</strong>
                                    </div>
                                </div>
                            )}

                            {/* Evidence Section */}
                            {selectedCase.evidence && (
                                <div style={styles.evidenceSection}>
                                    <h4 style={styles.aiTitle}>🖼️ Evidence</h4>
                                    <img
                                        src={getEvidenceUrl(selectedCase)}
                                        alt="Submitted Evidence"
                                        style={styles.evidenceImage}
                                        onError={(e) => {
                                            e.target.replaceWith(Object.assign(document.createElement('p'), {
                                                textContent: '⚠️ Image unavailable (backend may be offline)',
                                                style: 'color: #A0AEC0; font-size: 13px;'
                                            }));
                                        }}
                                    />
                                </div>
                            )}
                            {!selectedCase.evidence && (
                                <p style={{ color: '#A0AEC0', fontSize: '13px', marginTop: '15px' }}>No evidence file attached.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', gap: '15px' },
    heading: { color: '#003366', margin: 0 },
    sub: { color: '#718096', margin: '5px 0 0', fontSize: '14px' },
    layout: { display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px', flex: 1, minHeight: 0 },
    listPanel: { display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', paddingRight: '5px' },
    caseRow: {
        background: 'white', padding: '15px', borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer',
        transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '10px'
    },
    caseId: { fontWeight: 'bold', color: '#2C5282', fontSize: '13px', fontFamily: 'monospace' },
    caseType: { fontSize: '15px', fontWeight: '600', color: '#2D3748', marginTop: '2px' },
    caseDesc: { fontSize: '12px', color: '#718096', marginTop: '4px' },
    badge: { padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap' },
    thumbnail: { width: '100%', maxHeight: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #E2E8F0' },
    detailPanel: { background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflowY: 'auto' },
    detailTitle: { color: '#003366', margin: '0 0 20px', fontFamily: 'monospace', fontSize: '20px' },
    detailRow: { display: 'flex', gap: '10px', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F7FAFC' },
    label: { fontWeight: 'bold', color: '#4A5568', minWidth: '100px', fontSize: '13px' },
    aiBox: { marginTop: '20px', background: '#EBF8FF', padding: '15px', borderRadius: '10px', border: '1px solid #90CDF4' },
    aiTitle: { margin: '0 0 12px', color: '#2B6CB0', fontSize: '14px' },
    evidenceSection: { marginTop: '20px' },
    evidenceImage: { width: '100%', borderRadius: '10px', marginTop: '10px', border: '2px solid #E2E8F0', maxHeight: '350px', objectFit: 'contain', background: '#F7FAFC' },
};

export default CaseList;
