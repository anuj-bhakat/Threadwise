import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import ThreadModal from "../components/ThreadModal";
import styles from "../styles/pages/ThreadsPage.module.css";

const API_URL = import.meta.env.VITE_API_URL;

function ThreadsPage() {
  const [threads, setThreads] = useState([]);
  const [people, setPeople] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingThread, setEditingThread] = useState(null);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [threadsRes, peopleRes] = await Promise.all([
        axios.get(`${API_URL}/threads`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/people`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setThreads(threadsRes.data);
      setPeople(peopleRes.data);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (thread = null) => {
    setEditingThread(thread || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingThread(null);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this thread?")) {
      try {
        await axios.delete(`${API_URL}/threads/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchData();
      } catch (error) {
        console.error("Error deleting thread", error);
      }
    }
  };

  const filteredThreads = threads.filter(t => {
    const q = searchQuery.toLowerCase();
    return (
      (t.title && t.title.toLowerCase().includes(q)) ||
      (t.description && t.description.toLowerCase().includes(q))
    );
  });


  const totalPages = Math.ceil(filteredThreads.length / itemsPerPage);
  const paginatedThreads = filteredThreads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className={styles['page-wrapper']}>
      <Navbar />
      <div className={styles['page-container']}>
        <div className={styles['page-header']}>
          <h2>Threads</h2>
          <button className={styles['action-btn']} onClick={() => openModal()}>Create Thread</button>
        </div>

        <input
          type="text"
          className={styles['search-input']}
          placeholder="Search by title or description..."
          value={searchQuery}
          onChange={handleSearch}
        />

        <div className={styles['threads-grid']}>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className={styles['skeleton-card']}>
                <div className={styles['skeleton-box']} style={{ width: '60%' }}></div>
                <div className={styles['skeleton-box']} style={{ width: '100%' }}></div>
                <div className={styles['skeleton-box']} style={{ width: '80%' }}></div>
                <div className={styles['skeleton-box']} style={{ width: '40%' }}></div>
              </div>
            ))
          ) : paginatedThreads.length > 0 ? (
            paginatedThreads.map(thread => (
              <div
                key={thread.thread_id}
                className={styles['thread-card']}
                onClick={() => navigate('/thread-view', { state: { threadId: thread.thread_id } })}
              >
                <div className={styles['thread-title']}>{thread.title}</div>
                <div className={styles['thread-desc']}>{thread.description || "No description provided."}</div>

                <div className={styles['people-count']}>
                  <svg className={styles['people-icon']} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span className={styles['people-number']}>{thread.associated_people?.length || 0}</span>
                </div>

                <div className={styles['card-actions']}>
                  <button className={styles['edit-btn']} onClick={(e) => { e.stopPropagation(); openModal(thread); }}>Edit</button>
                  <button className={styles['delete-btn']} onClick={(e) => { e.stopPropagation(); handleDelete(thread.thread_id); }}>Delete</button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '32px', color: '#777', gridColumn: '1 / -1' }}>
              No threads found.
            </div>
          )}
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

        <ThreadModal
          isOpen={isModalOpen}
          thread={editingThread}
          peopleList={people}
          onClose={closeModal}
          onSuccess={() => {
            fetchData();
            closeModal();
          }}
        />
      </div>
    </div>
  );
}

export default ThreadsPage;
