# 📖 Buku Kas Ibuk (Mobile Android & iOS)

Aplikasi pembukuan kas bendahara yang didesain khusus dengan standar **Apple Human Interface Guidelines (HIG)**, navigasi jempol yang ergonomis, tanpa tombol "Tutup" berlebih (*gesture-first swipe down to dismiss*), dan proteksi ketat pencegahan salah hapus (*Tap-to-Inspect Detail Sheet*).

Dibuat untuk memudahkan pencatatan keuangan kegiatan sekolah, kas ibu-ibu/PKK/arisan, dan belanja rumah tangga.

---

## 🚀 Download APK Langsung (GitHub Releases)

Anda tidak perlu pusing memikirkan kompilasi manual atau dashboard cloud! Setiap kali ada pembaruan kode, file `.apk` siap pasang langsung dirilis otomatis di GitHub Releases.

👉 **[Unduh APK Terbaru di GitHub Releases](https://github.com/alwinidzam/app-ibuk/releases/latest)**

### Pilihan File APK yang Tersedia:
- 🚀 **`Buku-Kas-Ibuk-arm64-v8a-Lite.apk`** (~16 MB): **Sangat Direkomendasikan!** Khusus untuk Samsung Galaxy A54 dan hampir seluruh smartphone Android modern. Ukuran super ringan, cepat diunduh, dan performa mulus.
- 📦 **`Buku-Kas-Ibuk-Universal.apk`** (~30 MB): Versi universal untuk semua jenis perangkat Android (kompatibilitas menyeluruh).

Tinggal unduh file `.apk` di atas langsung dari browser HP Anda, lalu ketuk **Pasang / Install**.

---

## ✨ Fitur Unggulan

- **Tap-to-Inspect Detail Sheet**: Menghindari senggolan gestur geser (*swipe*) yang rawan menghapus catatan tanpa sengaja. Cukup ketuk baris transaksi untuk melihat rincian penuh, foto nota, ubah data, atau hapus dengan konfirmasi aman 2 langkah.
- **Multibuku Kas Fleksibel**: Bebas menambah pos kas baru (misal: Kas Masjid, Kas Toko, Kas Usaha, Kas Donasi) lengkap dengan pilihan warna dan ikon SVG murni.
- **Pure SVG Icons (0 Emojis)**: Semua ikon menggunakan geometri presisi SF Symbols standar Apple HIG dengan ketebalan garis konsisten (*stroke 2.0pt*).
- **Simpan Foto Bukti Nota**: Foto kwitansi atau struk belanja tersimpan langsung di memori perangkat dengan kompresi cerdas.
- **Bagikan Laporan ke WhatsApp**: Sekali ketuk untuk mengirim ringkasan kas bulanan atau bukti transaksi tunggal ke WhatsApp grup bendahara.
- **Laporan Otomatis**: Rekap saldo awal, total pemasukan, total pengeluaran, dan saldo akhir berjalan secara *real-time*.
- **Cadangkan & Pulihkan (Offline-First)**: Data tersimpan aman di HP dan dapat diekspor/diimpor kapan saja.

---

## 🛠️ Menjalankan Secara Lokal (Development)

Jika ingin menjalankan aplikasi ini di laptop secara lokal dengan Expo Go:

```bash
# 1. Masuk ke direktori aplikasi
cd native-app

# 2. Pasang dependensi
npm install

# 3. Jalankan Expo dev server
npx expo start
```

Pindai QR code yang muncul di terminal menggunakan aplikasi **Expo Go** di HP Android atau iOS Anda.

---

## 📦 Struktur Proyek

```
native-app/
├── .github/workflows/
│   └── build-apk.yml        # CI/CD otomatis kompilasi APK di GitHub
├── assets/                  # Ikon aplikasi & gambar splash screen
├── src/
│   ├── components/          # Komponen UI (Detail Modal, List, Dock, Form, dll)
│   ├── books.ts             # Manajemen kategori & data buku kas
│   ├── storage.ts           # Penyimpanan lokal offline (AsyncStorage & Filesystem)
│   ├── money.ts             # Logika format rupiah & tanggal Indonesia
│   ├── haptics.ts           # Respon getar haptic standar iOS
│   └── types.ts             # Definisi TypeScript
├── App.tsx                  # Titik masuk utama aplikasi React Native
├── app.json                 # Konfigurasi Expo & Android package com.bukukas.ibuk
└── package.json
```

---

*Dibuat dengan ❤️ untuk Ibuk.*
