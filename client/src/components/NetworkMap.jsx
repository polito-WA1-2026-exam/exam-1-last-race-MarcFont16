const NetworkMap = ({ network, mission, currentPosition, onMove }) => {
  if (!currentPosition) return <div>loading map...</div>;

  const isValidMove = (targetStation) => {
    return network.connections.some(
      (conn) =>
        (conn.from === currentPosition.id && conn.to === targetStation.id) ||
        (conn.from === targetStation.id && conn.to === currentPosition.id)
    );
  };

  return (
    <div style={{ width: "100%", padding: "20px" }}>
      <h3>Subway Network</h3>

      {network.lines.map((line) => (
        <div key={line.id} style={{ marginBottom: "25px" }}>
          <h4 style={{ color: line.color, borderBottom: `2px solid ${line.color}`, display: "inline-block" }}>
            Line {line.name}
          </h4>
          
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
            {(line.stations || []).map((station) => {
              const isCurrent = station.id === currentPosition.id;
              const isEnd = station.id === mission.end.id;
              const isClickable = isValidMove(station);
              
              let bgColor = "#333";
              if (isCurrent) bgColor = "#2563eb"; 
              else if (isEnd) bgColor = "#ea580c"; 
              else if (isClickable) bgColor = "#4b5563"; 

              return (
                <button
                  key={station.id}
                  onClick={() => isClickable && onMove(station)}
                  style={{
                    padding: "10px 15px",
                    backgroundColor: bgColor,
                    color: "white",
                    border: station.isInterchange ? "2px solid gold" : "1px solid gray",
                    borderRadius: "5px",
                    cursor: isClickable ? "pointer" : "default",
                    opacity: (isCurrent || isEnd || isClickable) ? 1 : 0.6
                  }}
                >
                  {station.name}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NetworkMap;