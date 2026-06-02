import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

// component imports
import GameContainer from './components/GameContainer';
import NavBar from './components/NavBar';
import RankingPage from './components/RankingPage';
import InstructionsPage from './components/InstructionsPage';
import HomePage from './components/HomePage.jsx';
import LoginForm from './components/LoginForm.jsx';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // check active session
  useEffect(() => {
    fetch("/api/sessions/current")
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    await fetch("/api/sessions/current", { method: "DELETE" });
    setUser(null);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <BrowserRouter>
      {/* nav bar layout */}
      <NavBar user={user} onLogout={logout} />
      
      <Routes>
        {/* public routes */}
        <Route path="/" element={<HomePage user={user} />} />
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