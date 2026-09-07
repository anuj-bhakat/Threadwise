import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import ContextForm from "../components/ContextForm";
import TaskForm from "../components/TaskForm";
import ActivityTimeline from "../components/ActivityTimeline";
import styles from "../styles/pages/ThreadView.module.css";

const API_URL = import.meta.env.VITE_API_URL;

function ThreadView() {
    const location = useLocation();
    const id = location.state?.threadId;
    const navigate = useNavigate();
    const [thread, setThread] = useState(null);
    const [associatedPeople, setAssociatedPeople] = useState([]);
    const [activity, setActivity] = useState([]);
    const [allPeople, setAllPeople] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [activeTab, setActiveTab] = useState('context');

    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchThreadDetails();
        fetchAllPeople();
    }, [id]);

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: '2-digit'
        });
    };

    const fetchThreadDetails = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`${API_URL}/threads/details?id=${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = res.data;
            setThread(data);
            setAssociatedPeople(data.associated_people || []);

            const contexts = (data.contexts || []).map(c => ({ ...c, type: 'context' }));
            const tasks = (data.tasks || []).map(t => ({ ...t, type: 'task' }));
            const merged = [...contexts, ...tasks].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setActivity(merged);
        } catch (error) {
            console.error("Error fetching thread details", error);
            if (error.response?.status === 404) navigate('/threads');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAllPeople = async () => {
        try {
            const res = await axios.get(`${API_URL}/people`, { headers: { Authorization: `Bearer ${token}` } });
            setAllPeople(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    if (isLoading && !thread) {
        return (
            <div className={styles['page-wrapper']}>
                <Navbar />
                <div className={styles['view-container']}>
                    <div className={styles['skeleton-header']}>
                        <div className={styles['skeleton-box']} style={{ width: '40%', height: '32px', marginBottom: '12px' }}></div>
                        <div className={styles['skeleton-box']} style={{ width: '80%', height: '20px', marginBottom: '24px' }}></div>
                        <div className={styles['skeleton-box']} style={{ width: '20%', height: '24px' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles['page-wrapper']}>
            <Navbar />

            <div className={styles['view-container']}>
                <button className={styles['back-btn']} onClick={() => navigate('/threads')}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                    Back to Threads
                </button>

                <div className={styles['thread-header']}>
                    <h1 className={styles.title}>{thread?.title}</h1>
                    <p className={styles.desc}>{thread?.description || "No description provided."}</p>

                    <div className={styles['associated-people']}>
                        <span className={styles['people-label']}>Associated People:</span>
                        <div className={styles.badges}>
                            {associatedPeople.length > 0 ? associatedPeople.map(p => (
                                <span key={p.person_id} className={styles.badge}>{p.name}</span>
                            )) : <span className={styles['empty-text']}>None</span>}
                        </div>
                    </div>
                </div>

                <div className={styles['main-layout']}>
                    <div className={styles['activity-feed-section']}>
                        <h2 className={styles['section-title']}>Activity Timeline</h2>

                        <ActivityTimeline
                            activity={activity}
                            token={token}
                            fetchThreadDetails={fetchThreadDetails}
                            setActivity={setActivity}
                        />
                    </div>

                    <div className={styles['inputs-section']}>
                        <div className={styles['action-panel']}>
                            <div className={styles['action-tabs']}>
                                <button
                                    className={`${styles['tab-btn']} ${activeTab === 'context' ? styles.active : ''}`}
                                    onClick={() => setActiveTab('context')}
                                >
                                    Add Context
                                </button>
                                <button
                                    className={`${styles['tab-btn']} ${activeTab === 'task' ? styles.active : ''}`}
                                    onClick={() => setActiveTab('task')}
                                >
                                    Follow-up Task
                                </button>
                            </div>

                            <div className={styles['action-content']}>
                                {activeTab === 'context' && (
                                    <ContextForm threadId={id} token={token} onSuccess={fetchThreadDetails} />
                                )}

                                {activeTab === 'task' && (
                                    <TaskForm threadId={id} token={token} allPeople={associatedPeople} onSuccess={fetchThreadDetails} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ThreadView;
