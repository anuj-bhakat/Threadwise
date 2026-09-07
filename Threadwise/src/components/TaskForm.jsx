import { useState } from 'react';
import axios from 'axios';
import styles from '../styles/components/TaskForm.module.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function TaskForm({ threadId, token, allPeople, onSuccess }) {
    const [taskDesc, setTaskDesc] = useState("");
    const [taskPriority, setTaskPriority] = useState("medium");
    const [taskDueDate, setTaskDueDate] = useState("");
    const [taskPersonIds, setTaskPersonIds] = useState([]);
    const [personSearch, setPersonSearch] = useState("");
    const [setReminder, setSetReminder] = useState(false);
    const [reminderTime, setReminderTime] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const filteredPeople = allPeople.filter(p => p.name.toLowerCase().includes(personSearch.toLowerCase()));

    const togglePersonSelection = (personId) => {
        setTaskPersonIds(prev => prev.includes(personId) ? prev.filter(id => id !== personId) : [...prev, personId]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!taskDesc.trim() || isSubmitting) return;
        setIsSubmitting(true);
        try {
            const res = await axios.post(`${API_URL}/tasks`, {
                thread_id: threadId,
                description: taskDesc,
                priority: taskPriority,
                due_date: taskDueDate || null,
                person_ids: taskPersonIds
            }, { headers: { Authorization: `Bearer ${token}` } });

            const newTask = res.data;

            if (setReminder && reminderTime) {
                await axios.post(`${API_URL}/reminders`, {
                    task_id: newTask.task_id,
                    reminder_time: new Date(reminderTime).toISOString()
                }, { headers: { Authorization: `Bearer ${token}` } });
            }

            setTaskDesc("");
            setTaskPriority("medium");
            setTaskDueDate("");
            setTaskPersonIds([]);
            setSetReminder(false);
            setReminderTime("");
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles['fade-in']}>
            <div className={styles['form-group']}>
                <label>Description</label>
                <input
                    type="text"
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    placeholder="What needs to be done?"
                    required
                />
            </div>
            <div className={styles['form-row']}>
                <div className={styles['form-group']}>
                    <label>Priority</label>
                    <div className={styles['priority-selector']}>
                        <button type="button" className={`${styles['priority-btn']} ${taskPriority === 'low' ? styles['selected-low'] : ''}`} onClick={() => setTaskPriority('low')}>Low</button>
                        <button type="button" className={`${styles['priority-btn']} ${taskPriority === 'medium' ? styles['selected-medium'] : ''}`} onClick={() => setTaskPriority('medium')}>Medium</button>
                        <button type="button" className={`${styles['priority-btn']} ${taskPriority === 'high' ? styles['selected-high'] : ''}`} onClick={() => setTaskPriority('high')}>High</button>
                    </div>
                </div>
                <div className={styles['form-group']}>
                    <label>Due Date</label>
                    <input
                        type="date"
                        value={taskDueDate}
                        onChange={(e) => setTaskDueDate(e.target.value)}
                    />
                </div>
            </div>
            <div className={styles['form-group']}>
                <label className={styles['checkbox-label']}>
                    <input
                        type="checkbox"
                        checked={setReminder}
                        onChange={(e) => setSetReminder(e.target.checked)}
                    />
                    Set Reminder?
                </label>
            </div>
            {setReminder && (
                <div className={styles['form-group']}>
                    <label>Reminder Time</label>
                    <input
                        type="datetime-local"
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                        required={setReminder}
                    />
                </div>
            )}
            <div className={styles['form-group']}>
                <label>Assign People</label>
                <input
                    type="text"
                    placeholder="Search directory..."
                    value={personSearch}
                    onChange={(e) => setPersonSearch(e.target.value)}
                    className={styles['search-input']}
                />
                <div className={styles['people-list']}>
                    {filteredPeople.map(p => (
                        <label key={p.person_id} className={`${styles['person-select']} ${taskPersonIds.includes(p.person_id) ? styles.selected : ''}`}>
                            <input
                                type="checkbox"
                                checked={taskPersonIds.includes(p.person_id)}
                                onChange={() => togglePersonSelection(p.person_id)}
                            />
                            {p.name}
                        </label>
                    ))}
                </div>
            </div>
            <button type="submit" className={styles['primary-btn']} disabled={!taskDesc.trim() || isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Task"}
            </button>
        </form>
    );
}
