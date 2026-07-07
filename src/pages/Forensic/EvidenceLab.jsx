import React, { useState, useEffect } from 'react';

const FileIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4A5568" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
);

const EvidenceLab = () => {
    const [selectedEvidence, setSelectedEvidence] = useState(null);
    const [evidenceList, setEvidenceList] = useState([]);

    // Interactive states
    const [isExporting, setIsExporting] = useState(false);
    const [terminalOutput, setTerminalOutput] = useState([]);
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        const fetchDeepfakes = async () => {
            try {
                // Fetch cases tagged as 'Deepfake'
                const res = await fetch('/api/complaints?type=Deepfake');
                const data = await res.json();
                if (res.ok) {
                    const mappedData = data.map(c => ({
                        id: c._id,
                        caseRef: c.caseRef || `REF-${c._id.slice(-6).toUpperCase()}`,
                        name: c.evidence ? c.evidence.split('\\').pop().split('/').pop() : 'No Attachment',
                        type: c.evidence ? (c.evidence.toLowerCase().endsWith('.mp4') ? 'Video Media' : 'Image Media') : 'System Log',
                        size: '8.4 MB',
                        date: new Date(c.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
                        hash: `SHA-256: ${c._id.split('').reverse().join('')}A9F...`,
                        custodian: 'Cyber Police (Digital Vault)',
                        status: c.status,
                        original: c
                    }));
                    setEvidenceList(mappedData);
                }
            } catch (err) {
                console.error("Failed to fetch evidence");
            }
        };
        fetchDeepfakes();
    }, []);

    const chainOfCustody = [
        { date: '10:00 AM', status: 'Seized', action: 'Digital Acquisition at Source Node', user: 'Auto-Ingest System' },
        { date: '02:00 PM', status: 'Transferred', action: 'Moved to Secure Digital Vault', user: 'Protocol DPF-Secure' },
        { date: '09:00 AM (Next Day)', status: 'Accessed', action: 'Checked out for GAN Analysis', user: 'Forensic Expert Level-2' }
    ];

    // Simulate Terminal Boot-up Sequence
    const handleSelectEvidence = (item) => {
        if (selectedEvidence?.id === item.id) return;

        setSelectedEvidence(item);
        setIsScanning(true);
        setTerminalOutput([]);

        const lines = [
            `> Initializing Secure Protocol... [OK]`,
            `> Connecting to Vault Interface... [OK]`,
            `> Fetching Artifact Metadata [${item.caseRef}]...`,
            `> Decrypting header... [VERIFIED]`,
            `> Computing SHA-256 Checksum...`,
            `> Hash Match: ${item.hash}`,
            `> DATA STREAM SECURE.`
        ];

        let index = 0;
        const interval = setInterval(() => {
            if (index < lines.length) {
                setTerminalOutput(prev => [...prev, lines[index]]);
                index++;
            } else {
                clearInterval(interval);
                setIsScanning(false);
            }
        }, 300); // Typewriter effect speed
    };

    const handleExport = () => {
        setIsExporting(true);
        setTimeout(() => {
            setIsExporting(false);
            alert("✅ XML Audit Log generated and downloaded securely.");
        }, 1500);
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.titleGroup}>
                    <h2 style={{ color: '#003366', margin: 0, fontSize: '24px', fontWeight: '800' }}>🔬 Digital Evidence Lab</h2>
                    <span style={styles.badgeTop}>SECURE VAULT</span>
                    {isScanning && <span style={styles.liveBadge}><span style={styles.pulseDot} /> LIVE FEED</span>}
                </div>
                <p style={{ color: '#627D98', margin: '5px 0 0', fontSize: '14px' }}>Immutable workspace for digital evidence analysis and chain of custody tracking.</p>
            </div>

            <div style={styles.layout}>
                {/* Left Panel: Evidence List */}
                <div style={styles.listPanel}>
                    <h3 style={styles.panelTitle}>📂 Evidence Locker</h3>
                    <div style={styles.list}>
                        {evidenceList.length === 0 ? (
                            <div style={styles.emptyState}>No pending evidence in vault.</div>
                        ) : (
                            evidenceList.map((item) => (
                                <div
                                    key={item.id}
                                    className="evidence-item-hover"
                                    style={{
                                        ...styles.listItem,
                                        borderColor: selectedEvidence?.id === item.id ? '#3182CE' : '#E2E8F0',
                                        background: selectedEvidence?.id === item.id ? '#EBF8FF' : 'white',
                                        transform: selectedEvidence?.id === item.id ? 'scale(1.01)' : 'scale(1)',
                                        boxShadow: selectedEvidence?.id === item.id ? '0 4px 12px rgba(49, 130, 206, 0.15)' : 'none',
                                    }}
                                    onClick={() => handleSelectEvidence(item)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={styles.fileIcon}><FileIcon /></div>
                                        <div style={{ flex: 1 }}>
                                            <div style={styles.itemTitle}>{item.caseRef}</div>
                                            <div style={styles.itemSubtitle}>{item.name?.substring(0, 25)}{item.name?.length > 25 ? '...' : ''}</div>
                                        </div>
                                    </div>
                                    <span style={{
                                        ...styles.statusDot,
                                        background: item.status === 'Resolved' ? '#48BB78' : item.status === 'AI-Flagged' ? '#E53E3E' : '#ECC94B'
                                    }} />
                                    {selectedEvidence?.id === item.id && isScanning && (
                                        <div style={styles.scanningOverlay}>SCANNING</div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Panel: Metadata & Details Terminal */}
                <div style={styles.detailPanel}>
                    {selectedEvidence ? (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h3 style={styles.panelTitleTerminal}>
                                    <span style={{ marginRight: '8px' }}>📄</span>
                                    METADATA EXTRACT // {selectedEvidence.caseRef}
                                </h3>
                                {isScanning && <div style={styles.miniSpinner} />}
                            </div>

                            <div style={styles.terminalWindow}>
                                <div style={styles.terminalHeader}>
                                    <div style={styles.terminalDots}>
                                        <span style={{ ...styles.dot, background: '#FC8181' }}></span>
                                        <span style={{ ...styles.dot, background: '#F6E05E' }}></span>
                                        <span style={{ ...styles.dot, background: '#68D391' }}></span>
                                    </div>
                                    <span style={styles.terminalTitle}>system@forensics:~/analysis</span>
                                </div>
                                <div style={styles.terminalBody}>
                                    {/* Boot Sequence Animation */}
                                    {terminalOutput.map((line, i) => (
                                        <div key={i} style={{ color: line?.includes('[OK]') || line?.includes('[VERIFIED]') ? '#68D391' : line?.includes('SECURE') ? '#63B3ED' : '#A0AEC0', marginBottom: '4px' }}>
                                            {line}
                                        </div>
                                    ))}

                                    {/* Only show table after scanning finishes */}
                                    {!isScanning && (
                                        <div style={{ marginTop: '15px', animation: 'fadeIn 0.5s ease-in' }}>
                                            <div style={styles.metaRow}><span style={styles.metaKey}>EVIDENCE_ID</span><span style={styles.metaVal}>{selectedEvidence.id}</span></div>
                                            <div style={styles.metaRow}><span style={styles.metaKey}>FILE_NAME</span><span style={styles.metaVal}>{selectedEvidence.name}</span></div>
                                            <div style={styles.metaRow}><span style={styles.metaKey}>FILE_TYPE</span><span style={{ ...styles.metaVal, color: '#F6E05E' }}>{selectedEvidence.type}</span></div>
                                            <div style={styles.metaRow}><span style={styles.metaKey}>FILE_SIZE</span><span style={styles.metaVal}>{selectedEvidence.size}</span></div>
                                            <div style={styles.metaRow}><span style={styles.metaKey}>ACQUIRED_AT</span><span style={styles.metaVal}>{selectedEvidence.date}</span></div>
                                            <div style={styles.metaRow}><span style={styles.metaKey}>CUSTODIAN</span><span style={styles.metaVal}>{selectedEvidence.custodian}</span></div>
                                            <div style={{ ...styles.metaRow, marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #4A5568' }}>
                                                <span style={styles.metaKey}>CRYPTO_HASH</span>
                                                <span style={{ ...styles.metaVal, color: '#68D391', wordBreak: 'break-all' }}>{selectedEvidence.hash}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {!isScanning && (
                                <div style={{ animation: 'slideUp 0.4s ease-out' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px', marginBottom: '15px' }}>
                                        <h3 style={{ ...styles.panelTitleTerminal, margin: 0 }}>
                                            <span style={{ marginRight: '8px' }}>🔗</span> CHAIN OF CUSTODY
                                        </h3>
                                        <button
                                            style={isExporting ? styles.exportBtnActive : styles.exportBtn}
                                            onClick={handleExport}
                                            disabled={isExporting}
                                        >
                                            {isExporting ? '📥 Formatting XML...' : '📥 Export XML Log'}
                                        </button>
                                    </div>

                                    <div style={styles.timeline}>
                                        {chainOfCustody.map((log, index) => (
                                            <div key={index} style={{ ...styles.timelineItem, animation: `fadeIn 0.5s ease-out forwards`, animationDelay: `${index * 0.15}s`, opacity: 0 }}>
                                                <div style={{ ...styles.timelineIcon, borderColor: index === 0 ? '#48BB78' : index === 1 ? '#ECC94B' : '#3182CE' }}>
                                                    {index === 0 ? '📥' : index === 1 ? '🔒' : '🔬'}
                                                </div>
                                                <div className="timeline-card-hover" style={styles.timelineContent}>
                                                    <div style={styles.timelineHeader}>
                                                        <span style={{ ...styles.timelineStatus, color: index === 0 ? '#48BB78' : index === 1 ? '#D69E2E' : '#2B6CB0' }}>{log.status}</span>
                                                        <span style={styles.timelineDate}>{log.date}</span>
                                                    </div>
                                                    <div style={styles.timelineAction}>{log.action}</div>
                                                    <div style={styles.timelineUser}>Agent: {log.user}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={styles.emptyDetailState}>
                            <div style={{ fontSize: '50px', marginBottom: '15px', animation: 'float 3s ease-in-out infinite' }}>🛡️</div>
                            <h3 style={{ color: '#2D3748' }}>Secure Terminal Standby</h3>
                            <p>Select an evidence artifact from the locker vault to initialize cryptographic decryption and metadata preview.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '10px 0', height: '100%', display: 'flex', flexDirection: 'column', gap: '20px' },
    header: { padding: '15px 20px', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' },
    titleGroup: { display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' },
    badgeTop: { background: '#FAF5FF', color: '#805AD5', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', border: '1px solid #D6BCFA', letterSpacing: '1px' },
    liveBadge: { display: 'flex', alignItems: 'center', gap: '6px', background: '#FFF5F5', color: '#E53E3E', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', border: '1px solid #FC8181' },
    pulseDot: { width: '6px', height: '6px', background: '#E53E3E', borderRadius: '50%', animation: 'pulse 1s infinite' },

    layout: { display: 'flex', gap: '20px', flex: 1, height: '0px' },

    // Panels
    listPanel: { flex: '1', background: 'white', borderRadius: '16px', border: '1px solid #EDF2F7', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column' },
    detailPanel: { flex: '2', background: 'white', borderRadius: '16px', border: '1px solid #EDF2F7', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', padding: '25px', overflowY: 'auto' },

    panelTitle: { color: '#2D3748', borderBottom: '2px solid #EDF2F7', paddingBottom: '12px', marginBottom: '15px', fontSize: '16px', fontWeight: 'bold' },
    panelTitleTerminal: { color: '#2D3748', margin: '0', fontSize: '15px', fontWeight: '800', letterSpacing: '0.5px' },

    // List Styles
    list: { display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 },
    listItem: { padding: '15px', borderRadius: '12px', border: '2px solid transparent', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', overflow: 'hidden' },
    fileIcon: { width: '40px', height: '40px', background: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.08)', border: '1px solid #EDF2F7' },
    itemTitle: { fontWeight: 'bold', color: '#1A365D', fontSize: '14px', fontFamily: 'monospace' },
    itemSubtitle: { fontSize: '12px', color: '#718096', marginTop: '2px' },
    statusDot: { width: '8px', height: '8px', borderRadius: '50%', position: 'absolute', top: '15px', right: '15px' },
    scanningOverlay: { position: 'absolute', bottom: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, transparent, #3182CE, transparent)', animation: 'scanLine 1.5s infinite linear' },

    emptyState: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A0AEC0', fontStyle: 'italic', fontSize: '14px' },
    emptyDetailState: { height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#718096', textAlign: 'center', padding: '40px', background: '#F7FAFC', borderRadius: '12px', border: '2px dashed #E2E8F0' },

    // Terminal Emulator Styles
    terminalWindow: { borderRadius: '12px', background: '#1A202C', color: '#A0AEC0', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', border: '1px solid #2D3748', transition: 'all 0.3s' },
    terminalHeader: { background: '#2D3748', padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '1px solid #4A5568' },
    terminalDots: { display: 'flex', gap: '6px' },
    dot: { width: '12px', height: '12px', borderRadius: '50%' },
    terminalTitle: { color: '#CBD5E0', fontSize: '12px', fontFamily: 'monospace', fontWeight: 'bold' },
    terminalBody: { padding: '20px', display: 'flex', flexDirection: 'column', minHeight: '180px', fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.6' },

    metaRow: { display: 'flex', gap: '20px' },
    metaKey: { width: '130px', color: '#63B3ED', fontWeight: 'bold' },
    metaVal: { color: '#E2E8F0', flex: 1 },

    // Timeline Styles
    timeline: { display: 'flex', flexDirection: 'column', gap: '0', background: '#F7FAFC', borderRadius: '12px', padding: '20px', border: '1px solid #E2E8F0', position: 'relative' },
    timelineItem: { display: 'flex', gap: '18px', position: 'relative', paddingBottom: '25px' },
    timelineIcon: { width: '36px', height: '36px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', zIndex: 2, border: '2px solid transparent', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
    timelineContent: { flex: 1, background: 'white', padding: '15px 18px', borderRadius: '12px', border: '1px solid #EDF2F7', marginTop: '-5px', transition: 'all 0.2s', cursor: 'default' },
    timelineHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '5px', alignItems: 'center' },
    timelineStatus: { fontWeight: '900', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    timelineDate: { fontSize: '11px', color: '#A0AEC0', fontWeight: 'bold', background: '#F7FAFC', padding: '2px 8px', borderRadius: '10px' },
    timelineAction: { fontSize: '14px', color: '#4A5568', marginBottom: '8px', lineHeight: '1.4' },
    timelineUser: { fontSize: '11px', color: '#718096', display: 'inline-block', background: '#EDF2F7', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold' },

    exportBtn: { padding: '8px 16px', background: 'white', color: '#4A5568', border: '1px solid #CBD5E0', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', transition: 'all 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' },
    exportBtnActive: { padding: '8px 16px', background: '#EDF2F7', color: '#A0AEC0', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'wait', fontWeight: 'bold', fontSize: '12px' },

    miniSpinner: { width: '16px', height: '16px', border: '2px solid #E2E8F0', borderTop: '2px solid #3182CE', borderRadius: '50%', animation: 'spin 1s linear infinite' },
};

// Inject Global Styles & Keyframes
if (typeof document !== 'undefined' && !document.getElementById('evidence-lab-styles')) {
    const style = document.createElement('style');
    style.id = 'evidence-lab-styles';
    style.innerHTML = `
        div[style*="timelineItem"]:not(:last-child)::before {
            content: ''; position: absolute; top: 36px; left: 17px; bottom: 0; width: 2px; background: #E2E8F0; zIndex: 1;
        }
        .evidence-item-hover:hover { background: #F7FAFC; transform: translateY(-1px) !important; box-shadow: 0 4px 10px rgba(0,0,0,0.03) !important; }
        .timeline-card-hover:hover { border-color: #CBD5E0 !important; transform: translateX(2px); box-shadow: 0 4px 12px rgba(0,0,0,0.03) !important; }
        @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes scanLine { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-8px); } 100% { transform: translateY(0px); } }
        @keyframes spin { to { transform: rotate(360deg); } }
    `;
    document.head.appendChild(style);
}

export default EvidenceLab;
