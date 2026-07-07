import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

// 1. STYLES DEFINITION
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #FFFFFF 0%, #E6F0FF 100%)',
    padding: '20px',
    fontFamily: "'Inter', sans-serif"
  },
  card: {
    background: '#FFFFFF',
    padding: '45px 40px',
    borderRadius: '16px',
    boxShadow: '0 15px 35px rgba(0, 51, 102, 0.08)',
    width: '100%',
    maxWidth: '420px',
    border: '1px solid #E1E8ED'
  },
  logoContainer: { textAlign: 'center', marginBottom: '30px' },
  logoEye: { fontSize: '50px', display: 'block', marginBottom: '5px' },
  brandTitle: { color: '#003366', fontSize: '24px', fontWeight: '800', letterSpacing: '1px', margin: 0 },
  brandSubtitle: { color: '#627D98', fontSize: '13px', fontWeight: '500', marginTop: '5px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '11px', fontWeight: '700', color: '#486581', textTransform: 'uppercase' },
  input: {
    padding: '12px 15px',
    borderRadius: '8px',
    border: '1px solid #CFD9E0',
    fontSize: '15px',
    backgroundColor: '#F8FAFC',
    outline: 'none',
    transition: 'all 0.2s ease'
  },
  loginBtn: {
    backgroundColor: '#003366',
    color: '#FFFFFF',
    padding: '14px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: '700',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '5px',
    boxShadow: '0 4px 12px rgba(0, 51, 102, 0.2)'
  },
  divider: { display: 'flex', alignItems: 'center', margin: '30px 0' },
  line: { flex: 1, height: '1px', background: '#E1E8ED' },
  orText: { padding: '0 15px', fontSize: '10px', fontWeight: '800', color: '#9FB3C8', letterSpacing: '1px' },
  googleWrapper: { display: 'flex', justifyContent: 'center' },
  footer: { textAlign: 'center', marginTop: '30px', fontSize: '14px', color: '#627D98' },
  link: { color: '#0052CC', fontWeight: '700', textDecoration: 'none' }
};

const Login = () => {
  const navigate = useNavigate();

  // State for login fields including Role-Based Access Control [cite: 46]
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    role: 'Citizen'
  });

  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Connects to the structured authController 
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();

      if (response.ok) {
        // Securely store user session data [cite: 46]
        sessionStorage.setItem('user', JSON.stringify(data.user));
        alert(`Welcome back, ${data.user.fullName}! Accessing Command Center...`);

        // Dynamic Role-Based Redirection [cite: 27, 79]
        if (data.user.role === 'Citizen') {
          navigate('/citizen-dashboard');
        } else if (data.user.role === 'Cyber Police' || data.user.email === "admin@cyberpolice.gov.in") {
          navigate('/police-dashboard');
        } else if (data.user.role === 'Forensic Expert') {
          navigate('/forensic-dashboard');
        } else {
          // Future-proofing: Redirect others to home or show alert for now
          alert("Dashboard for this role is under construction.");
          navigate('/');
        }
      } else {
        alert(data.error || "Access Denied. Check credentials.");
      }
    } catch (err) {
      console.error("Login Error:", err);
      alert("Connection to CyberNetra server failed. Is the backend running?");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* The Nethra Eye Logo Section */}
        <div style={styles.logoContainer}>
          <span style={styles.logoEye}>👁️</span>
          <h2 style={styles.brandTitle}>CYBERNETRA</h2>
          <p style={styles.brandSubtitle}>National Cyber Command Center</p>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              name="email"
              type="email"
              placeholder="officer@cyber.gov"
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

          {/* Role selection for the multi-module workflow [cite: 27] */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Portal Role</label>
            <select
              name="role"
              style={styles.input}
              value={loginData.role}
              onChange={handleChange}
            >
              <option value="Citizen">Citizen / Complainant</option>
              <option value="Cyber Police">Cyber Police Officer</option>
              <option value="Forensic Expert">Forensic Expert</option>
            </select>
          </div>

          <button type="submit" style={styles.loginBtn}>Access Portal</button>
        </form>

        <div style={styles.divider}>
          <span style={styles.line}></span>
          <span style={styles.orText}>SECURE ACCESS</span>
          <span style={styles.line}></span>
        </div>

        <div style={styles.googleWrapper}>
          <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
            <GoogleLogin
              onSuccess={res => console.log("Google Login Success", res)}
              onError={() => console.log('Login Failed')}
              useOneTap
              width="300px"
            />
          </GoogleOAuthProvider>
        </div>

        <div style={styles.footer}>
          <span>New to CyberNetra?</span>
          <Link to="/signup" style={styles.link}> Register Account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;