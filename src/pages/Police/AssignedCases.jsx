import React, { useState, useEffect, useMemo } from 'react';

const STATUS_COLORS = {
    'Pending': { bg: '#FFFCF0', text: '#975A16', border: '#F6AD55' },
    'AI-Flagged': { bg: '#FFF5F5', text: '#C53030', border: '#FC8181' },
    'Under Investigation': { bg: '#EBF8FF', text: '#2B6CB0', border: '#63B3ED' },
    'Evidence Analysis': { bg: '#FAF5FF', text: '#6B46C1', border: '#D6BCFA' },
    'Legal Review': { bg: '#F0FFF4', text: '#276749', border: '#68D391' },
    'Resolved': { bg: '#F0FFF4', text: '#276749', border: '#68D391' },
    'Deepfake Verified': { bg: '#EBF8FF', text: '#2B6CB0', border: '#63B3ED' },
};

const FileIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2B6CB0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
);

const AssignedCases = () => {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterType, setFilterType] = useState('All');
    const [sortBy, setSortBy] = useState('newest');

    const fetchCases = async () => {
        try {
            const res = await fetch('/api/complaints');
            const data = await res.json();
            if (res.ok) setCases(data);
        } catch (err) {
            console.error("Failed to fetch cases", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCases(); }, []);

    const updateStatus = async (id, newStatus) => {
        try {
            const res = await fetch(`/api/complaints/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) fetchCases();
        } catch (err) {
            alert("Update failed");
        }
    };

    const deleteCase = async (id) => {
        if (!window.confirm("Are you sure you want to PERMANENTLY delete this case and its evidence? This cannot be undone.")) return;
        try {
            const res = await fetch(`/api/complaints/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setCases(cases.filter(c => c._id !== id));
                setExpandedId(null);
            } else {
                alert("Deletion failed");
            }
        } catch (err) {
            alert("Error connecting to server");
        }
    };

    const getRef = (c) => c.caseRef || `REF-${c._id.slice(-6).toUpperCase()}`;

    const filtered = useMemo(() => {
        let list = [...cases];
        const q = search.toLowerCase().trim();

        if (q) {
            list = list.filter(c =>
                getRef(c).toLowerCase().includes(q) ||
                c.type.toLowerCase().includes(q) ||
                c.email.toLowerCase().includes(q) ||
                c.description.toLowerCase().includes(q)
            );
        }
        if (filterStatus !== 'All') list = list.filter(c => c.status === filterStatus);
        if (filterType !== 'All') list = list.filter(c => c.type === filterType);

        if (sortBy === 'newest') list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        else if (sortBy === 'oldest') list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        else if (sortBy === 'ai-flagged') list.sort((a, b) => (b.status === 'AI-Flagged') - (a.status === 'AI-Flagged'));

        return list;
    }, [cases, search, filterStatus, filterType, sortBy]);

    const SERVER_URL = import.meta.env.VITE_BACKEND_URL || '';
    const getEvidenceUrl = (c) => {
        if (!c || !c.evidence) return null;
        if (c.evidence === 'mongodb') return `${SERVER_URL}/api/complaints/${c._id}/evidence`;
        return `${SERVER_URL}/${c.evidence.replace(/\\/g, '/')}`;
    };

    const allStatuses = ['All', 'Pending', 'AI-Flagged', 'Under Investigation', 'Evidence Analysis', 'Legal Review', 'Resolved', 'Deepfake Verified'];
    const allTypes = ['All', 'Deepfake', 'Fraud', 'Harassment', 'Hacking', 'IdentityTheft'];

    return (
        <div style={s.container}>
            {/* Header */}
            <div style={s.pageHeader}>
                <div>
                    <h2 style={s.heading}>📁 Assigned Cases & Investigations</h2>
                    <p style={s.sub}>{filtered.length} of {cases.length} cases shown</p>
                </div>
                <div style={s.statRow}>
                    <div style={s.miniStat}>
                        <span style={{ color: '#C53030', fontSize: '20px', fontWeight: 'bold' }}>
                            {cases.filter(c => c.status === 'AI-Flagged').length}
                        </span>
                        <span style={s.miniLabel}>AI Flagged</span>
                    </div>
                    <div style={s.miniStat}>
                        <span style={{ color: '#975A16', fontSize: '20px', fontWeight: 'bold' }}>
                            {cases.filter(c => c.status === 'Pending').length}
                        </span>
                        <span style={s.miniLabel}>Pending</span>
                    </div>
                    <div style={s.miniStat}>
                        <span style={{ color: '#276749', fontSize: '20px', fontWeight: 'bold' }}>
                            {cases.filter(c => c.status === 'Resolved').length}
                        </span>
                        <span style={s.miniLabel}>Resolved</span>
                    </div>
                </div>
            </div>

            {/* Toolbar: Search + Filters */}
            <div style={s.toolbar}>
                <div style={s.searchWrap}>
                    <span style={s.searchIcon}>🔍</span>
                    <input
                        style={s.searchInput}
                        placeholder="Search by Reference ID, Type, Email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button style={s.clearBtn} onClick={() => setSearch('')}>✕</button>
                    )}
                </div>

                <select style={s.filterSelect} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    {allStatuses.map(s => <option key={s} value={s}>{s === 'All' ? '⚙️ All Statuses' : s}</option>)}
                </select>

                <select style={s.filterSelect} value={filterType} onChange={e => setFilterType(e.target.value)}>
                    {allTypes.map(t => <option key={t} value={t}>{t === 'All' ? '📂 All Types' : t}</option>)}
                </select>

                <select style={s.filterSelect} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    <option value="newest">🕐 Newest First</option>
                    <option value="oldest">🕐 Oldest First</option>
                    <option value="ai-flagged">🚨 AI Flagged First</option>
                </select>
            </div>

            {/* Case List */}
            {loading && <div style={s.emptyMsg}>Loading cases...</div>}
            {!loading && filtered.length === 0 && (
                <div style={s.emptyMsg}>
                    <p style={{ fontSize: '32px', margin: 0 }}>📭</p>
                    <p>No cases match your search.</p>
                </div>
            )}

            <div style={s.list}>
                {filtered.map(c => {
                    const isOpen = expandedId === c._id;
                    const ref = getRef(c);
                    const colors = STATUS_COLORS[c.status] || STATUS_COLORS['Pending'];
                    const date = new Date(c.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

                    return (
                        <div key={c._id} style={{ ...s.caseWrap, border: isOpen ? '1.5px solid #3182CE' : '1.5px solid transparent' }}>
                            {/* Collapsed Row - Always Visible */}
                            <div
                                style={s.caseBar}
                                onClick={() => setExpandedId(isOpen ? null : c._id)}
                            >
                                <div style={s.leftGroup}>
                                    <div style={s.typeIcon}><FileIcon /></div>
                                    <div>
                                        <div style={s.refId}>{ref}</div>
                                        <div style={s.typeName}>{c.type}</div>
                                    </div>
                                </div>

                                <div style={s.rightGroup}>
                                    <span style={{ ...s.badge, background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                                        {c.status}
                                    </span>
                                    <span style={s.dateTag}>{date}</span>
                                    <span style={{ color: isOpen ? '#3182CE' : '#A0AEC0', fontSize: '18px', fontWeight: 'bold', transition: 'transform 0.2s', display: 'inline-block', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                                        ›
                                    </span>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {isOpen && (
                                <div style={s.expanded}>
                                    <div style={s.detailGrid}>
                                        <div style={s.detailBlock}>
                                            <div style={s.detailLabel}>Complainant</div>
                                            <div style={s.detailValue}>{c.email}</div>
                                        </div>
                                        <div style={s.detailBlock}>
                                            <div style={s.detailLabel}>Filed On</div>
                                            <div style={s.detailValue}>{date}</div>
                                        </div>
                                        {c.ai_analysis_result && (
                                            <div style={s.detailBlock}>
                                                <div style={s.detailLabel}>AI Verdict</div>
                                                <div style={{ ...s.detailValue, color: c.ai_analysis_result === 'Fake' ? '#C53030' : '#276749', fontWeight: 'bold' }}>
                                                    {c.ai_analysis_result === 'Fake' ? '⚠️ Deepfake' : '✅ Authentic'} — {((parseFloat(c.ai_confidence_score) || 0) * 100).toFixed(1)}%
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div style={s.descBlock}>
                                        <div style={s.detailLabel}>Description</div>
                                        <p style={s.descText}>{c.description}</p>
                                    </div>

                                    {c.evidence && (
                                        <div style={s.evidenceBlock}>
                                            <div style={s.detailLabel}>Submitted Evidence</div>
                                            <img
                                                src={getEvidenceUrl(c)}
                                                alt="Evidence"
                                                style={s.evidenceImg}
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        </div>
                                    )}

                                    <div style={s.actionRow}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                                            <span style={{ fontSize: '13px', color: '#718096' }}>Update Status:</span>
                                            <select
                                                style={s.select}
                                                value={c.status}
                                                onChange={(e) => updateStatus(c._id, e.target.value)}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Under Investigation">Under Investigation</option>
                                                <option value="Evidence Analysis">Evidence Analysis</option>
                                                <option value="Legal Review">Legal Review</option>
                                                <option value="Resolved">Resolved</option>
                                            </select>
                                        </div>
                                        <button
                                            onClick={() => deleteCase(c._id)}
                                            style={{ ...s.select, background: '#FFF5F5', color: '#C53030', borderColor: '#FC8181', fontWeight: 'bold' }}
                                        >
                                            🗑️ Delete Case
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const s = {
    container: { padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: '10px', boxSizing: 'border-box' },
    pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' },
    heading: { color: '#003366', margin: 0, fontSize: '20px' },
    sub: { color: '#718096', margin: '3px 0 0', fontSize: '13px' },
    statRow: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
    miniStat: { display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'white', padding: '8px 16px', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' },
    miniLabel: { fontSize: '11px', color: '#718096', marginTop: '2px' },

    toolbar: { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' },
    searchWrap: { flex: 1, minWidth: '180px', display: 'flex', alignItems: 'center', background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 10px', gap: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    searchIcon: { fontSize: '14px' },
    searchInput: { flex: 1, border: 'none', outline: 'none', padding: '9px 0', fontSize: '13px', background: 'transparent' },
    clearBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#A0AEC0', fontSize: '15px' },
    filterSelect: { padding: '9px 10px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '13px', background: 'white', cursor: 'pointer', outline: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },

    list: { display: 'flex', flexDirection: 'column', gap: '8px' },
    emptyMsg: { textAlign: 'center', color: '#A0AEC0', padding: '40px 20px', background: 'white', borderRadius: '12px' },

    caseWrap: { background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden', transition: 'border 0.2s' },
    caseBar: { padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none', transition: 'background 0.15s' },
    leftGroup: { display: 'flex', alignItems: 'center', gap: '12px' },
    typeIcon: { fontSize: '20px', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EBF8FF', borderRadius: '8px' },
    refId: { fontWeight: 'bold', fontFamily: 'monospace', fontSize: '14px', color: '#2C5282', letterSpacing: '0.5px' },
    typeName: { fontSize: '12px', color: '#718096', marginTop: '1px' },
    rightGroup: { display: 'flex', alignItems: 'center', gap: '10px' },
    badge: { padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap' },
    dateTag: { fontSize: '12px', color: '#A0AEC0' },

    expanded: { borderTop: '1px solid #EDF2F7', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#FAFCFF' },
    detailGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' },
    detailBlock: { display: 'flex', flexDirection: 'column', gap: '3px' },
    detailLabel: { fontSize: '11px', color: '#A0AEC0', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '600' },
    detailValue: { fontSize: '13px', color: '#2D3748' },
    descBlock: { display: 'flex', flexDirection: 'column', gap: '4px' },
    descText: { margin: 0, color: '#4A5568', fontSize: '13px', lineHeight: 1.6, background: 'white', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0' },
    evidenceBlock: { display: 'flex', flexDirection: 'column', gap: '6px' },
    evidenceImg: { maxWidth: '100%', maxHeight: '180px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F7FAFC' },
    actionRow: { display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '8px', borderTop: '1px solid #EDF2F7' },
    select: { padding: '7px 10px', borderRadius: '8px', border: '1px solid #CBD5E0', fontSize: '13px', cursor: 'pointer', outline: 'none' },
};

export default AssignedCases;
