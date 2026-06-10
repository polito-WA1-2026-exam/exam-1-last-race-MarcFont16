import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import NetworkMap from './NetworkMap';
import { API_URL } from '../config';

// main game controller
const GameContainer = ({ user }) => {
  // core game states
  const [gamePhase, setGamePhase] = useState("SETUP"); 
  const [network, setNetwork] = useState(null);
  const [mission, setMission] = useState(null);
  const [route, setRoute] = useState([]); 
  const [timeLeft, setTimeLeft] = useState(90);
  const [gameResult, setGameResult] = useState(null);
  
  // live coin tracking
  const [currentCoins, setCurrentCoins] = useState(20);

  // animation states
  const [eventsLog, setEventsLog] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);

  // ui states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); 

  // fetch initial data
  useEffect(() => {
    Promise.all([
      // absolute urls via config
      fetch(`${API_URL}/network`).then(res => res.json()), 
      fetch(`${API_URL}/game/setup`).then(res => res.json())
    ])
      .then(([networkData, setupData]) => {
        setNetwork(networkData);
        setMission(setupData);
        setRoute([setupData.start]); 
        setLoading(false);
      })
      .catch(() => setError("connection lost."));
  }, []);

  // planning timer
  useEffect(() => {
    if (gamePhase === "PLANNING" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gamePhase === "PLANNING" && timeLeft === 0) {
      submitRoute(); 
    }
  }, [gamePhase, timeLeft]);

  // execution animation logic
  useEffect(() => {
    if (gamePhase === "EXECUTION" && eventsLog.length > 0) {
      
      // strict-mode proof deterministic calculation
      let computedCoins = 20;
      for (let i = 0; i <= currentStep && i < eventsLog.length; i++) {
        const effectVal = parseInt(eventsLog[i].effect);
        if (!isNaN(effectVal)) {
          computedCoins += effectVal;
        }
      }
      setCurrentCoins(computedCoins);

      // manage timing
      if (currentStep < eventsLog.length) {
        // 1.5s pause before first event, then 3.5s per event
        const delay = currentStep === -1 ? 1500 : 3500;
        const timer = setTimeout(() => setCurrentStep(prev => prev + 1), delay); 
        return () => clearTimeout(timer);
      } else {
        // exact sync with backend at the end
        if (gameResult) setCurrentCoins(gameResult.coins);
        
        const timer = setTimeout(() => setGamePhase("RESULT"), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [gamePhase, currentStep, eventsLog, gameResult]);

  // start mission
  const startMission = () => {
    setGamePhase("PLANNING");
  };

  // handle node click
  const handleMove = (station) => {
    if (gamePhase !== "PLANNING") return;
    setRoute([...route, station]);
  };

  // soft reset
  const resetGame = () => {
    setGamePhase("SETUP");
    setRoute([mission.start]);
    setTimeLeft(90);
    setCurrentCoins(20);
    setGameResult(null);
    setEventsLog([]);
    setCurrentStep(-1);
    setIsSubmitting(false);
    setError(null);
  };

  // submit route
  const submitRoute = async () => {
    if (isSubmitting) return; 
    setIsSubmitting(true);
    
    // ui resets for validation phase
    setGamePhase("EXECUTION");
    setCurrentCoins(20); 
    setCurrentStep(-1); 

    try {
      // send route for official validation using api_url
      const res = await fetch(`${API_URL}/games/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include", // required for cross-origin sessions
        body: JSON.stringify({ route, endId: mission.end.id })
      });
      const result = await res.json();
      
      // save incoming data 
      setEventsLog(result.eventsLog || []);
      setGameResult(result);

      // save match to db if valid
      if (result.isValid) {
        const saveRes = await fetch(`${API_URL}/games`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // required to authenticate the save request
          body: JSON.stringify({
            startStationId: mission.start.id,
            endStationId: mission.end.id,
            score: result.coins, 
            timeLeft: timeLeft
          })
        });

        if (!saveRes.ok) {
          const errorText = await saveRes.text();
          console.error("Error saving game to backend:", saveRes.status, errorText);
        } else {
          console.log("Game successfully saved to database!");
        }
      }

    } catch (err) {
      console.error(err);
      setError("Mission validation failed.");
    }
  };

  // renders
  if (loading) return <div style={styles.centered}><p style={styles.loadingText}>Loading control center...</p></div>;
  if (error) return <div style={styles.centered}><p style={styles.errorText}>{error}</p></div>;

  return (
    <div style={styles.container}>
      <div style={styles.gameWrapper}>
        
        {/* top hud */}
        <div style={styles.gameHeader}>
          <h2 style={styles.pageTitle}>Operator: {user.username}</h2>
          <h2 style={styles.coinDisplay}>
            FUNDS: <span style={{ color: currentCoins < 0 ? "#a7192d" : "#2b221a" }}>{currentCoins}</span> PTS
          </h2>
        </div>
        
        {/* layer 1: setup phase (briefing + official map) */}
        {gamePhase === "SETUP" && (
          <>
            <div style={styles.briefingPanel}>
              <div style={styles.briefingHeader}>
                <h3 style={styles.panelTitle}>Mission Briefing</h3>
                <button style={styles.button} onClick={startMission}>
                  Initialize Planning (90s)
                </button>
              </div>
              <div style={styles.missionGoals}>
                <p style={styles.textCompact}><strong>Origin:</strong> {mission.start.name}</p>
                <p style={styles.textCompact}><strong>Destination:</strong> {mission.end.name}</p>
              </div>
            </div>
            
            <div style={styles.mapContainer}>
              <NetworkMap 
                network={network} 
                mission={mission} 
                route={route} 
                gamePhase={gamePhase}
                onMove={handleMove} 
              />
            </div>
          </>
        )}

        {/* layer 2: planning phase (status + target grid) */}
        {gamePhase === "PLANNING" && (
          <>
            <div style={styles.statusPanel}>
              <div style={styles.timerHeader}>
                <h3 style={{ ...styles.timer, color: timeLeft <= 10 ? "#a7192d" : "#2b221a" }}>
                  Time Remaining: {timeLeft}s
                </h3>
                <button 
                  style={isSubmitting ? styles.buttonDisabled : styles.buttonConfirm} 
                  onClick={submitRoute}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Transmitting..." : "Confirm Route"}
                </button>
              </div>
              <div style={styles.statusInfo}>
                <p style={styles.textCompact}><strong>Mission:</strong> {mission.start.name} ➔ {mission.end.name}</p>
                <p style={styles.textCompact}><strong>Current Route:</strong> {route.map(s => s.name).join(" ➔ ")}</p>
              </div>
            </div>
            
            <div style={styles.mapContainer}>
              <NetworkMap 
                network={network} 
                mission={mission} 
                route={route} 
                gamePhase={gamePhase}
                onMove={handleMove} 
              />
            </div>
          </>
        )}

        {/* layer 3: execution phase (validation log standalone) */}
        {gamePhase === "EXECUTION" && (
          <div style={styles.centeredPhase}>
            <div style={styles.executionPanel}>
              <h3 style={styles.panelTitle}>Validating Route...</h3>
              
              <div style={styles.logContainer}>
                {eventsLog.slice(0, currentStep + 1).map((log, index) => (
                  <div key={index} style={styles.logEntry}>
                    <span style={styles.logStation}>[{log.stationName.toUpperCase()}]</span>
                    <span style={styles.logText}> {log.description} </span>
                    <span style={{ ...styles.logEffect, color: log.effect.includes('-') ? "#a7192d" : "#2b221a" }}>
                      ({log.effect} pts)
                    </span>
                  </div>
                ))}
                
                {currentStep < eventsLog.length && currentStep >= 0 && (
                  <div style={styles.awaitingText}>... awaiting next transmission ...</div>
                )}
                {currentStep >= eventsLog.length && (
                  <div style={styles.awaitingText}>... calculating final official score ...</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* layer 4: result phase */}
        {gamePhase === "RESULT" && (
          <div style={styles.centeredPhase}>
            <div style={styles.resultCard}>
              <h2 style={styles.cardTitle}>Mission Complete</h2>
              <div style={styles.decorationLine}></div>
              <p style={styles.cardText}>
                Final Score: <span style={styles.highlight}>{currentCoins} pts</span>
              </p>
              
              <div style={styles.buttonGroup}>
                <button style={styles.button} onClick={resetGame}>
                  Play Again
                </button>
                <Link to="/ranking" style={styles.buttonSecondary}>
                  Ranking
                </Link>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};

// styles
const styles = {
  container: {
    width: "100%",
    height: "calc(100vh - 75px)", 
    backgroundColor: "#e8dfd3", 
    fontFamily: "Georgia, 'Times New Roman', serif",
    color: "#2b221a",
    padding: "10px 20px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    overflow: "hidden" 
  },
  gameWrapper: {
    width: "100%",
    maxWidth: "1250px",
    height: "100%",
    display: "flex",
    flexDirection: "column"
  },
  gameHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottom: "3px solid #2b221a",
    paddingBottom: "10px",
    marginBottom: "15px", 
    flexShrink: 0
  },
  pageTitle: {
    color: "#a7192d",
    fontSize: "2rem", 
    textTransform: "uppercase",
    letterSpacing: "1px",
    margin: 0,
    fontFamily: "Arial, sans-serif"
  },
  coinDisplay: {
    color: "#2b221a",
    fontSize: "1.8rem", 
    fontFamily: "'Courier New', Courier, monospace",
    margin: 0,
    fontWeight: "bold"
  },
  centered: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e8dfd3",
    width: "100%",
    height: "100%"
  },
  loadingText: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    letterSpacing: "2px",
    color: "#2b221a",
    textTransform: "uppercase",
    fontFamily: "'Courier New', Courier, monospace"
  },
  errorText: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    letterSpacing: "2px",
    color: "#a7192d", 
    textTransform: "uppercase",
    fontFamily: "'Courier New', Courier, monospace"
  },
  centeredPhase: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%"
  },
  briefingPanel: {
    backgroundColor: "#f2ebd9", 
    padding: "15px 25px", 
    border: "2px solid #2b221a",
    marginBottom: "15px", 
    boxShadow: "4px 4px 0px rgba(43, 34, 26, 0.15)",
    flexShrink: 0
  },
  briefingHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px dashed #2b221a",
    paddingBottom: "10px",
    marginBottom: "10px"
  },
  statusPanel: {
    backgroundColor: "#f2ebd9", 
    padding: "10px 20px", 
    border: "2px solid #2b221a",
    borderLeft: "6px solid #a7192d", 
    marginBottom: "15px", 
    boxShadow: "4px 4px 0px rgba(43, 34, 26, 0.15)",
    flexShrink: 0
  },
  statusInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px", 
    marginTop: "5px"
  },
  executionPanel: {
    backgroundColor: "#f2ebd9", 
    padding: "30px", 
    border: "3px solid #2b221a",
    borderLeft: "10px solid #a7192d", 
    boxShadow: "6px 6px 0px rgba(43, 34, 26, 0.15)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    maxWidth: "1250px"
  },
  logContainer: {
    width: "100%",
    backgroundColor: "#e8dfd3",
    border: "1px solid #8c7a6b",
    padding: "20px", 
    height: "350px", 
    overflowY: "auto",
    textAlign: "left",
    fontFamily: "'Courier New', Courier, monospace"
  },
  logEntry: {
    display: "flex",
    borderBottom: "1px dashed #d5c8b5",
    padding: "12px 0", 
    fontSize: "1.1rem", 
    lineHeight: "1.5",
    width: "100%"
  },
  logStation: {
    fontWeight: "bold",
    color: "#2b221a",
    marginRight: "10px",
    flexShrink: 0
  },
  logText: {
    color: "#5c4a3d",
    fontStyle: "italic",
    marginRight: "10px",
    flexGrow: 1,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  logEffect: {
    fontWeight: "bold",
    flexShrink: 0
  },
  awaitingText: {
    padding: "15px 0", 
    color: "#8c7a6b",
    fontStyle: "italic",
    textAlign: "center"
  },
  panelTitle: {
    margin: "0", 
    color: "#a7192d",
    fontSize: "1.5rem", 
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    fontFamily: "Arial, sans-serif"
  },
  missionGoals: {
    display: "flex",
    justifyContent: "space-around",
    padding: "10px", 
    backgroundColor: "#e8dfd3",
    border: "1px solid #d5c8b5"
  },
  timerHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  timer: {
    margin: "0",
    fontSize: "1.5rem", 
    letterSpacing: "1px",
    fontFamily: "'Courier New', Courier, monospace",
    fontWeight: "bold"
  },
  textCompact: {
    margin: "0", 
    fontSize: "1.05rem", 
    fontFamily: "'Courier New', Courier, monospace", 
    color: "#2b221a"
  },
  mapContainer: {
    backgroundColor: "#f2ebd9",
    border: "2px solid #2b221a", 
    boxShadow: "4px 4px 0px rgba(43, 34, 26, 0.15)", 
    flex: 1, 
    minHeight: 0, 
    display: "flex",
    flexDirection: "column",
    overflowY: "auto", 
    width: "100%"
  },
  resultCard: {
    backgroundColor: "#f2ebd9",
    padding: "50px 60px", 
    border: "3px solid #2b221a",
    textAlign: "center",
    boxShadow: "6px 6px 0px rgba(43, 34, 26, 0.15)",
    maxWidth: "500px",
    width: "100%"
  },
  cardTitle: {
    color: "#a7192d",
    fontSize: "2.5rem", 
    textTransform: "uppercase",
    margin: "0 0 15px 0",
    letterSpacing: "2px",
    fontWeight: "normal"
  },
  decorationLine: {
    width: "60px",
    height: "4px",
    backgroundColor: "#2b221a",
    margin: "0 auto 20px auto"
  },
  cardText: {
    fontSize: "1.4rem", 
    fontFamily: "Arial, sans-serif",
    color: "#5c4a3d",
    textTransform: "uppercase",
    letterSpacing: "1px"
  },
  highlight: {
    color: "#a7192d",
    fontWeight: "bold",
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: "2rem", 
    display: "block",
    marginTop: "15px"
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "center",
    gap: "20px", 
    marginTop: "30px" 
  },
  button: {
    backgroundColor: "#2b221a",
    color: "#f2ebd9",
    border: "2px solid #2b221a",
    padding: "10px 20px", 
    fontSize: "1rem", 
    fontFamily: "Arial, sans-serif",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: "1px",
    cursor: "pointer",
    boxShadow: "3px 3px 0px #a7192d", 
    transition: "transform 0.1s"
  },
  buttonSecondary: {
    backgroundColor: "#e8dfd3",
    color: "#2b221a",
    textDecoration: "none", 
    border: "2px solid #2b221a",
    padding: "10px 20px", 
    fontSize: "1rem", 
    fontFamily: "Arial, sans-serif",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: "1px",
    cursor: "pointer",
    boxShadow: "3px 3px 0px #2b221a", 
    transition: "transform 0.1s"
  },
  buttonConfirm: {
    backgroundColor: "#a7192d", 
    color: "#f2ebd9",
    border: "2px solid #2b221a",
    padding: "8px 16px", 
    fontSize: "0.95rem", 
    fontFamily: "Arial, sans-serif",
    fontWeight: "bold",
    textTransform: "uppercase",
    cursor: "pointer",
    boxShadow: "3px 3px 0px #2b221a"
  },
  buttonDisabled: {
    backgroundColor: "#8c7a6b", 
    color: "#e8dfd3",
    border: "2px solid #5c4a3d",
    padding: "8px 16px", 
    fontSize: "0.95rem", 
    fontFamily: "Arial, sans-serif",
    fontWeight: "bold",
    textTransform: "uppercase",
    cursor: "not-allowed"
  }
};

export default GameContainer;