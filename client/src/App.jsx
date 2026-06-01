import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import "./App.css";
import GameContainer from './components/GameContainer';

// temporary placeholder components
const HomePage = () => (
  <div>
    <h1>last race: bcn edition</h1>
    <Link to="/instructions">how to play</Link> | <Link to="/login">login</Link>
  </div>
);
const InstructionsPage = () => <div><h2>instructions</h2></div>;

const LoginForm = ({ setUser }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent html form submission
    setError("");
    
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      
      if (res.ok) {
        const data = await res.json();
        setUser(data); // update global state
        navigate("/game"); // redirect to protected route
      } else {
        setError("invalid credentials");
      }
    } catch (err) {
      setError("connection error");
    }
  };

  return (
    <div>
      <h2>login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>username: </label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>password: </label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button type="submit">enter</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <br />
      <Link to="/">back to home</Link>
    </div>
  );
};

const RankingPage = () => <div><h2>ranking (protected)</h2></div>;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // check active session on load
  useEffect(() => {
    fetch("/api/sessions/current")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("not authenticated");
      })
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // show blank or spinner while checking session
  if (loading) return <div>loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        {/* public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/instructions" element={<InstructionsPage />} />
        <Route path="/login" element={<LoginForm setUser={setUser} />} />
        
        {/* protected routes */}
        <Route 
          path="/game" 
          element={user ? <GameContainer user={user} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/ranking" 
          element={user ? <RankingPage /> : <Navigate to="/login" />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;