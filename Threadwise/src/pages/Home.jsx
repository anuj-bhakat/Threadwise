import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import ActionList from "../components/ActionList";
import styles from "../styles/pages/Home.module.css";

const API_URL = import.meta.env.VITE_API_URL;

function Home() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [activeTab, setActiveTab] = useState('overdue');
  const [needsActionData, setNeedsActionData] = useState({
    overdue: [],
    due_today: [],
    upcoming: [],
    inactive: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNeedsAction();
  }, []);

  const fetchNeedsAction = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/threads/needs-action`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNeedsActionData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles['home-container']}>
      <Navbar />
      
      <main className={styles['home-content']}>
        <div className={styles['welcome-header']}>
          <h2>Welcome, {user?.name}</h2>
        </div>



        <section className={styles['needs-action-section']}>
          <h3 className={styles['section-title']}>Needs Action</h3>
          
          <div className={styles['tabs-container']}>
            <button 
              className={`${styles.tab} ${activeTab === 'overdue' ? styles.active : ''}`}
              onClick={() => setActiveTab('overdue')}
            >
              Overdue
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'due' ? styles.active : ''}`}
              onClick={() => setActiveTab('due')}
            >
              Due Today
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'upcoming' ? styles.active : ''}`}
              onClick={() => setActiveTab('upcoming')}
            >
              Upcoming
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'inactive' ? styles.active : ''}`}
              onClick={() => setActiveTab('inactive')}
            >
              Inactive
            </button>
          </div>

          <div className={styles['tab-content']}>
            {isLoading ? (
              <div className={styles['loading-container']}>
                <div className={styles.loader}></div>
                <p className={styles['placeholder-text']}>Loading your dashboard...</p>
              </div>
            ) : (
              <ActionList 
                threads={activeTab === 'due' ? needsActionData.due_today : needsActionData[activeTab]} 
                tab={activeTab} 
              />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;