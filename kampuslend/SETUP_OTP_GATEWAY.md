# Panduan Deploy Google Apps Script OTP Gateway untuk SODALIS

## Langkah-Langkah

### 1. Buka Google Apps Script
Pergi ke: https://script.google.com/ (login dengan akun Google Anda)

### 2. Buat Project Baru
- Klik **"+ New Project"**
- Hapus kode default yang ada
- Copy-paste seluruh isi file `google-apps-script-otp.js` yang ada di root proyek ini

### 3. Deploy sebagai Web App
- Klik **"Deploy"** di pojok kanan atas
- Pilih **"New deployment"**
- Klik ikon ⚙️ di samping "Select type" → pilih **"Web app"**
- Isi konfigurasi:
  - **Description**: `SODALIS OTP Gateway`
  - **Execute as**: `Me` (akun Google Anda)
  - **Who has access**: `Anyone`
- Klik **"Deploy"**
- Izinkan semua permission yang diminta (Gmail access)

### 4. Salin URL Deployment
Setelah deploy, Anda akan mendapat URL seperti:
```
https://script.google.com/macros/s/AKfycby.../exec
```

### 5. Set Environment Variable
Buka file: `src/frontend/.env.local`
Ganti baris ini:
```
VITE_OTP_GATEWAY_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```
Dengan URL yang Anda salin:
```
VITE_OTP_GATEWAY_URL=https://script.google.com/macros/s/AKfycby.../exec
```

### 6. Restart Dev Server
```bash
npm run dev
# atau
pnpm dev
```

### 7. Test
- Daftarkan akun baru di halaman Register
- Cek inbox email Anda (termasuk folder Spam)
- Masukkan kode OTP 6-digit yang diterima

## Catatan Penting
- Kode OTP berlaku selama **10 menit**
- Jika email tidak masuk, cek folder **Spam/Junk**
- Tombol **Resend OTP** tersedia setelah 1 menit
- Google Apps Script dapat mengirim hingga **100 email/hari** (gratis)
- Untuk kapasitas lebih besar, gunakan Google Workspace
