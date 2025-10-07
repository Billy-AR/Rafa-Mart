# Changelog - Rafa Mart Delivery Planner

## Update: Perbandingan Kategori (4 Algoritma)

### 🎯 Perubahan Konsep

**Sebelumnya:**

- Membandingkan UCS vs A\* (lintas kategori: blind vs heuristic)
- Menampilkan 1 badge "Paling efisien" untuk algoritma terbaik secara keseluruhan

**Sekarang:**

- Membandingkan **di dalam kategori masing-masing**:
  - **Blind Search**: BFS vs UCS
  - **Heuristic Search**: Greedy Best-First vs A\*
- Menampilkan 2 badge terpisah:
  - "Paling efisien (Blind Search)"
  - "Paling efisien (Heuristic Search)"

### ✅ File yang Ditambahkan

1. **`src/lib/search/breadthFirst.ts`**

   - Implementasi Breadth-First Search (BFS)
   - Menggunakan FIFO queue
   - Tidak menjamin solusi optimal (hanya shortest path dalam graph tak berbobot)
   - Kompleksitas: O(b^d)

2. **`src/lib/search/greedyBestFirst.ts`**
   - Implementasi Greedy Best-First Search
   - Hanya menggunakan heuristik h(n) untuk prioritas (tanpa g(n))
   - Ekspansi cepat tapi tidak menjamin optimal
   - Kompleksitas: O(b^m) dengan m = kedalaman maksimum

### 🔧 File yang Dimodifikasi

1. **`src/lib/search/index.ts`**

   - Export semua 4 algoritma dengan komentar kategori
   - `runBreadthFirstSearch`, `runUniformCostSearch`, `runGreedyBestFirstSearch`, `runAStarSearch`

2. **`src/App.tsx`**

   - **Tipe AlgorithmKey**: `"bfs" | "ucs" | "greedy" | "astar"` (sebelumnya hanya 2)
   - **State solutions**: Sekarang menyimpan 4 hasil algoritma
   - **Fungsi findBestInCategory**: Menggantikan `findBestSolution`, menerima parameter kategori
   - **useMemo**: Menghitung `bestBlindAlgorithm` dan `bestHeuristicAlgorithm` secara terpisah
   - **UI badge**: Menampilkan "Paling efisien (Blind Search)" atau "Paling efisien (Heuristic Search)"
   - **Hero text**: Diperjelas bahwa perbandingan dilakukan per kategori

3. **`README.md`**

   - Tabel algoritma diperluas dengan 4 baris (BFS, UCS, Greedy, A\*)
   - Kolom tambahan: "Optimal?" dan "Lengkap?"
   - Penjelasan kriteria efisiensi per kategori
   - Expected results: UCS > BFS, A\* > Greedy

4. **`PENJELASAN_EFISIENSI.md`**
   - Tabel perbandingan 4 algoritma dengan metrik lengkap
   - Kesimpulan per kategori:
     - **Blind Search**: UCS menang (optimal 21.5 km vs BFS ~25 km)
     - **Heuristic Search**: A\* menang (optimal 21.5 km + efisien vs Greedy ~23 km)
   - Logika pemilihan pemenang per kategori

### 🎨 Perubahan UI

**Summary Cards:**

- Sekarang menampilkan 4 cards (BFS, UCS, Greedy, A\*)
- Badge "Paling efisien" menyertakan nama kategori dalam kurung
- Warna tetap: Biru untuk Blind, Oranye/Merah untuk Heuristic

**Visualisasi Map:**

- Garis putus-putus untuk algoritma non-optimal
- Garis solid tebal untuk pemenang di kategorinya (UCS dan A\*)

**State Trace:**

- Sekarang menampilkan 4 tabel ekspansi (1 per algoritma)

### 📊 Hasil yang Diharapkan

Untuk kasus **4 alamat (A,B,C,D) + kembali ke Depot**:

| Algoritma | Kategori  | Jarak  | Node Ekspansi | Optimal? | Badge?                               |
| --------- | --------- | ------ | ------------- | -------- | ------------------------------------ |
| BFS       | Blind     | ~25 km | ~120          | ❌       | -                                    |
| UCS       | Blind     | 21.5   | 81            | ✅       | 🏆 Paling efisien (Blind Search)     |
| Greedy    | Heuristic | ~23 km | ~30           | ❌       | -                                    |
| A\*       | Heuristic | 21.5   | 38            | ✅       | 🏆 Paling efisien (Heuristic Search) |

### 🧪 Testing

User akan melakukan testing sendiri dengan:

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run test:run` - Unit tests (mungkin perlu update untuk 4 algoritma)

### 📝 Catatan Implementasi

**BFS:**

- Menggunakan array biasa dengan `shift()` sebagai FIFO queue
- Menyimpan visited states dalam Set untuk deteksi duplikat
- Tidak optimal karena tidak mempertimbangkan bobot edge

**Greedy Best-First:**

- Menggunakan PriorityQueue dengan h(n) saja (tanpa g(n))
- Heuristik sama dengan A\* (MST + nearest neighbor)
- Bisa terjebak di lokal optimum karena tidak mempertimbangkan cost sebenarnya

**UCS:**

- Tetap optimal dengan duplicate detection via `bestCost` map
- Ekspansi berdasarkan g(n) saja

**A\*:**

- Tetap optimal dengan heuristik admissible
- Ekspansi berdasarkan f(n) = g(n) + h(n)
- Paling efisien karena panduan heuristik

---

**Tanggal Update:** (Sesuai kebutuhan user)
**Versi:** 2.0 (Dari 2 algoritma → 4 algoritma)
