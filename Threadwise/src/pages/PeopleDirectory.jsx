import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import PersonModal from "../components/PersonModal";
import styles from "../styles/pages/PeopleDirectory.module.css";

const API_URL = import.meta.env.VITE_API_URL;

function PeopleDirectory() {
  const [people, setPeople] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isDeletingPersonId, setIsDeletingPersonId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchPeople();
  }, []);

  const fetchPeople = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/people`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPeople(response.data);
    } catch (error) {
      console.error("Error fetching people", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (person = null) => {
    setEditingPerson(person || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPerson(null);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this person?")) {
      setIsDeletingPersonId(id);
      try {
        await axios.delete(`${API_URL}/people/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchPeople();
      } catch (error) {
        console.error("Error deleting person", error);
      } finally {
        setIsDeletingPersonId(null);
      }
    }
  };

  const filteredPeople = people.filter(p => {
    const q = searchQuery.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.email && p.email.toLowerCase().includes(q)) ||
      (p.organization && p.organization.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filteredPeople.length / itemsPerPage);
  const paginatedPeople = filteredPeople.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className={styles['page-wrapper']}>
      <Navbar />
      <div className={styles['people-container']}>
        <div className={styles['people-header']}>
        <h2>People Directory</h2>
        <button className={styles['add-btn']} onClick={() => openModal()}>Add Person</button>
      </div>

      <input 
        type="text" 
        className={styles['search-bar']} 
        placeholder="Search by name, email, or organization..." 
        value={searchQuery}
        onChange={handleSearch}
      />

      <div className={styles['people-table-container']}>
        <table className={styles['people-table']}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Organization</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className={styles['skeleton-row']}>
                  <td><div className={styles['skeleton-box']} style={{ width: '80%' }}></div></td>
                  <td><div className={styles['skeleton-box']} style={{ width: '100%' }}></div></td>
                  <td><div className={styles['skeleton-box']} style={{ width: '60%' }}></div></td>
                  <td><div className={styles['skeleton-box']} style={{ width: '70%' }}></div></td>
                  <td><div className={styles['skeleton-box']} style={{ width: '90%' }}></div></td>
                  <td><div className={styles['skeleton-box']} style={{ width: '100px' }}></div></td>
                </tr>
              ))
            ) : paginatedPeople.length > 0 ? (
              paginatedPeople.map(person => (
                <tr key={person.person_id}>
                  <td className={styles['font-medium']}>{person.name}</td>
                  <td>{person.email || "-"}</td>
                  <td>{person.designation || "-"}</td>
                  <td>{person.organization || "-"}</td>
                  <td>{person.phone || "-"}</td>
                  <td>
                    <div className={styles['table-actions']}>
                      <button className={styles['edit-btn']} onClick={() => openModal(person)}>Edit</button>
                      <button className={styles['delete-btn']} onClick={() => handleDelete(person.person_id)} disabled={isDeletingPersonId === person.person_id}>
                        {isDeletingPersonId === person.person_id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className={styles['empty-state']}>No people found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && totalPages > 1 && (
        <div className={styles['pagination-controls']}>
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className={styles['pagination-info']}>Page {currentPage} of {totalPages}</span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      <PersonModal 
        isOpen={isModalOpen}
        person={editingPerson}
        onClose={closeModal}
        onSuccess={() => {
          fetchPeople();
          closeModal();
        }}
      />
      </div>
    </div>
  );
}

export default PeopleDirectory;
