import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Notifications from "./Notifications";
import styles from "../styles/components/Navbar.module.css";

function Navbar() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };


  return (
    <nav className={styles.navbar}>
      <div className={styles['navbar-container']}>
        <h1>
          <Link to="/home" className={styles['navbar-brand']}>Threadwise</Link>
        </h1>
        
        <div className={styles['navbar-right']}>
          <div className={`${styles['nav-links']} ${isMobileMenuOpen ? styles['mobile-open'] : ''}`}>
            <Link to="/threads" className={styles['nav-link']}>Threads</Link>
            <Link to="/people" className={styles['nav-link']}>People Directory</Link>
            <button className={styles['logout-btn']} onClick={handleLogout}>Logout</button>
          </div>

          <Notifications />

          <button 
            className={styles['mobile-menu-btn']} 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
