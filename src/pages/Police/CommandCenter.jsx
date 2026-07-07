import React, { useState, useEffect } from 'react';
import CrimeMap from './CrimeMap';

const CommandCenter = () => {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/complaints')
            .then(r => r.json())
            .then(data => { setCases(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    // --- Derived Stats ---
    const total = cases.length;
    const resolved = cases.filter(c => c.status === 'Resolved').length;
    const active = total - resolved;
    const flaggedCases = cases.filter(c => c.status === 'AI-Flagged');
    const critical = cases.filter(c => c.type === 'Deepfake' || c.type === 'Hacking').length;

    // Today's cases
    const today = new Date().toDateString();
    const todayCases = cases.filter(c => new Date(c.createdAt).toDateString() === today);

    // Recent 5 cases
    const recent = [...cases]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    // Crime type breakdown
    const typeCounts = ['Deepfake', 'Fraud', 'Harassment', 'Hacking', 'IdentityTheft'].map(type => ({
        type, count: cases.filter(c => c.type === type).length
    })).sort((a, b) => b.count - a.count);

    // Repeat complainants (same email, multiple complaints)
    const emailMap = {};
    cases.forEach(c => { emailMap[c.email] = (emailMap[c.email] || 0) + 1; });
    const repeatComplainants = Object.entries(emailMap)
        .filter(([, count]) => count > 1)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    const getRef = (c) => c.caseRef || `REF-${c._id.slice(-6).toUpperCase()}`;

    const STATUS_COLOR = {
        'Pending': '#D69E2E', 'AI-Flagged': '#E53E3E',
        'Under Investigation': '#3182CE', 'Evidence Analysis': '#805AD5',
        'Legal Review': '#38A169', 'Resolved': '#38A169', 'Deepfake Verified': '#3182CE'
    };

    return (
        <div style={st.container}>
            {/* Header */}
            <div style={st.topRow}>
                <div>
                    <h2 style={st.heading}>🏛️ Command Center</h2>
                    <p style={st.sub}>Real-time overview of all cyber cases · Last refreshed: {new Date().toLocaleTimeString()}</p>
                </div>
                {todayCases.length > 0 && (
                    <div style={st.todayBadge}>
                        📅 <strong>{todayCases.length}</strong> new case{todayCases.length > 1 ? 's' : ''} today
                    </div>
                )}
            </div>

            {/* Stats Row */}
            <div style={st.statsGrid}>
                <StatCard icon="📁" label="Total Cases" value={loading ? '…' : total} color="#3182CE" />
                <StatCard icon="🔍" label="Active" value={loading ? '…' : active} color="#D69E2E" />
                <StatCard icon="⚠️" label="Critical" value={loading ? '…' : critical} color="#E53E3E" />
                <StatCard icon="✅" label="Resolved" value={loading ? '…' : resolved} color="#38A169" />
                <StatCard icon="🚨" label="AI Flagged" value={loading ? '…' : flaggedCases.length} color="#C53030" alert={flaggedCases.length > 0} />
            </div>

            {/* AI Flagged Alerts - Real Cases */}
            {flaggedCases.length > 0 && (
                <div style={st.alertSection}>
                    <div style={st.alertHeader}>
                        <span style={st.alertTitle}>🚨 AI-Flagged High Priority Cases</span>
                        <span style={st.alertCount}>{flaggedCases.length} require immediate triage</span>
                    </div>
                    <div style={st.alertList}>
                        {flaggedCases.slice(0, 4).map(c => (
                            <div key={c._id} style={st.alertItem}>
                                <div style={st.alertLeft}>
                                    <span style={st.alertRef}>{getRef(c)}</span>
                                    <span style={st.alertType}>{c.type}</span>
                                </div>
                                <div style={st.alertMid}>
                                    <span style={st.alertEmail}>{c.email}</span>
                                    <span style={st.alertDesc}>{c.description?.slice(0, 60)}…</span>
                                </div>
                                <div style={st.alertConf}>
                                    {c.ai_confidence_score
                                        ? <span style={st.confBadge}>{((parseFloat(c.ai_confidence_score) || 0) * 100).toFixed(1)}% confidence</span>
                                        : <span style={st.confBadge}>AI Flagged</span>
                                    }
                                </div>
                            </div>
                        ))}
                        {flaggedCases.length > 4 && (
                            <p style={{ margin: 0, fontSize: '12px', color: '#C53030', paddingLeft: '8px' }}>
                                +{flaggedCases.length - 4} more flagged cases in Assigned Cases
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Map + Insights Grid */}
            <div style={st.contentGrid}>
                {/* Crime Map */}
                <div style={st.mapSection}>
                    <CrimeMap />
                </div>

                {/* Right Panel: Insights */}
                <div style={st.insightsPanel}>

                    {/* Crime Type Breakdown */}
                    <div style={st.insightCard}>
                        <h4 style={st.insightTitle}>📊 Case Type Breakdown</h4>
                        {typeCounts.map(({ type, count }) => {
                            const pct = total ? Math.round((count / total) * 100) : 0;
                            return (
                                <div key={type} style={st.barRow}>
                                    <span style={st.barLabel}>{type}</span>
                                    <div style={st.barOuter}>
                                        <div style={{ ...st.barInner, width: `${pct}%` }} />
                                    </div>
                                    <span style={st.barCount}>{count}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Recent Activity */}
                    <div style={st.insightCard}>
                        <h4 style={st.insightTitle}>🕐 Recent Cases</h4>
                        {loading && <p style={{ color: '#A0AEC0', fontSize: '13px' }}>Loading...</p>}
                        {recent.map(c => {
                            const color = STATUS_COLOR[c.status] || '#718096';
                            return (
                                <div key={c._id} style={st.recentRow}>
                                    <div style={st.recentLeft}>
                                        <span style={st.recentRef}>{getRef(c)}</span>
                                        <span style={st.recentType}>{c.type}</span>
                                    </div>
                                    <span style={{ ...st.recentBadge, background: `${color}18`, color, border: `1px solid ${color}40` }}>
                                        {c.status}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Repeat Complainants */}
                    {repeatComplainants.length > 0 && (
                        <div style={st.insightCard}>
                            <h4 style={st.insightTitle}>🔁 Repeat Complainants</h4>
                            <p style={st.insightSub}>Same email filed multiple complaints</p>
                            {repeatComplainants.map(([email, count]) => (
                                <div key={email} style={st.repeatRow}>
                                    <span style={st.repeatEmail}>{email}</span>
                                    <span style={st.repeatCount}>{count} cases</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Sub-component ---
const StatCard = ({ icon, label, value, color, alert }) => (
    <div style={{ ...st.statCard, borderTop: `3px solid ${color}`, animation: alert ? 'pulse 2s infinite' : 'none' }}>
        <span style={{ fontSize: '22px' }}>{icon}</span>
        <p style={{ ...st.statValue, color }}>{value}</p>
        <h4 style={st.statLabel}>{label}</h4>
    </div>
);

// --- Styles ---
const st = {
    container: { padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: '16px' },

    topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' },
    heading: { color: '#003366', margin: 0, fontSize: '20px' },
    sub: { color: '#718096', margin: '4px 0 0', fontSize: '12px' },
    todayBadge: { background: '#EBF8FF', color: '#2B6CB0', border: '1px solid #BEE3F8', borderRadius: '10px', padding: '8px 16px', fontSize: '13px' },

    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' },
    statCard: { background: 'white', padding: '14px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
    statValue: { fontSize: '28px', fontWeight: 'bold', margin: 0 },
    statLabel: { fontSize: '11px', color: '#718096', margin: 0, fontWeight: '600' },

    alertSection: { background: '#FFF5F5', border: '1px solid #FC8181', borderRadius: '12px', padding: '14px 16px' },
    alertHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
    alertTitle: { color: '#C53030', fontWeight: 'bold', fontSize: '14px' },
    alertCount: { color: '#C53030', fontSize: '12px' },
    alertList: { display: 'flex', flexDirection: 'column', gap: '8px' },
    alertItem: { background: 'white', padding: '10px 12px', borderRadius: '8px', border: '1px solid #FED7D7', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
    alertLeft: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '90px' },
    alertRef: { fontFamily: 'monospace', fontWeight: 'bold', color: '#2C5282', fontSize: '13px' },
    alertType: { fontSize: '11px', color: '#C53030', fontWeight: '600' },
    alertMid: { flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' },
    alertEmail: { fontSize: '12px', color: '#4A5568' },
    alertDesc: { fontSize: '11px', color: '#718096' },
    alertConf: {},
    confBadge: { background: '#C53030', color: 'white', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' },

    contentGrid: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' },
    mapSection: { background: 'white', borderRadius: '12px', padding: '5px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden', minHeight: '300px' },

    insightsPanel: { display: 'flex', flexDirection: 'column', gap: '12px' },
    insightCard: { background: 'white', padding: '14px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '8px' },
    insightTitle: { margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#2C5282' },
    insightSub: { margin: '-4px 0 0', fontSize: '11px', color: '#A0AEC0' },

    barRow: { display: 'flex', alignItems: 'center', gap: '8px' },
    barLabel: { fontSize: '12px', color: '#4A5568', minWidth: '95px' },
    barOuter: { flex: 1, background: '#EDF2F7', borderRadius: '4px', height: '7px' },
    barInner: { background: '#3182CE', borderRadius: '4px', height: '7px', minWidth: '4px' },
    barCount: { fontSize: '12px', fontWeight: 'bold', color: '#2D3748', minWidth: '18px', textAlign: 'right' },

    recentRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' },
    recentLeft: { display: 'flex', flexDirection: 'column', gap: '1px' },
    recentRef: { fontFamily: 'monospace', fontSize: '12px', color: '#2C5282', fontWeight: 'bold' },
    recentType: { fontSize: '11px', color: '#718096' },
    recentBadge: { padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold', whiteSpace: 'nowrap' },

    repeatRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', background: '#FFFCF0', borderRadius: '6px', border: '1px solid #F6E05E' },
    repeatEmail: { fontSize: '12px', color: '#4A5568' },
    repeatCount: { fontSize: '12px', fontWeight: 'bold', color: '#975A16' },
};

export default CommandCenter;
