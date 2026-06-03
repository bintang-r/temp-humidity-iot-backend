# DHT11 Realtime Dashboard - Backend API

Repositori ini berisi server backend untuk sistem pemantauan suhu dan kelembaban (DHT11) secara real-time. Dibangun menggunakan Node.js, Express, MySQL, dan Socket.io.

## Fitur Utama
- **REST API:** Menerima data sensor (`temperature` dan `humidity`) melalui request HTTP POST.
- **Autentikasi JWT:** Dasbor web dilindungi menggunakan JSON Web Token (JWT). Hanya pengguna yang telah login yang dapat mengakses data.
- **Autentikasi Alat:** Setiap sensor DHT11/ESP32 harus mengirimkan `api_token` valid untuk melakukan *ingest* data (tidak perlu login).
- **Manajemen Perangkat:** Admin dapat membuat token baru, melihat daftar alat, memblokir/mengaktifkan alat.
- **WebSocket Broadcast:** Menggunakan `Socket.io` untuk menyiarkan data masuk secara realtime ke frontend tanpa delay/refresh.
- **MySQL Database:** Menyimpan data log histori sensor secara persisten.

---

## 🔐 Akun Default

Saat server pertama kali dijalankan, sistem akan **otomatis membuat akun admin default** di database.

> ⚠️ **Sangat disarankan untuk segera mengganti password default ini setelah pertama kali login!**

| Field    | Nilai Default |
|----------|--------------|
| Username | `admin`      |
| Password | `admin123`   |

Akun ini dapat diubah melalui menu **"Akun Saya"** di dalam dasbor web setelah berhasil login.

---

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
   JWT_SECRET=ganti_dengan_kunci_rahasia_yang_kuat
   ```

   > Ganti `JWT_SECRET` dengan string acak yang panjang dan tidak mudah ditebak untuk keamanan optimal.

4. **Jalankan Server:**
   ```bash
   # Menjalankan di mode development (auto-restart dengan nodemon)
   npm run dev

   # Menjalankan di mode produksi
   npm start
   ```

Database, tabel, dan akun admin default akan otomatis dibuat saat pertama kali server berhasil berjalan.

---

## Struktur API

### 🔑 Autentikasi (Publik)
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `POST` | `/api/auth/login` | Login dan mendapatkan JWT Token |

### 👤 Manajemen Akun (Butuh JWT)
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `PUT` | `/api/auth/account` | Ubah username dan/atau password |

### 📡 Perangkat (Butuh JWT)
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `GET` | `/api/devices` | Daftar semua perangkat terdaftar |
| `POST` | `/api/devices` | Buat perangkat/token baru |
| `DELETE` | `/api/devices/:id` | Hapus perangkat |
| `PUT` | `/api/devices/:id/toggle` | Blokir / Aktifkan perangkat |

### 🌡️ Data Sensor
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `POST` | `/api/sensor/data` | (**Publik + api_token**) Ingest data dari hardware |
| `GET` | `/api/sensor/history` | (**Butuh JWT**) Histori data sensor |
| `GET` | `/api/sensor/dashboard` | (**Butuh JWT**) Statistik dasbor |
| `GET` | `/api/sensor/latest/:device_id` | (**Butuh JWT**) Data terbaru per perangkat |

---

## Struktur Direktori
```
dht-backend/
├── config/
│   └── db.js              # Konfigurasi dan inisialisasi database
├── controllers/
│   ├── authController.js  # Logic login & update akun
│   ├── deviceController.js # Logic manajemen perangkat
│   └── sensorController.js # Logic ingest & query data sensor
├── middleware/
│   └── authMiddleware.js  # Validasi JWT
├── routes/
│   └── api.js             # Definisi semua routes
├── migrate.js             # Script migrasi skema DB
├── migrate-auth.js        # Script migrasi tabel users
├── server.js              # Entry point server
└── .env                   # Konfigurasi environment (jangan di-commit!)
```
