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

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: '2-digit'
        });
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
            {activity.map(item => (
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
                            <span className={styles['item-date']}>{formatDate(item.created_at)}</span>
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
                                        <span className={styles.due}>
                                            {new Date(item.due_date).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                                {item.assignees && item.assignees.length > 0 && (
                                    <div className={styles['task-assignees']}>
                                        Associated: {item.assignees.map(a => a.name).join(', ')}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
