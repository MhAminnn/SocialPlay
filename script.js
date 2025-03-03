// Fungsi untuk mengenkripsi API key dengan metode yang lebih kuat
function encryptApiKey(key) {
    // Implementasi enkripsi yang lebih kompleks
    let encrypted = '';
    for (let i = 0; i < key.length; i++) {
        const charCode = key.charCodeAt(i) ^ (i + 7); // XOR dengan offset dinamis
        encrypted += String.fromCharCode(charCode);
    }
    // Tambahkan salt acak dan encode base64 dua kali
    const salt = Math.random().toString(36).substring(2, 10);
    return btoa(btoa(encrypted + salt));
}

// Fungsi untuk mendekripsi API key
function decryptApiKey(encryptedKey) {
    try {
        // Decode base64 dua kali
        const decoded = atob(atob(encryptedKey));
        // Hapus salt (8 karakter di akhir)
        const withoutSalt = decoded.substring(0, decoded.length - 8);
        
        // Reverse dari proses enkripsi
        let decrypted = '';
        for (let i = 0; i < withoutSalt.length; i++) {
            const charCode = withoutSalt.charCodeAt(i) ^ (i + 7); // XOR dengan offset yang sama
            decrypted += String.fromCharCode(charCode);
        }
        return decrypted;
    } catch (e) {
        console.error('Dekripsi gagal');
        return '';
    }
}

// Deteksi browser dan DevTools yang lebih canggih
function isBrowserAllowed() {
    // Performa cek tidak boleh dalam satu fungsi untuk menghindari override
    return performBrowserCheck() && performDevToolsCheck() && performIntegrityCheck();
}

// Pemeriksaan browser yang dipisah
function performBrowserCheck() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Daftar browser yang diblokir - lebih lengkap
    const blockedBrowsers = [
        'kiwi', 'firefox', 'opera', 'edge', 'brave', 'yandex',
        'mixes', 'puffin', 'ucbrowser', 'duckduckgo', 'dolphin',
        'baidu', 'maxthon', 'chromium'
    ];
    
    // Deteksi browser yang diblokir dengan regex yang lebih baik
    const isBlockedBrowser = blockedBrowsers.some(browser => {
        const regex = new RegExp(`\\b${browser}\\b`, 'i');
        return regex.test(userAgent);
    });
    
    // Deteksi browser mobile yang diizinkan (hanya Chrome Android, Samsung Browser, atau browser bawaan)
    const isAllowedMobile = (
        /android/.test(userAgent) && (
            (/chrome/.test(userAgent) && !/chromium|edg|opr|ucbrowser|kiwi/.test(userAgent)) ||
            /samsung browser/.test(userAgent) ||
            (/android/.test(userAgent) && /version/.test(userAgent) && !blockedBrowsers.some(b => userAgent.includes(b)))
        )
    );
    
    // Cek apakah ada ekstensi browser - metode yang lebih canggih
    const hasExtensions = (
        // Chrome extensions check
        (window.chrome && (
            window.chrome.runtime ||
            window.chrome.webstore ||
            window.chrome.app
        )) ||
        // Firefox extensions check
        (typeof InstallTrigger !== 'undefined') ||
        // General extension detection
        document.documentElement.hasAttribute('__EXTENSION__')
    );
    
    return isAllowedMobile && !isBlockedBrowser && !hasExtensions;
}

// Pemeriksaan DevTools yang dipisah dan lebih canggih
function performDevToolsCheck() {
    // Metode 1: Deteksi waktu eksekusi
    const timeCheck = () => {
        const start = performance.now();
        debugger; // Ini akan dipause jika DevTools terbuka
        const end = performance.now();
        return (end - start) > 100; // DevTools terbuka jika terlalu lama
    };
    
    // Metode 2: Deteksi dengan ukuran window
    const sizeCheck = () => {
        // Gunakan multiple checks dan thresholds yang berbeda
        return (
            window.outerHeight - window.innerHeight > 150 ||
            window.outerWidth - window.innerWidth > 150 ||
            window.devicePixelRatio % 1 !== 0 // Banyak browser saat inspect mengubah pixel ratio
        );
    };
    
    // Metode 3: Deteksi console properties - DevTools akan mengubah ini
    const consoleCheck = () => {
        const props = Object.getOwnPropertyNames(window.console);
        return props.length > 30; // DevTools menambahkan banyak property ke console
    };
    
    // Metode 4: Deteksi firehose - inspect akan mengaktifkan ini
    const firehoseCheck = () => {
        let devtoolsDetected = false;
        
        const originalDesc = Object.getOwnPropertyDescriptor(Element.prototype, 'id');
        try {
            Object.defineProperty(Element.prototype, 'id', {
                get: function() {
                    devtoolsDetected = true;
                    return '';
                }
            });
            
            // Trigger banyak operasi DOM untuk memicu firehose
            document.querySelectorAll('*');
            Object.defineProperty(Element.prototype, 'id', originalDesc);
        } catch (e) {
            Object.defineProperty(Element.prototype, 'id', originalDesc);
        }
        
        return devtoolsDetected;
    };
    
    // Metode 5: Deteksi melalui CSS
    const cssCheck = () => {
        // Buat elemen dengan style yang hanya berubah saat diinspect
        const checkElement = document.createElement('div');
        checkElement.style.display = 'none';
        checkElement.textContent = 'DevTools detector';
        document.documentElement.appendChild(checkElement);
        
        const result = (
            window.getComputedStyle(checkElement).getPropertyValue('display') !== 'none' ||
            checkElement.offsetHeight > 0
        );
        
        document.documentElement.removeChild(checkElement);
        return result;
    };
    
    // Gabungkan semua metode deteksi
    return !(timeCheck() || sizeCheck() || consoleCheck() || firehoseCheck() || cssCheck());
}

// Pemeriksaan integritas kode - baru
function performIntegrityCheck() {
    // Verifikasi bahwa fungsi-fungsi kunci belum diubah
    const functionBodies = {
        encryptApiKey: encryptApiKey.toString(),
        decryptApiKey: decryptApiKey.toString(),
        isBrowserAllowed: isBrowserAllowed.toString(),
        performBrowserCheck: performBrowserCheck.toString(),
        performDevToolsCheck: performDevToolsCheck.toString(),
        performIntegrityCheck: performIntegrityCheck.toString(),
        secureApplication: secureApplication.toString()
    };
    
    // Simpan hash fungsi-fungsi di sessionStorage saat pertama kali load
    if (!sessionStorage.getItem('_integrityHash')) {
        const hash = Object.values(functionBodies).join('').length.toString(16);
        sessionStorage.setItem('_integrityHash', hash);
        return true;
    }
    
    // Verifikasi hash pada load berikutnya
    const currentHash = Object.values(functionBodies).join('').length.toString(16);
    return sessionStorage.getItem('_integrityHash') === currentHash;
}

// Enkripsi API key pada kompilasi
const ENCRYPTED_API_KEY = '5y3gVTZWQmWXUXRiMllSakZXV0ZoZWprJmJGNiVm5zNUFGRHh0andSbXRiYjFNPQ==';

// Improved secure application
function secureApplication() {
    if (!isBrowserAllowed()) {
        // Kode pengalihan yang lebih canggih - redirect ke halaman error kustom
        // Tambahkan timeout acak agar sulit dideteksi
        setTimeout(() => {
            // Hancurkan semua elemen UI
            document.body.innerHTML = '<div style="text-align: center; padding: 50px; font-family: Arial; color: #333;"><h2>Browser Tidak Didukung</h2><p>Aplikasi ini hanya dapat diakses melalui Chrome Android atau Browser bawaan Android.</p><p>Developer tools harus dinonaktifkan.</p></div>';
            
            // Hancurkan semua fungsi yang tersisa
            const functions = ['encryptApiKey', 'decryptApiKey', 'isBrowserAllowed',
                'performBrowserCheck', 'performDevToolsCheck', 'performIntegrityCheck'];
            
            functions.forEach(func => {
                window[func] = function() { return false; };
            });
            
            // Hancurkan data penting
            localStorage.clear();
            sessionStorage.clear();
            
            // Rusak aliran eksekusi normal
            window.onerror = null;
            window.onload = null;
            
            // Kirim event untuk tracking (opsional)
            try {
                navigator.sendBeacon('/analytics', JSON.stringify({
                    event: 'security_violation',
                    browser: navigator.userAgent
                }));
            } catch (e) {}
            
            return false;
        }, Math.random() * 500 + 100);
        
        return false;
    }
    return true;
}

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
        key: ENCRYPTED_API_KEY, // Key yang sudah dienkripsi dengan metode baru
        host: 'tiktok-scraper7.p.rapidapi.com',
        endpoint: 'https://tiktok-scraper7.p.rapidapi.com/'
    };

    // Cache untuk menyimpan hasil API request - gunakan memory storage yang lebih aman
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

    // Optimasi pengambilan data video dengan caching yang ditingkatkan
    async function fetchVideoData(videoUrl) {
        // Validasi URL terlebih dahulu
        if (!validateTikTokUrl(videoUrl)) {
            showNotification('URL TikTok tidak valid. Format yang benar: https://www.tiktok.com/@username/video/1234567890', 'warning');
            return;
        }
        
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
            timeout: 15000 // 15 detik
        };

        showSpinner("Sedang Mencari...");
        videoPreview.style.display = 'none';
        downloadBtn.style.display = 'none';

        try {
            // Gunakan AbortController untuk membatalkan permintaan jika terlalu lama
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 20000);
            
            const response = await axios.request({...options, signal: controller.signal});
            clearTimeout(timeoutId);
            
            const data = response.data.data;

            if (data) {
                // Implementasi cache dengan batas umur dan ukuran
                while (apiCache.size > 10) { // Batas ukuran cache
                    const firstKey = apiCache.keys().next().value;
                    apiCache.delete(firstKey);
                }
                
                // Tambahkan timestamp ke data untuk batasi umur cache
                const cacheData = {
                    ...data,
                    _timestamp: Date.now()
                };
                
                apiCache.set(videoUrl, cacheData);
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

    // Validasi URL TikTok
    function validateTikTokUrl(url) {
        // Pola untuk URL TikTok yang valid
        const patterns = [
            /^https?:\/\/(www\.|vm\.|vt\.)?tiktok\.com\/(@[\w.-]+\/video\/\d+|[\w]+)/i,
            /^https?:\/\/(www\.|vm\.|vt\.)?tiktok\.com\/t\/[\w]+/i
        ];
        
        return patterns.some(pattern => pattern.test(url));
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

    // Implementasi download yang dioptimalkan dengan streaming
    downloadBtn.addEventListener('click', async () => {
        const downloadUrl = downloadBtn.getAttribute('data-url');
        if (!downloadUrl) {
            showNotification('URL download tidak ditemukan.', 'error');
            return;
        }

        showSpinner("Sedang Mengunduh, Harap Bersabar...");
        downloadBtn.disabled = true;

        try {
            // Gunakan Blob API dengan timeout dan streaming untuk file besar
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 detik timeout
            
            const response = await fetch(downloadUrl, { 
                signal: controller.signal,
                mode: 'cors',
                headers: {
                    'Accept': 'video/mp4,video/*;q=0.9,*/*;q=0.8'
                }
            });
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
            const blob = new Blob(chunks, {type: 'video/mp4'});
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

    // F