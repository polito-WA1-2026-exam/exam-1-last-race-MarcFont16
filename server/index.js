// imports
import express from "express";
import { getStations, getLines, getConnections } from "./dao.js";
import { getDistance } from "./utils.js";

// init express
const app = new express();
const port = 3001;

// parse json requests
app.use(express.json());

// get full metro network
app.get("/api/network", async (req, res) => {
  try {
    const stations = await getStations();
    const lines = await getLines();
    const connections = await getConnections();
    
    res.json({ stations, lines, connections });
  } catch (err) {
    res.status(500).json({ error: "failed to retrieve network data" });
  }
});

// setup game
app.get("/api/game/setup", async (req, res) => {
  try {
    const stations = await getStations();
    const connections = await getConnections();
    
    let start, end, dist;
    
    // retry until distance is at least 3
    do {
      start = stations[Math.floor(Math.random() * stations.length)];
      end = stations[Math.floor(Math.random() * stations.length)];
      dist = getDistance(start.id, end.id, connections);
    } while (dist < 3);

    res.json({ start, end });
  } catch (err) {
    res.status(500).json({ error: "failed to setup game" });
  }
});

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});