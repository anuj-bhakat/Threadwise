import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../styles/components/PersonModal.module.css";

const API_URL = import.meta.env.VITE_API_URL;

function PersonModal({ isOpen, person, onClose, onSuccess }) {
  const [formData, setFormData] = useState({ name: "", email: "", designation: "", organization: "", phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (person) {
      setFormData({ 
        name: person.name || "", 
        email: person.email || "", 
        designation: person.designation || "", 
        organization: person.organization || "", 
        phone: person.phone || "" 
      });
    } else {
      setFormData({ name: "", email: "", designation: "", organization: "", phone: "" });
    }
  }, [person, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      if (person) {
        await axios.put(`${API_URL}/people/${person.person_id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/people`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving person", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']}>
        <h3 className={styles['modal-title']}>{person ? "Edit Person" : "Add Person"}</h3>
        <form onSubmit={handleSubmit}>
          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label>Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className={styles['form-group']}>
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} />
            </div>
          </div>
          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label>Designation</label>
              <input type="text" name="designation" value={formData.designation} onChange={handleChange} />
            </div>
            <div className={styles['form-group']}>
              <label>Organization</label>
              <input type="text" name="organization" value={formData.organization} onChange={handleChange} />
            </div>
          </div>
          <div className={styles['form-group']}>
            <label>Phone</label>
            <input 
              type="tel" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange}
              pattern="[\+]?[0-9\s]+"
              title="Phone number can start with + and must contain only numbers and spaces"
              placeholder="+1 555 123 4567"
            />
          </div>
          
          <div className={styles['modal-actions']}>
            <button type="button" className={styles['cancel-btn']} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles['submit-btn']} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : (person ? "Save Changes" : "Add Person")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PersonModal;
