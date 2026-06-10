import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from '../config';

// render retro login form
const LoginForm = ({ setUser }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setError("");
    
    try {
      // using centralized api_url for absolute paths
      const res = await fetch(`${API_URL}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // required cross-origin passport session
        body: JSON.stringify({ username, password })
      });
      
      if (res.ok) {
        const data = await res.json();
        setUser(data); 
        navigate("/"); // redirect to home instead of forcing the game
      } else {
        setError("invalid credentials");
      }
    } catch (err) {
      setError("connection error");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.authFrame}>
        <h2 style={styles.title}>Agent Identification</h2>
        <p style={styles.subtitle}>Authorized personnel only. Please provide your credentials.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Operator Code:</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
              onInvalid={(e) => e.target.setCustomValidity("Please fill out this field.")}
              onInput={(e) => e.target.setCustomValidity("")}
              style={styles.input}
              placeholder="e.g. Agent01"
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Security Key:</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              onInvalid={(e) => e.target.setCustomValidity("Please fill out this field.")}
              onInput={(e) => e.target.setCustomValidity("")}
              style={styles.input}
            />
          </div>
          
          <button type="submit" style={styles.submitBtn}>
            Validate Access
          </button>
        </form>

        {error && (
          <div style={styles.errorBox}>
            <strong>ERROR:</strong> {error}
          </div>
        )}
        
        <div style={styles.footer}>
          <Link to="/" style={styles.backLink}>[ return to terminal ]</Link>
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
    fontFamily: "Georgia, 'Times New Roman', serif",
    padding: "30px",
    boxSizing: "border-box"
  },
  authFrame: {
    width: "100%",
    maxWidth: "500px",
    border: "3px solid #2b221a",
    outline: "1px solid #2b221a",
    outlineOffset: "6px",
    padding: "40px 50px",
    backgroundColor: "#f2ebd9", 
    boxShadow: "10px 10px 0px rgba(43, 34, 26, 0.1)",
    display: "flex",
    flexDirection: "column"
  },
  title: {
    color: "#a7192d",
    fontSize: "2.2rem",
    fontWeight: "normal",
    textTransform: "uppercase",
    letterSpacing: "1px",
    margin: "0 0 10px 0",
    textAlign: "center",
    borderBottom: "2px solid #2b221a",
    paddingBottom: "15px"
  },
  subtitle: {
    fontSize: "0.95rem",
    color: "#5c4a3d",
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: "30px"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "25px"
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  label: {
    fontSize: "1.1rem",
    fontWeight: "bold",
    color: "#2b221a",
    textTransform: "uppercase",
    letterSpacing: "1px",
    fontFamily: "Arial, sans-serif"
  },
  input: {
    padding: "12px 15px",
    fontSize: "1.1rem",
    fontFamily: "'Courier New', Courier, monospace",
    backgroundColor: "#e8dfd3",
    border: "2px solid #2b221a",
    color: "#2b221a",
    outline: "none"
  },
  submitBtn: {
    backgroundColor: "#2b221a",
    color: "#f2ebd9",
    padding: "15px",
    fontSize: "1.1rem",
    fontWeight: "bold",
    fontFamily: "Arial, sans-serif",
    textTransform: "uppercase",
    letterSpacing: "2px",
    border: "2px solid #2b221a",
    boxShadow: "4px 4px 0px #a7192d",
    cursor: "pointer",
    marginTop: "15px",
    transition: "all 0.1s"
  },
  errorBox: {
    marginTop: "25px",
    padding: "15px",
    backgroundColor: "#e8dfd3",
    border: "2px dashed #a7192d",
    color: "#a7192d",
    fontFamily: "'Courier New', Courier, monospace",
    textAlign: "center"
  },
  footer: {
    marginTop: "35px",
    textAlign: "center"
  },
  backLink: {
    color: "#5c4a3d",
    textDecoration: "none",
    fontWeight: "bold",
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: "0.95rem"
  }
};

export default LoginForm;