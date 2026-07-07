import React, { useState } from 'react';

export default function Profile({ user }) {
  const [phone, setPhone] = useState(user.phone || '');
  const [message, setMessage] = useState('');

  const handleUpdate = async () => {
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, phone })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('✅ Phone updated successfully!');
        // Optionally update local storage or context if needed, 
        // but for now user object prop is immutable from here without a callback.
        //Ideally setUser in parent should be called, but we'll stick to simple feedback first.
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (err) {
      setMessage('❌ Update failed');
    }
  };

  return (
    <div style={cardStyle}>
      <h2 style={{ color: '#003366', marginBottom: '20px' }}>👤 My Profile</h2>
      <div style={styles.infoGroup}>
        <p><strong>Name:</strong> {user.fullName}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Phone Number:</label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={styles.input}
          placeholder="Enter phone number"
        />
        <button onClick={handleUpdate} style={styles.btn}>Update Phone</button>
      </div>
      {message && <p style={styles.msg}>{message}</p>}
    </div>
  );
}

const cardStyle = { background: '#fff', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', maxWidth: '600px', margin: '0 auto' };
const styles = {
  infoGroup: { marginBottom: '30px', lineHeight: '1.8', color: '#486581' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '10px' },
  label: { fontWeight: 'bold', color: '#334E68' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E0', fontSize: '16px' },
  btn: { padding: '12px', background: '#003366', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' },
  msg: { marginTop: '15px', fontSize: '14px', fontWeight: 'bold' }
};