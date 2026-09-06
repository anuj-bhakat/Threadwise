import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../styles/components/ThreadModal.module.css";

const API_URL = import.meta.env.VITE_API_URL;

function ThreadModal({ isOpen, thread, peopleList, onClose, onSuccess }) {
  const [formData, setFormData] = useState({ title: "", description: "", person_ids: [] });
  const [personSearchQuery, setPersonSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    setPersonSearchQuery("");
    if (thread) {
      const associatedIds = thread.associated_people.map(p => p.person_id);
      setFormData({ 
        title: thread.title || "", 
        description: thread.description || "", 
        person_ids: associatedIds 
      });
    } else {
      setFormData({ title: "", description: "", person_ids: [] });
    }
  }, [thread, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (personId) => {
    setFormData(prev => {
      const isSelected = prev.person_ids.includes(personId);
      if (isSelected) {
        return { ...prev, person_ids: prev.person_ids.filter(id => id !== personId) };
      } else {
        return { ...prev, person_ids: [...prev.person_ids, personId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      if (thread) {
        await axios.put(`${API_URL}/threads/${thread.thread_id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/threads`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving thread", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const filteredPeopleList = peopleList.filter(p => 
    (p.name && p.name.toLowerCase().includes(personSearchQuery.toLowerCase())) || 
    (p.email && p.email.toLowerCase().includes(personSearchQuery.toLowerCase()))
  );

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']}>
        <h3 className={styles['modal-title']}>{thread ? "Edit Thread" : "Create Thread"}</h3>
        <form onSubmit={handleSubmit}>
          <div className={styles['form-group']}>
            <label>Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required />
          </div>
          <div className={styles['form-group']}>
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="3" />
          </div>
          
          <div className={styles['form-group']}>
            <label>Associated People</label>
            <input 
              type="text" 
              placeholder="Search people to add..."
              value={personSearchQuery}
              onChange={(e) => setPersonSearchQuery(e.target.value)}
              className={styles['modal-search-input']}
            />
            <div className={styles['checkbox-group']}>
              {filteredPeopleList.length > 0 ? filteredPeopleList.map(person => (
                <label 
                  key={person.person_id} 
                  className={`${styles['checkbox-item']} ${formData.person_ids.includes(person.person_id) ? styles.selected : ''}`}
                >
                  <input 
                    type="checkbox" 
                    checked={formData.person_ids.includes(person.person_id)}
                    onChange={() => handleCheckboxChange(person.person_id)}
                  />
                  <span className={styles['checkbox-label-text']}>{person.name}</span>
                  {person.email && <span className={styles['checkbox-label-sub']}>({person.email})</span>}
                </label>
              )) : (
                <span className={styles['empty-text']}>No people found.</span>
              )}
            </div>
          </div>
          
          <div className={styles['modal-actions']}>
            <button type="button" className={styles['cancel-btn']} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles['submit-btn']} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : (thread ? "Save Changes" : "Create Thread")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ThreadModal;
