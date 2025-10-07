import { describe, expect, it } from "vitest";
import { runAStarSearch, runUniformCostSearch } from ".";
import type { LocationKey } from "../../data/graph";

const fullRoute: LocationKey[] = ["A", "B", "C", "D", "E"];

function assertCoversAddresses(path: LocationKey[], addresses: LocationKey[]) {
  const visited = new Set(path);
  for (const address of addresses) {
    expect(visited.has(address)).toBe(true);
  }
}

describe("delivery search algorithms", () => {
  it("return identical optimal cost when forced to visit all addresses and return", () => {
    const uniform = runUniformCostSearch(fullRoute, { returnToDepot: true });
    const astar = runAStarSearch(fullRoute, { returnToDepot: true });

    expect(uniform.totalDistance).toBeCloseTo(astar.totalDistance, 5);
    expect(uniform.metrics.expandedNodes).toBeGreaterThan(0);
    expect(astar.metrics.expandedNodes).toBeGreaterThan(0);
    expect(uniform.path[0]).toBe("Depot");
    expect(astar.path[0]).toBe("Depot");
    expect(uniform.path.at(-1)).toBe("Depot");
    expect(astar.path.at(-1)).toBe("Depot");
    assertCoversAddresses(uniform.path, fullRoute);
    assertCoversAddresses(astar.path, fullRoute);
  });

  it("A* never expands more nodes than uniform cost on the sample dataset", () => {
    const uniform = runUniformCostSearch(fullRoute, { returnToDepot: true });
    const astar = runAStarSearch(fullRoute, { returnToDepot: true });

    expect(astar.metrics.expandedNodes).toBeLessThanOrEqual(uniform.metrics.expandedNodes);
    expect(astar.metrics.generatedNodes).toBeLessThanOrEqual(uniform.metrics.generatedNodes);
  });

  it("supports open route delivery when depot return is optional", () => {
    const uniform = runUniformCostSearch(["A", "B", "C"], { returnToDepot: false });
    const astar = runAStarSearch(["A", "B", "C"], { returnToDepot: false });

    expect(uniform.path.at(-1)).not.toBeNull();
    expect(astar.path.at(-1)).not.toBeNull();
    assertCoversAddresses(uniform.path, ["A", "B", "C"]);
    assertCoversAddresses(astar.path, ["A", "B", "C"]);
    expect(uniform.totalDistance).toBeCloseTo(astar.totalDistance, 5);
  });
});
