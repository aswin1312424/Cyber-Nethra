import React, { useState } from 'react';

export default function ReportCrime({ user }) {
  const [type, setType] = useState('Fraud');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validate inputs
    if (!description.trim()) {
      setMessage({ type: 'error', text: 'Please provide a description of the incident.' });
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('email', user.email);
    formData.append('type', type);
    formData.append('description', description);
    formData.append('status', 'Pending');

    // Add file if selected
    const fileInput = document.getElementById('evidence-upload');
    if (fileInput && fileInput.files[0]) {
      formData.append('evidence', fileInput.files[0]);
    }

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        // Headers are not needed for FormData, browser sets them automatically with boundary
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: `✅ Complaint filed successfully! Reference ID: ${data.caseRef || data.id}` });
        setDescription(''); // Clear form
        if (fileInput) fileInput.value = ''; // Clear file input
      } else {
        setMessage({ type: 'error', text: `❌ ${data.error || 'Submission failed'}` });
      }
    } catch (err) {
      setMessage({ type: 'error', text: '❌ Server error. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>🛡️ Lodge a Complaint</h2>
      <p style={styles.sub}>Report cyber incidents directly to the National Cyber Crime portal. Your identity remains secure.</p>

      <form onSubmit={handleSubmit} style={styles.formStyle}>
        <div style={styles.fieldGroup}>
          <label style={styles.labelStyle}>Crime Category</label>
          <select value={type} onChange={(e) => setType(e.target.value)} style={styles.inputStyle}>
            <option value="Fraud">Financial Fraud</option>
            <option value="Deepfake">Deepfake/Media Abuse</option>
            <option value="Harassment">Cyber Harassment</option>
            <option value="Hacking">Hacking / Unauthorized Access</option>
            <option value="IdentityTheft">Identity Theft</option>
          </select>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.labelStyle}>Incident Description</label>
          <textarea
            placeholder="Please describe the incident in detail..."
            style={{ ...styles.inputStyle, minHeight: '140px', resize: 'vertical' }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.labelStyle}>Upload Evidence (Optional)</label>
          <input
            id="evidence-upload"
            type="file"
            accept="image/*,video/*,.pdf"
            style={{ ...styles.inputStyle, padding: '10px' }}
          />
          <small style={{ color: '#718096', fontSize: '12px' }}>Supports Images, Videos, and PDF.</small>
        </div>

        <button type="submit" style={{ ...styles.btnStyle, opacity: loading ? 0.7 : 1 }} disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Complaint'}
        </button>
      </form>

      {message && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          borderRadius: '8px',
          background: message.type === 'success' ? '#F0FFF4' : '#FFF5F5',
          color: message.type === 'success' ? '#2F855A' : '#C53030',
          border: `1px solid ${message.type === 'success' ? '#C6F6D5' : '#FED7D7'}`
        }}>
          {message.text}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    background: 'white',
    padding: '30px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
    border: '1px solid #E2E8F0',
    width: '100%',
    boxSizing: 'border-box'
  },
  header: {
    color: '#1A365D',
    fontSize: '24px',
    marginBottom: '8px',
    fontWeight: '800'
  },
  sub: {
    color: '#718096',
    marginBottom: '25px',
    fontSize: '14px'
  },
  formStyle: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  labelStyle: {
    fontWeight: '600',
    color: '#4A5568',
    fontSize: '13px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  inputStyle: {
    width: '100%',
    padding: '12px 15px',
    border: '1px solid #CBD5E0',
    borderRadius: '8px',
    fontSize: '15px',
    outline: 'none',
    background: '#F7FAFC',
    boxSizing: 'border-box',
    transition: 'border 0.2s',
    fontFamily: 'inherit'
  },
  btnStyle: {
    background: '#3182CE',
    color: 'white',
    padding: '14px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: '10px',
    boxShadow: '0 4px 10px rgba(49, 130, 206, 0.2)'
  }
};
