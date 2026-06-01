import { useState, useEffect } from "react";

const GameContainer = ({ user }) => {
  const [network, setNetwork] = useState(null);
  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // fetch network and setup data in parallel
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
        setLoading(false);
      })
      .catch((err) => {
        // handle unhandled rejections as per exam rules
        console.error(err);
        setError("Connection to the control center lost. Please try again.");
        setLoading(false);
      });
  }, []);

  if (loading) return <div>loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Control Center - Agent: {user.username}</h2>
      
      <div style={{ background: "#222", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
        <h3>Current Mission:</h3>
        <p>Travel from <strong>{mission.start.name}</strong> to <strong>{mission.end.name}</strong></p>
      </div>

      <div>
        <p>
          <em>Map data loaded into memory: {network.stations.length} stations, {network.lines.length} lines, and {network.connections.length} connections.</em>
        </p>
      </div>

      {/* map placeholder */}
      <div style={{ border: "1px dashed gray", height: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        [ Interactive Map Area ]
      </div>
    </div>
  );
};

export default GameContainer;