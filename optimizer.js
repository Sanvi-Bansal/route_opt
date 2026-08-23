/**
 * Haversine formula — great-circle distance between two lat/lng points in km
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} distance in kilometres
 */
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const toRad = (deg) => (deg * Math.PI) / 180;


  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);


  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);


  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}


/**
 * Build a full distance matrix for an array of stops
 * @param {Array<{lat:number, lng:number}>} points
 * @returns {number[][]} matrix[i][j] = distance from i to j
 */
function buildDistanceMatrix(points) {
  const n = points.length;
  const matrix = [];

  for (let i = 0; i < n; i++) {
    matrix[i] = [];
    for (let j = 0; j < n; j++) {
      matrix[i][j] = 0;
    }
  }


  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = haversine(
        points[i].lat,
        points[i].lng,
        points[j].lat,
        points[j].lng
      );
      matrix[i][j] = d;
      matrix[j][i] = d;
    }
  }
  return matrix;
}


/**
 * Nearest-Neighbor heuristic for TSP
 * Starts at index 0, repeatedly visits the closest unvisited stop,
 * then returns to the start.
 * @param {number[][]} matrix
 * @returns {{ order: number[], total: number }}
 */
function nearestNeighbor(matrix) {
  const n = matrix.length;
  if (n < 2) {
    return { order: [0], total: 0 };
  }


  const visited = new Array(n).fill(false);
  const order = [0];
  visited[0] = true;
  let total = 0;
  let current = 0;

  for (let step = 1; step < n; step++) {
    let nearest = -1;
    let minDist = Infinity;


    for (let j = 0; j < n; j++) {
      if (!visited[j] && matrix[current][j] < minDist) {
        minDist = matrix[current][j];
        nearest = j;
      }
    }


    order.push(nearest);
    visited[nearest] = true;
    total += minDist;
    current = nearest;
  }

  total += matrix[current][0];
  order.push(0);


  return { order, total };
}


/**
 * Simple 2-opt improvement
 * Tries to remove crossings by reversing segments
 * @param {number[][]} matrix
 * @param {number[]} order  — route including return to start at the end
 * @returns {{ order: number[], total: number }}
 */