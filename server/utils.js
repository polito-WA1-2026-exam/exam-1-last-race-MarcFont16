// calculate shortest path distance between two stations using bfs
export const getDistance = (startId, endId, connections) => {
  
  // base case: already at destination
  if (startId === endId) return 0;

  // build adjacency list
  const graph = {};

  connections.forEach(c => {
    // init empty arrays if station not in graph yet
    if (!graph[c.station_from_id]) graph[c.station_from_id] = [];
    if (!graph[c.station_to_id]) graph[c.station_to_id] = [];
    
    // add undirected edges (bidirectional connections)
    graph[c.station_from_id].push(c.station_to_id);
    graph[c.station_to_id].push(c.station_from_id); 
  });

  // bfs queue: stores arrays of [current_station_id, distance_from_start]
  const queue = [[startId, 0]];

  // track visited nodes to prevent infinite loops
  const visited = new Set([startId]);

  // process queue until empty
  while (queue.length > 0) {
    // pop first element (fifo: first in, first out)
    const [current, dist] = queue.shift();

    // target found. bfs guarantees this is the shortest path
    if (current === endId) return dist;

    // get connected stations (fallback to empty array if none)
    const neighbors = graph[current] || [];
    
    // explore neighbors
    for (const neighbor of neighbors) {
      
      // only process unvisited stations
      if (!visited.has(neighbor)) {
        // mark as visited immediately
        visited.add(neighbor);
        // add to back of queue with incremented distance
        queue.push([neighbor, dist + 1]);
      }
    }
  }

  // target unreachable
  return -1; 
};