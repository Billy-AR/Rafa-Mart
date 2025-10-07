import type { LocationKey } from "../data/graph";

export interface DeliveryState {
  loc: LocationKey;
  visited: LocationKey[];
}

export interface SearchOptions {
  returnToDepot?: boolean;
}

export interface SearchMetrics {
  expandedNodes: number;
  generatedNodes: number;
  frontierMaxSize: number;
  computationTimeMs: number;
}

export interface SearchTraceStep {
  state: DeliveryState;
  action: LocationKey | null;
  stepCost: number;
  cumulativeCost: number;
}

export interface SearchSolution {
  algorithm: string;
  path: LocationKey[];
  totalDistance: number;
  metrics: SearchMetrics;
  trace: SearchTraceStep[];
}

export type SearchRunner = (addresses: LocationKey[], options?: SearchOptions) => SearchSolution;
