import { Link } from "react-router-dom";

// render retro styled navigation bar matching paper theme
const NavBar = ({ user, onLogout }) => {
  return (
    <nav style={styles.nav}>
      <div style={styles.linksContainer}>
        <Link to="/" style={styles.link}>Home</Link>
        <Link to="/game" style={styles.link}>Game</Link>
        <Link to="/ranking" style={styles.link}>Ranking</Link>
        <Link to="/instructions" style={styles.link}>Instructions</Link>
      </div>
      
      <div style={styles.userSection}>
        {user ? (
          <>
            <span style={styles.username}>AGT. {user.username}</span>
            <button style={styles.logoutBtn} onClick={onLogout}>Logout</button>
          </>
        ) : (
          <Link to="/login" style={styles.loginBtn}>Agent Login</Link>
        )}
      </div>
    </nav>
  );
};

// styles
const styles = {
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "15px 35px",
    backgroundColor: "#e8dfd3",
    borderBottom: "3px solid #2b221a",
    fontFamily: "Arial, sans-serif",
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    position: "relative"
  },
  linksContainer: {
    display: "flex",
    gap: "30px",
    alignItems: "center"
  },
  link: {
    color: "#2b221a",
    textDecoration: "none",
    fontSize: "1rem",
    fontWeight: "bold",
    padding: "5px 0"
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "25px"
  },
  username: {
    fontFamily: "'Courier New', Courier, monospace",
    color: "#a7192d",
    fontWeight: "bold",
    fontSize: "1.2rem",
    letterSpacing: "2px"
  },
  logoutBtn: {
    backgroundColor: "#f2ebd9",
    color: "#2b221a",
    padding: "8px 20px",
    fontSize: "0.9rem",
    fontWeight: "bold",
    fontFamily: "Arial, sans-serif",
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    border: "2px solid #2b221a",
    boxShadow: "3px 3px 0px #2b221a",
    cursor: "pointer",
    transition: "all 0.1s"
  },
  loginBtn: {
    backgroundColor: "#a7192d",
    color: "#f2ebd9",
    textDecoration: "none",
    padding: "8px 20px",
    fontSize: "0.9rem",
    fontWeight: "bold",
    fontFamily: "Arial, sans-serif",
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    border: "2px solid #2b221a",
    boxShadow: "3px 3px 0px #2b221a",
    transition: "all 0.1s"
  }
};

export default NavBar;