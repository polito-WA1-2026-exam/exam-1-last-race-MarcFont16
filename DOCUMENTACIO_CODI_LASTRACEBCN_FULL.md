# Documentació de codi per a LastRaceBCN

Aquest document està pensat perquè puguis entendre i explicar qualsevol aspecte del projecte amb facilitat. Conté les parts generals, la lògica clau, els patrons que es repeteixen i una guia pràctica per analitzar codi.

## 1. Objectiu general

- Entendre què fa cada capa del projecte.
- Saber explicar per què s’ha triat una solució i no una altra.
- Reconèixer les parts crítiques on cal garantir seguretat, consistència i rendiment.
- Poder afegir explicacions noves a mida que s’incorporin més fragments de codi.
- Conèixer un mètode estructurat per respondre preguntes de codi de manera clara i completa.

## 2. Patrons generals del projecte

- **Client / Servei separats**: React funciona com a client i Express serveix la lògica i les dades.
- **Sessió amb cookies**: Passport.js gestiona l’autenticació i guarda l’usuari en una sessió HTTP-only.
- **Comunicar amb API**: el client fa `fetch` a `API_URL` amb `credentials: 'include'` per mantenir la sessió.
- **Validació al servidor**: qualsevol regla de negoci important s’executa al backend, no al client.
- **Dades relacionals**: SQLite es fa servir per taules d’usuaris, estacions, connexions, esdeveniments i partides.

## 3. Arquitectura general i comunicació zero-trust

- `server/index.js` configura Express, CORS, sessions i Passport.
- El `corsOptions` només accepta origen `http://localhost:5173` i `credentials: true`.
- Aquest plantejament evita que un client desconegut pugui cridar l’API amb cookies de sessió.
- El backend aplica un model zero-trust: mai no accepta ni confia en cap validació feta només pel client.
- Exemples reals:
  - les rutes no es validen al moment de clicar al mapa; es validen quan es fa `POST /api/games/route`.
  - la puntuació es recalcula al servidor abans de guardar qualsevol joc.

## 3.1 Flux de responsabilitats: frontend → index.js → dao.js → BD

- El frontend fa peticions HTTP al servidor; `server/index.js` rep aquestes peticions.
- `index.js` és l’intermediari que entén el que fa l’usuari, aplica la lògica de control, valida la sessió i després delega en `dao.js` quan cal accedir a la base de dades.
- `index.js` no consulta SQLite directament; no té codi SQL ni cria connexions a la base de dades.
- `dao.js` és el component que coneix la base de dades: obre la connexió a `server/db.js`, executa consultes SQL i retorna resultats a `index.js`.
- Exemple de flux:
  1. El client crida `POST /api/games/route` amb la ruta planificada.
  2. `index.js` valida la sessió, valida la ruta i calcula la puntuació.
  3. Si cal llegir estacions, connexions o esdeveniments, `index.js` demana aquestes dades a `dao.js`.
  4. Quan la partida s’ha de guardar, `index.js` rep la sol·licitud `POST /api/games` i l’envia a `dao.js` amb `saveGame(...)`.
  5. Si es demana el ranking, `index.js` crida `dao.getRanking()` i retorna el resultat al client.
- Així, `index.js` fa d’orquestrador i regla de negoci, i `dao.js` fa d’accés a dades.
- Això ajuda a mantenir el codi clar: canvis en la lògica de joc es fan a `index.js`, canvis en l’esquema o consultes SQL es fan a `dao.js`.

## 4. Criptografia i IAM

- `server/dao.js` conté la interacció amb la base de dades i la verificació d’usuaris.
- La funció `getUser(username, password)` busca l’usuari en la taula `Users`.
- Si existeix, es deriva la contrasenya amb `crypto.scrypt(password, row.salt, 32)`.
- El resultat es compara amb el hash emmagatzemat en `row.password`.
- Això vol dir que no s’emmagatzema mai la contrasenya en text clar.
- El salt és únic per usuari i s’usa per fer la derivació de la clau.
- Passport serialitza només `{ id, username }`, reduint l’exposició d’informació a la cookie.

## 5. Algorismes de pathfinding i grafos

- `server/utils.js` implementa la funció `getDistance(startId, endId, connections)`.
- Aquesta funció busca la distància mínima entre dues estacions en una xarxa no ponderada.
- El mètode utilitzat és BFS (Breadth-First Search).
- El graf s’organitza com una llista d’adjacència: cada estació apunta a les seves connexions.
- S’usa un `Set` per marcar estacions visitades i evitar repetir-les, això evita bucles.
- La distància compta segments (`edges`) i no només estacions.
- Això garanteix que el joc sempre proposi inici i destí separats per almenys 3 segments.

## 6. Validació de rutes i detecció de duplicats

- `server/index.js` processa `POST /api/games/route`.
- La ruta enviada pel client té una forma: `{ route, endId }`.
- `index.js` recorre cada parella consecutiva de la rampa i valida la lògica de ruta, però no fa consultes SQL directes.
- Quan necessita dades, com les connexions o els esdeveniments, `index.js` delega a `dao.js`.
- El servidor valida:
  1. que el segment existeix a la taula `Connections`.
  2. que no s’ha recorregut abans.
  3. que el canvi de línia passa per una estació intercanviadora.
- Per detectar duplicats, crea un identificador normalitzat del segment:
  - ordena `from.id` i `to.id`
  - els concatena amb `-`
  - guarda el resultat en un `Set`
- Això fa que `13-21` i `21-13` siguin el mateix segment.
- Si es detecta un segment repetit, s’activa `isValid = false` i s’interromp la validació.
- Si la ruta no arriba a l’`endId`, també es marca com a invàlida.
- La puntuació final només es retorna quan el servidor ha validat completament la ruta.

## 7. Estructura de dades i normalització

- A `server/index.js`, la ruta `GET /api/network` orquestra la construcció de la xarxa amb línies i estacions agrupades.
- `index.js` demana a `dao.js` les dades de línies, estacions i connexions, i després les combina en el format final.
- Cada línia conté una llista de les seves estacions sense duplicitats.
- Les connexions es retornen tal com es guarden a la base de dades.
- Aquest contracte d’API permet al client dibuixar tant el mapa oficial com la graella de joc.
- La normalització facilita que la UI no hagi de reprocessar la mateixa estació diverses vegades.

## 8. Client React: GameContainer i gestió d’estat

- `client/src/components/GameContainer.jsx` és el controlador principal del joc.
- El component manté estats clau:
  - `gamePhase`: fase actual del joc (`SETUP`, `PLANNING`, `EXECUTION`, `RESULT`).
  - `network`, `mission`, `route`: dades de la partida.
  - `timeLeft`, `currentCoins`, `eventsLog`, `currentStep`: informació d’execució.
  - `loading`, `error`, `isSubmitting`: estats de UX.
- El primer `useEffect` carrega la xarxa i el punt de partida amb `Promise.all`.
- El segon `useEffect` redueix el temporitzador durant la fase de planificació.
- El tercer `useEffect` gestiona l’animació d’execució i recalcula `currentCoins` de forma determinista:
  - parteix de 20 punts
  - suma tots els efectes visibles fins a `currentStep`
  - no depèn de valors previs mutats
- Això evita problemes amb React Strict Mode i dobles renderitzacions.

## 9. Prevenció de race conditions i gestió d’errors

- `submitRoute` comprova `isSubmitting` al principi per evitar envaïment de peticions.
- Quan la validació s’inicia, bloqueja la UI i canvia fase a `EXECUTION`.
- Les crides `fetch` utilitzen `credentials: 'include'` per enviar cookies de sessió.
- Tot es fa dins d’un `try...catch` per capturar falles de xarxa.
- Si hi ha un error, el component mostra un missatge d’error i no es trenca l’aplicació.
- Aquest patró és fonamental per aplicacions amb múltiples interaccions async.

## 10. Consultes SQL avançades i ranking

- `dao.js` gestiona les consultes a SQLite amb promeses.
- `index.js` delega les consultes de dades a `dao.js`, que és l’únic que escriu SQL.
- `getRanking` usa una subconsulta correlacionada per obtenir la millor partida per usuari.
- La consulta selecciona l’`id` de la partida amb `ORDER BY score DESC, time_left DESC LIMIT 1` per cada `user_id`.
- Això resol empats directament dins de la base de dades.
- `saveGame` inserta una nova fila a `Games` amb les dades de la partida.
- Evitar fer el filtrat a Node i deixar que SQLite ordeni i agrupyi és més eficient.

## 11. Com analitzar qualsevol arxiu o fragment de codi

Quan analitzes un arxiu per primera vegada, busca aquestes coses:

1. **Imports i dependències**
   - Què importa? `express`, `passport`, `react`, `fetch`, `crypto`.
   - Això indica si l’arxiu és de servidor, client, seguretat o UI.
2. **Responsabilitat principal**
   - Gestiona rutes? Dades? Autenticació? Presentació? Càlculs?
3. **Entrades i sortides**
   - Quina informació rep i què retorna?
   - En un endpoint, és `req.body` → `res.json(...)`.
   - En un component React, és `props`, `state` i returns JSX.
4. **Patrons de control de flux**
   - Async/await, promeses, `try...catch`, `useEffect`, `setTimeout`.
   - Aquestes eines mostren com s’organitzen les operacions lentes o els efectes.
5. **Validació i seguretat**
   - S’usa `req.isAuthenticated()`? `passport.authenticate()`? `crypto.scrypt`?
   - Es comprova el tipus de dades i la presència de camps obligatoris?
6. **Gestió d’estat i incoherències**
   - Es modifica l’estat directament o es crea nou objecte/array?
   - Es fa `setState([...route, station])` o s’usa un patró mutable perillós?
7. **Mecanismes de defensa**
   - Hi ha `Set` per evitar duplicats?
   - S’usa un bloqueig `isSubmitting`?
   - S’eviten rutes inexistents o salts il·lògics?

## 12. Plantilla per respondre preguntes de codi

Quan t’expliquen un fragment, fes servir aquest esquema com a resposta:

- `Què fa?`
  - "Aquesta funció valida la ruta que l’usuari ha planejat i calcula la puntuació oficial." 
- `On està?`
  - "S’implementa a `server/index.js` dins de `POST /api/games/route`."
- `Com ho fa?`
  - "Transforma cada parella de parades en un segment normalitzat i comprova la base de dades per assegurar que existeix." 
- `Per què ho fa així?`
  - "Això evita que l’usuari faci trampes retrocedint per un mateix segment o carregui una ruta que no existeix." 
- `Quins problemes evita?`
  - "Evita trajectes duplicats, salts en línies no vàlides i puntuacions falses." 

Aquest patró funciona tant per una funció de React com per una consulta SQL o una ruta d’Express.

## 13. Com afegir més codi i explicacions

Per completar el document en el futur, segueix aquestes regles:

- Si afegeixes un nou endpoint, descriu el contracte API, els paràmetres esperats i la resposta.
- Si canvies la lògica de joc, explica la regla de negoci que implementes.
- Si alteres la base de dades, anota les taules afectades i les claus estrangeres.
- Si modifiques el client React, indica com impacta la UI i les dependències d’estat.
- Si implementes un nou algorisme, descriu el seu cost i per què és el més adequat.

## 14. Exemples d’explicacions complexes

- **CORS + sessions**: "Aquí `corsOptions` limita l’origen i transmet cookies per mantenir la sessió, de manera que només el client oficial pot cridar l’API amb credencials." 
- **BFS en graf**: "La funció fa una cerca per amplitud, que garanteix la ruta mínima en un graf sense pesos i evita bucles gràcies al `Set` de visitats." 
- **Determinisme en React**: "No depenem d’un `prevState` acumulat, perquè React Strict Mode podria disparar l’efecte dues vegades; en canvi recalculam des de zero a cada pas." 

## 15. Guia ràpida per parlar de codi en català

- Utilitza termes estàndard: `endpoint`, `validació`, `sessió`, `cors`, `hash`, `graf`, `render`, `state`, `hook`.
- Explica les decisions com a mesures de seguretat, robustesa i mantenibilitat.
- Si no saps un detall, diu `Aquest fragment fa... i sembla dissenyat per...`, això mostra criteri.
- Sigues clar amb `què`, `per què`, `com` i `on`.

Aquest document ha de funcionar com una plantilla viva: quan preguntin "Què fa això?" ja tens una resposta estructurada i un marc per adaptar-la a qualsevol codi del projecte.

## 16. Detall per fitxer (explicació completa)

A continuació trobaràs, per cada arxiu clau del projecte, una explicació completa: què fa, les funcions principals, què crida i per què està implementat així.

### `server/index.js`
- Què fa: configura l'API Express i exposa tots els endpoints públics del servidor.
- Funcions / rutes principals:
  - `POST /api/sessions` — login mitjançant `passport.authenticate("local")`.
  - `GET /api/sessions/current` — retorna l'usuari de la sessió si `req.isAuthenticated()`.
  - `DELETE /api/sessions/current` — fa `req.logout()` i tanca sessió.
  - `GET /api/network` — orquestra la construcció de la representació de la xarxa (línies, estacions, connexions) a partir de dades de `dao.js`.
  - `GET /api/game/setup` — tria aleatòriament `start` i `end` assegurant distància mínima mitjançant `getDistance`.
  - `POST /api/games/route` — valida la ruta enviada pel client, aplica esdeveniments i calcula la puntuació oficial.
  - `POST /api/games` — processa la sol·licitud d'emmagatzematge de partida i la delega a `dao.saveGame(...)`.
  - `GET /api/ranking` — obté el ranking delegant en `dao.getRanking()` i el retorna al client.
- Què crida: `getStations`, `getLines`, `getConnections`, `getEvents`, `getUser`, `getRanking`, `saveGame` (des de `dao.js`) i `getDistance` (des de `utils.js`).
- Com i per què:
  - Cors i sessions: `corsOptions` només permet l'origen del client i `credentials: true` per compartir la cookie de sessió de Passport; això manté un esquema de confiança mínima (zero-trust) i evita que altres orígens capturin o reutilitzin cookies.
  - No consulta la base de dades directament: delega les consultes a `dao.js` i només processa la lògica de negoci i la validació de sessió.
  - Validació de rutes: per a cada segment consecutiu construeix un `segmentId` normalitzat ordenant `from.id` i `to.id` i guardant-lo en un `Set`. Així `13-21` i `21-13` són identificador únic del segment, independent de la direcció. Això prevé retrocediments i duplicitats amb O(1) per comprovació.
  - Comprovacions addicionals: assegura que el segment existeix a la taula `Connections` i que un canvi de `line_id` només és vàlid si l'estació actual és `isInterchange`.
  - Esdeveniments: extreu una llista d'esdeveniments de la BBDD via `dao.js` i aplica un efecte aleatori per segment a la puntuació (`coins`). Això manté la lògica del joc al servidor i evita manipulacions client-side.
  - Guardar partida: només permet guardar si `req.isAuthenticated()`; això protegeix l'històric i associa la partida amb `req.user.id`.

### `server/dao.js`
- Què fa: proveeix una capa d'accés a dades (data access object) amb funcions que retornen Promises.
- Funcions principals:
  - `getStations()` — retorna estacions distinctes con `line_id` agregat (fa JOIN amb `Connections`).
  - `getLines()` — retorna totes les línies.
  - `getConnections()` — retorna totes les connexions.
  - `getEvents()` — retorna tots els esdeveniments (descripcions i efectes numèrics).
  - `getUser(username, password)` — llegeix l'usuari i valida la contrasenya amb `crypto.scrypt` i el `salt` emmagatzemat.
  - `getRanking()` — consulta avançada SQL que usa una subconsulta correlacionada per seleccionar la millor partida per usuari (order by `score DESC, time_left DESC`).
  - `saveGame(userId, startStationId, endStationId, score, timeLeft)` — insereix una nova fila a `Games`.
- Què crida: importa `db` (la connexió SQLite) i `crypto` per la verificació de contrasenyes.
- Com i per què:
  - `dao.js` és l’únic que coneix la base de dades i escriu SQL; `index.js` utilitza aquestes funcions com a servei.
  - Promeses: cada funció envolta les crides de `db` en Promises per poder usar `await` al codi del servidor.
  - `crypto.scrypt`: s'utilitza perquè és una KDF (key derivation function) segura — millora la resistència a atacs de força bruta i taules rainbow comparat amb simples funcions hash.
  - `getRanking` utilitza la base de dades per fer la feina d'agregació, reduint trànsit i cost computacional al servidor Node.

### `server/db.js`
- Què fa: crea i exporta la connexió a la base de dades SQLite (`last-race.db`).
- Com: `new sqlite3.Database('./last-race.db', ...)` — mostra errors de connexió per consola i exporta `db` per ser reutilitzat pel DAO.
- Per què: centralitzar la connexió evita múltiples obertures i facilita el mock o substitució per proves.

### `server/utils.js`
- Què fa: implementa utilitats diverses; principalment `getDistance(startId, endId, connections)`.
- Implementació:
  - Construeix una llista d'adjacència `graph` a partir de `connections` assumint bidireccionalitat.
  - Executa una BFS (Breadth-First Search) comptant la distància en segments (edges).
  - Retorna la distància mínima en segments o `-1` si no és accessible.
- Complexitat i per què:
  - Complexitat O(V + E) en temps, memòria O(V). BFS és la millor opció per trobar distància mínima en graf sense pesos.
  - S'usa a `GET /api/game/setup` per assegurar que l'origen i destinació estiguin separats per almenys 3 segments (regla de joc).

### `server/schema.sql`
- Què fa: defineix l'esquema de la base de dades i introdueix dades semilla.
- Taules clau i importància:
  - `Stations(id, name, isInterchange)` — `isInterchange` és crític per validar canvis de línia.
  - `Lines(id, name, color)` — metadades utilitzades pel client per dibuixar línies.
  - `Connections(station_from_id, station_to_id, line_id)` — representa segments; és la font de veritat per validar moviments.
  - `Events(description, effect)` — llista d'esdeveniments aleatoris aplicats per segment.
  - `Users(username, password, salt)` — contrasenya ja emmagatzemada com hash; `salt` únic per usuari.
  - `Games(...)` — històric de partides amb `played_at` automàtic.
- Notes: el fitxer inclou entrades de prova (users, games, lines, stations, connections, events) que el servidor aprofita per arrancar en entorn local.

### `client/src/config.js`
- Què fa: exporta `API_URL` amb l'endpoint base `http://localhost:3001/api`.
- Per què: centralitza l'URL d'API per facilitar canvis d'entorn i evitar rutes relatives fràgils.

### `client/src/components/GameContainer.jsx`
- Què fa: orquestra el cicle complet del joc al client (carregar dades, planificació, execució, resultat i guardar).
- Variables i estats importants:
  - `gamePhase`, `network`, `mission`, `route`, `timeLeft`, `gameResult`.
  - UX: `loading`, `error`, `isSubmitting`.
  - Execució: `eventsLog`, `currentStep`, `currentCoins`.
- Efectes (`useEffect`):
  - Carrega `GET /network` i `GET /game/setup` com a promeses en paral·lel a la muntada.
  - Temporitzador de planificació: decrementa `timeLeft` i crida `submitRoute()` quan s'esgota.
  - Animació d'execució: recalcula `currentCoins` de forma determinista a partir de `eventsLog` i `currentStep` (evita patrons mutables per ser `Strict Mode`-safe).
- Funcions clau:
  - `startMission()` — passa a la fase `PLANNING`.
  - `handleMove(station)` — afegeix l'estació seleccionada a `route` (només en `PLANNING`).
  - `resetGame()` — reinicia estats a valors inicials.
  - `submitRoute()` — bloqueja amb `isSubmitting`, envia `POST /games/route` amb `{ route, endId }` i després, si `isValid`, envia `POST /games` per guardar la partida (amb `credentials: 'include'`).
- Per què està així:
  - El bloqueig `isSubmitting` evita race conditions i submissions duplicats.
  - L'ús de `credentials: 'include'` fa que el servidor identifiqui l'usuari via cookie de sessió.
  - Recalcular `currentCoins` des de zero cada pas evita duplicacions causades per Strict Mode o re-renders repetits.

### `client/src/components/NetworkMap.jsx`
- Què fa: renderitza la vista del mapa i el grid de planificació, i controla si una estació és clicable.
- Funcions internes:
  - `isValidMove(targetStation)` — comprova que el `targetStation` no estigui ja a la `route` i que existeixi una connexió amb la posició actual (`network.connections`).
  - `getUniqueStations()` — construeix una llista d'estacions sense duplicats a partir de `network.lines`.
  - `getAllSegments()` — converteix `connections` en una llista textual per mostrar operatives conegudes.
  - `renderStationButton(station)` — decideix l'estat visual (current, end, clickable) i el comportament del botó.
- Per què:
  - El component aplica una defensa client-side (no suficient sola) per bloquejar clics il·lògics i millorar UX; la validació final la fa el servidor.

### `client/src/components/LoginForm.jsx`
- Què fa: gestiona la UI d'autenticació i la crida a `POST /sessions`.
- Com:
  - `handleSubmit` envia `fetch(${API_URL}/sessions)` amb `credentials: 'include'` i, si OK, crida `setUser(data)` i redirigeix.
  - Inclou validació HTML nativa (`required`) i missatges d'error.
- Per què:
  - Manté la sessió com a cookie HTTP-only al domini del servidor; el client només rep l'objecte usuari després d'autenticar-se.

### `client/src/components/NavBar.jsx`
- Què fa: mostra enllaços de navegació i l'estat d'autenticació.
- Props: `user` i `onLogout` (callback que el pare ha d'implementar per tancar sessió).

### `client/src/components/HomePage.jsx`
- Què fa: pàgina d'inici amb enllaços a les seccions principals i botó d'accés o login segons si `user` existeix.

### `client/src/components/InstructionsPage.jsx`
- Què fa: document de regles estàtiques que explica fases del joc, puntuació i empats.
 - Important per a QA i per a usuaris nous que volen conèixer les regles exactes que el servidor també aplica.

### `client/src/components/RankingPage.jsx`
- Què fa: busca `GET /ranking` i mostra sempre 10 files amb les entrades disponibles; en cas d'error mostra missatge.
- Per què: manté la presentació consistent i deixa que la BBDD resolgui empats i càlculs complexos.

---

Aquestes explicacions s'han afegit per cobrir tots els fitxers principals del projecte. Si vols, puc:

- inserir exemples de sortida (JSON) per a cada endpoint; o
- generar una versió resumida per fer servir en presentacions; o
- crear fitxers README separats per client i servidor amb aquests continguts.
