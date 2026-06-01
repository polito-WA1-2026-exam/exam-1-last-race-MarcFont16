import { useState, useEffect } from "react";
import NetworkMap from './NetworkMap';

const GameContainer = ({ user }) => {
  const [network, setNetwork] = useState(null);
  const [mission, setMission] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/network").then(res => {
        if (!res.ok) throw new Error("network fetch failed");
        return res.json();
      }),
      fetch("/api/game/setup").then(res => {
        if (!res.ok) throw new Error("setup fetch failed");
        return res.json();
      })
    ])
      .then(([networkData, setupData]) => {
        setNetwork(networkData);
        setMission(setupData);
        setCurrentPosition(setupData.start);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Connection to the control center lost.");
        setLoading(false);
      });
  }, []);

  if (loading) return <div>loading control center...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!network || !mission || !currentPosition) return <div>initializing system...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Control Center - Agent: {user.username}</h2>
      
      <div style={{ background: "#222", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
        <h3>Current Mission:</h3>
        <p>Travel from <strong>{mission.start.name}</strong> to <strong>{mission.end.name}</strong></p>
        <p>Current location: <strong>{currentPosition.name}</strong></p>
      </div>

      <div style={{ border: "1px dashed gray", minHeight: "400px", marginTop: "20px" }}>
        <NetworkMap 
          network={network} 
          mission={mission} 
          currentPosition={currentPosition} 
          onMove={(station) => setCurrentPosition(station)} 
        />
      </div>
    </div>
  );
};

export default GameContainer;