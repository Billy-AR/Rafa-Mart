import type { LocationKey } from "../../data/graph";
import { buildTraceStep, createInitialState, DEPOT, expandState, isGoalState, normalizeTargets, serializeVisited, shouldReturnDepot } from "../searchUtils";
import { PriorityQueue } from "../priorityQueue";
import { deliveryHeuristic } from "./heuristics";
import type { DeliveryState, SearchMetrics, SearchOptions, SearchSolution, SearchTraceStep } from "../../types/search";

interface FrontierNode {
  state: DeliveryState;
  cost: number;
  heuristic: number;
  path: LocationKey[];
  trace: SearchTraceStep[];
  tieBreaker: number;
}

function makeKey(state: DeliveryState): string {
  return `${state.loc}|${serializeVisited(state.visited)}`;
}

export function runGreedyBestFirstSearch(addresses: LocationKey[], options?: SearchOptions): SearchSolution {
  const targets = normalizeTargets(addresses);
  const returnToDepot = shouldReturnDepot(options);
  const startState = createInitialState();
  const startTrace: SearchTraceStep = buildTraceStep(null, null, startState, 0);

  const startHeuristic = deliveryHeuristic(startState, targets, returnToDepot);
  const frontier = new PriorityQueue<FrontierNode>();
  frontier.enqueue(
    {
      state: startState,
      cost: 0,
      heuristic: startHeuristic,
      path: [DEPOT],
      trace: [startTrace],
      tieBreaker: 0,
    },
    startHeuristic, // Greedy: hanya gunakan h(n), tidak ada g(n)
    0
  );

  const visited = new Set<string>();

  const metrics: SearchMetrics = {
    expandedNodes: 0,
    generatedNodes: 1,
    frontierMaxSize: 1,
    computationTimeMs: 0,
  };

  const startTime = performance.now();
  let tieSequence = 1;

  while (!frontier.isEmpty()) {
    metrics.frontierMaxSize = Math.max(metrics.frontierMaxSize, frontier.size());
    const currentItem = frontier.dequeue()!;
    const { state, cost, path, trace } = currentItem.value;

    const stateKey = makeKey(state);
    if (visited.has(stateKey)) {
      continue;
    }
    visited.add(stateKey);

    const goalReached = isGoalState(state, targets) && (!returnToDepot || state.loc === DEPOT);

    if (goalReached) {
      metrics.computationTimeMs = performance.now() - startTime;
      return {
        algorithm: "Greedy Best-First Search",
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

      const newCost = cost + stepCost;
      const remaining = targets.filter((addr) => !next.visited.includes(addr));
      const heuristic = deliveryHeuristic(next, remaining, returnToDepot);

      const nextTraceStep = buildTraceStep(trace.at(-1) ?? null, moveTo, next, stepCost);
      const nextNode: FrontierNode = {
        state: next,
        cost: newCost,
        heuristic,
        path: [...path, moveTo],
        trace: [...trace, nextTraceStep],
        tieBreaker: tieSequence++,
      };

      frontier.enqueue(nextNode, heuristic, nextNode.tieBreaker); // Hanya h(n)
      metrics.generatedNodes += 1;
    }
  }

  metrics.computationTimeMs = performance.now() - startTime;
  throw new Error("Greedy Best-First Search failed to find a solution.");
}
