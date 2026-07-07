import React from 'react';

const Sidebar = ({ userRole, activeTab, setActiveTab, handleLogout }) => {

  // 1. Define menus for each role based on your Project Modules [cite: 80]
  const menus = {
    'Citizen': [
      { id: 'overview', label: 'Overview', icon: '🏠' },
      { id: 'report', label: 'Report Incident', icon: '🛡️' },
      { id: 'track', label: 'My Complaints', icon: '📊' },
      { id: 'url-scanner', label: 'URL Scanner', icon: '🔗' },
      // Evidence Vault merged into Report Incident
      { id: 'ai-reports', label: 'AI Insights', icon: '📑' }
    ],
    'Cyber Police': [
      { id: 'police-overview', label: 'Command Center', icon: '🏛️' },
      { id: 'assigned-cases', label: 'Assigned Cases', icon: '📁' },
      { id: 'url-scanner', label: 'URL Scanner', icon: '🔗' },
      { id: 'legal-escalation', label: 'Legal Escalations', icon: '⚖️' },
      { id: 'coordination-hub', label: 'Coordination Hub', icon: '🤝' }
    ],
    'Forensic Expert': [
      { id: 'evidence-lab', label: 'Evidence Lab', icon: '🔬' },
      { id: 'media-analysis', label: 'Media Analysis', icon: '🎞️' },
      { id: 'url-analysis', label: 'URL Scanner', icon: '🔗' },
      { id: 'forensic-reports', label: 'Forensic Reports', icon: '📝' }
    ]
  };

  // 2. Select the menu for the current user
  const currentMenu = menus[userRole] || menus['Citizen'];

  return (
    <aside style={styles.sidebar}>
      <div style={styles.sidebarLogo}>
        <h2 style={styles.logoText}>CYBER NETHRA</h2>
        <p style={styles.logoSub}>{userRole} Dashboard</p>
      </div>

      <nav style={styles.navMenu}>
        {currentMenu.map((item) => (
          <button
            key={item.id}
            style={activeTab === item.id ? styles.activeBtn : styles.navBtn}
            onClick={() => setActiveTab(item.id)}
          >
            {item.icon} {item.label}
          </button>
        ))}

        {/* Settings is common for everyone */}
        <button
          style={activeTab === 'profile' ? styles.activeBtn : styles.navBtn}
          onClick={() => setActiveTab('profile')}
        >
          ⚙️ Settings
        </button>
      </nav>

      <button onClick={handleLogout} style={styles.logoutBtn}>
        🚪 Exit Portal
      </button>
    </aside>
  );
};

const styles = {
  sidebar: { width: '280px', background: '#001529', color: 'white', display: 'flex', flexDirection: 'column', padding: '30px 20px', height: '100vh' },
  sidebarLogo: { marginBottom: '40px', borderBottom: '1px solid #1A2D3E', paddingBottom: '20px' },
  logoText: { fontSize: '22px', fontWeight: '800', color: '#00D4FF', margin: 0 },
  logoSub: { fontSize: '10px', color: '#627D98', textTransform: 'uppercase', fontWeight: '700' },
  navMenu: { display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 },
  navBtn: { background: 'none', border: 'none', color: '#A6ADB4', textAlign: 'left', padding: '14px 18px', borderRadius: '10px', cursor: 'pointer', fontSize: '15px' },
  activeBtn: { background: 'linear-gradient(90deg, #00D4FF 0%, #008CFF 100%)', border: 'none', color: '#001529', textAlign: 'left', padding: '14px 18px', borderRadius: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: '800' },
  logoutBtn: { background: '#FF4D4F', color: 'white', border: 'none', padding: '14px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', marginTop: 'auto' },
};

export default Sidebar;