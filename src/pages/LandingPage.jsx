import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import LoadingScreen from '../components/LoadingScreen';

const LandingPage = () => {
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  /* const slides = [ ... ]; */

  useEffect(() => {
    // Matches your 8-second loading.mp4 video
    const timer = setTimeout(() => setLoading(false), 8000);
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => { clearTimeout(timer); clearInterval(interval); };
  }, [heroSlides.length]);

  if (loading) return <LoadingScreen />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.container}>

      {/* 1. NEWS TICKER */}
      <div style={styles.carouselBar}>
        <AnimatePresence mode="wait">
          <motion.p
            key={currentSlide}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            style={styles.carouselText}
          >
            🔔 <strong>LATEST UPDATE:</strong> {heroSlides[currentSlide].title}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* 2. HERO CAROUSEL */}
      <header className="hero-header" style={styles.hero}>
        <div style={styles.heroOverlay}></div>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            style={styles.heroContent}
          >
            <motion.h1
              className="hero-title"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={styles.heroTitle}
            >
              {heroSlides[currentSlide].title}
            </motion.h1>
            <motion.p
              className="hero-sub"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={styles.heroSub}
            >
              {heroSlides[currentSlide].sub}
            </motion.p>
            <div className="hero-btns" style={styles.heroBtns}>
              <Link to="/signup" style={styles.mainBtn}>{heroSlides[currentSlide].btn1}</Link>
              <button style={styles.secBtn}>{heroSlides[currentSlide].btn2}</button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Indicators */}
        <div style={styles.carouselDots}>
          {heroSlides.map((_, i) => (
            <div
              key={i}
              onClick={() => setCurrentSlide(i)}
              style={{
                ...styles.dot,
                background: i === currentSlide ? '#003366' : '#CBD5E0',
                transform: i === currentSlide ? 'scale(1.3)' : 'scale(1)'
              }}
            />
          ))}
        </div>
      </header>

      {/* 3. ACHIEVEMENTS SECTION (Clean Card-Style) */}
      <section className="achievements-area" style={styles.achievementsArea}>
        <div className="achievements-grid" style={styles.achievementsGrid}>
          {statsData.map((stat, i) => (
            <motion.div key={i} className="stat-card" whileHover={{ y: -5 }} style={styles.statCard}>
              <h2 style={styles.statNum}>{stat.value}</h2>
              <p style={styles.statLabel}>{stat.label}</p>
              <div style={styles.statLine}></div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. OPERATIONAL CAPABILITIES */}
      <section className="showcase-section" style={styles.showcaseSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Operational Capabilities</h2>
          <div style={styles.titleUnderline}></div>
        </div>

        <div style={styles.showcaseGrid}>
          {featuresData.map((f, i) => (
            <motion.div key={i} whileHover={{ y: -10 }} style={styles.showcaseCard}>
              <div style={styles.cardHeader}>
                <span style={styles.showcaseIcon}>{f.icon}</span>
                <span style={styles.cardTag}>ACTIVE</span>
              </div>
              <h3 style={styles.cardTitle}>{f.title}</h3>
              <p style={styles.cardDesc}>{f.desc}</p>
              <button style={styles.cardBtn}>Explore Module →</button>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </motion.div>
  );
};

// --- DATA ---
const statsData = [
  { value: "1.2M+", label: "Incidents Neutralized" },
  { value: "98.4%", label: "AI Accuracy" },
  { value: "24/7", label: "National Monitoring" },
  { value: "150+", label: "Forensic Labs Linked" }
];

const featuresData = [
  { icon: "🔍", title: "Neural Deepfake Scan", desc: "Multi-layered CNN analysis to detect manipulated media and voice clones." },
  { icon: "💰", title: "Crypto-Fraud Tracker", desc: "Real-time blockchain tracing for suspicious financial movements." },
  { icon: "🔐", title: "Evidence Vault", desc: "Military-grade encrypted storage for digital chain-of-custody logs." },
  { icon: "📡", title: "DarkWeb Monitor", desc: "Automated scanning for leaked government and personal credentials." },
  { icon: "🤝", title: "Role Coordination", desc: "Seamless bridge between Police, Forensics, and Financial Officers." },
  { icon: "📊", title: "Risk Intelligence", desc: "Predictive AI scoring for reported threats based on global patterns." }
];

// --- FOOTER COMPONENT ---
const Footer = () => (
  <footer style={styles.footer}>
    <div className="footer-grid" style={styles.footerGrid}>
      <div style={styles.footerCol}>
        <h3 style={styles.footerHead}>CYBERNETRA</h3>
        <p style={styles.footerText}>National portal for advanced cybercrime management and forensic analysis.</p>
      </div>
      <div style={styles.footerCol}>
        <h4 style={styles.footerHead}>Resources</h4>
        <a href="#" style={styles.fLink}>Reporting Portal</a>
        <a href="#" style={styles.fLink}>Forensic Guide</a>
        <a href="#" style={styles.fLink}>Safety Tips</a>
      </div>
      <div style={styles.footerCol}>
        <h4 style={styles.footerHead}>Contact</h4>
        <p style={styles.footerText}>📧 support@cybernetra.gov.in</p>
        <p style={styles.footerText}>📞 1930 (Helpline)</p>
      </div>
      <div style={styles.footerCol}>
        <h4 style={styles.footerHead}>Newsletter</h4>
        <div style={styles.newsLetter}>
          <input type="email" placeholder="Email Address" style={styles.newsInput} />
          <button style={styles.newsBtn}>Join</button>
        </div>
      </div>
    </div>
    <div style={styles.footerBottom}>
      <p>© 2026 CYBERNETRA - Ministry of Electronics & IT, Govt of India</p>
    </div>
  </footer>
);

// --- HERO SLIDES DATA ---
const heroSlides = [
  {
    title: "Secure the Digital Frontier",
    sub: "National portal for AI-powered cybercrime analysis, forensic investigation, and rapid reporting.",
    btn1: "Report a Crime Now",
    btn2: "Verify Evidence"
  },
  {
    title: "AI-Powered Threat Detection",
    sub: "Utilizing advanced neural networks to identify and neutralize deepfakes and crypto fraud in real-time.",
    btn1: "Scan Media",
    btn2: "Learn More"
  },
  {
    title: "24/7 Citizen Support",
    sub: "Direct line to cyber-cells and forensic experts. Your safety is our national priority.",
    btn1: "Get Help",
    btn2: "Emergency Contact"
  }
];

// --- STYLES ---
const styles = {
  container: { fontFamily: "'Inter', sans-serif", color: '#334E68', background: '#FFFFFF' },
  carouselBar: { background: '#003366', color: 'white', padding: '12px', textAlign: 'center', height: '45px' },
  carouselText: { margin: 0, fontSize: '14px', fontWeight: 'bold' },

  hero: {
    textAlign: 'center',
    padding: '140px 20px',
    background: 'radial-gradient(circle, #f0f4f8 0%, #ffffff 100%)',
    minHeight: '75vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  heroContent: { maxWidth: '900px', width: '100%' },
  heroTitle: { fontSize: '72px', color: '#003366', marginBottom: '20px', fontWeight: '900', letterSpacing: '-1.5px' },
  heroSub: { fontSize: '22px', maxWidth: '800px', margin: '0 auto 40px', lineHeight: '1.6', color: '#486581' },
  heroBtns: { display: 'flex', gap: '20px', justifyContent: 'center' },
  mainBtn: { textDecoration: 'none', background: '#003366', color: 'white', padding: '18px 40px', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', boxShadow: '0 4px 14px rgba(0,51,102,0.3)' },
  secBtn: { background: 'none', border: '2px solid #003366', color: '#003366', padding: '18px 40px', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' },

  carouselDots: { display: 'flex', gap: '12px', marginTop: '50px' },
  dot: { width: '12px', height: '12px', borderRadius: '50%', cursor: 'pointer', transition: 'all 0.3s ease' },

  achievementsArea: { padding: '80px 8%', background: '#F8FAFC', display: 'flex', justifyContent: 'center' },
  achievementsGrid: { display: 'flex', gap: '25px', justifyContent: 'center', width: '100%', maxWidth: '1200px', flexWrap: 'wrap' },
  statCard: { background: '#FFFFFF', padding: '35px 25px', borderRadius: '15px', width: '270px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0, 51, 102, 0.05)', border: '1px solid #E1E8ED' },
  statNum: { fontSize: '46px', color: '#003366', margin: '0 0 10px 0', fontWeight: '900' },
  statLabel: { fontSize: '14px', color: '#627D98', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' },
  statLine: { height: '4px', width: '40px', background: '#00D4FF', margin: '15px auto 0', borderRadius: '2px' },

  showcaseSection: { padding: '100px 8%', background: '#fff' },
  sectionHeader: { textAlign: 'center', marginBottom: '60px' },
  sectionTitle: { fontSize: '42px', color: '#003366', fontWeight: '800' },
  titleUnderline: { height: '5px', width: '80px', background: '#00D4FF', margin: '15px auto' },
  showcaseGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' },
  showcaseCard: { background: '#F8FAFC', padding: '45px 35px', borderRadius: '20px', border: '1px solid #E2E8F0', position: 'relative' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '25px' },
  showcaseIcon: { fontSize: '45px' },
  cardTag: { fontSize: '11px', background: '#E6FFFA', color: '#2C7A7B', padding: '5px 12px', borderRadius: '12px', fontWeight: 'bold' },
  cardTitle: { fontSize: '24px', color: '#003366', marginBottom: '18px' },
  cardDesc: { color: '#4A5568', lineHeight: '1.7', fontSize: '16px', marginBottom: '30px' },
  cardBtn: { background: 'none', border: 'none', color: '#003366', fontWeight: 'bold', cursor: 'pointer', padding: 0, fontSize: '15px' },

  footer: { background: '#001529', color: 'white', padding: '90px 8% 30px' },
  footerGrid: { display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '50px' },
  footerCol: { flex: 1, minWidth: '220px' },
  footerHead: { fontSize: '22px', marginBottom: '30px', color: '#00D4FF', fontWeight: '700' },
  footerText: { fontSize: '15px', opacity: 0.7, lineHeight: '1.8' },
  fLink: { display: 'block', color: 'white', textDecoration: 'none', marginBottom: '15px', opacity: 0.7, fontSize: '15px' },
  newsLetter: { display: 'flex', marginTop: '15px' },
  newsInput: { padding: '14px', borderRadius: '6px 0 0 6px', border: 'none', width: '100%', fontSize: '14px' },
  newsBtn: { background: '#00D4FF', border: 'none', padding: '0 25px', borderRadius: '0 6px 6px 0', cursor: 'pointer', fontWeight: 'bold', color: '#001529' },
  footerBottom: { borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '60px', paddingTop: '30px', textAlign: 'center', fontSize: '14px', opacity: 0.5 }
};

export default LandingPage;