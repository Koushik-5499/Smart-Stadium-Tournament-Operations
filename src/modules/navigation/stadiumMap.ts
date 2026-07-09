// PROBLEM STATEMENT ALIGNMENT: addresses "Smart Indoor Navigation" —
// pathfinding and turn-by-turn directions within the stadium.

/**
 * Stadium navigation graph and pathfinding (Dijkstra's algorithm).
 *
 * Provides shortest-path routing between any two stadium locations
 * with turn-by-turn natural-language directions.
 *
 * @module navigation/stadiumMap
 */

import { STADIUM_LOCATIONS, STADIUM_EDGES } from '../../shared/constants';
import type { NavigationStep } from '../../shared/types';

/** Adjacency list built from STADIUM_EDGES. */
type AdjList = Map<string, { to: string; distance: number; description: string }[]>;

/**
 * Builds the adjacency list from the stadium edges.
 * Graph is bidirectional.
 *
 * @returns Adjacency list map
 */
function buildGraph(): AdjList {
  const adj: AdjList = new Map();

  for (const edge of STADIUM_EDGES) {
    if (!adj.has(edge.from)) adj.set(edge.from, []);
    if (!adj.has(edge.to)) adj.set(edge.to, []);
    adj.get(edge.from)!.push({ to: edge.to, distance: edge.distance, description: edge.description });
    adj.get(edge.to)!.push({ to: edge.from, distance: edge.distance, description: `Go back: ${edge.description}` });
  }

  return adj;
}

const graph = buildGraph();

/**
 * Finds the shortest path between two locations using Dijkstra's algorithm.
 *
 * @param fromId - Starting location ID
 * @param toId - Destination location ID
 * @returns Array of navigation steps, or null if no path exists
 */
export function findRoute(fromId: string, toId: string): NavigationStep[] | null {
  if (fromId === toId) {
    return [{ instruction: 'You are already at your destination!', distance: 0 }];
  }

  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const visited = new Set<string>();

  // Initialize
  for (const loc of STADIUM_LOCATIONS) {
    distances.set(loc.id, Infinity);
    previous.set(loc.id, null);
  }
  distances.set(fromId, 0);

  while (true) {
    // Find unvisited node with smallest distance
    let current: string | null = null;
    let minDist = Infinity;

    for (const [node, dist] of distances) {
      if (!visited.has(node) && dist < minDist) {
        current = node;
        minDist = dist;
      }
    }

    if (current === null || current === toId) break;
    visited.add(current);

    const neighbors = graph.get(current) ?? [];
    for (const neighbor of neighbors) {
      if (visited.has(neighbor.to)) continue;
      const newDist = minDist + neighbor.distance;
      if (newDist < (distances.get(neighbor.to) ?? Infinity)) {
        distances.set(neighbor.to, newDist);
        previous.set(neighbor.to, current);
      }
    }
  }

  // Reconstruct path
  if (!previous.has(toId) || (distances.get(toId) ?? Infinity) === Infinity) {
    return null;
  }

  const path: string[] = [];
  let node: string | null = toId;
  while (node !== null) {
    path.unshift(node);
    node = previous.get(node) ?? null;
  }

  // Convert path to navigation steps
  const steps: NavigationStep[] = [];
  for (let i = 0; i < path.length - 1; i++) {
    const edges = graph.get(path[i]) ?? [];
    const edge = edges.find((e) => e.to === path[i + 1]);
    const toLocation = STADIUM_LOCATIONS.find((l) => l.id === path[i + 1]);

    steps.push({
      instruction: edge?.description ?? `Continue to ${toLocation?.name ?? path[i + 1]}`,
      distance: edge?.distance ?? 0,
      landmark: toLocation?.name,
    });
  }

  return steps;
}

/**
 * Resolves a location name (fuzzy) to a location ID.
 *
 * @param query - User's location query (e.g., "gate 12", "restroom")
 * @returns The matching location ID, or null if not found
 */
export function resolveLocation(query: string): string | null {
  const q = query.toLowerCase().trim();

  // Direct ID match
  const directMatch = STADIUM_LOCATIONS.find((l) => l.id === q);
  if (directMatch) return directMatch.id;

  // Name match (case-insensitive, partial)
  const nameMatch = STADIUM_LOCATIONS.find(
    (l) => l.name.toLowerCase().includes(q) || q.includes(l.name.toLowerCase()),
  );
  if (nameMatch) return nameMatch.id;

  // Type match (e.g., "restroom" -> first restroom)
  const typeMatch = STADIUM_LOCATIONS.find(
    (l) => l.type.toLowerCase().includes(q) || q.includes(l.type.toLowerCase()),
  );
  if (typeMatch) return typeMatch.id;

  return null;
}

/**
 * Returns all stadium locations for display.
 *
 * @returns Array of all stadium locations
 */
export function getAllLocations() {
  return STADIUM_LOCATIONS;
}
