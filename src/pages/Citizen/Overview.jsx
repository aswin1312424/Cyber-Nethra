import React, { useState } from 'react';

export default function Overview({ user }) {
  const [panicMode, setPanicMode] = useState(false);

  const handlePanic = () => {
    setPanicMode(true);
    // Mock API Call
    setTimeout(() => {
      alert("🚨 EMERGENCY ALERT SENT! \n\n- Financial Freeze Initiated \n- Local Cyber Cell Notified \n- Device Isolation Recommended");
      setPanicMode(false);
    }, 1500);
  };

  return (
    <div style={containerStyle}>
      {/* Header Section */}
      <div className="responsive-stack" style={headerCard}>
        <div>
          <h2 style={{ color: '#003366', margin: 0 }}>Welcome back, {user.fullName}</h2>
          <p style={{ color: '#627D98', margin: '5px 0 0' }}>Secure Citizen Portal • ID: {user._id || 'CIT-8829'}</p>
        </div>
        <div style={statusBadge}>
          <span style={{ fontSize: '20px', marginRight: '8px' }}>🛡️</span>
          <div>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', color: '#044E54' }}>Security Status</div>
            <div style={{ fontWeight: 'bold', color: '#006D77' }}>Active & Monitored</div>
          </div>
        </div>
      </div>

      {/* Panic Button Section */}
      <div className="responsive-stack" style={panicSection}>
        <div style={panicText}>
          <h3 style={{ marginTop: 0, color: '#821717' }}>🚨 Emergency Financial Freeze</h3>
          <p style={{ fontSize: '14px', color: '#610404' }}>
            Use this ONLY if you suspect immediate financial fraud (money deduction, unauthorized access).
            This will trigger an instant freeze request to linked banks.
          </p>
        </div>
        <button
          onClick={handlePanic}
          style={panicMode ? panicBtnActive : panicBtn}
          disabled={panicMode}
        >
          {panicMode ? 'Connecting to Bank API...' : 'ACTIVATE PANIC FREEZE'}
        </button>
      </div>

      {/* Quick Stats or Shortcuts could go here */}
      <div className="responsive-stack" style={gridStyle}>
        <div style={cardStyle}>
          <h3>📝 Report Incident</h3>
          <p>File a new cyber crime report immediately.</p>
        </div>
        <div style={cardStyle}>
          <h3>📊 Track Status</h3>
          <p>Check the progress of your active cases.</p>
        </div>
        <div style={cardStyle}>
          <h3>🤖 AI Chat (Secure)</h3>
          <p>Talk to the automated legal assistant.</p>
        </div>
      </div>
    </div>
  );
}

const containerStyle = { display: 'flex', flexDirection: 'column', gap: '25px' };

const headerCard = {
  background: '#fff', padding: '30px', borderRadius: '15px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
};

const statusBadge = {
  background: '#E6FFFA', padding: '10px 20px', borderRadius: '12px',
  display: 'flex', alignItems: 'center', border: '1px solid #B2F5EA'
};

const panicSection = {
  background: 'linear-gradient(90deg, #FFF5F5 0%, #FED7D7 100%)',
  border: '1px solid #FEB2B2',
  padding: '30px', borderRadius: '15px',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
};

const panicText = { maxWidth: '100%' };

const panicBtn = {
  background: '#E53E3E', color: 'white', border: 'none',
  padding: '15px 30px', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold',
  cursor: 'pointer', boxShadow: '0 4px 15px rgba(229, 62, 62, 0.4)',
  transition: 'all 0.2s ease'
};

const panicBtnActive = {
  ...panicBtn, background: '#9B2C2C', cursor: 'not-allowed', opacity: 0.8
};

const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px' };

const cardStyle = {
  background: '#fff', padding: '25px', borderRadius: '15px',
  boxShadow: '0 4px 15px rgba(0,0,0,0.03)', textAlign: 'center'
};