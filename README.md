## SODALIS

SODALIS adalah aplikasi **P2P Lending untuk mahasiswa** yang dibangun di atas Internet Computer (ICP).
Project ini terdiri dari:

- **Backend canister (Motoko)** untuk logika bisnis, data user, pinjaman, pembayaran, approval, dan scoring.
- **Frontend (React + Vite)** untuk antarmuka pengguna investor dan peminjam.

## Struktur Singkat Project

- `src/backend/main.mo`: canister backend (Motoko).
- `src/frontend/`: aplikasi frontend (React + Vite).
- `dfx.json`: definisi canister `backend` (motoko) dan `frontend` (assets dari `src/frontend/dist`).

## Prasyarat

Pastikan sudah terpasang:

- `dfx` (DFINITY SDK)
- `node` (minimal v16 sesuai `package.json`)
- `pnpm` (direkomendasikan oleh project ini)

## Menjalankan Frontend Saja (Mode Dev dengan Vite)

Panduan ini mengikuti alur yang kamu minta: dari `cd` ke frontend dan menjalankan `npx vite`.

1) Masuk ke root project:

```bash
cd /home/trizzkunn/CAPSTONE-1/kampuslend
```

2) Install dependency (jika belum):

```bash
pnpm install
```

3) Masuk ke folder frontend:

```bash
cd src/frontend
```

4) Jalankan frontend dengan Vite:

```bash
npx vite
```

Frontend akan aktif di URL dev server Vite (umumnya `http://localhost:5173`).

> Catatan penting:
> - Mode ini fokus menjalankan UI frontend.
> - Jika frontend melakukan call ke canister backend, replica lokal tetap perlu dijalankan (`dfx start`) agar API backend bisa diakses.

## Menjalankan Replica Lokal ICP

Jalankan di terminal terpisah dari root project (`/home/trizzkunn/CAPSTONE-1/kampuslend`):

```bash
dfx start --clean --background
```

Penjelasan:

- `--clean`: membersihkan state replica lokal sebelumnya.
- `--background`: menjalankan replica di background.

## Build Frontend untuk Canister Assets

Sebelum deploy, frontend harus dibuild ke folder `src/frontend/dist` (sesuai `dfx.json`).

Dari root project:

```bash
cd /home/trizzkunn/CAPSTONE-1/kampuslend
pnpm --dir src/frontend run build
```

Script build akan:

- generate `env.json` (berisi host & canister id backend),
- build bundle Vite ke `dist`,
- menyalin `env.json` ke `dist`.

## Deploy Canister (Backend + Frontend)

Setelah `dfx start` aktif dan frontend sudah dibuild:

```bash
cd /home/trizzkunn/CAPSTONE-1/kampuslend
dfx deploy
```

Perintah ini akan:

- compile/deploy canister `backend` (Motoko),
- deploy canister `frontend` sebagai assets dari `src/frontend/dist`.

## Alur Project Secara Rinci

### 1) Inisialisasi & Auth

- Aplikasi React di-bootstrap dari `src/frontend/src/main.tsx`.
- `InternetIdentityProvider` dan `AuthProvider` menyiapkan state autentikasi user.
- `useActor` membuat actor ke canister backend, menggunakan identity aktif jika login.

### 2) Routing dan Role-based UI

Di `src/frontend/src/App.tsx`, routing dibagi menjadi:

- area **Investor** (`/investor/...`)
- area **Peminjam** (`/borrower/...`)

Saat user login, aplikasi redirect otomatis sesuai role:

- `Investor` -> dashboard investor
- `Peminjam` -> dashboard peminjam

### 3) Komunikasi Frontend -> Backend Canister

- Frontend memanggil method backend melalui actor (`@dfinity/agent` + generated declarations).
- Konfigurasi host dan `backend_canister_id` dimuat dari `env.json` dan environment Vite.
- Saat local dev, host backend mengarah ke replica lokal (`127.0.0.1`/`localhost`).

### 4) Logika Bisnis di Backend (Motoko)

`src/backend/main.mo` menangani:

- **User management**: register, profile, verifikasi.
- **Approval flow**: request approval user, list/set approval oleh admin.
- **Loan management**: create loan, approve loan, ubah status, list per borrower/investor.
- **Payment tracking**: catat pembayaran, lihat riwayat pembayaran, hitung cicilan sisa.
- **AI scoring sederhana**: penilaian kelayakan pinjaman berdasarkan parameter input.

### 5) Penyimpanan Data

- Data disimpan di state canister (ICP) menggunakan struktur map di backend.
- Entitas utama: `User`, `Loan`, `Payment`, dan `UserProfile`.

### 6) Seed Data

- Frontend memicu `addSeedData()` sekali (berdasarkan flag localStorage) agar data demo tersedia.
- Ini membantu pengujian cepat dashboard investor/peminjam pada environment lokal.

### 7) Siklus Kerja Harian (Recommended)

Untuk development:

1. `dfx start --clean --background` (sekali saat mulai kerja)
2. Terminal frontend: `cd src/frontend && npx vite`
3. Koding dan testing UI/flow

Untuk deploy lokal:

1. `pnpm --dir src/frontend run build`
2. `dfx deploy`

## Troubleshooting Singkat

- Jika frontend tidak bisa call backend:
  - pastikan `dfx start` sedang berjalan,
  - pastikan `backend_canister_id` terisi di `env.json` hasil build.
- Jika assets tidak ter-update setelah deploy:
  - jalankan ulang build frontend,
  - deploy ulang dengan `dfx deploy`.
