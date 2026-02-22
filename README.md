# SMART OSH - Sistem Manajemen Keselamatan dan Kesehatan Kerja

**SMART OSH** adalah sistem manajemen K3 (Keselamatan dan Kesehatan Kerja) terpadu yang dirancang untuk lingkungan Politeknik. Aplikasi ini mengintegrasikan analisis risiko (HIRADC), laporan K3, dan monitoring performa keselamatan dalam satu dashboard digital.

## 🚀 Teknologi yang Digunakan

* **Frontend:** React.js (Vite), Tailwind CSS, Lucide React
* **Backend:** PocketBase (Self-hosted backend in Go)
* **Database:** SQLite (Embedded in PocketBase)
* **Environment:** WSL (Ubuntu) / Linux / Windows

---

## 📁 Struktur Proyek

* /apps/web/src/pages: Berisi halaman utama seperti HIRADC, Laporan, dan Dashboard.
* /apps/web/src/components: Komponen UI yang dapat digunakan kembali (UI Kit).
* /apps/web/src/lib: Konfigurasi klien untuk menghubungkan frontend ke PocketBase.

---

## 🛠️ Langkah Instalasi

### 1. Prasyarat
Pastikan Anda sudah menginstal:
* [Node.js](https://nodejs.org/) (Versi terbaru/LTS)
* [Unzip](https://linux.die.net/man/1/unzip) (Untuk mengekstrak PocketBase di WSL)

### 2. Setup Backend (PocketBase)
Masuk ke folder pocketbase dan siapkan aplikasi servernya:

```bash
cd apps/pocketbase

# Unduh binary PocketBase (Linux/WSL)
wget [https://github.com/pocketbase/pocketbase/releases/download/v0.22.4/pocketbase_0.22.4_linux_amd64.zip]

# Ekstrak dan beri izin eksekusi
unzip pocketbase_0.22.4_linux_amd64.zip
chmod +x pocketbase

# Jalankan server
./pocketbase serve
```

### 3. Setup Frontend (React + Vite)
```bash
cd apps/web

# Instal dependensi
npm install

# Jalankan aplikasi mode pengembangan
npm run dev


