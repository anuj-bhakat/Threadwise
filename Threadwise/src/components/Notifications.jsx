import { useState, useEffect, useRef } from "react";
import axios from "axios";
import styles from "../styles/components/Notifications.module.css";

const API_URL = import.meta.env.VITE_API_URL;

function Notifications() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [reminders, setReminders] = useState([]);
  const dropdownRef = useRef(null);

  const fetchReminders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get(`${API_URL}/reminders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReminders(res.data);
    } catch (err) {
      console.error("Error fetching reminders", err);
    }
  };

  useEffect(() => {
    fetchReminders();
    
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDismissReminder = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/reminders/${id}/dismiss`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReminders(prev => prev.filter(r => r.reminder_id !== id));
    } catch (err) {
      console.error("Error dismissing reminder", err);
    }
  };

  return (
    <div className={styles['notifications-wrapper']} ref={dropdownRef}>
      <button 
        className={styles['bell-btn']} 
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {reminders.length > 0 && <span className={styles.badge}>{reminders.length}</span>}
      </button>
      
      {showNotifications && (
        <div className={styles.dropdown}>
          <div className={styles['dropdown-header']}>
            <h3>Notifications</h3>
          </div>
          <div className={styles['dropdown-body']}>
            {reminders.length > 0 ? reminders.map(reminder => {
              const date = new Date(reminder.reminder_time).toLocaleString();
              return (
                <div key={reminder.reminder_id} className={styles['reminder-item']}>
                  <div className={styles['reminder-icon-container']}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                  </div>
                  <div className={styles['reminder-content']}>
                    <span className={styles['reminder-title']}>{reminder.task_description}</span>
                    <span className={styles['reminder-date']}>{date}</span>
                  </div>
                  <button 
                    className={styles['dismiss-btn']} 
                    onClick={() => handleDismissReminder(reminder.reminder_id)}
                    title="Dismiss"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              );
            }) : (
              <div className={styles['empty-state']}>No new notifications.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Notifications;
