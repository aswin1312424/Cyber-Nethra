import React, { useState, useEffect } from 'react';

const CoordinationHub = () => {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeWing, setActiveWing] = useState('pipeline');

    useEffect(() => {
        fetch('/api/complaints')
            .then(r => r.json())
            .then(data => {
                setCases(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const getRef = (c) => c.caseRef || `REF-${c._id.slice(-6).toUpperCase()}`;

    // Data Segregation
    const wings = {
        pipeline: {
            id: 'pipeline',
            name: 'Master Pipeline',
            icon: '🔄',
            desc: 'End-to-end investigation lifecycle tracking',
            color: '#6366F1'
        },
        forensic: {
            id: 'forensic',
            name: 'Forensic Lab',
            icon: '🔬',
            desc: 'Digital media analysis & deepfake verification',
            color: '#8B5CF6',
            filter: (c) => ['AI-Flagged', 'Evidence Analysis'].includes(c.status) && c.type === 'Deepfake'
        },
        financial: {
            id: 'financial',
            name: 'Financial Wing',
            icon: '💳',
            desc: 'Money trail tracing & fraud coordination',
            color: '#06B6D4',
            filter: (c) => ['Pending', 'Under Investigation'].includes(c.status) && c.type === 'Fraud'
        },
        legal: {
            id: 'legal',
            name: 'Legal Escalation',
            icon: '⚖️',
            desc: 'Prosecution readiness & legal review cases',
            color: '#F59E0B',
            filter: (c) => c.status === 'Legal Review'
        }
    };

    if (loading) return (
        <div style={styles.loader}>
            <div style={styles.spinner} />
            <p>Syncing coordination nodes...</p>
        </div>
    );

    return (
        <div style={styles.wrapper}>
            {/* Header with Glassmorphism */}
            <header style={styles.hero}>
                <div style={styles.heroContent}>
                    <h1 style={styles.title}>Coordination Center</h1>
                    <p style={styles.subtitle}>Unified inter-departmental operations and case handoffs</p>
                </div>
                <div style={styles.livePulse}>
                    <div style={styles.pulseDot} />
                    <span>Live Operations Active</span>
                </div>
            </header>

            <div style={styles.mainLayout}>
                {/* Navigation Sidebar */}
                <nav style={styles.navSide}>
                    {Object.values(wings).map(wing => {
                        const count = wing.id === 'pipeline' ? cases.length : cases.filter(wing.filter).length;
                        return (
                            <button
                                key={wing.id}
                                onClick={() => setActiveWing(wing.id)}
                                style={{
                                    ...styles.navItem,
                                    background: activeWing === wing.id ? 'white' : 'transparent',
                                    boxShadow: activeWing === wing.id ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                                    color: activeWing === wing.id ? wing.color : '#64748B'
                                }}
                            >
                                <span style={styles.navIcon}>{wing.icon}</span>
                                <div style={styles.navText}>
                                    <span style={styles.navName}>{wing.name}</span>
                                    <span style={styles.navDesc}>{wing.desc}</span>
                                </div>
                                {count > 0 && (
                                    <span style={{ ...styles.navCounter, background: wing.color }}>{count}</span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Content Area */}
                <section style={styles.contentArea}>
                    {activeWing === 'pipeline' ? (
                        <div style={styles.pipelineView}>
                            <div style={styles.sectionHeader}>
                                <h2>Investigation Lifecycle</h2>
                                <p>Cases grouped by current operation status</p>
                            </div>
                            <div style={styles.stageGrid}>
                                {[
                                    { s: 'Pending', name: 'Open', color: '#64748B' },
                                    { s: 'AI-Flagged', name: 'AI Alert', color: '#EF4444' },
                                    { s: 'Evidence Analysis', name: 'Analysis', color: '#8B5CF6' },
                                    { s: 'Under Investigation', name: 'Active', color: '#3B82F6' },
                                    { s: 'Legal Review', name: 'Legal', color: '#F59E0B' },
                                    { s: 'Resolved', name: 'Closed', color: '#10B981' }
                                ].map(stage => {
                                    const stageCases = cases.filter(c => c.status === stage.s);
                                    return (
                                        <div key={stage.s} style={styles.stageColumn}>
                                            <div style={{ ...styles.stageLabel, color: stage.color }}>
                                                {stage.name} <span>({stageCases.length})</span>
                                            </div>
                                            <div style={styles.stageList}>
                                                {stageCases.map(c => (
                                                    <div key={c._id} style={styles.miniCard}>
                                                        <span style={styles.miniRef}>{getRef(c)}</span>
                                                        <span style={styles.miniType}>{c.type}</span>
                                                    </div>
                                                ))}
                                                {stageCases.length === 0 && <div style={styles.emptyMini}>No cases</div>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div style={styles.wingDetailView}>
                            <div style={styles.sectionHeader}>
                                <h2 style={{ color: wings[activeWing].color }}>{wings[activeWing].name} Queue</h2>
                                <p>{wings[activeWing].desc}</p>
                            </div>
                            <div style={styles.cardList}>
                                {cases.filter(wings[activeWing].filter).length === 0 ? (
                                    <div style={styles.fullEmpty}>
                                        <p style={{ fontSize: '48px' }}>✨</p>
                                        <h3>Queue is Empty</h3>
                                        <p>No cases are currently waiting for {wings[activeWing].name} intervention.</p>
                                    </div>
                                ) : (
                                    cases.filter(wings[activeWing].filter).map(c => (
                                        <div key={c._id} style={styles.premiumCard}>
                                            <div style={styles.cardHeader}>
                                                <div style={styles.cardRefGroup}>
                                                    <span style={styles.cardRef}>{getRef(c)}</span>
                                                    <span style={styles.cardTypeBadge}>{c.type}</span>
                                                </div>
                                                <span style={{ ...styles.statusPill, color: wings[activeWing].color, background: `${wings[activeWing].color}10` }}>
                                                    {c.status}
                                                </span>
                                            </div>
                                            <p style={styles.cardDescription}>{c.description}</p>
                                            <div style={styles.cardFooter}>
                                                <div style={styles.metaRow}>
                                                    <span style={styles.metaItem}>👤 {c.email}</span>
                                                    <span style={styles.metaItem}>📅 {new Date(c.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <button style={{ ...styles.actionBtn, background: wings[activeWing].color }}>
                                                    Access Case Files
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

// --- Premium Styles ---
const styles = {
    wrapper: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#F8FAFC',
        gap: '20px'
    },
    hero: {
        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
        padding: '30px 40px',
        borderRadius: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'white',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
    },
    title: { fontSize: '28px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' },
    subtitle: { fontSize: '14px', opacity: 0.7, margin: '5px 0 0' },
    livePulse: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: 'rgba(255,255,255,0.1)',
        padding: '8px 15px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 'bold',
        backdropFilter: 'blur(10px)'
    },
    pulseDot: {
        width: '8px',
        height: '8px',
        backgroundColor: '#10B981',
        borderRadius: '50%',
        boxShadow: '0 0 0 rgba(16, 185, 129, 0.4)',
        animation: 'pulse 2s infinite'
    },
    mainLayout: {
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        gap: '24px',
        flex: 1,
        minHeight: 0
    },
    navSide: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    navItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        padding: '20px',
        borderRadius: '12px',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative'
    },
    navIcon: { fontSize: '24px' },
    navText: { display: 'flex', flexDirection: 'column', gap: '2px' },
    navName: { fontWeight: '700', fontSize: '15px' },
    navDesc: { fontSize: '11px', opacity: 0.8 },
    navCounter: {
        marginLeft: 'auto',
        color: 'white',
        padding: '2px 8px',
        borderRadius: '8px',
        fontSize: '11px',
        fontWeight: 'bold'
    },
    contentArea: {
        background: 'white',
        borderRadius: '16px',
        padding: '30px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
        overflowY: 'auto'
    },
    sectionHeader: { marginBottom: '25px' },
    pipelineView: { height: '100%', display: 'flex', flexDirection: 'column' },
    stageGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '15px',
        flex: 1
    },
    stageColumn: {
        background: '#F1F5F9',
        borderRadius: '12px',
        padding: '15px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    stageLabel: { fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' },
    stageList: { display: 'flex', flexDirection: 'column', gap: '8px' },
    miniCard: {
        background: 'white',
        padding: '10px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column'
    },
    miniRef: { fontSize: '12px', fontWeight: 'bold', fontFamily: 'monospace' },
    miniType: { fontSize: '10px', color: '#64748B' },
    emptyMini: { textAlign: 'center', fontSize: '11px', color: '#94A3B8', padding: '10px' },

    wingDetailView: { display: 'flex', flexDirection: 'column', gap: '20px' },
    cardList: { display: 'flex', flexDirection: 'column', gap: '15px' },
    premiumCard: {
        background: 'white',
        border: '1px solid #E2E8F0',
        borderRadius: '15px',
        padding: '20px',
        transition: 'all 0.3s ease',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 10px 15px rgba(0,0,0,0.05)' }
    },
    cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px' },
    cardRefGroup: { display: 'flex', alignItems: 'center', gap: '10px' },
    cardRef: { fontSize: '16px', fontWeight: '800', fontFamily: 'monospace', color: '#1E293B' },
    cardTypeBadge: { background: '#F1F5F9', color: '#475569', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' },
    statusPill: { padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' },
    cardDescription: { fontSize: '14px', color: '#475569', lineHeight: 1.6, margin: '0 0 20px' },
    cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '15px' },
    metaRow: { display: 'flex', gap: '20px' },
    metaItem: { fontSize: '12px', color: '#94A3B8' },
    actionBtn: { border: 'none', color: 'white', padding: '10px 20px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', transition: 'filter 0.2s' },

    fullEmpty: { textAlign: 'center', padding: '60px 20px', color: '#94A3B8' },
    loader: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '15px' },
    spinner: { width: '40px', height: '40px', border: '3px solid #E2E8F0', borderTop: '3px solid #6366F1', borderRadius: '50%', animation: 'spin 1s linear infinite' }
};

export default CoordinationHub;
