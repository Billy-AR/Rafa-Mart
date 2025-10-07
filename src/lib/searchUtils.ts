import { distanceMatrix, type LocationKey } from "../data/graph";
import type { DeliveryState, SearchOptions, SearchTraceStep } from "../types/search";

export const DEPOT: LocationKey = "Depot";

export function createInitialState(): DeliveryState {
  return { loc: DEPOT, visited: [] };
}

export function isGoalState(state: DeliveryState, targets: LocationKey[]): boolean {
  return targets.every((addr) => state.visited.includes(addr));
}

export function serializeVisited(visited: LocationKey[]): string {
  return visited.slice().sort().join("|");
}

export function addVisit(visited: LocationKey[], location: LocationKey): LocationKey[] {
  if (visited.includes(location)) return visited;
  return [...visited, location].sort();
}

export function expandState(state: DeliveryState, targets: LocationKey[], returnToDepot: boolean): Array<{ next: DeliveryState; moveTo: LocationKey; cost: number }> {
  const remaining = targets.filter((addr) => !state.visited.includes(addr));
  if (remaining.length === 0) {
    if (returnToDepot && state.loc !== DEPOT) {
      const cost = distanceMatrix[state.loc][DEPOT];
      return [
        {
          moveTo: DEPOT,
          cost,
          next: {
            loc: DEPOT,
            visited: state.visited,
          },
        },
      ];
    }
    return [];
  }

  return remaining.map((moveTo) => {
    const cost = distanceMatrix[state.loc][moveTo];
    const nextVisited = addVisit(state.visited, moveTo);
    return {
      moveTo,
      cost,
      next: {
        loc: moveTo,
        visited: nextVisited,
      },
    };
  });
}

export function buildTraceStep(previous: SearchTraceStep | null, action: LocationKey | null, state: DeliveryState, stepCost: number): SearchTraceStep {
  return {
    state,
    action,
    stepCost,
    cumulativeCost: (previous?.cumulativeCost ?? 0) + stepCost,
  };
}

export function normalizeTargets(addresses: LocationKey[]): LocationKey[] {
  return addresses.filter((addr) => addr !== DEPOT);
}

export function shouldReturnDepot(options?: SearchOptions): boolean {
  return Boolean(options?.returnToDepot);
}
