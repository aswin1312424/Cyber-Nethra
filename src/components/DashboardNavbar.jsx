import React, { useState, useEffect } from 'react';
import NotificationBell from './NotificationBell';

const DashboardNavbar = ({ userName, userRole, onProfileClick, onMenuClick }) => {
  const [greeting, setGreeting] = useState('');

  // Set dynamic greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  // Split name to get just the first name for the greeting
  const firstName = userName ? userName.split(' ')[0] : 'Citizen';

  return (
    <nav className="dashboard-navbar" style={styles.nav}>
      {/* Left Side: Hamburger, Breadcrumb & Greeting */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button className="hamburger-dashboard" onClick={onMenuClick}>☰</button>
        
        <div style={styles.leftTextStack}>
          <div className="breadcrumb" style={styles.breadcrumb}>
            <span style={styles.icon}>🛡️</span>
            <span style={styles.muted}>Cyber Nethra</span>
            <span style={styles.separator}>/</span>
            <strong style={styles.activePath}>Secure Portal</strong>
          </div>
          <div className="greeting-text" style={styles.greetingText}>
            {greeting}, <span style={{ color: '#2B6CB0' }}>{firstName}</span> 👋
          </div>
        </div>
      </div>

      {/* Right Side: Actions & Profile */}
      <div style={styles.rightSection}>

        {/* Dynamic WebSocket Notification Bell */}
        <NotificationBell />

        {/* Divider */}
        <div style={styles.divider}></div>

        {/* User Profile Button */}
        <div
          style={styles.profileBtn}
          onClick={onProfileClick}
          className="profile-btn-hover"
        >
          <div style={styles.avatar}>
            {firstName.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info" style={styles.profileInfo}>
            <span style={styles.userName}>{userName || 'User'}</span>
            <span style={styles.userRole}>{userRole || 'Verified Citizen'}</span>
          </div>
          <span style={styles.dropdownIcon}>▼</span>
        </div>
      </div>
    </nav>
  );
};

// -- Premium Glassmorphic & Modern Styles --
const styles = {
  nav: {
    height: '75px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 35px',
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },

  leftTextStack: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '3px'
  },

  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  icon: { marginRight: '6px', fontSize: '14px' },
  muted: { color: '#A0AEC0' },
  separator: { color: '#CBD5E0', margin: '0 8px' },
  activePath: { color: '#4A5568' },

  greetingText: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#1A365D',
    letterSpacing: '-0.5px'
  },

  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },

  iconBtn: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#F7FAFC',
    border: '1px solid #EDF2F7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.2s ease',
  },
  bellIcon: { fontSize: '18px' },
  notificationDot: {
    position: 'absolute',
    top: '8px',
    right: '10px',
    width: '8px',
    height: '8px',
    background: '#E53E3E',
    borderRadius: '50%',
    border: '2px solid white'
  },

  divider: {
    width: '1px',
    height: '35px',
    background: '#E2E8F0'
  },

  profileBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '6px 16px 6px 6px',
    borderRadius: '30px',
    border: '1px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    background: 'transparent',
  },

  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3182CE 0%, #2B6CB0 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: 'bold',
    boxShadow: '0 4px 10px rgba(49, 130, 206, 0.3)',
  },

  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  userName: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#2D3748',
    lineHeight: '1.2'
  },
  userRole: {
    fontSize: '11px',
    color: '#718096',
    fontWeight: '600'
  },

  dropdownIcon: {
    color: '#A0AEC0',
    fontSize: '10px',
    marginLeft: '5px'
  }
};

// Inject hover styles into head since inline styles don't support pseudo-classes
if (typeof document !== 'undefined' && !document.getElementById('navbar-styles')) {
  const style = document.createElement('style');
  style.id = 'navbar-styles';
  style.innerHTML = `
    .nav-icon-hover:hover {
      background: #EDF2F7 !important;
      transform: translateY(-1px);
    }
    .profile-btn-hover:hover {
      background: #F7FAFC !important;
      border: 1px solid #E2E8F0 !important;
    }
    @media (max-width: 768px) {
      .dashboard-navbar {
        padding: 0 15px !important;
        height: 70px !important;
      }
      .breadcrumb {
        display: none !important;
      }
      .profile-info {
        display: none !important;
      }
      .greeting-text {
        font-size: 16px !important;
      }
      .hamburger-dashboard {
        display: inline-block !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export default DashboardNavbar;