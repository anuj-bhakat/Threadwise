import { useState } from 'react';
import axios from 'axios';
import styles from '../styles/components/ContextForm.module.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function ContextForm({ threadId, token, onSuccess }) {
    const [contextContent, setContextContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!contextContent.trim() || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await axios.post(`${API_URL}/contexts`, { thread_id: threadId, content: contextContent }, { headers: { Authorization: `Bearer ${token}` } });
            setContextContent("");
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles['fade-in']}>
            <textarea
                className={styles.textarea}
                placeholder="Add a note or meeting summary..."
                value={contextContent}
                onChange={(e) => setContextContent(e.target.value)}
                rows="4"
            />
            <button type="submit" className={styles['primary-btn']} disabled={!contextContent.trim() || isSubmitting}>
                {isSubmitting ? "Posting..." : "Post Context"}
            </button>
        </form>
    );
}
