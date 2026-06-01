// imports
import express from "express";
import session from "express-session";
import passport from "passport";
import LocalStrategy from "passport-local";
import { getStations, getLines, getConnections, getUser } from "./dao.js";
import { getDistance } from "./utils.js";

// init express
const app = new express();
const port = 3001;

// parse json
app.use(express.json());

// session config
app.use(session({
  secret: "last-race-secret",
  resave: false,
  saveUninitialized: false
}));

// passport strategy
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await getUser(username, password);
    if (!user) return done(null, false, { message: "invalid credentials" });
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// serialize
passport.serializeUser((user, done) => {
  done(null, { id: user.id, username: user.username });
});

// deserialize
passport.deserializeUser((user, done) => {
  done(null, user);
});

// middlewares
app.use(passport.initialize());
app.use(passport.session());

// login
app.post("/api/sessions", passport.authenticate("local"), (req, res) => {
  res.status(201).json(req.user);
});

// current user
app.get("/api/sessions/current", (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: "not authenticated" });
  }
});

// logout
app.delete("/api/sessions/current", (req, res) => {
  req.logout(() => {
    res.status(200).json({ message: "logged out" });
  });
});

// network data
app.get("/api/network", async (req, res) => {
  try {
    const stations = await getStations();
    const lines = await getLines();
    const connections = await getConnections();
    
    // build network with stations grouped by line and de-duplicated
    const network = {
      lines: lines.map(line => ({
        ...line,
        stations: Array.from(new Map(
          stations
            .filter(s => s.line_id === line.id)
            .map(s => [s.id, s])
        ).values())
      })),
      connections
    };
    
    res.json(network);
  } catch (err) {
    res.status(500).json({ error: "failed to retrieve network data" });
  }
});

// game setup
app.get("/api/game/setup", async (req, res) => {
  try {
    const stations = await getStations();
    const connections = await getConnections();
    
    let start, end, dist;
    
    // ensure distance >= 3
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

// start server
app.listen(port, () => {
  console.log(`server listening at http://localhost:${port}`);
});