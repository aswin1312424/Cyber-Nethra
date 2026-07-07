import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // 1. Added useNavigate
import { GoogleLogin } from '@react-oauth/google';

const Signup = () => {
  const navigate = useNavigate(); // 2. Initialize navigate
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'Citizen'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. UPDATED handleSubmit to talk to your Backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ Success! Account created in CYBERNETRA.");
        navigate('/login'); // Redirect to login
      } else {
        alert("❌ Error: " + data.error);
      }
    } catch (err) {
      console.error("Signup error:", err);
      alert("❌ Server is not running! Did you start 'node server.js'?");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Join the CYBERNETRA Network</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              name="fullName"
              type="text"
              placeholder="John Doe"
              style={styles.input}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              name="email"
              type="email"
              placeholder="name@agency.gov"
              style={styles.input}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              style={styles.input}
              onChange={handleChange}
              required
            />
          </div>

          {/* Role Selection - Essential for your project objectives [cite: 35] */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Designated Role</label>
            <select
              name="role"
              style={styles.input}
              value={formData.role}
              onChange={handleChange}
            >
              <option value="Citizen">Citizen / Complainant</option>
              <option value="Cyber Police">Cyber Police Officer</option>
              <option value="Forensic Expert">Forensic Expert</option>
            </select>
          </div>

          <button type="submit" style={styles.signupBtn}>Sign Up</button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerLine}></span>
          <span style={styles.dividerText}>OR</span>
          <span style={styles.dividerLine}></span>
        </div>

        <div style={styles.googleContainer}>
          <GoogleLogin
            onSuccess={res => console.log(res)}
            onError={() => console.log('Signup Failed')}
            text="signup_with"
            shape="rectangular"
            width="100%"
          />
        </div>

        <p style={styles.footerText}>
          Already have an account? <Link to="/login" style={styles.link}>Login here</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: '#F0F4F8', // Light Professional Blue
    padding: '20px'
  },
  card: {
    background: '#FFFFFF',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 8px 30px rgba(0, 51, 102, 0.1)',
    width: '100%',
    maxWidth: '450px',
  },
  header: { textAlign: 'center', marginBottom: '30px' },
  title: { color: '#003366', fontSize: '28px', fontWeight: 'bold', marginBottom: '5px' },
  subtitle: { color: '#627D98', fontSize: '14px' },
  form: { display: 'flex', flexDirection: 'column', gap: '18px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', fontWeight: '700', color: '#334E68', textTransform: 'uppercase' },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1.5px solid #D9E2EC',
    fontSize: '15px',
    outline: 'none',
    transition: 'border 0.3s ease',
    backgroundColor: '#F9FAFB'
  },
  signupBtn: {
    backgroundColor: '#003366', // Deep Navy Blue
    color: '#FFFFFF',
    padding: '14px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: 'bold',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '10px'
  },
  divider: { display: 'flex', alignItems: 'center', margin: '25px 0' },
  dividerLine: { flex: 1, height: '1px', background: '#D9E2EC' },
  dividerText: { padding: '0 10px', fontSize: '12px', color: '#9FB3C8' },
  googleContainer: { display: 'flex', justifyContent: 'center' },
  footerText: { textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#486581' },
  link: { color: '#003366', fontWeight: 'bold', textDecoration: 'none' }
};

export default Signup;