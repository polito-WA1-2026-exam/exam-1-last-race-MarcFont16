// imports
import express from "express";
import session from "express-session";
import { getStations, getLines, getConnections, getUser } from "./dao.js";
import { getDistance } from "./utils.js";

// init express
const app = new express();
const port = 3001;

// parse json requests
app.use(express.json());

// configure session
app.use(session({
  secret: "last-race-secret",
  resave: false,
  saveUninitialized: false
}));

// login
app.post("/api/sessions", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await getUser(username, password);
    if (!user) {
      return res.status(401).json({ error: "invalid credentials" });
    }
    req.session.user = { id: user.id, username: user.username };
    res.status(201).json(req.session.user);
  } catch (err) {
    res.status(500).json({ error: "login failed" });
  }
});

// get current user
app.get("/api/sessions/current", (req, res) => {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ error: "not authenticated" });
  }
});

// logout
app.delete("/api/sessions/current", (req, res) => {
  req.session.destroy(() => {
    res.status(200).json({ message: "logged out" });
  });
});

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