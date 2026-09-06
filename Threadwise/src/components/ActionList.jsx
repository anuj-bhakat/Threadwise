import { useNavigate as useRouterNavigate } from "react-router-dom";
import styles from "../styles/components/ActionList.module.css";

export default function ActionList({ threads, tab }) {
    // Use router navigation
    const navigate = useRouterNavigate();

    // If no items, show empty state
    if (!threads || threads.length === 0) {
        return <div className={styles['empty-state']}>No {tab === 'due' ? 'due today' : tab} items right now. You're all caught up!</div>;
    }

    // Badge rendering based on tab and item properties
    const renderBadge = (item) => {
        const dateStr = item.due_date ? new Date(item.due_date).toLocaleDateString() : '';
        if (tab === 'overdue') {
            return <span className={`${styles.badge} ${styles.overdue}`}>🚨 Overdue: {dateStr}</span>;
        } else if (tab === 'due') {
            return <span className={`${styles.badge} ${styles['due-today']}`}>⚠️ Due Today</span>;
        } else if (tab === 'upcoming') {
            return <span className={`${styles.badge} ${styles.upcoming}`}>📅 Due {dateStr}</span>;
        } else if (tab === 'inactive') {
            return <span className={`${styles.badge} ${styles.inactive}`}>💤 Inactive for {item.inactive_days} days</span>;
        }
        return null;
    };

    const statusClass = {
        overdue: styles['overdue-item'],
        due: styles['due-item'],
        upcoming: styles['upcoming-item'],
        inactive: styles['inactive-item'],
    }[tab];

    return (
        <div className={styles['action-list']}>
            {threads.map(item => (
                <div
                    key={`${item.thread_id}-${item.task_id || 'inactive'}`}
                    className={`${styles['action-item']} ${statusClass}`}
                    onClick={() => navigate('/thread-view', { state: { threadId: item.thread_id } })}
                >
                    <div className={styles['item-info']}>
                        <div className={styles['title-row']}>
                            <h4 className={styles.title}>{item.thread_title || item.title}</h4>
                            {renderBadge(item)}
                        </div>
                        <p className={styles.desc}>{item.description?.substring(0, 100) || "No description"}{item.description && item.description.length > 100 ? '...' : ''}</p>
                    </div>
                    <div className={styles['item-action']}>
                        <svg className={styles.chevron} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                    </div>
                </div>
            ))}
        </div>
    );
}
