import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Static Components
import Sidebar from '../components/Sidebar';
import DashboardNavbar from '../components/DashboardNavbar';

// Forensic Sub-pages
import EvidenceLab from './Forensic/EvidenceLab';
import MediaAnalysis from './Forensic/MediaAnalysis';
import UrlAnalysis from './Forensic/UrlAnalysis';
import ForensicReports from './Forensic/ForensicReports';
import Profile from './Citizen/Profile'; // Reusing Profile component

const ForensicDashboard = () => {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('evidence-lab');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState({ fullName: '', email: '', role: 'Forensic Expert' });

    useEffect(() => {
        const savedUser = JSON.parse(sessionStorage.getItem('user'));
        if (!savedUser) {
            navigate('/login');
        } else {
            setUser(savedUser);
        }
    }, [navigate]);

    const handleLogout = () => {
        sessionStorage.removeItem('user');
        navigate('/login');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'evidence-lab': return <EvidenceLab />;
            case 'media-analysis': return <MediaAnalysis />;
            case 'url-analysis': return <UrlAnalysis />;
            case 'forensic-reports': return <ForensicReports />;
            case 'profile': return <Profile user={user} />;
            default: return <EvidenceLab />;
        }
    };

    return (
        <div className="dashboard-layout" style={styles.layout}>
            <div className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <Sidebar
                    userRole="Forensic Expert"
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
                    userName={user.fullName || 'Analyst'}
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

const styles = {
    layout: { display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#F8FAFC' },
    contentArea: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    main: { padding: '15px 20px', overflowY: 'auto', flex: 1, minHeight: 0 }
};

export default ForensicDashboard;
