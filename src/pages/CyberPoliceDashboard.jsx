import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Static Components
import Sidebar from '../components/Sidebar';
import DashboardNavbar from '../components/DashboardNavbar';

// Cyber Police Sub-pages
import CommandCenter from './Police/CommandCenter';
import AssignedCases from './Police/AssignedCases';
import LegalEscalations from './Police/LegalEscalations';
import CoordinationHub from './Police/CoordinationHub';
import Profile from './Citizen/Profile'; // Reusing Profile component
import UrlAnalysis from './Forensic/UrlAnalysis';

const CyberPoliceDashboard = () => {
    const navigate = useNavigate();

    // 1. State to manage active tab
    const [activeTab, setActiveTab] = useState('police-overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // 2. User State
    const [user, setUser] = useState({ fullName: '', email: '', role: 'Cyber Police' });

    // 3. Auth Check
    useEffect(() => {
        const savedUser = JSON.parse(sessionStorage.getItem('user'));
        if (!savedUser) {
            // For development/demo purposes, if no user is found, we might validly redirect to login
            // But if we want to test immediately without login flow, we can comment this out or set a dummy user
            navigate('/login');
        } else {
            setUser(savedUser);
        }
    }, [navigate]);

    // 4. Logout Logic
    const handleLogout = () => {
        sessionStorage.removeItem('user');
        navigate('/login');
    };

    // 5. Render Content Switcher
    const renderContent = () => {
        switch (activeTab) {
            case 'police-overview': return <CommandCenter />;
            case 'assigned-cases': return <AssignedCases />;
            case 'url-scanner': return <UrlAnalysis />;
            case 'legal-escalation': return <LegalEscalations />;
            case 'coordination-hub': return <CoordinationHub />;
            case 'profile': return <Profile user={user} />;
            default: return <CommandCenter />;
        }
    };

    return (
        <div className="dashboard-layout" style={styles.layout}>
            <div className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <Sidebar
                    userRole="Cyber Police"
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
                <DashboardNavbar
                    userName={user.fullName || 'Officer'}
                    userRole={user.role}
                    onProfileClick={() => setActiveTab('profile')}
                    onMenuClick={() => setSidebarOpen(true)}
                />

                <main style={styles.main}>
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

// Styles (Reused from CitizenDashboard for consistency)
const styles = {
    layout: { display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#F8FAFC' },
    contentArea: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    main: { padding: '15px 20px', overflowY: 'auto', flex: 1, minHeight: 0 }
};

export default CyberPoliceDashboard;
