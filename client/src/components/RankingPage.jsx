import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// render official global ranking
const RankingPage = () => {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // fetch data on mount
  useEffect(() => {
    fetch("/api/ranking")
      .then(res => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then(data => {
        setRanking(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to secure connection with the central database.");
        setLoading(false);
      });
  }, []);

  // initial renders
  if (loading) return <div style={styles.centered}><p style={styles.loadingText}>Retrieving Official Records...</p></div>;
  if (error) return <div style={styles.centered}><p style={styles.errorText}>{error}</p></div>;

  // pad array to always show exactly 10 rows
  const top10 = Array.from({ length: 10 }, (_, i) => ranking[i] || null);

  return (
    <div style={styles.container}>
      <div style={styles.documentFrame}>
        
        <h2 style={styles.title}>Official Global Ranking</h2>
        <p style={styles.leadText}>
          Top operatives authorized by the command center. Ties are broken by operational speed.
        </p>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Rank</th>
                <th style={styles.th}>Operator Code</th>
                <th style={styles.th}>Max Score (Coins)</th>
                <th style={styles.th}>Speed (Time Left)</th>
              </tr>
            </thead>
            <tbody>
              {top10.map((record, index) => (
                <tr key={index} style={styles.tr}>
                  <td style={styles.td}>#{index + 1}</td>
                  <td style={styles.tdOperator}>
                    {record ? record.username.toUpperCase() : "-"}
                  </td>
                  <td style={styles.tdHighlight}>
                    {record ? `${record.max_score} pts` : "-"}
                  </td>
                  <td style={styles.td}>
                    {record ? `${record.time_left}s` : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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

// custom tight styling objects
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
    padding: "8px", 
    boxSizing: "border-box"
  },
  documentFrame: {
    width: "100%", 
    maxWidth: "1000px", 
    border: "3px solid #2b221a",
    outline: "1px solid #2b221a",
    outlineOffset: "4px",
    padding: "15px 25px", 
    backgroundColor: "#f2ebd9", 
    boxShadow: "8px 8px 0px rgba(43, 34, 26, 0.1)",
    textAlign: "left"
  },
  title: {
    color: "#a7192d", 
    fontSize: "1.8rem", 
    fontWeight: "normal",
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    margin: "0 0 8px 0", 
    borderBottom: "3px solid #2b221a",
    paddingBottom: "4px", 
    textAlign: "center"
  },
  leadText: {
    fontSize: "0.95rem", 
    lineHeight: "1.1", 
    color: "#5c4a3d",
    marginBottom: "12px", 
    textAlign: "center",
    fontStyle: "italic"
  },
  tableContainer: {
    width: "100%",
    backgroundColor: "#e8dfd3",
    border: "2px solid #2b221a",
    padding: "4px" 
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontFamily: "'Courier New', Courier, monospace"
  },
  th: {
    borderBottom: "2px dashed #2b221a",
    padding: "6px 8px", // reduced
    textAlign: "left",
    textTransform: "uppercase",
    color: "#a7192d",
    fontSize: "0.95rem"
  },
  tr: {
    borderBottom: "1px dashed #d5c8b5"
  },
  td: {
    padding: "6px 8px", // reduced
    fontSize: "0.95rem",
    color: "#2b221a"
  },
  tdOperator: {
    padding: "6px 8px", 
    fontSize: "0.95rem",
    fontWeight: "bold",
    color: "#2b221a",
    letterSpacing: "1px"
  },
  tdHighlight: {
    padding: "6px 8px", 
    fontSize: "0.95rem",
    fontWeight: "bold",
    color: "#a7192d"
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
    padding: "8px 20px", 
    fontSize: "0.9rem",
    fontWeight: "bold",
    fontFamily: "Arial, sans-serif",
    textTransform: "uppercase",
    letterSpacing: "1px",
    border: "2px solid #2b221a",
    boxShadow: "3px 3px 0px #a7192d", 
    transition: "all 0.1s"
  },
  centered: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e8dfd3",
    width: "100%"
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
  }
};

export default RankingPage;