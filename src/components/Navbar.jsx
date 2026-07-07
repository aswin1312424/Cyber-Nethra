import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import logo from '../assets/logo.jpeg';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50);
  });

  return (
    <motion.nav
      style={{
        ...styles.nav,
        background: scrolled ? 'rgba(255, 255, 255, 0.85)' : '#FFFFFF',
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
        boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.05)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E1E8ED',
      }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        style={styles.logoGroup}
      >
        <Link to="/" style={styles.logoLink}>
          <img src={logo} alt="CyberNetra Logo" style={styles.logoImg} />
          <h2 style={styles.logoText}>CYBERNETRA</h2>
        </Link>
      </motion.div>

      <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        {mobileMenuOpen ? '✖' : '☰'}
      </button>

      <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`} style={styles.links}>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/login">Login</NavLink>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link to="/signup" style={styles.primaryBtn}>Register</Link>
        </motion.div>
      </div>
    </motion.nav>
  );
};

const NavLink = ({ to, children }) => (
  <Link to={to} style={styles.navLink}>
    <motion.span whileHover={{ color: '#003366', y: -2 }} transition={{ type: 'spring', stiffness: 300 }}>
      {children}
    </motion.span>
  </Link>
);

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '15px 8%',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    width: '100%',
    transition: 'all 0.3s ease'
  },
  logoLink: { textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' },
  logoImg: { height: '45px', width: 'auto', borderRadius: "50px" },
  logoText: { color: '#003366', margin: 0, letterSpacing: '1px', fontSize: '22px', fontWeight: '800' },
  links: { display: 'flex', alignItems: 'center', gap: '30px' },
  navLink: { textDecoration: 'none', color: '#334E68', fontWeight: '600', fontSize: '15px' },
  primaryBtn: { textDecoration: 'none', background: '#003366', color: 'white', padding: '10px 22px', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold' },
};

export default Navbar;