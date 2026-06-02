drop table if exists Games;
drop table if exists Connections;
drop table if exists Events;
drop table if exists Stations;
drop table if exists Lines;
drop table if exists Users;

-- stations table
CREATE TABLE Stations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    isInterchange BOOLEAN DEFAULT 0
);

-- lines table
CREATE TABLE Lines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT
);

-- connections table
CREATE TABLE Connections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_from_id INTEGER,
    station_to_id INTEGER,
    line_id INTEGER,
    FOREIGN KEY (station_from_id) REFERENCES Stations(id),
    FOREIGN KEY (station_to_id) REFERENCES Stations(id),
    FOREIGN KEY (line_id) REFERENCES Lines(id)
);

-- events table
CREATE TABLE Events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    effect INTEGER NOT NULL
);

-- users table
CREATE TABLE Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    salt TEXT NOT NULL
);

-- games table
CREATE TABLE Games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    start_station_id INTEGER,
    end_station_id INTEGER,
    score INTEGER DEFAULT 0,
    time_left INTEGER,
    played_at DATETIME DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- seed users
INSERT INTO Users (id, username, password, salt) VALUES 
(1, 'guest', 'a214b36e5e7b7d1e5b3c9ebc404fee66a8e09eaeb42aa4050088732dd9dc415c', 'd3b1f9bcde254441dadf98943a800383'),
(2, 'professor', '6c3c8b03489fc8ae79097aa6139cd70c56e1e545e3b0bec72a021588f11f31f5', '49f50ff6e26d30a54fb4811cad60ac8c'),
(3, 'marcfont', 'e85b8e82c8d4c69c5fe5b034562a45a31f601b7cbb0d558bb939e30a2a550813', '9150fce381c0abe2bd1802502f2f6ff8');

-- seed games
INSERT INTO Games (user_id, start_station_id, end_station_id, score, time_left) VALUES 
(1, 1, 5, 24, 45),
(2, 3, 8, 12, 10);

-- seed lines
INSERT INTO Lines (name, color) VALUES 
('L1', 'red'),
('L2', 'purple'),
('L3', 'green'),
('L4', 'yellow'),
('L5', 'blue');

-- seed stations
INSERT INTO Stations (name, isInterchange) VALUES 
('Av. Carrilet', 0),
('Espanya', 1),
('Universitat', 1),
('Catalunya', 1),
('Urquinaona', 1),
('Marina', 0),
('El Clot', 1),
('Passeig de Gràcia', 1),
('Sagrada Família', 1),
('Bac de Roda', 0),
('Zona Universitària', 0),
('Maria Cristina', 0),
('Sants Estació', 1),
('Diagonal', 1),
('Lesseps', 0),
('Verdaguer', 1),
('Vall d''Hebron', 0);

-- seed connections
INSERT INTO Connections (station_from_id, station_to_id, line_id) VALUES 
(1, 2, 1), (2, 3, 1), (3, 4, 1), (4, 5, 1), (5, 6, 1), (6, 7, 1),
(3, 8, 2), (8, 9, 2), (9, 7, 2), (7, 10, 2),
(11, 12, 3), (12, 13, 3), (13, 2, 3), (2, 4, 3), (4, 8, 3), (8, 14, 3), (14, 15, 3),
(16, 8, 4), (8, 5, 4),
(13, 14, 5), (14, 16, 5), (16, 9, 5), (9, 17, 5);

-- seed events
INSERT INTO Events (description, effect) VALUES 
('A tourist asks you for directions to the Sagrada Família.', 1),
('Station maintenance works, you have to take a long detour on foot.', -1),
('You found an empty seat during rush hour.', 2),
('A group enters the carriage blasting reggaeton on a speaker at 8 AM.', -2),
('You ran down the stairs and caught the train by a split second!', 3),
('Loudspeaker: ''The departure of this train will be delayed...''', -3),
('Ticket barrier malfunction: you get to pass for free!', 3),
('Someone blocked the left side of the escalator, making you miss the train.', -3),
('Empty carriage with the AC on full blast: pure glory!', 4),
('Watch out! A pickpocket stole your wallet.', -4);