import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Real-time Socket Setup
  useEffect(() => {
    // 1. Get current logged in user
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (!user) return; // Wait until logged in

    const { role, email } = user;

    // 2. Initial Fetch History
    const fetchHistory = async () => {
      try {
         const SERVER_URL = import.meta.env.VITE_BACKEND_URL || '';
         const res = await fetch(`${SERVER_URL}/api/notifications?role=${encodeURIComponent(role)}&email=${encodeURIComponent(email)}`);
         const data = await res.json();
         if (data.notifications) {
           setNotifications(data.notifications);
           setUnreadCount(data.notifications.filter(n => !n.isRead).length);
         }
      } catch (err) {
         console.warn("Could not fetch old notifications", err);
      }
    };
    fetchHistory();

    // 3. Connect via Socket.io
    const SERVER_URL = import.meta.env.VITE_BACKEND_URL || '';
    const socket = io(SERVER_URL || '/');
    
    socket.on('connect', () => {
      console.log('✅ Connected to real-time notification socket');
      socket.emit('join', { role, email });
    });

    // 4. Handle incoming real-time notifications
    socket.on('newNotification', (newNotif) => {
      console.log('📬 NEW Real-Time Notification Received!', newNotif);
      
      // Update our state cleanly
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // (Optional) Could trigger browser push notification here
      if (Notification.permission === 'granted') {
          new Notification(newNotif.title, { body: newNotif.message });
      }
    });

    return () => {
      socket.disconnect(); // Cleanup on unmount
    };
  }, []); // Run once on mount

  // Click outside to close map
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mark a specific notification as read in DB and UI
  const markAsRead = async (id) => {
    try {
        const SERVER_URL = import.meta.env.VITE_BACKEND_URL || '';
        await fetch(`${SERVER_URL}/api/notifications/${id}/read`, { method: 'PATCH' });
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    } catch(err) {
        console.warn('Failed to mark read', err);
    }
  };

  const toggleDropdown = () => {
     setIsOpen(!isOpen);
     // Ask permission first time they open it just in case
     if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
     }
  };

  return (
    <div style={styles.container} ref={dropdownRef}>
      
      {/* The Bell Icon */}
      <div style={styles.iconBtn} onClick={toggleDropdown}>
        <span style={styles.bellIcon}>🔔</span>
        {unreadCount > 0 && (
          <span style={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </div>

      {/* The Dropdown Menu */}
      {isOpen && (
        <div className="notif-dropdown" style={styles.dropdown}>
          <div style={styles.dropHeader}>
            <h4 style={{margin: 0, fontSize: '15px'}}>Notifications</h4>
            <span style={{fontSize: '12px', color: '#666'}}>{unreadCount} unread</span>
          </div>

          <div style={styles.scrollArea}>
            {notifications.length === 0 ? (
               <div style={styles.empty}>You have no notifications yet.</div>
            ) : (
               notifications.map(notif => (
                 <div 
                   key={notif._id} 
                   onClick={() => !notif.isRead && markAsRead(notif._id)}
                   style={{
                     ...styles.notifItem,
                     backgroundColor: notif.isRead ? '#fff' : '#F0F9FF',
                     borderLeft: notif.isRead ? '4px solid transparent' : '4px solid #3182CE'
                   }}
                 >
                    <div style={styles.notifTitle}>
                      {notif.title}
                      {notif.priority === 'High' && <span style={styles.highBadge}>High Priority</span>}
                    </div>
                    <div style={styles.notifBody}>{notif.message}</div>
                    <div style={styles.notifTime}>
                       {new Date(notif.createdAt).toLocaleString([], {hour: '2-digit', minute:'2-digit', month: 'short', day: 'numeric'})}
                    </div>
                 </div>
               ))
            )}
          </div>
        </div>
      )}
      
      {/* Inject Media Queries for Dropdown */}
      <style>{`
        @media (max-width: 400px) {
          .notif-dropdown {
            width: 300px !important;
            right: -60px !important;
            max-width: 95vw !important;
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: { position: 'relative' },
  iconBtn: { position: 'relative', cursor: 'pointer', padding: '8px', borderRadius: '50%', '&:hover': { background: '#F1F5F9' } },
  bellIcon: { fontSize: '20px' },
  badge: {
    position: 'absolute', top: 0, right: 0, background: '#E53E3E', color: 'white',
    fontSize: '10px', fontWeight: 'bold', width: '18px', height: '18px', display: 'flex',
    alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '2px solid white'
  },
  dropdown: {
    position: 'absolute', top: '45px', right: '-10px', width: '350px',
    background: '#FFF', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    border: '1px solid #E2E8F0', zIndex: 1000, overflow: 'hidden', display: 'flex', flexDirection: 'column'
  },
  dropHeader: {
    padding: '16px 20px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  },
  scrollArea: { maxHeight: '400px', overflowY: 'auto' },
  empty: { padding: '30px 20px', textAlign: 'center', color: '#A0AEC0', fontSize: '14px' },
  notifItem: { padding: '16px 20px', borderBottom: '1px solid #F1F5F9', cursor: 'pointer', transition: '0.2s' },
  notifTitle: { fontWeight: '600', fontSize: '14px', color: '#2D3748', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' },
  notifBody: { fontSize: '13px', color: '#4A5568', lineHeight: '1.4' },
  notifTime: { fontSize: '11px', color: '#A0AEC0', marginTop: '8px' },
  highBadge: { fontSize: '10px', background: '#FED7D7', color: '#C53030', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }
};

export default NotificationBell;
