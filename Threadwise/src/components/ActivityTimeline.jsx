import { useState } from 'react';
import axios from 'axios';
import styles from '../styles/components/ActivityTimeline.module.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function ActivityTimeline({ activity, token, fetchThreadDetails, setActivity }) {
    const [editingContextId, setEditingContextId] = useState(null);
    const [editContextContent, setEditContextContent] = useState("");
    const [isSavingContextId, setIsSavingContextId] = useState(null);
    const [isDeletingContextId, setIsDeletingContextId] = useState(null);
    const [isDeletingTaskId, setIsDeletingTaskId] = useState(null);

    const formatTime = (dateStr) => {
        return new Date(dateStr).toLocaleTimeString('en-US', {
            hour: 'numeric', minute: '2-digit'
        });
    };

    const groupActivitiesByDate = () => {
        const groups = [];
        let lastDateStr = null;
        let currentGroup = null;

        activity.forEach(item => {
            const dateObj = new Date(item.created_at);
            const dateStr = dateObj.toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
            });

            if (dateStr !== lastDateStr) {
                currentGroup = {
                    date: dateStr,
                    items: []
                };
                groups.push(currentGroup);
                lastDateStr = dateStr;
            }
            
            currentGroup.items.push(item);
        });

        return groups;
    };

    const handleEditContextClick = (contextId, currentContent) => {
        setEditingContextId(contextId);
        setEditContextContent(currentContent);
    };

    const handleCancelEdit = () => {
        setEditingContextId(null);
        setEditContextContent("");
    };

    const handleUpdateContext = async (contextId) => {
        if (!editContextContent.trim()) return;
        setIsSavingContextId(contextId);
        try {
            await axios.put(`${API_URL}/contexts/${contextId}`, { content: editContextContent }, { headers: { Authorization: `Bearer ${token}` } });
            setEditingContextId(null);
            setEditContextContent("");
            fetchThreadDetails();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSavingContextId(null);
        }
    };

    const handleDeleteContext = async (contextId) => {
        if (confirm("Are you sure you want to delete this note?")) {
            setIsDeletingContextId(contextId);
            try {
                await axios.delete(`${API_URL}/contexts/${contextId}`, { headers: { Authorization: `Bearer ${token}` } });
                fetchThreadDetails();
            } catch (error) {
                console.error(error);
            } finally {
                setIsDeletingContextId(null);
            }
        }
    };

    const toggleTaskStatus = async (taskId, currentStatus) => {
        const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';

        setActivity(prev => prev.map(item =>
            item.task_id === taskId ? { ...item, status: newStatus } : item
        ));

        try {
            await axios.put(`${API_URL}/tasks/${taskId}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
        } catch (error) {
            console.error(error);
            setActivity(prev => prev.map(item =>
                item.task_id === taskId ? { ...item, status: currentStatus } : item
            ));
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (confirm("Are you sure you want to delete this task?")) {
            setIsDeletingTaskId(taskId);
            try {
                await axios.delete(`${API_URL}/tasks/${taskId}`, { headers: { Authorization: `Bearer ${token}` } });
                fetchThreadDetails();
            } catch (error) {
                console.error(error);
            } finally {
                setIsDeletingTaskId(null);
            }
        }
    };

    if (activity.length === 0) {
        return <div className={styles['empty-timeline']}>No activity yet. Add context or a task to get started!</div>;
    }

    return (
        <div className={styles.timeline}>
            {groupActivitiesByDate().map((group) => (
                <div key={group.date} className={styles['timeline-group']}>
                    <div className={styles['timeline-date-header']}>
                        <div className={styles['date-node']}></div>
                        <span className={styles['date-text']}>Activity on {group.date}</span>
                    </div>
                    <div className={styles['group-items']}>
                        {group.items.map(item => (
                            <div key={item.type === 'context' ? item.context_id : item.task_id} className={`${styles['timeline-item']} ${styles[item.type]}`}>
                                <div className={styles['item-icon']}>
                        {item.type === 'context' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><line x1="10" x2="8" y1="9" y2="9" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
                        )}
                    </div>
                    <div className={styles['item-content']}>
                        <div className={styles['item-meta']}>
                            <span className={styles['item-date']}>{formatTime(item.created_at)}</span>
                            {item.type === 'context' && editingContextId !== item.context_id && (
                                <div className={styles['item-actions']}>
                                    <button onClick={() => handleEditContextClick(item.context_id, item.content)} className={styles['action-btn']}>Edit</button>
                                    <button onClick={() => handleDeleteContext(item.context_id)} className={`${styles['action-btn']} ${styles.danger}`} disabled={isDeletingContextId === item.context_id}>
                                        {isDeletingContextId === item.context_id ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            )}
                            {item.type === 'task' && (
                                <div className={styles['item-actions']}>
                                    <button onClick={() => handleDeleteTask(item.task_id)} className={`${styles['action-btn']} ${styles.danger}`} disabled={isDeletingTaskId === item.task_id}>
                                        {isDeletingTaskId === item.task_id ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {item.type === 'context' ? (
                            <div className={styles['context-wrapper']}>
                                {editingContextId === item.context_id ? (
                                    <div className={styles['edit-context-form']}>
                                        <textarea
                                            className={styles.textarea}
                                            value={editContextContent}
                                            onChange={(e) => setEditContextContent(e.target.value)}
                                            rows="3"
                                        />
                                        <div className={styles['edit-actions']}>
                                            <button className={styles['save-btn']} onClick={() => handleUpdateContext(item.context_id)} disabled={isSavingContextId === item.context_id}>
                                                {isSavingContextId === item.context_id ? 'Saving...' : 'Save'}
                                            </button>
                                            <button className={styles['cancel-btn']} onClick={handleCancelEdit} disabled={isSavingContextId === item.context_id}>Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className={styles['context-text']}>{item.content}</p>
                                )}
                            </div>
                        ) : (
                            <div className={`${styles['task-card']} ${item.status !== 'completed' ? styles[`priority-${item.priority}`] : ''}`}>
                                <div className={styles['task-header']}>
                                    <input
                                        type="checkbox"
                                        checked={item.status === 'completed'}
                                        onChange={() => toggleTaskStatus(item.task_id, item.status)}
                                        className={styles['task-checkbox']}
                                    />
                                    <span className={`${styles['task-desc']} ${item.status === 'completed' ? styles.completed : ''}`}>
                                        {item.description}
                                    </span>
                                    {item.due_date && (
                                        <span className={`${styles.due} ${item.status !== 'completed' ? styles[`due-${item.priority}`] : ''}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                                <line x1="3" y1="10" x2="21" y2="10"></line>
                                            </svg>
                                            {new Date(item.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    )}
                                </div>
                                {item.assignees && item.assignees.length > 0 && (
                                    <div className={styles['task-assignees']}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                            <circle cx="9" cy="7" r="4" />
                                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                        </svg>
                                        <span>{item.assignees.map(a => a.name).join(', ')}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
