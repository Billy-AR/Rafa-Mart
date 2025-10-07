import { useMemo, useState } from "react";
import "./App.css";
import { distanceMatrix, locations, locationIds, type LocationKey } from "./data/graph";
import { runBreadthFirstSearch, runUniformCostSearch, runGreedyBestFirstSearch, runAStarSearch } from "./lib/search";
import type { SearchSolution } from "./types/search";

type AlgorithmKey = "bfs" | "ucs" | "greedy" | "astar";

// Kelompokkan berdasarkan kategori
const blindSearchOrder: AlgorithmKey[] = ["bfs", "ucs"];
const heuristicSearchOrder: AlgorithmKey[] = ["greedy", "astar"];
const algorithmOrder: AlgorithmKey[] = [...blindSearchOrder, ...heuristicSearchOrder];

const algorithmLabels: Record<AlgorithmKey, string> = {
  bfs: "Breadth-First Search",
  ucs: "Uniform Cost Search",
  greedy: "Greedy Best-First Search",
  astar: "A* Search",
};

const algorithmCategories: Record<AlgorithmKey, string> = {
  bfs: "Blind Search",
  ucs: "Blind Search",
  greedy: "Heuristic Search",
  astar: "Heuristic Search",
};

const mapColors: Record<AlgorithmKey, string> = {
  bfs: "#1976d2",
  ucs: "#0d47a1",
  greedy: "#e65100",
  astar: "#c62828",
};

const addressOptions = locations.filter((loc) => loc.id !== "Depot");

function formatDistance(distance: number): string {
  return `${distance.toFixed(1)} km`;
}

function formatTime(ms: number): string {
  if (ms < 1) return "< 1 ms";
  return `${ms.toFixed(1)} ms`;
}

function formatPath(path: LocationKey[]): string {
  return path.join(" → ");
}

function findBestInCategory(entries: Array<[AlgorithmKey, SearchSolution]>, category: "blind" | "heuristic"): AlgorithmKey | null {
  const categoryKeys = category === "blind" ? blindSearchOrder : heuristicSearchOrder;
  const categoryEntries = entries.filter(([key]) => categoryKeys.includes(key));

  if (categoryEntries.length === 0) return null;

  // Cari solusi dengan jarak optimal (minimal)
  const minDistance = Math.min(...categoryEntries.map(([, sol]) => sol.totalDistance));

  // Filter hanya solusi yang optimal (sama dengan jarak minimal)
  const optimalSolutions = categoryEntries.filter(([, sol]) => Math.abs(sol.totalDistance - minDistance) < 0.01);

  // Jika hanya ada 1 solusi optimal, itu yang terbaik
  if (optimalSolutions.length === 1) {
    return optimalSolutions[0][0];
  }

  // Jika ada beberapa solusi dengan jarak optimal yang sama,
  // pilih yang paling EFISIEN KOMPUTASI (paling sedikit node expansion)
  let bestKey = optimalSolutions[0][0];
  let bestExpansion = optimalSolutions[0][1].metrics.expandedNodes;

  for (const [key, solution] of optimalSolutions.slice(1)) {
    if (solution.metrics.expandedNodes < bestExpansion) {
      bestKey = key;
      bestExpansion = solution.metrics.expandedNodes;
    }
  }

  return bestKey;
}

function App() {
  const [selectedAddresses, setSelectedAddresses] = useState<LocationKey[]>(addressOptions.slice(0, 4).map((loc) => loc.id));
  const [returnToDepot, setReturnToDepot] = useState<boolean>(true);
  const [solutions, setSolutions] = useState<Record<AlgorithmKey, SearchSolution | null>>({
    bfs: null,
    ucs: null,
    greedy: null,
    astar: null,
  });
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const mapLayout = useMemo(() => {
    const margin = 12; // Perbesar margin agar label tidak terpotong
    const xs = locations.map((loc) => loc.coord.x);
    const ys = locations.map((loc) => loc.coord.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const width = Math.max(maxX - minX, 1);
    const height = Math.max(maxY - minY, 1);

    const points = new Map<LocationKey, { x: number; y: number }>();

    for (const loc of locations) {
      const x = ((loc.coord.x - minX) / width) * (100 - margin * 2) + margin;
      const y = ((maxY - loc.coord.y) / height) * (100 - margin * 2) + margin;
      points.set(loc.id, { x, y });
    }

    return { points };
  }, []);

  const solutionEntries = useMemo(() => algorithmOrder.map((key) => [key, solutions[key]] as [AlgorithmKey, SearchSolution | null]).filter((entry): entry is [AlgorithmKey, SearchSolution] => entry[1] !== null), [solutions]);

  const bestBlindAlgorithm = useMemo(() => findBestInCategory(solutionEntries, "blind"), [solutionEntries]);
  const bestHeuristicAlgorithm = useMemo(() => findBestInCategory(solutionEntries, "heuristic"), [solutionEntries]);

  const toggleAddress = (id: LocationKey) => {
    setSelectedAddresses((prev) => {
      if (prev.includes(id)) {
        return prev.filter((addr) => addr !== id);
      }
      return [...prev, id];
    });
  };

  const runComparison = () => {
    if (selectedAddresses.length === 0) {
      setError("Pilih minimal satu alamat untuk dikirim.");
      return;
    }

    setIsRunning(true);
    setError(null);

    try {
      const options = { returnToDepot };
      const addresses = [...selectedAddresses];

      // Jalankan semua algoritma
      const bfs = runBreadthFirstSearch(addresses, options);
      const ucs = runUniformCostSearch(addresses, options);
      const greedy = runGreedyBestFirstSearch(addresses, options);
      const astar = runAStarSearch(addresses, options);

      setSolutions({ bfs, ucs, greedy, astar });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan saat menjalankan pencarian.";
      setError(message);
      setSolutions({ bfs: null, ucs: null, greedy: null, astar: null });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-text">
          <h1>Rafa Mart Delivery Planner</h1>
          <p>
            Bandingkan teknik pencarian untuk optimasi rute kurir tunggal di komplek Asri Residence. Perbandingan dilakukan dalam kategori masing-masing: <strong>Blind Search</strong> (BFS vs UCS) dan <strong>Heuristic Search</strong>{" "}
            (Greedy vs A*). Formulasi state mengikuti susunan ⟨lokasi kurir, alamat terkirim⟩.
          </p>
        </div>
        <div className="hero-tag">AI Search Demo</div>
      </header>

      <main className="layout">
        <section className="panel">
          <h2>Pengaturan Percobaan</h2>
          <p className="section-intro">Centang alamat yang wajib dikunjungi kurir. Kendaraan diasumsikan cukup membawa semua paket dan graf jarak sudah diketahui.</p>

          <div className="options-grid">
            {addressOptions.map((address) => {
              const selected = selectedAddresses.includes(address.id);
              return (
                <label key={address.id} className="option-card">
                  <input type="checkbox" checked={selected} onChange={() => toggleAddress(address.id)} />
                  <div>
                    <div className="option-title">{address.name}</div>
                    <div className="option-meta">Kode: {address.id}</div>
                    <div className="option-desc">{address.description}</div>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="toggle-row">
            <label className="switch">
              <input type="checkbox" checked={returnToDepot} onChange={() => setReturnToDepot((prev) => !prev)} />
              <span className="slider" />
            </label>
            <div>
              <h3>Kembali ke depot?</h3>
              <p>Aktifkan jika kurir diwajibkan kembali ke depot setelah pengantaran terakhir. Menjadikan masalah setara Traveling Salesperson Problem.</p>
            </div>
          </div>

          <button className="run-button" onClick={runComparison} disabled={isRunning}>
            {isRunning ? "Menghitung..." : "Jalankan Pencarian"}
          </button>
          {error && <div className="alert">{error}</div>}
        </section>

        <section className="panel results">
          <div className="results-header">
            <h2>Hasil &amp; Bukti Penerapan</h2>
            <p>
              Setiap algoritma menelusuri ruang keadaan (posisi, alamat yang sudah dikirim) dan mencari urutan aksi dengan biaya total minimal.
              <strong> "Paling efisien"</strong> ditentukan berdasarkan: (1) solusi optimal (jarak minimal), lalu (2) efisiensi komputasi (node expansion paling sedikit).
            </p>
          </div>

          {solutionEntries.length === 0 ? (
            <div className="placeholder">Jalankan pencarian untuk melihat perbandingan performa algoritma.</div>
          ) : (
            <>
              <div className="summary-grid">
                {solutionEntries.map(([key, solution]) => {
                  const category = algorithmCategories[key];
                  const isBest = (category === "Blind Search" && key === bestBlindAlgorithm) || (category === "Heuristic Search" && key === bestHeuristicAlgorithm);
                  const stepCount = Math.max(solution.path.length - 1, 0);
                  return (
                    <article key={key} className={`summary-card ${isBest ? "best" : ""}`}>
                      <header>
                        <h3>{algorithmLabels[key]}</h3>
                        {isBest && <span className="badge">Paling efisien ({category})</span>}
                      </header>
                      <dl>
                        <div>
                          <dt>Total jarak</dt>
                          <dd>{formatDistance(solution.totalDistance)}</dd>
                        </div>
                        <div>
                          <dt>Jumlah langkah</dt>
                          <dd>{stepCount} aksi</dd>
                        </div>
                        <div>
                          <dt>Node diekspansi</dt>
                          <dd>{solution.metrics.expandedNodes}</dd>
                        </div>
                        <div>
                          <dt>Node digenerasi</dt>
                          <dd>{solution.metrics.generatedNodes}</dd>
                        </div>
                        <div>
                          <dt>Frontier maksimum</dt>
                          <dd>{solution.metrics.frontierMaxSize}</dd>
                        </div>
                        <div>
                          <dt>Waktu komputasi</dt>
                          <dd>{formatTime(solution.metrics.computationTimeMs)}</dd>
                        </div>
                      </dl>
                      <div className="path">{formatPath(solution.path)}</div>
                    </article>
                  );
                })}
              </div>

              <div className="map-card">
                <div className="map-header">
                  <h3>Visualisasi Geografis</h3>
                  <p>Titik menandai depot dan alamat. Garis menunjukkan urutan kunjungan tiap algoritma.</p>
                </div>
                <svg viewBox="0 0 100 100" className="map-canvas">
                  {solutionEntries.map(([key, solution]) => {
                    const points = solution.path.map((node) => mapLayout.points.get(node)).filter(Boolean) as Array<{ x: number; y: number }>;
                    if (points.length < 2) return null;
                    const pointString = points.map((point) => `${point.x},${point.y}`).join(" ");
                    const category = algorithmCategories[key];
                    const isBest = (category === "Blind Search" && key === bestBlindAlgorithm) || (category === "Heuristic Search" && key === bestHeuristicAlgorithm);
                    return (
                      <polyline
                        key={key}
                        points={pointString}
                        stroke={mapColors[key]}
                        strokeDasharray={isBest ? undefined : "5 3"}
                        strokeWidth={isBest ? 2.2 : 1.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        opacity={isBest ? 0.95 : 0.7}
                      />
                    );
                  })}

                  {locations.map((loc) => {
                    const point = mapLayout.points.get(loc.id)!;
                    return (
                      <g key={loc.id} className="map-node">
                        <circle cx={point.x} cy={point.y} r={loc.id === "Depot" ? 2.8 : 2.2} className={loc.id === "Depot" ? "depot" : "address"} />
                        <text x={point.x} y={point.y - 3.5} textAnchor="middle">
                          {loc.id}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="trace-card">
                <h3>Jejak Penelusuran State</h3>
                <p>Perhatikan urutan aksi yang dipilih dan biaya kumulatif yang dihasilkan selama penelusuran.</p>
                {solutionEntries.map(([key, solution]) => (
                  <details key={key} className="trace">
                    <summary>{algorithmLabels[key]}</summary>
                    <table>
                      <thead>
                        <tr>
                          <th>Langkah</th>
                          <th>Aksi</th>
                          <th>Lokasi</th>
                          <th>Alamat terkirim</th>
                          <th>Biaya langkah</th>
                          <th>Biaya kumulatif</th>
                        </tr>
                      </thead>
                      <tbody>
                        {solution.trace.map((step, index) => (
                          <tr key={`${key}-${index}`}>
                            <td>{index}</td>
                            <td>{step.action ?? "Mulai"}</td>
                            <td>{step.state.loc}</td>
                            <td>{step.state.visited.length === 0 ? "-" : step.state.visited.join(", ")}</td>
                            <td>{step.stepCost.toFixed(1)}</td>
                            <td>{step.cumulativeCost.toFixed(1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </details>
                ))}
              </div>

              <div className="distance-card">
                <h3>Matriks Jarak Antar Titik</h3>
                <p>Biaya transisi antar state dihitung dari jarak Euclidean antar lokasi.</p>
                <table className="distance-table">
                  <thead>
                    <tr>
                      <th>From / To</th>
                      {locationIds.map((id) => (
                        <th key={`col-${id}`}>{id}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {locationIds.map((from) => (
                      <tr key={`row-${from}`}>
                        <th>{from}</th>
                        {locationIds.map((to) => (
                          <td key={`${from}-${to}`}>{distanceMatrix[from][to].toFixed(1)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>State space: ⟨lokasi kurir, alamat terkirim⟩. Aturan aksi: bergerak ke alamat yang belum dikunjungi (atau kembali ke depot). Tujuan: seluruh alamat selesai dan opsional kembali ke depot.</p>
      </footer>
    </div>
  );
}

export default App;
