import { Link } from "react-router-dom";

// render landing page
const HomePage = ({ user }) => {
  return (
    <div style={styles.container}>
      {/* poster frame */}
      <div style={styles.posterFrame}>
        
        {/* metro line graphic */}
        <div style={styles.decoration}>
          <div style={styles.dot}></div>
          <div style={styles.line}></div>
          <div style={styles.dotActive}></div>
          <div style={styles.line}></div>
          <div style={styles.dot}></div>
        </div>

        <h1 style={styles.title}>
          Last Race <span style={styles.badge}>BCN</span>
        </h1>
        <h2 style={styles.subtitle}>edició centenari · 1924 - 2024</h2>

        <div style={styles.actions}>
          <Link to="/instructions" style={styles.buttonSecondary}>
            How to Play
          </Link>
          {!user ? (
            <Link to="/login" style={styles.buttonPrimary}>
              Agent Login
            </Link>
          ) : (
            <Link to="/game" style={styles.buttonPrimary}>
              Access Network
            </Link>
          )}
        </div>

        {/* vintage stamp */}
        <div style={styles.retroFooter}>
          companyia del gran metropolità de barcelona, s.a.
        </div>
      </div>
    </div>
  );
};

// styles
const styles = {
  container: {
    flex: 1, 
    width: "100%", 
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e8dfd3", 
    color: "#2b221a", 
    fontFamily: "Georgia, 'Times New Roman', serif", 
    padding: "30px", 
    boxSizing: "border-box"
  },
  posterFrame: {
    width: "75%",
    maxWidth: "850px",
    minHeight: "450px", 
    justifyContent: "center",
    border: "3px solid #2b221a",
    outline: "1px solid #2b221a",
    outlineOffset: "9px", 
    padding: "65px 40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    backgroundColor: "#f2ebd9",
    boxShadow: "12px 12px 0px rgba(43, 34, 26, 0.1)"
  },
  decoration: {
    display: "flex",
    alignItems: "center",
    marginBottom: "40px"
  },
  dot: {
    width: "14px",
    height: "14px",
    backgroundColor: "#e8dfd3",
    borderRadius: "50%",
    border: "2px solid #2b221a"
  },
  dotActive: {
    width: "20px",
    height: "20px",
    backgroundColor: "#a7192d", 
    borderRadius: "50%",
    border: "3px solid #2b221a"
  },
  line: {
    width: "70px", 
    height: "4px",
    backgroundColor: "#2b221a"
  },
  title: {
    color: "#2b221a", 
    fontSize: "5rem",
    fontWeight: "normal",
    textTransform: "uppercase",
    letterSpacing: "2px",
    margin: "0 0 35px 0", 
    display: "flex",
    alignItems: "center",
    gap: "15px"
  },
  badge: {
    backgroundColor: "#a7192d",
    color: "#f2ebd9",
    padding: "5px 18px",
    fontSize: "3.2rem", 
    fontFamily: "Arial, sans-serif", 
    fontWeight: "bold",
    borderRadius: "2px" 
  },
  subtitle: {
    fontSize: "1.3rem", 
    color: "#5c4a3d",
    marginTop: "0", 
    marginBottom: "55px", 
    letterSpacing: "4px",
    textTransform: "uppercase",
    fontFamily: "Arial, sans-serif"
  },
  actions: {
    display: "flex",
    gap: "20px",
    zIndex: 1
  },
  buttonPrimary: {
    backgroundColor: "#a7192d",
    color: "#f2ebd9",
    textDecoration: "none",
    padding: "16px 40px", 
    fontSize: "1.1rem",
    fontWeight: "bold",
    fontFamily: "Arial, sans-serif",
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    border: "2px solid #2b221a",
    boxShadow: "4px 4px 0px #2b221a", 
    transition: "all 0.1s"
  },
  buttonSecondary: {
    backgroundColor: "#f2ebd9",
    color: "#2b221a",
    textDecoration: "none",
    padding: "16px 40px",
    fontSize: "1.1rem",
    fontWeight: "bold",
    fontFamily: "Arial, sans-serif",
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    border: "2px solid #2b221a",
    boxShadow: "4px 4px 0px #2b221a",
    transition: "all 0.1s"
  },
  retroFooter: {
    position: "absolute",
    bottom: "20px",
    color: "#8c7a6b",
    fontSize: "0.85rem",
    letterSpacing: "2.5px",
    textTransform: "uppercase",
    fontFamily: "'Courier New', Courier, monospace"
  }
};

export default HomePage;