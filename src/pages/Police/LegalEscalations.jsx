import React, { useState, useEffect } from 'react';

const LegalEscalations = () => {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [firModal, setFirModal] = useState({ open: false, caseId: null, data: null, error: null });

    const fetchLegalCases = async () => {
        try {
            const res = await fetch('/api/complaints');
            const data = await res.json();
            if (res.ok) {
                // Filter only cases requiring legal action
                const legalCases = data.filter(c =>
                    c.status === 'Legal Review' ||
                    c.status === 'Deepfake Verified'
                );
                // Sort oldest first (FIFO for legal queue)
                legalCases.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                setCases(legalCases);
            }
        } catch (err) {
            console.error("Failed to fetch legal cases", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLegalCases();
    }, []);

    const handleGenerateFIR = async (id) => {
        setActionLoading(id);
        try {
            const res = await fetch(`/api/complaints/${id}/fir`, { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                setFirModal({ open: true, caseId: id, data: data.fir, error: null });
            } else {
                alert("Failed to generate FIR: " + data.error);
            }
        } catch (err) {
            alert("Network error processing request.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleApproveFIR = async () => {
        if (!firModal.caseId) return;
        setActionLoading('approve');
        try {
            const res = await fetch(`/api/complaints/${firModal.caseId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Under Investigation', fir_report: firModal.data }) 
            });

            if (res.ok) {
                setCases(cases.filter(c => c._id !== firModal.caseId));
                setFirModal({ open: false, caseId: null, data: null, error: null });
                alert("✅ OFFICIAL FIR FILED.\n\nCase moved to Under Investigation.");
            } else {
                alert("Failed to file FIR.");
            }
        } catch (err) {
            alert("Network error processing request.");
        } finally {
            setActionLoading(null);
        }
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html><head><title>Official FIR Document</title>
            <style>
                body { font-family: 'Courier New', monospace; padding: 40px; line-height: 1.8; color: #1a202c; }
                h1 { color: #003366; border-bottom: 2px solid #003366; padding-bottom: 10px; }
                pre { white-space: pre-wrap; font-family: inherit; }
            </style></head>
            <body>
                <h1>⚖️ Official Cyber Police FIR</h1>
                <pre>${firModal.data}</pre>
                <div style="margin-top:40px; border-top:1px solid #ccc; font-size:12px; color:#666;">Generated via Judicial System • ${new Date().toLocaleString()}</div>
            </body></html>`);
        printWindow.document.close();
        printWindow.print();
    };

    const getRef = (c) => c.caseRef || `REF-${c._id.slice(-6).toUpperCase()}`;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.heading}>⚖️ Legal Escalations & Judicial Actions</h2>
                <p style={styles.subHeading}>Coordinate with judicial authorities, draft FIRs, and manage subpoenas for verified severe infractions.</p>
            </div>

            <div style={styles.statsRow}>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>{cases.length}</div>
                    <div style={styles.statLabel}>Pending Legal Approvals</div>
                </div>
                <div style={{ ...styles.statCard, background: '#F0FFF4', border: '1px solid #C6F6D5' }}>
                    <div style={{ ...styles.statValue, color: '#276749' }}>{cases.filter(c => c.type === 'Deepfake').length}</div>
                    <div style={{ ...styles.statLabel, color: '#2F855A' }}>High-Priority (Deepfakes)</div>
                </div>
            </div>

            <div style={styles.mainContent}>
                <h3 style={styles.sectionTitle}>Action Required Queue</h3>

                {loading ? (
                    <div style={styles.emptyState}>Loading legal queue...</div>
                ) : cases.length === 0 ? (
                    <div style={styles.emptyState}>
                        <span style={{ fontSize: '30px', display: 'block', marginBottom: '10px' }}>⚖️</span>
                        No cases currently pending judicial approval or FIR generation.
                    </div>
                ) : (
                    <div style={styles.grid}>
                        {cases.map(c => {
                            const date = new Date(c.createdAt).toLocaleDateString();
                            return (
                                <div key={c._id} style={styles.card}>
                                    <div style={styles.cardHeader}>
                                        <div style={styles.badgeWrapper}>
                                            <span style={{
                                                ...styles.badge,
                                                background: c.status === 'Deepfake Verified' ? '#FFF5F5' : '#EBF8FF',
                                                color: c.status === 'Deepfake Verified' ? '#C53030' : '#2B6CB0'
                                            }}>
                                                {c.status}
                                            </span>
                                            <span style={styles.date}>{date}</span>
                                        </div>
                                        <div style={styles.refId}>{getRef(c)}</div>
                                    </div>

                                    <div style={styles.cardBody}>
                                        <div style={styles.infoRow}>
                                            <span style={styles.label}>Offense Type:</span>
                                            <span style={styles.value}>{c.type}</span>
                                        </div>
                                        <div style={styles.infoRow}>
                                            <span style={styles.label}>Complainant:</span>
                                            <span style={styles.value}>{c.email}</span>
                                        </div>
                                        {c.ai_analysis_result && (
                                            <div style={styles.infoRow}>
                                                <span style={styles.label}>Forensic Verdict:</span>
                                                <span style={{ ...styles.value, color: '#C53030', fontWeight: 'bold' }}>
                                                    System Verified {c.ai_analysis_result}
                                                </span>
                                            </div>
                                        )}

                                        <div style={styles.descBox}>
                                            {c.description.length > 120 ? c.description.substring(0, 120) + '...' : c.description}
                                        </div>
                                    </div>

                                    <div style={styles.cardFooter}>
                                        <button
                                            style={actionLoading === c._id ? styles.btnDisabled : styles.btn}
                                            onClick={() => handleGenerateFIR(c._id)}
                                            disabled={actionLoading === c._id}
                                        >
                                            {actionLoading === c._id ? 'Generating Legal Docs...' : '📄 Generate FIR Request'}
                                        </button>
                                        <button style={styles.btnSecondary}>Request Subpoena</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal Overlay for FIR */}
            {firModal.open && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <div style={styles.modalHeader}>
                            <h3 style={{ margin: 0, color: '#003366' }}>📄 Review Prepared FIR</h3>
                            <button onClick={() => setFirModal({ open: false, caseId: null, data: null, error: null })} style={styles.closeBtn}>✕</button>
                        </div>
                        <div style={styles.modalBody}>
                            <div style={styles.reportToolbar}>
                                <button style={styles.printBtn} onClick={handlePrint}>🖨️ Print Document</button>
                            </div>
                            <pre style={styles.firText}>{firModal.data}</pre>
                        </div>
                        <div style={styles.modalFooter}>
                            <button style={styles.btnSecondary} onClick={() => setFirModal({ ...firModal, open: false })}>Cancel</button>
                            <button style={styles.btnApprove} onClick={handleApproveFIR} disabled={actionLoading === 'approve'}>
                                {actionLoading === 'approve' ? 'Filing...' : '✅ Approve & File FIR'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: { padding: '10px 0', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' },
    header: { padding: '0 10px' },
    heading: { color: '#003366', margin: '0 0 5px 0', fontSize: '24px', fontWeight: '800' },
    subHeading: { color: '#627D98', margin: 0, fontSize: '14px' },

    statsRow: { display: 'flex', gap: '15px', padding: '0 10px' },
    statCard: { background: 'white', padding: '15px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 2px 5px rgba(0,0,0,0.02)', flex: 1 },
    statValue: { fontSize: '24px', fontWeight: 'bold', color: '#2C5282' },
    statLabel: { fontSize: '12px', color: '#718096', marginTop: '2px', fontWeight: '600', textTransform: 'uppercase' },

    mainContent: { flex: 1, background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #EDF2F7', display: 'flex', flexDirection: 'column', overflowY: 'auto' },
    sectionTitle: { margin: '0 0 15px 0', fontSize: '18px', color: '#2D3748', borderBottom: '2px solid #EDF2F7', paddingBottom: '10px' },

    emptyState: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#A0AEC0', fontStyle: 'italic', background: '#F7FAFC', borderRadius: '12px', border: '2px dashed #E2E8F0', padding: '40px' },

    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' },

    card: { border: '1px solid #E2E8F0', borderRadius: '12px', background: '#FFFFFF', transition: 'transform 0.2s, box-shadow 0.2s', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    cardHeader: { padding: '15px', background: '#F7FAFC', borderBottom: '1px solid #E2E8F0' },
    badgeWrapper: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
    badge: { padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' },
    date: { fontSize: '12px', color: '#A0AEC0', fontWeight: 'bold' },
    refId: { fontSize: '16px', fontWeight: 'bold', color: '#1A365D', fontFamily: 'monospace' },

    cardBody: { padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 },
    infoRow: { display: 'flex', gap: '10px', fontSize: '13px' },
    label: { color: '#718096', width: '120px', fontWeight: '600' },
    value: { color: '#2D3748', flex: 1 },
    descBox: { marginTop: '5px', padding: '10px', background: '#EDF2F7', borderRadius: '8px', fontSize: '12px', color: '#4A5568', fontStyle: 'italic', lineHeight: '1.5' },

    cardFooter: { padding: '15px', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '10px' },
    btn: { flex: 2, padding: '10px', background: '#003366', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', transition: 'background 0.2s' },
    btnDisabled: { flex: 2, padding: '10px', background: '#CBD5E0', color: 'white', border: 'none', borderRadius: '8px', cursor: 'wait', fontWeight: 'bold', fontSize: '13px' },
    btnSecondary: { flex: 1, padding: '10px', background: 'transparent', color: '#4A5568', border: '1px solid #CBD5E0', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', transition: 'all 0.2s' },

    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalContent: { background: 'white', width: '800px', maxWidth: '90%', maxHeight: '90vh', borderRadius: '12px', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' },
    modalHeader: { padding: '20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    closeBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#718096' },
    modalBody: { padding: '20px', overflowY: 'auto', flex: 1, background: '#F7FAFC' },
    reportToolbar: { display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' },
    printBtn: { padding: '8px 15px', background: '#2D3748', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' },
    firText: { fontFamily: '"Courier New", monospace', fontSize: '14px', lineHeight: 1.6, color: '#1A202C', whiteSpace: 'pre-wrap', background: 'white', padding: '30px', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 2px 5px rgba(0,0,0,0.02)', margin: 0 },
    modalFooter: { padding: '20px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '15px' },
    btnApprove: { padding: '10px 20px', background: '#276749', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }
};

export default LegalEscalations;
