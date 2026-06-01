# Exam #1: "Last Race"
## Student: 363159 FONT RUANA MARC 

## React Client Application Routes

- Route `/`: page content and purpose
- Route `/something/:param`: page content and purpose, param specification
- ...

## API Server

- GET `/api/network`
  - request parameters: none
  - response body content: an object containing three arrays (`stations`, `lines`, `connections`) representing the full underground network.
- GET `/api/game/setup`
  - request parameters: none
  - response body content: an object containing `start` and `end` station objects, guaranteed to be at least 3 stops apart.
- POST `/api/sessions`
  - request parameters: none
  - request body content: JSON object with `username` and `password`.
  - response body content: the authenticated user object (`id`, `username`).
- GET `/api/sessions/current`
  - request parameters: none
  - response body content: the currently logged-in user object if a session exists.
- DELETE `/api/sessions/current`
  - request parameters: none
  - response body content: a confirmation message of successful logout.

## Database Tables

- Table `Users` - stores user credentials (username and hashed passwords) for authentication.
- Table `Stations` - contains the details of each metro station (id, name, and a boolean indicating if it is an interchange).
- Table `Lines` - stores the available metro lines (name and color).
- Table `Connections` - represents the graph segments connecting two stations directly, linked to a specific line.
- Table `Events` - contains the random events that can occur during a trip, including their text description and effect on coins.
- Table `Games` - stores the history of played games, including the user, assigned start/end stations, final score, and time left for ranking tie-breakers.

## Main React Components

- `ListOfSomething` (in `List.js`): component purpose and main functionality
- `GreatButton` (in `GreatButton.js`): component purpose and main functionality
- ...

(only _main_ components, minor ones may be skipped)

## Screenshot

![Screenshot](./img/screenshot.jpg)

## Users Credentials

- marcfont, hash_1
- professor, hash_2
- guest, hash_3

## Use of AI Tools
Briefly describe whether you used any AI tools (e.g., ChatGPT, GitHub Copilot, Claude) while working on this project, for which purposes (e.g., clarifying concepts, debugging, generating code), and how you verified or adapted their output.
If you did not use any AI tools, simply state so.