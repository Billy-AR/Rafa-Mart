import { distanceMatrix, type LocationKey } from "../../data/graph";
import type { DeliveryState } from "../../types/search";
import { DEPOT } from "../searchUtils";

function nearestDistance(origin: LocationKey, targets: LocationKey[]): number {
  if (targets.length === 0) return 0;
  return targets.reduce((min, node) => {
    const dist = distanceMatrix[origin][node];
    return Math.min(min, dist);
  }, Number.POSITIVE_INFINITY);
}

function mstCost(nodes: LocationKey[]): number {
  if (nodes.length <= 1) return 0;

  const visited = new Set<LocationKey>();
  visited.add(nodes[0]);
  let total = 0;

  while (visited.size < nodes.length) {
    let bestEdge = Number.POSITIVE_INFINITY;
    let nextNode: LocationKey | null = null;

    for (const from of visited) {
      for (const to of nodes) {
        if (visited.has(to)) continue;
        const dist = distanceMatrix[from][to];
        if (dist < bestEdge) {
          bestEdge = dist;
          nextNode = to;
        }
      }
    }

    if (!nextNode || bestEdge === Number.POSITIVE_INFINITY) {
      break;
    }

    visited.add(nextNode);
    total += bestEdge;
  }

  return Math.round(total * 10) / 10;
}

export function deliveryHeuristic(state: DeliveryState, remaining: LocationKey[], returnToDepot: boolean): number {
  if (remaining.length === 0) {
    return returnToDepot && state.loc !== DEPOT ? distanceMatrix[state.loc][DEPOT] : 0;
  }

  // MST cost untuk menghubungkan semua node yang tersisa
  const treeCost = mstCost(remaining);

  // Jarak minimum dari posisi sekarang ke salah satu node tersisa
  const currentToNext = nearestDistance(state.loc, remaining);

  // Untuk admissible heuristic pada TSP dengan return:
  // Kita tidak bisa menambahkan jarak kembali ke depot secara langsung
  // karena bisa overestimate. Sebagai gantinya kita hanya gunakan MST + nearest.
  // Heuristik ini admissible karena:
  // - MST adalah lower bound untuk mengunjungi semua node
  // - Nearest distance adalah lower bound untuk mencapai node tersisa

  const heuristic = currentToNext + treeCost;
  return Math.round(heuristic * 10) / 10;
}
