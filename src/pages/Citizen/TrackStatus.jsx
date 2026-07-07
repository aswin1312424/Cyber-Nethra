import React, { useEffect, useState, useCallback } from 'react';

export default function TrackStatus({ user }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedId, setExpandedId] = useState(null);
  const [generatingReportFor, setGeneratingReportFor] = useState(null);

  // Fetch complaints with auto-refresh capability
  const fetchComplaints = useCallback(() => {
    fetch(`/api/complaints/${user.email}`)
      .then(res => res.json())
      .then(data => {
        setComplaints(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch complaints:", err);
        setLoading(false);
      });
  }, [user.email]);

  // Initial fetch and auto-poll every 30 seconds
  useEffect(() => {
    fetchComplaints();
    const interval = setInterval(fetchComplaints, 30000);
    return () => clearInterval(interval);
  }, [fetchComplaints]);

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Prevent expanding card when clicking delete
    if (!window.confirm("Are you sure you want to delete this report? This will permanently remove the record and any evidence submitted.")) return;

    try {
      const res = await fetch(`/api/complaints/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setComplaints(complaints.filter(c => c._id !== id));
        if (expandedId === id) setExpandedId(null);
      } else {
        alert("Action failed. Please try again.");
      }
    } catch (err) {
      alert("Network error. Please check your connection.");
    }
  };

  const handleDownloadReport = (c, e) => {
    e.stopPropagation();
    setGeneratingReportFor(c._id);

    try {
      // Open Print Dialog with Formatted Complaint Data (No AI)
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
            <html><head><title>Complaint Copy - ${c.caseRef || c._id}</title>
            <style>
                body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; background: #fff; }
                .header { text-align: center; border-bottom: 3px solid #003366; padding-bottom: 20px; margin-bottom: 30px; }
                .header h1 { color: #003366; margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 1px; }
                .header p { color: #666; margin: 5px 0 0; font-size: 14px; }
                .section { margin-bottom: 30px; }
                .section-title { font-size: 18px; color: #003366; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px; }
                .row { display: flex; margin-bottom: 10px; }
                .label { font-weight: bold; width: 170px; color: #555; }
                .value { flex: 1; color: #222; }
                .desc-box { background: #f9f9f9; padding: 15px; border: 1px solid #eee; border-radius: 5px; white-space: pre-wrap; font-family: inherit; margin-top: 10px; }
                .footer { margin-top: 50px; border-top: 1px dashed #ccc; padding-top: 20px; font-size: 12px; color: #888; text-align: center; }
                .watermark { position: fixed; top: 40%; left: 50%; width: 100%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 70px; color: rgba(0, 51, 102, 0.04); z-index: -1; text-align: center; font-weight: bold; pointer-events: none; user-select: none; }
                @media print { body { padding: 0; } .watermark { color: rgba(0, 51, 102, 0.04); } }
            </style></head>
            <body>
                <div class="watermark">CYBER NETHRA<br/>FILED COPY</div>
                <div class="header">
                    <h1>Cyber Nethra Portal</h1>
                    <p>Official Copy of Filed Complaint</p>
                </div>
                
                <div class="section">
                    <h2 class="section-title">Case Information</h2>
                    <div class="row"><div class="label">Reference No:</div><div class="value"><strong>${c.caseRef || c._id.slice(-6).toUpperCase()}</strong></div></div>
                    <div class="row"><div class="label">Date Filed:</div><div class="value">${new Date(c.createdAt).toLocaleString()}</div></div>
                    <div class="row"><div class="label">Current Status:</div><div class="value"><strong>${c.status}</strong></div></div>
                </div>

                <div class="section">
                    <h2 class="section-title">Complainant Details</h2>
                    <div class="row"><div class="label">Email Address:</div><div class="value">${c.email}</div></div>
                </div>

                <div class="section">
                    <h2 class="section-title">Incident Details</h2>
                    <div class="row"><div class="label">Offense Type:</div><div class="value">${c.type}</div></div>
                    <div class="row"><div class="label">Evidence Provided:</div><div class="value">${c.evidence ? 'Yes (Attached securely in system)' : 'None'}</div></div>
                    <div class="label">Incident Description:</div>
                    <div class="desc-box">${c.description}</div>
                </div>

                <div class="footer">
                    This is a system-generated acknowledgement copy of the cyber incident report submitted via the Cyber Nethra portal.<br/>
                    Printed on: ${new Date().toLocaleString()}
                </div>
            </body></html>
        `);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500); // Wait for render before print trigger

    } catch (err) {
      alert("Failed to create PDF view. Please try again.");
    } finally {
      setGeneratingReportFor(null);
    }
  };

  const handleDownloadForensicReport = (c, e) => {
    e.stopPropagation();

    try {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
            <html><head><title>Forensic Report - ${c.caseRef || c._id}</title>
            <style>
                body { font-family: 'Courier New', monospace; padding: 40px; line-height: 1.8; color: #1a202c; max-width: 800px; margin: 0 auto; background: #fff; }
                h1 { color: #800000; border-bottom: 2px solid #800000; padding-bottom: 10px; text-transform: uppercase; margin-bottom: 5px; }
                .subtitle { color: #666; font-size: 14px; margin-top: 0; margin-bottom: 30px; font-weight: bold; }
                pre { white-space: pre-wrap; font-family: inherit; background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; }
                .footer { margin-top: 50px; border-top: 1px dashed #ccc; padding-top: 20px; font-size: 12px; color: #888; text-align: center; font-style: italic; }
                @media print { pre, body { background: white; border: none; } }
            </style></head>
            <body>
                <h1>FORENSIC ANALYSIS REPORT</h1>
                <p class="subtitle">CYBER NETHRA - EVIDENCE LAB DIVISION</p>
                <p><strong>Case Ref:</strong> ${c.caseRef || c._id.slice(-6).toUpperCase()}</p>
                
                <pre>${c.forensic_report}</pre>
                
                <div class="footer">
                    End of Official Forensic Document.<br/>
                    Released for Citizen Viewing by Cyber Nethra Forensic Authority
                </div>
            </body></html>
        `);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500); 
    } catch (err) {
      alert("Failed to render Forensic PDF. Please try again.");
    }
  };

  const handleDownloadFIRReport = (c, e) => {
    e.stopPropagation();

    try {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
            <html><head><title>FIR Report - ${c.caseRef || c._id}</title>
            <style>
                body { font-family: 'Courier New', monospace; padding: 40px; line-height: 1.8; color: #1a202c; max-width: 800px; margin: 0 auto; background: #fff; }
                h1 { color: #003366; border-bottom: 2px solid #003366; padding-bottom: 10px; text-transform: uppercase; margin-bottom: 5px; }
                .subtitle { color: #666; font-size: 14px; margin-top: 0; margin-bottom: 30px; font-weight: bold; }
                pre { white-space: pre-wrap; font-family: inherit; background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; }
                .footer { margin-top: 50px; border-top: 1px dashed #ccc; padding-top: 20px; font-size: 12px; color: #888; text-align: center; font-style: italic; }
                @media print { pre, body { background: white; border: none; } }
            </style></head>
            <body>
                <h1>FIRST INFORMATION REPORT (FIR)</h1>
                <p class="subtitle">CYBER NETHRA - CYBER CELL</p>
                <p><strong>Case Ref:</strong> ${c.caseRef || c._id.slice(-6).toUpperCase()}</p>
                
                <pre>${c.fir_report}</pre>
                
                <div class="footer">
                    End of Official FIR Document.<br/>
                    Released for Citizen Viewing by Cyber Nethra Police Authority
                </div>
            </body></html>
        `);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500); 
    } catch (err) {
      alert("Failed to render FIR PDF. Please try again.");
    }
  };

  const getStepStatus = (currentStatus, stepName) => {
    const steps = ['Pending', 'In Progress', 'Resolved'];
    const currentIndex = steps.indexOf(currentStatus);
    const stepIndex = steps.indexOf(stepName);

    // AI Flagged map to Pending step but visually prominent
    if (currentStatus === 'AI-Flagged' && stepName === 'Pending') return 'active-alert';
    // Evidence Analysis / Legal Review map to In Progress
    if (['Evidence Analysis', 'Legal Review'].includes(currentStatus) && stepName === 'In Progress') return 'active';

    if (currentStatus === stepName) return 'active';
    if (currentIndex > stepIndex || currentStatus === 'Resolved') return 'completed';
    return 'pending';
  };

  // Dynamic Metrics
  const activeCases = complaints.filter(c => c.status !== 'Resolved').length;
  const resolvedCases = complaints.filter(c => c.status === 'Resolved').length;

  // Filtering Logic
  const filteredComplaints = complaints.filter(c => {
    if (activeFilter === 'Active') return c.status !== 'Resolved';
    if (activeFilter === 'Resolved') return c.status === 'Resolved';
    return true; // 'All'
  });

  return (
    <div style={styles.container}>
      {/* Premium Header & Stats */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <h2 style={styles.heroTitle}>Case Activity & Tracking</h2>
          <p style={styles.heroSub}>Live monitoring of your filed cyber incidents</p>
        </div>
        <div style={styles.statsRow}>
          <div style={styles.statBox}>
            <span style={styles.statValue}>{complaints.length}</span>
            <span style={styles.statLabel}>Total Filed</span>
          </div>
          <div style={{ ...styles.statBox, background: 'rgba(56, 161, 105, 0.15)', border: '1px solid rgba(56, 161, 105, 0.3)' }}>
            <span style={{ ...styles.statValue, color: '#68D391' }}>{resolvedCases}</span>
            <span style={{ ...styles.statLabel, color: '#9AE6B4' }}>Resolved</span>
          </div>
          <div style={{ ...styles.statBox, background: 'rgba(49, 130, 206, 0.15)', border: '1px solid rgba(49, 130, 206, 0.3)' }}>
            <span style={{ ...styles.statValue, color: '#63B3ED' }}>{activeCases}</span>
            <span style={{ ...styles.statLabel, color: '#90CDF4' }}>Active</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={styles.loaderWrap}>
          <div style={styles.spinner} />
          <p style={{ color: '#718096' }}>Syncing live updates...</p>
        </div>
      ) : complaints.length === 0 ? (
        <div style={styles.emptyCard}>
          <div style={styles.emptyIcon}>📭</div>
          <h3 style={styles.emptyTitle}>No Active Cases</h3>
          <p style={styles.emptyText}>You haven't filed any cyber crime reports yet. Stay safe online!</p>
        </div>
      ) : (
        <div style={styles.mainContent}>
          {/* Interactive Filters */}
          <div style={styles.filterTabs}>
            {['All', 'Active', 'Resolved'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                style={{
                  ...styles.tabBtn,
                  ...(activeFilter === tab ? styles.tabActive : {})
                }}
              >
                {tab}
                <span style={styles.tabBadge}>
                  {tab === 'All' ? complaints.length : tab === 'Active' ? activeCases : resolvedCases}
                </span>
              </button>
            ))}
            <div style={styles.liveIndicator}>
              <span style={styles.pulseDot} /> Live Sync Active
            </div>
          </div>

          {/* Case List */}
          <div style={styles.listStyle}>
            {filteredComplaints.length === 0 && (
              <div style={styles.emptyFilter}>
                <p>No {activeFilter.toLowerCase()} cases found.</p>
              </div>
            )}

            {filteredComplaints.map(c => {
              const isExpanded = expandedId === c._id;

              return (
                <div
                  key={c._id}
                  style={{ ...styles.caseCard, ...(isExpanded ? styles.caseCardExpanded : {}) }}
                  onClick={() => setExpandedId(isExpanded ? null : c._id)}
                >
                  <div style={styles.caseHeader}>
                    <div style={styles.headerLeft}>
                      <div style={styles.refGroup}>
                        <span style={styles.caseRef}>{c.caseRef || `REF-${c._id.slice(-6).toUpperCase()}`}</span>
                        {c.status === 'AI-Flagged' && <span style={styles.aiAlert}>🚨 Critical Priority</span>}
                      </div>
                      <span style={styles.typeBadge}>{c.type}</span>
                    </div>
                    <div style={styles.headerRight}>
                      <span style={styles.dateBadge}>{new Date(c.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      <span style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {/* Milestone Tracker Visual */}
                  <div style={styles.trackerContainer}>
                    <Step label="Report Filed" status={getStepStatus(c.status, 'Pending')} icon="📝" />
                    <Connector status={getStepStatus(c.status, 'In Progress') === 'pending' ? 'pending' : 'completed'} />
                    <Step label="Investigation" status={getStepStatus(c.status, 'In Progress')} icon="🕵️‍♂️" />
                    <Connector status={getStepStatus(c.status, 'Resolved') === 'pending' ? 'pending' : 'completed'} />
                    <Step label="Resolution" status={getStepStatus(c.status, 'Resolved')} icon="⚖️" />
                  </div>

                  {/* Expandable Details Area */}
                  {isExpanded && (
                    <div style={styles.expandedContent}>
                      <div style={styles.detailGrid}>
                        <div>
                          <h4 style={styles.detailLabel}>Incident Description</h4>
                          <p style={styles.detailText}>{c.description}</p>
                        </div>

                        {c.ai_analysis_result && (
                          <div style={styles.aiBox}>
                            <h4 style={{ ...styles.detailLabel, color: '#C53030' }}>🤖 AI Forensic Analysis</h4>
                            <p style={{ margin: '5px 0 0', fontSize: '14px' }}>
                              <strong>Verdict: </strong> {c.ai_analysis_result} <br />
                              <strong>Confidence: </strong> {((parseFloat(c.ai_confidence_score) || 0) * 100).toFixed(1)}%
                            </p>
                          </div>
                        )}
                      </div>

                      {c.evidence && (
                        <div style={styles.evidenceBox}>
                          <span style={styles.detailLabel}>📎 Attached Evidence</span>
                          <div style={styles.evidenceLink}>View File Attachment ({c.evidence.split('.').pop().toUpperCase()})</div>
                        </div>
                      )}

                      <div style={styles.footerStyle}>
                        <div style={styles.footerFlex}>
                          <div style={styles.statusWrap}>
                            <span style={styles.statusLabel}>Current Hub Status:</span>
                            <span style={{ ...styles.statusPill, background: c.status === 'Resolved' ? '#C6F6D5' : '#EBF8FF', color: c.status === 'Resolved' ? '#22543D' : '#2B6CB0' }}>
                              {c.status}
                            </span>
                          </div>

                          {c.status === 'Pending' && (
                            <button
                              onClick={(e) => handleDelete(c._id, e)}
                              style={styles.deleteBtnStyle}
                            >
                              🗑️ Withdraw Report
                            </button>
                          )}

                          <div style={{ display: 'flex', gap: '10px' }}>
                            {c.forensic_report && (
                              <button
                                onClick={(e) => handleDownloadForensicReport(c, e)}
                                style={{
                                    background: '#742A2A', color: 'white', border: 'none', borderRadius: '8px',
                                    padding: '8px 16px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s',
                                    display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 5px rgba(116,42,42,0.3)'
                                  }}
                                disabled={generatingReportFor === c._id + "_forensic"}
                              >
                                {generatingReportFor === c._id + "_forensic" ? 'Opening...' : '🔬 View Forensic Report'}
                              </button>
                            )}
                            {c.fir_report && (
                              <button
                                onClick={(e) => handleDownloadFIRReport(c, e)}
                                style={{
                                    background: '#B83280', color: 'white', border: 'none', borderRadius: '8px',
                                    padding: '8px 16px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s',
                                    display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 5px rgba(184,50,128,0.3)'
                                  }}
                                disabled={generatingReportFor === c._id + "_fir"}
                              >
                                {generatingReportFor === c._id + "_fir" ? 'Opening...' : '⚖️ View FIR Report'}
                              </button>
                            )}
                            <button
                              onClick={(e) => handleDownloadReport(c, e)}
                              style={styles.reportBtnStyle}
                              disabled={generatingReportFor === c._id}
                            >
                              {generatingReportFor === c._id ? 'Opening...' : '📄 Download Complaint Copy'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Collapsed Footer (Only shows if NOT expanded) */}
                  {!isExpanded && (
                    <div style={styles.collapsedFooter}>
                      <span style={styles.statusLabel}>Status:</span>
                      <span style={{ ...styles.statusPill, marginLeft: '8px', background: c.status === 'Resolved' ? '#C6F6D5' : '#EBF8FF', color: c.status === 'Resolved' ? '#22543D' : '#2B6CB0' }}>{c.status}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Sub Components ---
const Step = ({ label, status, icon }) => {
  let bg = '#E2E8F0', color = '#A0AEC0', border = 'none', shadow = 'none';

  if (status === 'completed') { bg = '#48BB78'; color = 'white'; }
  if (status === 'active') { bg = '#EBF8FF'; color = '#3182CE'; border = '2px solid #3182CE'; shadow = '0 0 0 4px rgba(49, 130, 206, 0.2)'; }
  if (status === 'active-alert') { bg = '#FFF5F5'; color = '#E53E3E'; border = '2px solid #E53E3E'; shadow = '0 0 0 4px rgba(229, 62, 62, 0.2)'; }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: '50%', background: bg,
        color: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '18px', border: border, fontWeight: 'bold', transition: 'all 0.3s ease',
        boxShadow: shadow
      }}>
        {status === 'completed' ? '✓' : icon}
      </div>
      <span style={{ fontSize: '11px', marginTop: '10px', color: status === 'pending' ? '#A0AEC0' : '#4A5568', fontWeight: status !== 'pending' ? 'bold' : 'normal', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </span>
    </div>
  );
};

const Connector = ({ status }) => (
  <div style={{
    flex: 1, height: '3px', background: status === 'completed' ? '#48BB78' : '#E2E8F0',
    marginTop: '-25px', marginLeft: '-5px', marginRight: '-5px', zIndex: 1,
    transition: 'background 0.5s ease'
  }} />
);

// --- Premium Styles ---
const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' },

  hero: {
    background: 'linear-gradient(135deg, #1A365D 0%, #0F172A 100%)',
    padding: '30px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', color: 'white', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', flexWrap: 'wrap', gap: '20px'
  },
  heroTitle: { margin: 0, fontSize: '24px', fontWeight: '800' },
  heroSub: { margin: '5px 0 0', color: '#A0AEC0', fontSize: '14px' },
  statsRow: { display: 'flex', gap: '15px', flexWrap: 'wrap' },
  statBox: {
    background: 'rgba(255,255,255,0.1)', padding: '12px 20px', borderRadius: '12px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.1)'
  },
  statValue: { fontSize: '22px', fontWeight: 'bold' },
  statLabel: { fontSize: '11px', color: '#E2E8F0', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' },

  filterTabs: { display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' },
  tabBtn: {
    padding: '8px 16px', border: '1px solid #E2E8F0', background: 'white', color: '#718096',
    borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex',
    alignItems: 'center', gap: '8px', transition: 'all 0.2s'
  },
  tabActive: { background: '#3182CE', color: 'white', borderColor: '#3182CE', boxShadow: '0 4px 10px rgba(49, 130, 206, 0.3)' },
  tabBadge: { background: 'rgba(0,0,0,0.1)', padding: '2px 6px', borderRadius: '10px', fontSize: '10px' },
  liveIndicator: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#48BB78', fontWeight: 'bold', background: '#F0FFF4', padding: '6px 12px', borderRadius: '20px' },
  pulseDot: { width: '8px', height: '8px', background: '#48BB78', borderRadius: '50%', boxShadow: '0 0 0 rgba(72, 187, 120, 0.4)', animation: 'pulse 2s infinite' },

  listStyle: { display: 'flex', flexDirection: 'column', gap: '15px' },

  caseCard: {
    background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0',
    boxShadow: '0 2px 10px rgba(0,0,0,0.02)', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative', overflow: 'hidden'
  },
  caseCardExpanded: {
    borderColor: '#CBD5E0',
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
    transform: 'translateY(-2px)'
  },

  caseHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' },
  headerLeft: { display: 'flex', flexDirection: 'column', gap: '8px' },
  refGroup: { display: 'flex', alignItems: 'center', gap: '12px' },
  caseRef: { fontSize: '18px', fontWeight: '900', color: '#1A365D', fontFamily: 'monospace' },
  aiAlert: { background: '#FFF5F5', color: '#E53E3E', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', border: '1px solid #FEB2B2' },
  typeBadge: { background: '#EDF2F7', color: '#4A5568', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', display: 'inline-block', width: 'fit-content' },

  headerRight: { display: 'flex', alignItems: 'center', gap: '15px' },
  dateBadge: { fontSize: '13px', color: '#A0AEC0', fontWeight: '500' },
  expandIcon: { color: '#CBD5E0', fontSize: '12px' },

  trackerContainer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px', margin: '30px 0 10px' },

  expandedContent: { borderTop: '1px solid #EDF2F7', marginTop: '20px', paddingTop: '20px', animation: 'fadeIn 0.3s ease-out' },
  detailGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' },
  detailLabel: { fontSize: '11px', color: '#A0AEC0', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 8px' },
  detailText: { fontSize: '14px', color: '#4A5568', lineHeight: '1.6', margin: 0, background: '#F7FAFC', padding: '15px', borderRadius: '8px' },

  aiBox: { background: '#FFF5F5', padding: '15px', borderRadius: '8px', border: '1px solid #FED7D7' },
  evidenceBox: { marginBottom: '20px' },
  evidenceLink: { background: '#F7FAFC', border: '1px dashed #CBD5E0', padding: '10px 15px', borderRadius: '8px', fontSize: '13px', color: '#3182CE', fontWeight: 'bold', width: 'fit-content', marginTop: '8px' },

  footerStyle: { background: '#F7FAFC', borderRadius: '12px', padding: '15px 20px', marginTop: '10px' },
  footerFlex: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' },
  statusWrap: { display: 'flex', alignItems: 'center', gap: '10px' },
  statusLabel: { fontSize: '13px', color: '#718096', fontWeight: '600' },
  statusPill: { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },

  collapsedFooter: { borderTop: '1px solid #EDF2F7', marginTop: '20px', paddingTop: '15px', display: 'flex', alignItems: 'center' },

  deleteBtnStyle: {
    background: 'white', color: '#E53E3E', border: '1px solid #FC8181', borderRadius: '8px',
    padding: '8px 16px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s',
    display: 'flex', alignItems: 'center', gap: '6px'
  },

  reportBtnStyle: {
    background: '#003366', color: 'white', border: 'none', borderRadius: '8px',
    padding: '8px 16px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s',
    display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 5px rgba(0,51,102,0.3)'
  },

  loaderWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px', gap: '15px' },
  spinner: { width: '30px', height: '30px', border: '3px solid #EDF2F7', borderTop: '3px solid #3182CE', borderRadius: '50%', animation: 'spin 1s linear infinite' },

  emptyCard: { background: 'white', padding: '60px 20px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
  emptyIcon: { fontSize: '48px', marginBottom: '15px' },
  emptyTitle: { margin: '0 0 10px', color: '#2D3748', fontSize: '20px' },
  emptyText: { margin: 0, color: '#A0AEC0', fontSize: '15px' },
  emptyFilter: { textAlign: 'center', padding: '30px', color: '#A0AEC0', fontSize: '14px', background: 'rgba(255,255,255,0.5)', borderRadius: '12px', border: '1px dashed #E2E8F0' }
};

// Inject Required Keyframes
if (typeof document !== 'undefined' && !document.getElementById('track-status-styles')) {
  const style = document.createElement('style');
  style.id = 'track-status-styles';
  style.innerHTML = `
    @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(72, 187, 120, 0.4); } 70% { box-shadow: 0 0 0 6px rgba(72, 187, 120, 0); } 100% { box-shadow: 0 0 0 0 rgba(72, 187, 120, 0); } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes spin { to { transform: rotate(360deg); } }
  `;
  document.head.appendChild(style);
}