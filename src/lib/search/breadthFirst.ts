import type { LocationKey } from "../../data/graph";
import { buildTraceStep, createInitialState, DEPOT, expandState, isGoalState, normalizeTargets, serializeVisited, shouldReturnDepot } from "../searchUtils";
import type { DeliveryState, SearchMetrics, SearchOptions, SearchSolution, SearchTraceStep } from "../../types/search";

interface QueueNode {
  state: DeliveryState;
  cost: number;
  path: LocationKey[];
  trace: SearchTraceStep[];
  depth: number;
}

function makeKey(state: DeliveryState): string {
  return `${state.loc}|${serializeVisited(state.visited)}`;
}

export function runBreadthFirstSearch(addresses: LocationKey[], options?: SearchOptions): SearchSolution {
  const targets = normalizeTargets(addresses);
  const returnToDepot = shouldReturnDepot(options);
  const startState = createInitialState();
  const startTrace: SearchTraceStep = buildTraceStep(null, null, startState, 0);

  const queue: QueueNode[] = [];
  queue.push({
    state: startState,
    cost: 0,
    path: [DEPOT],
    trace: [startTrace],
    depth: 0,
  });

  const visited = new Set<string>();
  visited.add(makeKey(startState));

  const metrics: SearchMetrics = {
    expandedNodes: 0,
    generatedNodes: 1,
    frontierMaxSize: 1,
    computationTimeMs: 0,
  };

  const startTime = performance.now();

  while (queue.length > 0) {
    metrics.frontierMaxSize = Math.max(metrics.frontierMaxSize, queue.length);
    const current = queue.shift()!;
    const { state, cost, path, trace } = current;

    const goalReached = isGoalState(state, targets) && (!returnToDepot || state.loc === DEPOT);

    if (goalReached) {
      metrics.computationTimeMs = performance.now() - startTime;
      return {
        algorithm: "Breadth-First Search",
        path,
        totalDistance: cost,
        metrics,
        trace,
      };
    }

    metrics.expandedNodes += 1;

    for (const { moveTo, cost: stepCost, next } of expandState(state, targets, returnToDepot)) {
      const key = makeKey(next);
      if (visited.has(key)) {
        continue;
      }

      visited.add(key);
      const newCost = cost + stepCost;
      const nextTraceStep = buildTraceStep(trace.at(-1) ?? null, moveTo, next, stepCost);

      queue.push({
        state: next,
        cost: newCost,
        path: [...path, moveTo],
        trace: [...trace, nextTraceStep],
        depth: current.depth + 1,
      });

      metrics.generatedNodes += 1;
    }
  }

  metrics.computationTimeMs = performance.now() - startTime;
  throw new Error("Breadth-First Search failed to find a solution.");
}
