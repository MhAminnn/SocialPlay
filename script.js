// Fungsi untuk mendeteksi ekstensi browser
(function detectExtensions() {
  // Fungsi utama untuk memeriksa ekstensi browser
  function checkForExtensions() {
    return new Promise((resolve) => {
      // Metode 1: Deteksi melalui ukuran jendela yang tidak normal
      const windowFeatures = {
        width: window.outerWidth - window.innerWidth,
        height: window.outerHeight - window.innerHeight
      };
      
      // Browser tanpa ekstensi biasanya memiliki ukuran yang lebih konsisten
      const suspiciousSizes = windowFeatures.width > 150 || windowFeatures.height > 200;
      
      // Metode 2: Deteksi melalui perubahan pada fungsi native
      const nativeToString = Function.prototype.toString;
      const hasBeenModified = 
        Function.prototype.toString.toString().length !== nativeToString.toString.call(nativeToString).length;
      
      // Metode 3: Deteksi melalui pengecekan DOM shadow
      const shadowElements = document.querySelectorAll('*').length;
      const shadowRootCheck = document.documentElement.shadowRoot !== undefined;
      
      // Metode 4: Deteksi dengan Chrome Extension API
      const hasExtensionAPI = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
      
      // Metode 5: Deteksi dengan tambahan elemen yang tidak dikenal
      const unknownElements = document.querySelectorAll('div[id*="extension"], div[class*="extension"]').length > 0;
      
      // Metode 6: Deteksi perubahan pada Object.prototype
      const prototypeModified = Object.keys(Object.prototype).length > 0;
      
      // Deteksi objek atau fungsi spesifik yang biasanya ditambahkan oleh ekstensi
      const knownExtensionObjects = [
        '__REACT_DEVTOOLS_GLOBAL_HOOK__',
        '__REDUX_DEVTOOLS_EXTENSION__',
        'BetterTTV',
        'uBlockOrigin',
        'AdBlock',
        'Grammarly'
      ];
      
      const hasKnownExtObjects = knownExtensionObjects.some(obj => window[obj] !== undefined);
      
      // Menggabungkan semua metode deteksi
      const extensionDetected = 
        suspiciousSizes || 
        hasBeenModified || 
        shadowRootCheck || 
        hasExtensionAPI || 
        unknownElements || 
        prototypeModified || 
        hasKnownExtObjects;
      
      resolve(extensionDetected);
    });
  }

  // Jalankan deteksi dan ambil tindakan
  checkForExtensions().then(extensionDetected => {
    if (extensionDetected) {
      // Sembunyikan semua konten situs
      document.body.innerHTML = `
        <div style="height: 100vh; display: flex; align-items: center; justify-content: center; background-color: #f8f8f8; flex-direction: column; font-family: Arial, sans-serif;">
          <h1 style="color: #dc3545; text-align: center;">Akses Ditolak</h1>
          <p style="text-align: center; max-width: 600px; margin: 20px;">
            Demi keamanan, situs ini tidak dapat diakses pada browser dengan ekstensi. 
            Silakan nonaktifkan semua ekstensi browser atau gunakan mode incognito.
          </p>
        </div>
      `;
      
      // Hentikan eksekusi skrip lainnya
      throw new Error('SECURITY_EXTENSION_DETECTED');
    } else {
      // Inisialisasi aplikasi jika tidak terdeteksi ekstensi
      initializeApp();
    }
  });
})();

// Enkripsi key API untuk melindungi dari eksposur langsung
function decryptApiKey(encryptedKey) {
  // Metode enkripsi sederhana (dalam implementasi nyata, gunakan enkripsi yang lebih kuat)
  return atob(encryptedKey);
}

// Simpan key API dalam bentuk terenkripsi
const ENCRYPTED_API_KEY = 'NWU0MmU0MmQwMm1zaDJlN2FiZmU3YWVkOWQ0NnAxNDk0NjBqc25iNjdkYmI2OGU1Mzg=';

// Fungsi untuk inisialisasi aplikasi utama
function initializeApp() {
  // Seleksi elemen-elemen yang diperlukan
  const menuToggle = document.getElementById('menuToggle');
  const fullscreenMenu = document.getElementById('fullscreenMenu');
  const closeMenu = document.getElementById('closeMenu');
  const fetchBtn = document.getElementById('fetchBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const urlInput = document.getElementById('urlInput');
  const videoPreview = document.getElementById('videoPreview');
  const previewImage = document.getElementById('previewImage');
  const authorName = document.getElementById('authorName');
  const likeCount = document.getElementById('likeCount');
  const commentCount = document.getElementById('commentCount');

  // Konfigurasi API dengan key terenkripsi
  const API_CONFIG = {
    key: decryptApiKey(ENCRYPTED_API_KEY),
    host: 'tiktok-scraper7.p.rapidapi.com',
    endpoint: 'https://tiktok-scraper7.p.rapidapi.com/'
  };

  // Tambahkan pertahanan anti-debugging
  setInterval(() => {
    const startTime = performance.now();
    debugger; // Akan menghentikan eksekusi jika DevTools terbuka
    const endTime = performance.now();
    
    // Jika jeda eksekusi terlalu lama, kemungkinan debugger aktif
    if (endTime - startTime > 100) {
      document.body.innerHTML = '<h1>Debugging terdeteksi. Akses ditolak.</h1>';
      throw new Error('SECURITY_DEBUGGER_DETECTED');
    }
  }, 1000);

  // Cache untuk menyimpan hasil API request
  const apiCache = new Map();

  // Event listener untuk membuka menu
  menuToggle.addEventListener('click', () => {
    fullscreenMenu.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  // Event listener untuk menutup menu
  closeMenu.addEventListener('click', closeFullscreenMenu);

  // Tutup menu saat mengklik di luar menu
  document.addEventListener('click', (e) => {
    if (!fullscreenMenu.contains(e.target) && !menuToggle.contains(e.target)) {
      closeFullscreenMenu();
    }
  });

  // Tambahkan event listener untuk menutup menu saat item menu diklik
  const menuItems = document.querySelectorAll('.menu-item');
  menuItems.forEach(item => {
    item.addEventListener('click', closeFullscreenMenu);
  });

  // Fungsi untuk menutup menu fullscreen
  function closeFullscreenMenu() {
    fullscreenMenu.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Fungsi untuk menampilkan loading spinner dengan pesan kustom
  function showSpinner(message) {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const loadingText = document.getElementById('loadingText');
    
    loadingText.textContent = message;
    loadingSpinner.style.display = 'flex';
  }

  // Fungsi untuk menyembunyikan loading spinner
  function hideSpinner() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    loadingSpinner.style.display = 'none';
  }

  // Optimasi pengambilan data video dengan caching
  async function fetchVideoData(videoUrl) {
    // Periksa apakah data sudah ada di cache
    if (apiCache.has(videoUrl)) {
      updateUIWithVideoData(apiCache.get(videoUrl));
      return;
    }

    const options = {
      method: 'GET',
      url: API_CONFIG.endpoint,
      params: {
        url: videoUrl,
        hd: '1'
      },
      headers: {
        'x-rapidapi-key': API_CONFIG.key,
        'x-rapidapi-host': API_CONFIG.host
      },
      // Tambahkan timeout untuk permintaan
      timeout: 10000 // 10 detik
    };

    showSpinner("Sedang Mencari...");
    videoPreview.style.display = 'none';
    downloadBtn.style.display = 'none';

    try {
      // Gunakan AbortController untuk membatalkan permintaan jika terlalu lama
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await axios.request({...options, signal: controller.signal});
      clearTimeout(timeoutId);
      
      const data = response.data.data;

      if (data) {
        // Simpan data ke cache
        apiCache.set(videoUrl, data);
        updateUIWithVideoData(data);
      } else {
        showNotification('Tidak ada data ditemukan untuk video ini.', 'error');
        hideSpinner();
      }
    } catch (error) {
      console.error('Fetch error:', error);
      hideSpinner();
      
      if (error.code === 'ECONNABORTED' || error.name === 'AbortError') {
        showNotification('Permintaan timeout. Server terlalu lambat merespons.', 'error');
      } else if (error.response && error.response.status === 429) {
        showNotification('Terlalu banyak permintaan. Silakan coba lagi nanti.', 'error');
      } else {
        showNotification('Gagal mengambil data video. Coba lagi.', 'error');
      }
    }
  }

  // Fungsi untuk memperbarui UI dengan data video
  function updateUIWithVideoData(data) {
    // Update the UI with the fetched data
    authorName.innerText = data.author?.nickname || 'Unknown';
    likeCount.innerText = formatNumber(data.digg_count) || '0';
    commentCount.innerText = formatNumber(data.comment_count) || '0';
    
    if (data.cover) {
      previewImage.src = data.cover;
      previewImage.alt = data.author?.nickname ? `${data.author.nickname}'s video` : 'TikTok video';
    }

    hideSpinner();
    videoPreview.style.display = 'block';
    downloadBtn.style.display = 'block';

    // Store video download URL for later use - prioritas HD video
    const videoUrl = data.hdplay || data.play;
    downloadBtn.setAttribute('data-url', videoUrl);
    downloadBtn.disabled = !videoUrl;
  }

  // Format angka untuk ditampilkan (contoh: 1,000,000 -> 1M)
  function formatNumber(num) {
    if (!num) return '0';
    
    num = Number(num);
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  // Add event listeners
  fetchBtn.addEventListener('click', () => {
    const videoUrl = urlInput.value.trim();
    if (videoUrl) {
      fetchVideoData(videoUrl);
    } else {
      showNotification('Masukkan URL video TikTok yang valid.', 'warning');
    }
  });

  // Enter key pada input URL
  urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      fetchBtn.click();
    }
  });

  // Implementasi download yang dioptimalkan
  downloadBtn.addEventListener('click', async () => {
    const downloadUrl = downloadBtn.getAttribute('data-url');
    if (!downloadUrl) {
      showNotification('URL download tidak ditemukan.', 'error');
      return;
    }

    showSpinner("Sedang Mengunduh, Harap Bersabar...");
    downloadBtn.disabled = true;

    try {
      // Gunakan Blob API dengan timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 detik timeout
      
      const response = await fetch(downloadUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error('Network response was not ok');

      // Progress monitoring untuk file besar
      const contentLength = response.headers.get('content-length');
      let loaded = 0;
      
      // Create reader from response body
      const reader = response.body.getReader();
      const chunks = [];
      
      // Read data chunks
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.length;
        
        // Update loading text jika content-length tersedia
        if (contentLength) {
          const percentComplete = Math.round((loaded / contentLength) * 100);
          document.getElementById('loadingText').textContent = 
            `Mengunduh... ${percentComplete}%`;
        }
      }
      
      // Gabungkan semua chunk menjadi satu blob
      const blob = new Blob(chunks);
      const url = window.URL.createObjectURL(blob);

      // Buat link download dan klik
      const link = document.createElement('a');
      link.href = url;
      
      // Dapatkan nama file dari URL jika mungkin
      let filename = 'tiktok-video.mp4';
      try {
        const originalUrl = urlInput.value.trim();
        const urlMatch = originalUrl.match(/\/([\w-]+)(?:\?|$)/);
        if (urlMatch && urlMatch[1]) {
          filename = `tiktok-${urlMatch[1]}.mp4`;
        }
      } catch (e) {
        console.warn('Could not parse filename from URL', e);
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      }, 100);

      // Show notification
      showNotification('Download berhasil!', 'success');
    } catch (error) {
      console.error('Download error:', error);
      if (error.name === 'AbortError') {
        showNotification('Download timeout. Koneksi terlalu lambat.', 'error');
      } else {
        showNotification('Gagal mengunduh video. Coba lagi.', 'error');
      }
    } finally {
      hideSpinner();
      downloadBtn.disabled = false;
    }
  });

  // Fungsi untuk menampilkan notifikasi dengan jenis pesan (success, error, warning)
  function showNotification(message, type = 'success') {
    // Periksa apakah elemen notifikasi sudah ada
    let notification = document.getElementById('notification');
    
    // Jika belum ada, buat elemen baru
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'notification';
      notification.style.position = 'fixed';
      notification.style.bottom = '20px';
      notification.style.right = '20px';
      notification.style.padding = '10px 20px';
      notification.style.color = 'white';
      notification.style.borderRadius = '5px';
      notification.style.zIndex = '9999';
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.3s ease-in-out';
      document.body.appendChild(notification);
    }
    
    // Set warna berdasarkan tipe pesan
    const colors = {
      success: '#28a745',
      error: '#dc3545',
      warning: '#ffc107'
    };
    
    notification.style.backgroundColor = colors[type] || colors.success;
    
    // Set pesan notifikasi
    notification.innerText = message;
    
    // Tampilkan notifikasi
    setTimeout(() => {
      notification.style.opacity = '1';
    }, 10);
    
    // Hilangkan notifikasi setelah 3 detik
    setTimeout(() => {
      notification.style.opacity = '0';
    }, 3000);
  }

  // Tambahkan proteksi terhadap copy-paste dan inspeksi
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('keydown', e => {
    // Cegah inspeksi dengan F12 atau Ctrl+Shift+I
    if (
      e.key === 'F12' || 
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) ||
      (e.ctrlKey && e.key === 'u')
    ) {
      e.preventDefault();
      showNotification('Inspeksi elemen tidak diizinkan.', 'error');
    }
  });
}