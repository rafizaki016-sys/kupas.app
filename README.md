# Kupas — Teman Belajar AI Gratis (.apk & Web)

Aplikasi belajar AI 100% gratis tanpa paywall untuk pelajar Indonesia:
- Rangkuman otomatis, Flashcard Offline, Kuis Pilihan Ganda, Peta Konsep
- Foto & Bahas Soal (Snap & Solve)
- Tutor AI dengan dukungan suara (STT/TTS gratis bawaan perangkat)
- Mode **BYOK** (API Key gratis Google AI Studio) agar Rp 0 tanpa langganan

## Cara Menjalankan & Membuat File `.apk`

### 1. Jalankan di Lokal (Opsional)
```bash
npm install
cp .env.example .env.local
# Isi GOOGLE_GENERATIVE_AI_API_KEY (gratis dari https://aistudio.google.com/apikey)
npm run dev
```

### 2. Deploy Gratis ke Vercel
1. Unggah folder ini ke repositori GitHub milikmu.
2. Masuk ke [vercel.com](https://vercel.com), klik **Add New Project**, pilih repo **Kupas**.
3. Tambahkan Environment Variable `GOOGLE_GENERATIVE_AI_API_KEY` (dari Google AI Studio gratis), lalu klik **Deploy**.
4. Salin URL hasil deploy (misalnya `https://kupas-mu.vercel.app`).

### 3. Build File `.apk` Otomatis di GitHub (Tanpa Android Studio)
1. Buka `capacitor.config.ts` di repo GitHub-mu, ganti `url: "https://kupas.vercel.app"` dengan URL Vercel milikmu, lalu commit.
2. Buka tab **Actions** di GitHub → klik **Build Kupas APK** → klik **Run workflow**.
3. Tunggu sekitar 3 menit, lalu unduh artifact **`Kupas-APK`** (berisi `app-debug.apk` siap install di HP Android).
