# Exam #N: "Exam Title"
## Student: s123456 LASTNAME FIRSTNAME 

## React Client Application Routes

- Route `/`: page content and purpose
- Route `/something/:param`: page content and purpose, param specification
- ...

## API Server

- POST `/api/something`
  - request parameters and request body content
  - response body content
- GET `/api/something`
  - request parameters
  - response body content
- POST `/api/something`
  - request parameters and request body content
  - response body content
- ...

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

- username, password (plus any other requested info)
- username, password (plus any other requested info)

## Use of AI Tools
Briefly describe whether you used any AI tools (e.g., ChatGPT, GitHub Copilot, Claude) while working on this project, for which purposes (e.g., clarifying concepts, debugging, generating code), and how you verified or adapted their output.
If you did not use any AI tools, simply state so.
