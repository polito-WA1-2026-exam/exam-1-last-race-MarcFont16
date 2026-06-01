// calculate shortest path distance between two stations using bfs
export const getDistance = (startId, endId, connections) => {
  if (startId === endId) return 0;

  // build adjacency list
  const graph = {};
  connections.forEach(c => {
    if (!graph[c.station_from_id]) graph[c.station_from_id] = [];
    if (!graph[c.station_to_id]) graph[c.station_to_id] = [];
    // assuming bidirectional connections
    graph[c.station_from_id].push(c.station_to_id);
    graph[c.station_to_id].push(c.station_from_id); 
  });

  // bfs queue: [current_station_id, current_distance]
  const queue = [[startId, 0]];
  const visited = new Set([startId]);

  while (queue.length > 0) {
    const [current, dist] = queue.shift();

    if (current === endId) return dist;

    const neighbors = graph[current] || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([neighbor, dist + 1]);
      }
    }
  }

  // return -1 if unreachable
  return -1; 
};