import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Static Components
import Sidebar from '../components/Sidebar';
import DashboardNavbar from '../components/DashboardNavbar';

// Sub-pages from your /pages/Citizen folder
import Overview from './Citizen/Overview';
import ReportCrime from './Citizen/ReportCrime';
import TrackStatus from './Citizen/TrackStatus';
import AIInsights from './Citizen/Aiinsights';
import Profile from './Citizen/Profile';
import UrlAnalysis from './Forensic/UrlAnalysis';

const CitizenDashboard = () => {
  const navigate = useNavigate();

  // 1. State to manage which 'file' is currently displayed
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 2. State to hold the logged-in user's data
  const [user, setUser] = useState({ fullName: '', email: '', role: '' });

  // 3. Check if user is logged in on load
  useEffect(() => {
    const savedUser = JSON.parse(sessionStorage.getItem('user'));
    if (!savedUser) {
      navigate('/login');
    } else {
      setUser(savedUser);
    }
  }, [navigate]);

  // 4. Logout logic passed to Sidebar
  const handleLogout = () => {
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  // 5. The 'Switcher' - Redirects data to the screen based on activeTab
  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <Overview user={user} />;
      case 'report': return <ReportCrime user={user} />;
      case 'track': return <TrackStatus user={user} />;
      case 'url-scanner': return <UrlAnalysis />;
      // Evidence Vault merged into Report Crime
      case 'ai-reports': return <AIInsights user={user} />;
      case 'profile': return <Profile user={user} />;
      default: return <Overview user={user} />;
    }
  };

  return (
    <div className="dashboard-layout" style={styles.layout}>
      {/* STATIC SIDEBAR: Stays visible at all times */}
      <div className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => { setActiveTab(tab); setSidebarOpen(false); }}
          handleLogout={handleLogout}
        />
      </div>

      <div 
        className={`mobile-overlay ${sidebarOpen ? 'open' : ''}`} 
        onClick={() => setSidebarOpen(false)}
      ></div>

      <div className="content-area" style={styles.contentArea}>
        {/* STATIC NAVBAR: Clicking profile here triggers setActiveTab('profile') */}
        <DashboardNavbar
          userName={user.fullName}
          onProfileClick={() => setActiveTab('profile')}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* DYNAMIC MAIN CONTENT: Swaps based on Sidebar selection */}
        <main style={styles.main}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

// Tactical UI Styles
const styles = {
  layout: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    backgroundColor: '#F8FAFC'
  },
  contentArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  },
  main: {
    padding: '30px',
    overflowY: 'auto',
    flex: 1
  }
};

export default CitizenDashboard;