# Rafa Mart Delivery Planner

Antarmuka web interaktif untuk memvisualisasikan formulasi ruang keadaan dan penerapan teknik pencarian pada kasus pengantaran paket Rafa Mart di komplek Asri Residence. Aplikasi membandingkan teknik pencarian **di masing-masing kategori**: mencari yang paling optimal di antara **Blind Search** dan mencari yang paling optimal di antara **Heuristic Search**.

## ✨ Fitur Utama

- **Formulasi lengkap**: State didefinisikan sebagai ⟨lokasi kurir, alamat yang sudah dikirim⟩ sesuai dengan tugas mata kuliah.
- **Dataset sintetis**: Koordinat Depot, A, B, C, D, E dimodelkan agar mudah divisualisasikan, lengkap dengan matriks jarak Euclidean.
- **Perbandingan 4 algoritma**: Tampilkan total jarak, jumlah langkah, node yang diekspansi, node yang digenerasi, ukuran frontier maksimum, dan waktu komputasi untuk setiap teknik.
- **Visualisasi penelusuran**: Map interaktif, tabel trace state, serta matriks jarak untuk menjelaskan bukti penerapan.
- **Percobaan fleksibel**: Pilih alamat mana saja yang akan dikunjungi dan tentukan apakah kurir harus kembali ke depot (TSP lengkap) atau tidak.

## 🧠 Teknik Pencarian

| Kategori             | Algoritma                  | Optimal? | Lengkap? | Catatan                                                                                                  |
| -------------------- | -------------------------- | -------- | -------- | -------------------------------------------------------------------------------------------------------- |
| **Blind Search**     | Breadth-First Search (BFS) | ❌       | ✅       | Ekspansi level-by-level, tidak mempertimbangkan biaya riil (hanya jumlah langkah).                       |
| **Blind Search**     | Uniform Cost Search (UCS)  | ✅       | ✅       | Menjamin solusi optimal dengan mengeksplor node berdasarkan biaya kumulatif terendah.                    |
| **Heuristic Search** | Greedy Best-First Search   | ❌       | ✅       | Hanya menggunakan heuristik h(n), ekspansi cepat tapi bisa menemukan solusi suboptimal.                  |
| **Heuristic Search** | A\* Search                 | ✅       | ✅       | Menggunakan heuristik admissible (MST + nearest neighbor) sehingga eksplorasi efisien dan tetap optimal. |

**Heuristik untuk Informed Search:** Gabungan nearest neighbor distance + Minimum Spanning Tree (MST) cost. Heuristik ini **admissible** karena MST adalah lower bound untuk biaya mengunjungi semua node tersisa.

### 🏆 Kriteria "Paling Efisien"

Perbandingan dilakukan **di dalam kategori masing-masing**:

#### **Blind Search** (BFS vs UCS)

1. **Optimalitas Solusi** — Apakah menjamin solusi optimal?
2. **Efisiensi Komputasi** — Jika sama-sama optimal, pilih yang paling sedikit ekspansi node

**Hasil yang diharapkan:** UCS menjamin optimal, BFS tidak. **UCS menang dalam kategori Blind Search**.

#### **Heuristic Search** (Greedy vs A\*)

1. **Optimalitas Solusi** — Apakah menjamin solusi optimal?
2. **Efisiensi Komputasi** — Jika sama-sama optimal, pilih yang paling sedikit ekspansi node

**Hasil yang diharapkan:** A\* menjamin optimal dengan heuristik admissible, Greedy tidak. **A\* menang dalam kategori Heuristic Search**.

## 🚀 Cara Menjalankan

Pastikan Node.js ≥ 18 sudah terpasang.

```powershell
cd rafamart-web
npm install
npm run dev
```

Aplikasi akan terbuka di `http://localhost:5173`. Gunakan panel sebelah kiri untuk memilih alamat dan aturan kembali ke depot, lalu tekan **Jalankan Pencarian**.

## 🧪 Validasi & Pengujian

- `npm run build` – memastikan proyek dapat dibangun secara produksi.
- `npm run test:run` – menjalankan uji unit dengan Vitest. Pengujian memverifikasi:
  - Uniform Cost Search dan A\* menghasilkan jarak optimal yang sama.
  - A\* tidak mengeksplor lebih banyak node dibanding Uniform Cost Search pada dataset contoh.
  - Kedua algoritma mendistribusikan semua alamat yang dipilih, baik untuk kasus kembali ke depot maupun open route.

## 📁 Struktur Penting

```
src/
├── data/graph.ts          # Definisi titik lokasi & matriks jarak
├── lib/
│   ├── priorityQueue.ts   # Implementasi priority queue untuk frontier
│   ├── searchUtils.ts     # Utilitas state space (goal test, ekspansi state, dll.)
│   └── search/
│       ├── uniformCost.ts # Implementasi Uniform Cost Search
│       ├── aStar.ts       # Implementasi A* Search + heuristik
│       └── search.spec.ts # Pengujian algoritma
├── App.tsx                # Halaman utama dengan visualisasi & kontrol
└── App.css                # Styling khusus aplikasi
```

## 🧭 Alur State Space

1. **State awal**: (Depot, ∅)
2. **Aksi**: Bergerak ke alamat yang belum dikunjungi (atau kembali ke Depot jika semua paket selesai dan opsi diaktifkan).
3. **Transition cost**: Jarak Euclidean antar lokasi.
4. **Goal test**: Semua alamat telah masuk ke himpunan `visited`, serta kembali ke Depot bila diminta.

Kalkulasi metrik dilakukan selama penelusuran untuk mendukung laporan bukti penerapan.

## 📄 Lisensi

Proyek ini dibuat untuk kebutuhan akademik mata kuliah Kecerdasan Buatan. Silakan gunakan dan modifikasi sesuai kebutuhan pembelajaran.
