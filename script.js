// Fungsi untuk mengenkripsi API key
function encryptApiKey(key) {
    // Simple obfuscation - ini hanya contoh dasar
    // Dalam produksi, gunakan metode yang lebih kuat
    return btoa(key.split('').reverse().join(''));
}

// Fungsi untuk mendekripsi API key
function decryptApiKey(encryptedKey) {
    const decoded = atob(encryptedKey);
    return decoded.split('').reverse().join('');
}

// Cek browser untuk memblokir akses dari browser yang tidak diinginkan
function isBrowserAllowed() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Deteksi developer tools
    const devToolsOpen = window.outerHeight - window.innerHeight > 200 || 
                         window.outerWidth - window.innerWidth > 200;
    
    // Deteksi apakah ada extension browser
    const hasExtensions = !!window.chrome && !!window.chrome.runtime;
    
    // Deteksi browser mobile yang diizinkan (Chrome Android atau browser bawaan)
    const isAllowedMobile = (
        /android/.test(userAgent) && (
            /chrome/.test(userAgent) ||       // Chrome Android
            /samsung browser/.test(userAgent) || // Samsung browser
            /android browser/.test(userAgent)  // Browser bawaan Android
        )
    );
    
    // Deteksi browser yang tidak diizinkan
    const isBlockedBrowser = (
        /kiwi/.test(userAgent) || 
        /mixes/.test(userAgent) ||
        /firefox/.test(userAgent) ||
        /opera/.test(userAgent) ||
        /edge/.test(userAgent) ||
        /brave/.test(userAgent)
    );
    
    // Deteksi penggunaan DevTools
    let isDevToolsOpen = false;
    
    // Metode 1: Deteksi dengan console.log
    const consoleCheck = () => {
        const startTime = new Date();
        console.log('Checking for devtools...');
        console.clear();
        const endTime = new Date();
        
        // Jika membutuhkan waktu terlalu lama, kemungkinan DevTools terbuka
        return (endTime - startTime) > 100;
    };
    
    // Metode 2: Deteksi dengan ukuran window
    const sizeCheck = () => {
        return window.outerHeight - window.innerHeight > 200 || 
               window.outerWidth - window.innerWidth > 200;
    };
    
    // Metode 3: Deteksi dengan debugger statement
    const debuggerCheck = () => {
        let counter = 0;
        const start = new Date().getTime();
        
        function debuggerTrap() {
            counter++;
            // debugger; // Uncomment ini untuk deteksi lebih agresif
            
            if (counter < 2) {
                debuggerTrap();
            }
        }
        
        debuggerTrap();
        
        return (new Date().getTime() - start) > 100;
    };
    
    isDevToolsOpen = consoleCheck() || sizeCheck() || debuggerCheck();
    
    // Return true jika browser diizinkan dan tidak ada developer tools
    return isAllowedMobile && !isDevToolsOpen && !isBlockedBrowser && !hasExtensions;
}

// Fungsi untuk mengacak kode jika browser tidak diizinkan
function secureApplication() {
    if (!isBrowserAllowed()) {
        // Browser tidak diizinkan, nonaktifkan aplikasi
        document.body.innerHTML = '<div style="text-align: center; padding: 50px; color: red;"><h2>Akses Ditolak</h2><p>Aplikasi hanya dapat diakses melalui browser bawaan Android atau Chrome Android.</p></div>';
        
        // Cara lain: redirect ke halaman kesalahan
        // window.location.href = 'error.html';
        
        // Menghentikan semua fungsi JavaScript
        return false;
    }
    return true;
}

// API key yang telah dienkripsi
const ENCRYPTED_API_KEY = encryptApiKey('5e42e42d02msh2e7abfe7aed9d46p149460jsnb67dbb68e538');

// Inisialisasi aplikasi hanya jika browser diizinkan
if (secureApplication()) {
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
        key: ENCRYPTED_API_KEY, // Key yang sudah dienkripsi
        host: 'tiktok-scraper7.p.rapidapi.com',
        endpoint: 'https://tiktok-scraper7.p.rapidapi.com/'
    };

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
                'x-rapidapi-key': decryptApiKey(API_CONFIG.key), // Dekripsi key saat digunakan
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

    // Tambahkan pengecekan browser dan developer tools secara periodik
    setInterval(() => {
        if (!isBrowserAllowed()) {
            secureApplication();
        }
    }, 5000);
}

// Tambahkan proteksi tambahan terhadap manipulasi JavaScript
(function() {
    // Cegah override fungsi-fungsi penting
    const protectedFunctions = [
        'encryptApiKey',
        'decryptApiKey',
        'isBrowserAllowed',
        'secureApplication'
    ];
    
    protectedFunctions.forEach(funcName => {
        const originalFunc = window[funcName];
        Object.defineProperty(window, funcName, {
            get: function() {
                return originalFunc;
            },
            set: function() {
                console.warn('Mencoba mengubah fungsi keamanan!');
                return originalFunc; // Tolak perubahan
            }
        });
    });
    
    // Tambahkan listener untuk mematikan konsol saat dibuka
    window.addEventListener('error', function(e) {
        if (e.message === 'ResizeObserver loop limit exceeded') {
            // Ini sering muncul di DevTools, mungkin indikasi DevTools terbuka
            secureApplication();
        }
    });
    
    // Blokir inspect element
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });
    
    // Nonaktifkan fungsi view-source
    document.addEventListener('keydown', function(e) {
        // Ctrl+U, Ctrl+Shift+I, F12
        if (
            (e.ctrlKey && e.keyCode === 85) || 
            (e.ctrlKey && e.shiftKey && e.keyCode === 73) ||
            e.keyCode === 123
        ) {
            e.preventDefault();
            return false;
        }
    });
})();

// Eksekusi pengecekan saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    secureApplication();
});