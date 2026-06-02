// imports
import express from "express";
import session from "express-session";
import passport from "passport";
import LocalStrategy from "passport-local";
import { getStations, getLines, getConnections, getEvents, getUser, getRanking, saveGame } from "./dao.js";
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

// validate route
app.post("/api/games/:id/route", async (req, res) => {
  try {
    const { route, endId } = req.body;
    const connections = await getConnections();
    const allEvents = await getEvents();
    
    let coins = 20;
    let eventsLog = [];
    let isValid = true;
    let currentLineId = null;

    // validate each segment
    for (let i = 0; i < route.length - 1; i++) {
      const from = route[i];
      const to = route[i + 1];
      
      // check connection in db
      const segment = connections.find(c => 
        (c.station_from_id === from.id && c.station_to_id === to.id) ||
        (c.station_from_id === to.id && c.station_to_id === from.id)
      );

      if (!segment) {
        isValid = false;
        break;
      }

      // check valid interchange
      if (currentLineId && currentLineId !== segment.line_id) {
        if (!from.isInterchange) {
          isValid = false;
          break;
        }
      }
      currentLineId = segment.line_id;

      // apply random event
      const event = allEvents[Math.floor(Math.random() * allEvents.length)];
      coins += event.effect;
      eventsLog.push({
        stationName: to.name,
        description: event.description,
        effect: event.effect > 0 ? `+${event.effect}` : `${event.effect}`
      });
    }

    // check if route actually reached destination
    if (isValid && route[route.length - 1].id !== Number(endId)) {
      isValid = false;
    }

    // apply official scoring rules
    if (!isValid) {
      coins = 0;
      eventsLog = [{ stationName: "COMMAND CENTER", description: "CRITICAL ERROR: Route is invalid or incomplete.", effect: "-20" }];
    } else {
      coins += 10;
      eventsLog.push({ stationName: "COMMAND CENTER", description: "ARRIVAL BONUS: Destination reached successfully.", effect: "+10" });
    }

    // return result
    res.json({ coins: Math.max(0, coins), eventsLog, isValid });
  } catch (err) {
    res.status(500).json({ error: "validation failed" });
  }
});

// save game
app.post("/api/games", async (req, res) => {
  // check auth
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "not authenticated" });
  }
  
  const { startStationId, endStationId, score, timeLeft } = req.body;
  
  try {
    const gameId = await saveGame(req.user.id, startStationId, endStationId, score, timeLeft);
    res.status(201).json({ message: "game saved", id: gameId });
  } catch (err) {
    res.status(500).json({ error: "failed to save game" });
  }
});

// ranking data
app.get("/api/ranking", async (req, res) => {
  try {
    const ranking = await getRanking();
    res.json(ranking);
  } catch (err) {
    res.status(500).json({ error: "failed to retrieve ranking" });
  }
});

// start server
app.listen(port, () => {
  console.log(`server listening at http://localhost:${port}`);
});