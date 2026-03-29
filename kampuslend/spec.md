# KampusLend - P2P Lending Platform untuk Mahasiswa

## Current State
Proyek baru, belum ada kode aplikasi.

## Requested Changes (Diff)

### Add
- Sistem autentikasi dengan dua role: Investor dan Peminjam (Mahasiswa)
- Backend Motoko canister: user_canister, loan_canister, payment_canister
- Dashboard Investor: browse peminjam, skor AI, danai pinjaman, portofolio
- Dashboard Peminjam: ajukan pinjaman, lihat jadwal cicilan, bayar via VA
- AI Scoring logic: hitung skor kelayakan (0-100) berdasarkan GPA, nominal, tenor, tujuan, riwayat
- Payment Gateway simulation (Virtual Account IDR: BCA/Mandiri/BRI/BNI/BSI)
- Modal akad digital sebelum investor konfirmasi pendanaan
- Badge status: Aktif (hijau), Menunggu (kuning), Lunas (biru)
- Card peminjam dengan progress bar skor AI
- Timeline cicilan per bulan
- Landing page publik

### Modify
- Tidak ada (proyek baru)

### Remove
- Tidak ada (proyek baru)

## Implementation Plan

1. **Motoko Backend** (satu canister utama)
   - User management: register, getUser, verifyUser, getUsersByRole
   - Loan management: createLoan, getLoan, updateStatus, getAllLoans, getLoansByBorrower
   - Payment tracking: recordPayment, getPaymentsByLoan, getCicilanSisa
   - AI Scoring: scoreApplicant (hitung berdasarkan GPA, nominal, tenor, tujuan)

2. **Frontend Pages**
   - `/` - Landing page publik
   - `/login` - Form login
   - `/register` - Pilih role + isi data
   - `/investor/dashboard` - Ringkasan portofolio
   - `/investor/browse` - Daftar peminjam + skor AI
   - `/investor/loan/:id` - Detail + tombol Danai
   - `/investor/portfolio` - Pinjaman aktif + cicilan
   - `/borrower/dashboard` - Status pinjaman aktif
   - `/borrower/apply` - Form ajukan pinjaman
   - `/borrower/repayment` - Jadwal cicilan + bayar

3. **UI Components**
   - StatusBadge: Aktif/Menunggu/Lunas
   - BorrowerCard: profil + GPA + skor AI progress bar
   - RepaymentTimeline: bulan 1-N dengan status
   - AkadModal: ringkasan akad digital
   - VirtualAccountModal: tampil nomor VA dan bank
