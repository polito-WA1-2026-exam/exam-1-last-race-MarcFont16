// imports
import express from "express";
import { getStations, getLines, getConnections } from "./dao.js";

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

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});