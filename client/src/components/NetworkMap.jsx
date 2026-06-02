// render retro network map adapting to game phases
const NetworkMap = ({ network, mission, route, gamePhase, onMove }) => {
  const currentPosition = route && route.length > 0 ? route[route.length - 1] : null;

  if (!network || !mission || !currentPosition) {
    return <div style={styles.loading}>loading map...</div>;
  }

  // check valid connection using db keys and prevent backtracking
  const isValidMove = (targetStation) => {
    // prevent revisiting stations to avoid point farming exploits
    if (route.some(s => s.id === targetStation.id)) return false;

    return network.connections.some(
      (conn) =>
        (conn.station_from_id === currentPosition.id && conn.station_to_id === targetStation.id) ||
        (conn.station_from_id === targetStation.id && conn.station_to_id === currentPosition.id)
    );
  };

  // helper to extract unique stations for the planning phase
  const getUniqueStations = () => {
    const stationMap = new Map();
    network.lines.forEach(line => {
      (line.stations || []).forEach(st => {
        if (!stationMap.has(st.id)) stationMap.set(st.id, st);
      });
    });
    // sort alphabetically to scramble their visual order
    return Array.from(stationMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  };

  // helper to get all segments (pairs) for the planning phase
  const getAllSegments = () => {
    const stationMap = new Map();
    network.lines.forEach(line => {
      (line.stations || []).forEach(st => stationMap.set(st.id, st.name));
    });

    return network.connections.map(conn => {
      const from = stationMap.get(conn.station_from_id) || "Unknown";
      const to = stationMap.get(conn.station_to_id) || "Unknown";
      return `${from} ↔ ${to}`;
    });
  };

  // reusable button renderer for both phases
  const renderStationButton = (station) => {
    const isCurrent = station.id === currentPosition.id;
    const isEnd = station.id === mission.end.id;
    const isClickable = isValidMove(station) && gamePhase === "PLANNING";
    
    let bgColor = "#f2ebd9"; 
    let textColor = "#2b221a";
    let borderColor = "#2b221a";

    if (isCurrent) {
      bgColor = "#2b221a"; 
      textColor = "#f2ebd9";
    } else if (isEnd) {
      bgColor = "#a7192d"; 
      textColor = "#f2ebd9";
      borderColor = "#a7192d";
    } else if (isClickable) {
      bgColor = "#e8dfd3"; 
      borderColor = "#a7192d"; 
    }

    return (
      <button
        key={station.id}
        onClick={() => isClickable && onMove(station)}
        disabled={!isClickable && !isCurrent}
        style={{
          ...styles.stationBtn,
          backgroundColor: bgColor,
          color: textColor,
          borderColor: borderColor,
          borderStyle: station.isInterchange ? "dashed" : "solid",
          cursor: isClickable ? "pointer" : "default",
          opacity: (isCurrent || isEnd || isClickable || gamePhase === "SETUP") ? 1 : 0.4
        }}
      >
        {station.name}
      </button>
    );
  };

  // --- RENDER PLANNING PHASE (Scrambled Grid + Segments List) ---
  if (gamePhase === "PLANNING" || gamePhase === "EXECUTION") {
    const uniqueStations = getUniqueStations();
    const allSegments = getAllSegments();

    return (
      <div style={styles.container}>
        <h3 style={styles.title}>Target Grid (Lines Offline)</h3>
        
        <div style={styles.planningGrid}>
          {uniqueStations.map(station => renderStationButton(station))}
        </div>

        {/* The segment list is explicitly required by the exam rules */}
        <div style={styles.segmentsContainer}>
          <h4 style={styles.segmentsTitle}>Known Operational Segments</h4>
          <div style={styles.segmentsList}>
            {allSegments.map((seg, idx) => (
              <div key={idx} style={styles.segmentItem}>{seg}</div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER SETUP / RESULT PHASE (Full Map with Lines) ---
  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Official Network Diagram</h3>

      {network.lines.map((line) => (
        <div key={line.id} style={styles.lineContainer}>
          <h4 style={{ ...styles.lineTitle, color: line.color, borderBottomColor: line.color }}>
            {line.name}
          </h4>
          <div style={styles.stationsWrapper}>
            {(line.stations || []).map(station => renderStationButton(station))}
          </div>
        </div>
      ))}
    </div>
  );
};

// styling objects
const styles = {
  container: {
    width: "100%",
    padding: "20px",
    backgroundColor: "#f2ebd9", 
    fontFamily: "'Courier New', Courier, monospace"
  },
  loading: {
    padding: "20px",
    textAlign: "center",
    fontFamily: "'Courier New', Courier, monospace",
    fontWeight: "bold",
    color: "#2b221a",
    textTransform: "uppercase"
  },
  title: {
    textTransform: "uppercase",
    color: "#2b221a",
    borderBottom: "2px solid #2b221a",
    paddingBottom: "10px",
    marginBottom: "20px",
    letterSpacing: "1px"
  },
  lineContainer: {
    marginBottom: "25px",
    padding: "15px",
    border: "1px solid #d5c8b5",
    backgroundColor: "#e8dfd3" 
  },
  lineTitle: {
    display: "inline-block",
    borderBottomStyle: "solid",
    borderBottomWidth: "3px",
    margin: "0 0 15px 0",
    textTransform: "uppercase",
    letterSpacing: "1px",
    fontSize: "1.2rem",
    fontFamily: "Arial, sans-serif"
  },
  stationsWrapper: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px"
  },
  planningGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    padding: "20px",
    backgroundColor: "#e8dfd3",
    border: "2px dashed #8c7a6b",
    marginBottom: "25px"
  },
  stationBtn: {
    padding: "10px 15px",
    fontSize: "0.95rem",
    fontWeight: "bold",
    fontFamily: "'Courier New', Courier, monospace",
    borderWidth: "2px",
    borderRadius: "2px",
    boxShadow: "2px 2px 0px rgba(43, 34, 26, 0.2)",
    transition: "all 0.1s"
  },
  segmentsContainer: {
    border: "2px solid #2b221a",
    backgroundColor: "#e8dfd3",
    padding: "15px"
  },
  segmentsTitle: {
    margin: "0 0 15px 0",
    textTransform: "uppercase",
    fontSize: "1.1rem",
    color: "#a7192d",
    borderBottom: "1px solid #2b221a",
    paddingBottom: "5px"
  },
  segmentsList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "8px",
    maxHeight: "200px",
    overflowY: "auto",
    paddingRight: "10px"
  },
  segmentItem: {
    fontSize: "0.9rem",
    color: "#2b221a",
    fontStyle: "italic",
    borderBottom: "1px dashed #d5c8b5",
    paddingBottom: "4px"
  }
};

export default NetworkMap;