
# SocialPlay 🎥✨

![SocialPlay Banner](https://via.placeholder.com/1200x300.png?text=SocialPlay+-+Download+Social+Media+Made+Easy)  
*Download media dari TikTok dan Instagram dengan mudah dan cepat!*

SocialPlay adalah alat berbasis web yang memungkinkan pengguna untuk mengunduh video, gambar, atau carousel dari TikTok dan Instagram hanya dengan memasukkan URL. Dibangun dengan JavaScript modern, proyek ini menawarkan pengalaman pengguna yang mulus dengan animasi elegan, antarmuka responsif, dan fitur cerdas seperti deteksi clipboard otomatis.

## Fitur Utama 🚀

- **Unduh Media Sosial**: Ambil video atau gambar dari TikTok dan Instagram dalam hitungan detik.
- **Pratinjau Konten**: Lihat pratinjau media sebelum mengunduh, termasuk carousel untuk postingan multi-gambar.
- **Animasi Modern**: Alert selamat datang dengan efek masuk/keluar yang stylish dan blur latar belakang.
- **Jeda Alert Cerdas**: Alert muncul setiap 1 menit, terlacak dengan `localStorage`, bahkan setelah refresh.
- **Optimasi Performa**: Cache menggunakan `WeakMap`, debounce untuk efisiensi, dan format angka yang cepat.
- **Responsif**: Antarmuka yang ramah untuk semua perangkat.

## Demo 🎬

![Demo GIF](https://via.placeholder.com/600x400.png?text=SocialPlay+Demo)  
*Coba SocialPlay sekarang dan lihat kemudahannya!*

## Cara Kerja ⚙️

1. **Masukkan URL**: Salin tautan postingan TikTok atau Instagram.
2. **Ambil Data**: Klik tombol "Fetch" untuk memproses URL dan menampilkan pratinjau.
3. **Unduh**: Pilih media yang ingin diunduh dengan satu klik.

## Teknologi yang Digunakan 🛠️

- **JavaScript**: Logika utama dengan ES6+.
- **Axios**: Permintaan API ke layanan RapidAPI.
- **HTML/CSS**: Antarmuka responsif dengan animasi CSS.
- **LocalStorage**: Penjadwalan alert berbasis waktu.
- **RequestAnimationFrame**: Animasi yang mulus dan efisien.

## Instalasi dan Penggunaan 📥

### Prasyarat
- Browser modern (Chrome, Firefox, Edge, dll.).
- Koneksi internet untuk mengakses API.

### Langkah-langkah
1. **Clone Repository**:
   ```bash
   git clone https://github.com/username/socialplay.git
   cd socialplay
   ```
2. **Siapkan Dependensi**:
   - Pastikan Anda menyertakan Axios di HTML Anda:
     ```html
     <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
     ```
   - Salin kode JavaScript ke file `script.js` dan hubungkan ke HTML:
     ```html
     <script src="script.js"></script>
     ```

3. **Struktur HTML**:
   Pastikan elemen DOM seperti `fetchBtn`, `urlInput`, dll., ada di HTML Anda. Contoh minimal:
   ```html
   <!DOCTYPE html>
   <html lang="id">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>SocialPlay</title>
   </head>
   <body>
       <input id="urlInput" type="text" placeholder="Masukkan URL">
       <button id="fetchBtn">Ambil</button>
       <div id="videoPreview" style="display: none;">
           <img id="previewImage">
           <div id="carouselPreview" style="display: none;">
               <div id="carouselImages"></div>
               <button id="prevSlide">Prev</button>
               <button id="nextSlide">Next</button>
           </div>
           <button id="downloadBtn">Download</button>
           <span id="authorName"></span>
           <span id="likeCount"></span>
           <span id="commentCount"></span>
       </div>
       <div id="loadingSpinner" style="display: none;">Loading...</div>
       <div id="loadingText"></div>
       <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
       <script src="script.js"></script>
   </body>
   </html>
   ```

4. **Jalankan**:
   - Buka file HTML di browser atau gunakan server lokal:
     ```bash
     npx live-server
     ```

## Konfigurasi API 🔑

SocialPlay menggunakan RapidAPI untuk mengakses data TikTok dan Instagram. Anda perlu:
1. Daftar di [RapidAPI](https://rapidapi.com/).
2. Dapatkan kunci API untuk:
   - [TikTok Scraper](https://rapidapi.com/Glavier/api/tiktok-scraper7)
   - [Instagram Scraper](https://rapidapi.com/Glavier/api/instagram-scraper-api2)
3. Enkripsi kunci API Anda di `script.js` menggunakan fungsi `encryptApiKey`.

## Kontribusi 🤝

Kami menyambut kontribusi! Ikuti langkah ini:
1. Fork repository ini.
2. Buat branch fitur Anda: `git checkout -b fitur-baru`.
3. Commit perubahan: `git commit -m "Menambahkan fitur baru"`.
4. Push ke branch: `git push origin fitur-baru`.
5. Buat Pull Request.

## Lisensi 📜

Dilisensikan di bawah [MIT License](LICENSE). Gunakan, modifikasi, dan distribusikan sesuka hati!

## Kontak 📧

Punya pertanyaan atau saran? Hubungi saya di:
- **Email**: your.email@example.com
- **GitHub**: [username](https://github.com/username)

---

## Terima Kasih! 🙌

SocialPlay dibuat untuk mempermudah hidup Anda dalam menikmati konten media sosial. Dukung proyek ini dengan memberikan ⭐ di GitHub jika Anda menyukainya!

---

### Penjelasan:
1. **Desain Visual**: Menggunakan header besar, emoji, dan placeholder gambar untuk kesan modern.
2. **Struktur Profesional**: Termasuk bagian Fitur, Demo, Teknologi, Instalasi, dll., seperti README proyek open-source.
3. **Instruksi Jelas**: Langkah-langkah instalasi dan konfigurasi API mudah diikuti.
4. **Personalisasi**: Ganti `username`, `your.email@example.com`, dan URL gambar demo dengan milik Anda.

Simpan ini sebagai `README.md` di root proyek Anda. Jika Anda ingin menambahkan logo, screenshot, atau detail lain, beri tahu saya!