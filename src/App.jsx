import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute
import LandingPage from './pages/LandingPage';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import CitizenDashboard from './pages/CitizenDashboard';
import CyberPoliceDashboard from './pages/CyberPoliceDashboard';
import ForensicDashboard from './pages/ForensicDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Pages with the Main Navbar */}
        <Route path="/" element={<><Navbar /><LandingPage /></>} />
        <Route path="/login" element={<><Navbar /><Login /></>} />
        <Route path="/signup" element={<><Navbar /><Signup /></>} />

        {/* Dashboard: No Main Navbar here! It uses its own Sidebar/Nav */}
        <Route
          path="/citizen-dashboard"
          element={
            <ProtectedRoute allowedRoles={['Citizen']}>
              <CitizenDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/police-dashboard"
          element={
            <ProtectedRoute allowedRoles={['Cyber Police']}>
              <CyberPoliceDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forensic-dashboard"
          element={
            <ProtectedRoute allowedRoles={['Forensic Expert']}>
              <ForensicDashboard />
            </ProtectedRoute>
          }
        />


        {/* Redirect legacy admin route to police dashboard */}
        <Route path="/admin-dashboard" element={<Navigate to="/police-dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;