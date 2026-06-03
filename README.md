# DHT11 Realtime Dashboard - Backend API

Repositori ini berisi server backend untuk sistem pemantauan suhu dan kelembaban (DHT11) secara real-time. Dibangun menggunakan Node.js, Express, dan Socket.io.

## Fitur Utama
- **REST API:** Menerima data sensor (`temperature` dan `humidity`) melalui request HTTP POST.
- **Autentikasi Alat:** Setiap sensor DHT11/ESP32 harus mengirimkan API Token valid untuk melakukan *ingest* data.
- **Manajemen Perangkat:** Admin dapat mengenerate token baru, melihat daftar alat, dan memonitor koneksi.
- **WebSocket Broadcast:** Menggunakan `Socket.io` untuk menyiarkan (*broadcast*) data yang masuk seketika ke seluruh antarmuka (frontend) web tanpa delay/refresh.
- **MySQL Database:** Menyimpan data log histori sensor.

## Prasyarat
- Node.js (v18+)
- MySQL Server

## Cara Instalasi

1. **Clone repositori dan masuk ke direktori:**
   ```bash
   cd dht-backend
   ```

2. **Instal dependensi:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment:**
   Buat atau modifikasi file `.env` di direktori utama backend:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=password_database_anda
   DB_NAME=dht_realtime
   ```

4. **Jalankan Server:**
   ```bash
   # Menjalankan di mode development (auto-restart)
   npm run dev

   # Menjalankan di mode produksi
   npm start
   ```

Database dan tabel akan otomatis dibuat saat pertama kali server berhasil berjalan jika Anda mengatur user MySQL dengan hak akses yang memadai.

## Struktur API Singkat
- `POST /api/sensor/data` - Menerima data dari hardware DHT11 (Membutuhkan `api_token`).
- `GET /api/sensor/history` - Mendapatkan histori trafik.
- `GET /api/devices` - Mendapatkan daftar alat yang terdaftar.
- `POST /api/devices` - Membuat alat/token baru.
