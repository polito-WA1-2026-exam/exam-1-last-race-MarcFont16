import { Link } from "react-router-dom";

// render instructions page with official retro document style
const InstructionsPage = () => {
  return (
    <div style={styles.container}>
      <div style={styles.documentFrame}>
        
        <h2 style={styles.title}>Game Instructions</h2>
        <p style={styles.leadText}>
          Welcome to <span style={styles.highlight}>"Last Race: BCN Edition"</span>. Please find below the rules and operational procedures for an optimal gaming experience.
        </p>
        
        <h3 style={styles.sectionTitle}>1. Setup Phase</h3>
        <p style={styles.text}>
          The player sees the network map with all stations, their connections, and the lines. When the player is ready to play, they move on to the next phase.
        </p>
        
        <h3 style={styles.sectionTitle}>2. Planning Phase</h3>
        <p style={styles.text}>
          Each game starts with 20 coins. The player has 90 seconds to mentally reconstruct the network, as the map will show only the stations with their names but without the lines connecting them. The player must build their route from a starting station to a destination station (with a minimum distance of at least 3 stops between them) by selecting the segments in sequence. If time runs out, the planning phase automatically ends with the route built up to that point.
        </p>
        
        <h3 style={styles.sectionTitle}>3. Execution Phase</h3>
        <p style={styles.text}>
          The web application validates the submitted route and, for each segment of the journey, randomly selects one event and applies its effect (an integer from -4 to +4) to the player's total number of coins. The application shows the steps one at a time, in sequence, displaying the unexpected event that occurred and the updated coin total.
        </p>
        
        <h3 style={styles.sectionTitle}>4. Scoring Rules</h3>
        <ul style={styles.list}>
          <li style={styles.listItem}>
            <strong>Arrival Bonus:</strong> +10 coins if the last station of the validated route coincides exactly with the assigned destination station.
          </li>
          <li style={styles.listItem}>
            <strong>Lost Penalty:</strong> -5 coins if time runs out or the user confirms the route early, and the last stop is not the destination.
          </li>
          <li style={styles.listItem}>
            <strong>Invalid Route:</strong> If the submitted route is invalid or incomplete, this phase is skipped and the player loses all 20 coins in their possession, obtaining a score of zero.
          </li>
          <li style={styles.listItem}>
            <strong>Tie-breakers:</strong> If two players finish the game with the exact same coins, the tie in the ranking is broken by giving priority to speed (time left on the clock).
          </li>
        </ul>
        
        <p style={styles.closingText}>
          Good luck, Agent. We look forward to your best performance.
        </p>

        {/* return button */}
        <div style={styles.actionContainer}>
          <Link to="/" style={styles.button}>
            Return to Terminal
          </Link>
        </div>

      </div>
    </div>
  );
};

// styles
// ultra compact and maximum width styles
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
    padding: "10px", // reduced outer padding
    boxSizing: "border-box"
  },
  documentFrame: {
    width: "100%", // full width available
    maxWidth: "1400px", // massive max-width for large monitors
    border: "3px solid #2b221a",
    outline: "1px solid #2b221a",
    outlineOffset: "4px",
    padding: "15px 25px", // reduced side padding to maximize text space
    backgroundColor: "#f2ebd9", 
    boxShadow: "8px 8px 0px rgba(43, 34, 26, 0.1)",
    textAlign: "left"
  },
  title: {
    color: "#a7192d", 
    fontSize: "2.1rem", 
    fontWeight: "normal",
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    margin: "0 0 8px 0", 
    borderBottom: "2px solid #2b221a", 
    paddingBottom: "5px", 
    textAlign: "center"
  },
  leadText: {
    fontSize: "1rem", 
    lineHeight: "1.3", 
    color: "#5c4a3d",
    marginBottom: "12px", 
    textAlign: "center",
    fontStyle: "italic"
  },
  highlight: {
    fontWeight: "bold",
    color: "#a7192d",
    fontStyle: "normal"
  },
  sectionTitle: {
    fontSize: "1.1rem", 
    fontFamily: "Arial, sans-serif",
    textTransform: "uppercase",
    letterSpacing: "1px",
    color: "#2b221a",
    marginTop: "8px", 
    marginBottom: "4px", 
    borderBottom: "1px dashed #8c7a6b",
    display: "inline-block",
    paddingBottom: "2px"
  },
  text: {
    fontSize: "0.95rem", 
    lineHeight: "1.3", 
    color: "#2b221a",
    margin: "0 0 6px 0" 
  },
  list: {
    margin: "0 0 8px 30px", 
    padding: "0"
  },
  listItem: {
    fontSize: "0.95rem",
    lineHeight: "1.3", 
    color: "#2b221a",
    marginBottom: "2px" 
  },
  closingText: {
    fontSize: "1rem", 
    lineHeight: "1.3",
    color: "#a7192d",
    fontWeight: "bold",
    marginTop: "15px", 
    textAlign: "center",
    fontFamily: "'Courier New', Courier, monospace"
  },
  actionContainer: {
    marginTop: "15px", 
    display: "flex",
    justifyContent: "center"
  },
  button: {
    backgroundColor: "#2b221a", 
    color: "#f2ebd9",
    textDecoration: "none",
    padding: "8px 25px", 
    fontSize: "0.95rem",
    fontWeight: "bold",
    fontFamily: "Arial, sans-serif",
    textTransform: "uppercase",
    letterSpacing: "1px",
    border: "2px solid #2b221a",
    boxShadow: "3px 3px 0px #a7192d", 
    transition: "all 0.1s"
  }
};

export default InstructionsPage;