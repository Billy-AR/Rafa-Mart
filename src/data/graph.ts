export type LocationKey = "Depot" | "A" | "B" | "C" | "D" | "E";

export interface Location {
  id: LocationKey;
  name: string;
  description: string;
  coord: {
    x: number;
    y: number;
  };
}

export const locations: Location[] = [
  {
    id: "Depot",
    name: "Depot Rafa Mart",
    description: "Lokasi awal dan akhir kurir (opsional kembali).",
    coord: { x: 0, y: 0 },
  },
  {
    id: "A",
    name: "Blok Anggrek A3",
    description: "Alamat pelanggan 1.",
    coord: { x: 2, y: 4 },
  },
  {
    id: "B",
    name: "Blok Anggrek B5",
    description: "Alamat pelanggan 2.",
    coord: { x: 5, y: 2 },
  },
  {
    id: "C",
    name: "Blok Bougenville C1",
    description: "Alamat pelanggan 3.",
    coord: { x: -1, y: 3 },
  },
  {
    id: "D",
    name: "Blok Dahlia D7",
    description: "Alamat pelanggan 4.",
    coord: { x: 4, y: 6 },
  },
  {
    id: "E",
    name: "Blok Edelweis E2",
    description: "Alamat pelanggan 5.",
    coord: { x: -3, y: 1 },
  },
];

export const locationIds: LocationKey[] = locations.map((loc) => loc.id);

export function distance(from: LocationKey, to: LocationKey): number {
  if (from === to) return 0;
  const start = locations.find((loc) => loc.id === from);
  const end = locations.find((loc) => loc.id === to);
  if (!start || !end) {
    throw new Error(`Unknown location: ${from} -> ${to}`);
  }
  const dx = start.coord.x - end.coord.x;
  const dy = start.coord.y - end.coord.y;
  // Euclidean distance with one decimal rounding for readability.
  return Math.round(Math.hypot(dx, dy) * 10) / 10;
}

export const distanceMatrix: Record<LocationKey, Record<LocationKey, number>> = locations.reduce((acc, loc) => {
  acc[loc.id] = locations.reduce((inner, next) => {
    inner[next.id] = distance(loc.id, next.id);
    return inner;
  }, {} as Record<LocationKey, number>);
  return acc;
}, {} as Record<LocationKey, Record<LocationKey, number>>);
