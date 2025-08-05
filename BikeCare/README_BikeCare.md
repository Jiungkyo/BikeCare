# BikeCare - Aplikasi Perawatan Motor

BikeCare adalah aplikasi mobile offline untuk membantu pemilik sepeda motor menjaga kondisi motornya dengan pengingat perawatan rutin seperti pergantian oli, pengecekan ban, dan sparepart lainnya.

## 🎯 Fitur Utama

- **Input Motor**: Tambahkan informasi motor (merek dan tipe)
- **Dashboard Kondisi**: Lihat status perawatan motor secara real-time
- **Input Odometer**: Update kilometer terakhir motor
- **Reminder Perawatan**: Notifikasi berdasarkan tanggal & kilometer
- **History Perawatan**: Riwayat lengkap semua perawatan yang dilakukan
- **Tips & Edukasi**: Panduan perawatan motor untuk pemula
- **Offline Mode**: Semua data tersimpan lokal di device
- **No Login Required**: Langsung pakai tanpa registrasi

## 📱 Screenshots

### Dashboard
- Status perawatan terkini
- Informasi motor dan odometer
- Reminder yang akan datang dan tertunda
- Quick actions untuk update data

### Perawatan
- Daftar semua jenis perawatan
- Status dan jadwal setiap perawatan
- Kemudahan untuk melakukan perawatan
- Tracking berdasarkan KM dan hari

### Riwayat
- Timeline perawatan yang telah dilakukan
- Catatan detail setiap perawatan
- Statistik perawatan
- Grouping berdasarkan bulan

### Tips & Edukasi
- Panduan perawatan setiap komponen motor
- Tips keselamatan
- Tips musiman (hujan/kemarau)
- Tips darurat

## 🏗️ Arsitektur Aplikasi

### Technology Stack
- **Frontend**: React Native dengan TypeScript
- **Database**: SQLite (offline storage)
- **Navigation**: React Navigation v6
- **State Management**: React Hooks
- **UI Components**: Custom components dengan Material Design

### Database Schema
```sql
-- Tabel Motor
CREATE TABLE Motor (
    motor_id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama_motor TEXT NOT NULL,
    tahun_motor INTEGER
);

-- Tabel Odometer
CREATE TABLE Odometer (
    odometer_id INTEGER PRIMARY KEY AUTOINCREMENT,
    motor_id INTEGER NOT NULL,
    km_terakhir INTEGER,
    tanggal_update DATE,
    FOREIGN KEY (motor_id) REFERENCES Motor(motor_id)
);

-- Tabel Perawatan
CREATE TABLE Perawatan (
    perawatan_id INTEGER PRIMARY KEY AUTOINCREMENT,
    motor_id INTEGER NOT NULL,
    jenis_perawatan TEXT NOT NULL,
    tanggal_terakhir DATE,
    interval_km INTEGER,
    interval_hari INTEGER,
    FOREIGN KEY (motor_id) REFERENCES Motor(motor_id)
);

-- Tabel Reminder
CREATE TABLE Reminder (
    reminder_id INTEGER PRIMARY KEY AUTOINCREMENT,
    perawatan_id INTEGER NOT NULL,
    tanggal_reminder DATE,
    status TEXT CHECK(status IN ('Pending', 'Done')),
    FOREIGN KEY (perawatan_id) REFERENCES Perawatan(perawatan_id)
);

-- Tabel History Perawatan
CREATE TABLE History_Perawatan (
    history_id INTEGER PRIMARY KEY AUTOINCREMENT,
    perawatan_id INTEGER NOT NULL,
    tanggal_perawatan DATE,
    catatan TEXT,
    FOREIGN KEY (perawatan_id) REFERENCES Perawatan(perawatan_id)
);
```

### Struktur Folder
```
src/
├── navigation/          # Navigation setup
│   └── AppNavigator.tsx
├── screens/             # All screen components
│   ├── WelcomeScreen.tsx
│   ├── AddMotorScreen.tsx
│   ├── DashboardScreen.tsx
│   ├── MaintenanceScreen.tsx
│   ├── UpdateOdometerScreen.tsx
│   ├── PerformMaintenanceScreen.tsx
│   ├── HistoryScreen.tsx
│   ├── TipsScreen.tsx
│   └── SettingsScreen.tsx
├── services/            # Business logic & database
│   └── DatabaseService.ts
├── types/               # TypeScript interfaces
│   └── index.ts
├── components/          # Reusable components
└── utils/               # Utility functions
```

## 🚀 Instalasi dan Setup

### Prerequisites
- Node.js >= 18
- React Native development environment
- Android Studio (untuk Android)
- Xcode (untuk iOS)

### Langkah Instalasi
1. Clone repository:
   ```bash
   git clone <repository-url>
   cd BikeCare
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Untuk Android:
   ```bash
   npx react-native run-android
   ```

4. Untuk iOS:
   ```bash
   cd ios && pod install && cd ..
   npx react-native run-ios
   ```

## 📋 Jenis Perawatan Default

Aplikasi menyediakan 5 jenis perawatan default:

1. **Ganti Oli Mesin** (setiap 3.000 km / 90 hari)
2. **Ganti Oli Gear** (setiap 10.000 km / 180 hari)
3. **Cek Ban** (setiap 5.000 km / 60 hari)
4. **Ganti Filter Udara** (setiap 5.000 km / 120 hari)
5. **Cek Rem** (setiap 8.000 km / 120 hari)

## 🔄 User Flow

1. **Start** → Splash screen dengan pengecekan data
2. **Input Motor** → (jika belum ada data) Form input motor baru
3. **Dashboard** → Halaman utama dengan overview kondisi motor
4. **Perawatan** → Kelola dan lakukan perawatan
5. **Update Odometer** → Input kilometer terbaru
6. **Riwayat** → Lihat semua perawatan yang sudah dilakukan
7. **Tips** → Pelajari cara perawatan motor
8. **Settings** → Kelola data dan pengaturan

## 🛠️ Pengembangan

### Menambah Jenis Perawatan Baru
Tambahkan di `DatabaseService.ts` pada method `addDefaultMaintenanceForMotor`:

```typescript
{
  name: 'Jenis Perawatan Baru',
  defaultIntervalKm: 5000,
  defaultIntervalDays: 120,
  description: 'Deskripsi perawatan',
}
```

### Menambah Screen Baru
1. Buat file screen di `src/screens/`
2. Tambahkan ke navigation di `AppNavigator.tsx`
3. Update types di navigation types

### Menambah Database Table
1. Update schema di `DatabaseService.ts`
2. Tambahkan types di `src/types/index.ts`
3. Implementasikan CRUD operations

## 🔒 Privacy & Security

- **Offline First**: Semua data tersimpan lokal di device
- **No Login**: Tidak memerlukan akun atau data pribadi
- **No Internet**: Aplikasi berfungsi tanpa koneksi internet
- **Local Storage**: Data menggunakan SQLite lokal

## 📝 Catatan Pengembangan

### Dependencies Utama
- `react-native-sqlite-storage`: Database offline
- `@react-navigation/native`: Navigasi antar screen
- `react-native-gesture-handler`: Touch gestures
- `react-native-paper`: UI components

### Known Issues
- SQLite link manual diperlukan untuk iOS
- Vector icons memerlukan setup tambahan
- Gesture handler perlu konfigurasi native

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 License

Project ini menggunakan MIT License. Lihat file `LICENSE` untuk detail.

## 🐛 Bug Reports

Jika menemukan bug atau ingin request fitur, silakan buat issue di repository ini dengan detail:
- Device dan OS version
- Langkah untuk reproduce bug
- Expected vs actual behavior
- Screenshots (jika memungkinkan)

## 🎉 Acknowledgments

- Tim pengembang React Native
- Komunitas React Native Indonesia
- Para mekanik dan bengkel yang memberikan insight tentang perawatan motor
- User yang memberikan feedback untuk improvement

---

**BikeCare v1.0.0** - Dibuat dengan ❤️ untuk komunitas motor Indonesia