import type { LocationKey } from "../../data/graph";
import { buildTraceStep, createInitialState, DEPOT, expandState, isGoalState, normalizeTargets, serializeVisited, shouldReturnDepot } from "../searchUtils";
import { PriorityQueue } from "../priorityQueue";
import type { DeliveryState, SearchMetrics, SearchOptions, SearchSolution, SearchTraceStep } from "../../types/search";

interface FrontierNode {
  state: DeliveryState;
  cost: number;
  path: LocationKey[];
  trace: SearchTraceStep[];
  tieBreaker: number;
}

function makeKey(state: DeliveryState): string {
  return `${state.loc}|${serializeVisited(state.visited)}`;
}

export function runUniformCostSearch(addresses: LocationKey[], options?: SearchOptions): SearchSolution {
  const targets = normalizeTargets(addresses);
  const returnToDepot = shouldReturnDepot(options);
  const startState = createInitialState();
  const startTrace: SearchTraceStep = buildTraceStep(null, null, startState, 0);
  const frontier = new PriorityQueue<FrontierNode>();
  frontier.enqueue(
    {
      state: startState,
      cost: 0,
      path: [DEPOT],
      trace: [startTrace],
      tieBreaker: 0,
    },
    0,
    0
  );

  const bestCost = new Map<string, number>();
  bestCost.set(makeKey(startState), 0);

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

    // Check apakah ini state yang sudah pernah diexpand dengan cost lebih rendah
    const stateKey = makeKey(state);
    const recordedCost = bestCost.get(stateKey);
    if (recordedCost !== undefined && recordedCost < cost) {
      continue; // Skip state ini karena sudah ada path lebih murah
    }

    const goalReached = isGoalState(state, targets) && (!returnToDepot || state.loc === DEPOT);

    if (goalReached) {
      metrics.computationTimeMs = performance.now() - startTime;
      return {
        algorithm: "Uniform Cost Search",
        path,
        totalDistance: cost,
        metrics,
        trace,
      };
    }

    metrics.expandedNodes += 1;

    for (const { moveTo, cost: stepCost, next } of expandState(state, targets, returnToDepot)) {
      const newCost = cost + stepCost;
      const key = makeKey(next);
      const previousBest = bestCost.get(key);
      if (previousBest !== undefined && previousBest <= newCost) {
        continue;
      }

      bestCost.set(key, newCost);

      const nextTraceStep = buildTraceStep(trace.at(-1) ?? null, moveTo, next, stepCost);
      const nextNode: FrontierNode = {
        state: next,
        cost: newCost,
        path: [...path, moveTo],
        trace: [...trace, nextTraceStep],
        tieBreaker: tieSequence++,
      };

      frontier.enqueue(nextNode, newCost, nextNode.tieBreaker);
      metrics.generatedNodes += 1;
    }
  }

  metrics.computationTimeMs = performance.now() - startTime;
  throw new Error("Uniform Cost Search failed to find a solution.");
}
