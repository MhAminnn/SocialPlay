// Fungsi untuk mengenkripsi API key
function encryptApiKey(key) {
    return btoa(key.split('').reverse().join(''));
}

// Fungsi untuk mendekripsi API key
function decryptApiKey(encryptedKey) {
    const decoded = atob(encryptedKey);
    return decoded.split('').reverse().join('');
}

// API keys yang dienkripsi
const TIKTOK_API_KEY = encryptApiKey('5e42e42d02msh2e7abfe7aed9d46p149460jsnb67dbb68e538');
const INSTAGRAM_API_KEY = encryptApiKey('8a9451b54bmsh997e8b63578a8c7p1cdbcejsnd3dcbee782ed');

// Konfigurasi API
const API_CONFIG = Object.freeze({
    tiktok: {
        key: TIKTOK_API_KEY,
        host: 'tiktok-scraper7.p.rapidapi.com',
        endpoint: 'https://tiktok-scraper7.p.rapidapi.com/'
    },
    instagram: {
        key: INSTAGRAM_API_KEY,
        host: 'instagram-scraper-api2.p.rapidapi.com',
        endpoint: 'https://instagram-scraper-api2.p.rapidapi.com/v1/post_info'
    }
});

// Cache dengan batas ukuran untuk mencegah memory leak
const apiCache = new Map();
const MAX_CACHE_SIZE = 100;

// Debounce utility untuk membatasi frekuensi pemanggilan fungsi
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Fungsi untuk mendeteksi tipe URL dengan regex yang lebih cepat
function detectUrlType(url) {
    const urlLower = url.toLowerCase();
    return /tiktok\.com/.test(urlLower) ? 'tiktok' :
           /instagram\.com/.test(urlLower) ? 'instagram' : null;
}

document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi elemen UI dengan caching DOM
    const elements = {
        menuToggle: document.getElementById('menuToggle'),
        fullscreenMenu: document.getElementById('fullscreenMenu'),
        closeMenu: document.getElementById('closeMenu'),
        fetchBtn: document.getElementById('fetchBtn'),
        urlInput: document.getElementById('urlInput'),
        videoPreview: document.getElementById('videoPreview'),
        downloadBtn: document.getElementById('downloadBtn'),
        previewImage: document.getElementById('previewImage'),
        authorName: document.getElementById('authorName'),
        likeCount: document.getElementById('likeCount'),
        commentCount: document.getElementById('commentCount'),
        loadingSpinner: document.getElementById('loadingSpinner'),
        loadingText: document.getElementById('loadingText'),
        notificationBox: document.getElementById('notificationBox')
    };

    // Fungsi untuk menutup menu fullscreen
    const closeFullscreenMenu = () => {
        elements.fullscreenMenu.classList.remove('active');
        document.body.style.overflow = '';
    };

    // Event listener untuk menu dengan performa lebih baik
    elements.menuToggle?.addEventListener('click', () => {
        elements.fullscreenMenu.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    elements.closeMenu?.addEventListener('click', closeFullscreenMenu);

    document.addEventListener('click', (e) => {
        if (!elements.fullscreenMenu.contains(e.target) && !elements.menuToggle.contains(e.target)) {
            closeFullscreenMenu();
        }
    }, { passive: true });

    // Format angka dengan lookup table untuk efisiensi
    const formatNumber = (() => {
        const suffixes = ['K', 'M'];
        return (num) => {
            if (!num) return '0';
            num = Number(num);
            if (num < 1000) return num.toString();
            const exp = Math.min(Math.floor(Math.log10(num) / 3), 2);
            return (num / Math.pow(1000, exp)).toFixed(1) + suffixes[exp - 1];
        };
    })();

    // Fungsi untuk menampilkan loading spinner
    const showSpinner = (message) => {
        elements.loadingText.innerHTML = message; // Ubah ke innerHTML untuk mendukung warna
        elements.loadingSpinner.style.display = 'flex';
    };

    // Fungsi untuk menyembunyikan loading spinner
    const hideSpinner = () => {
        elements.loadingSpinner.style.display = 'none';
    };

    // Fungsi untuk menampilkan notifikasi dengan pooling
    const showNotification = (() => {
        let timeoutId;
        return (message, type = 'success') => {
            clearTimeout(timeoutId);
            elements.notificationBox.className = `notification ${type}`;
            elements.notificationBox.textContent = message;
            elements.notificationBox.style.display = 'block';
            timeoutId = setTimeout(() => {
                elements.notificationBox.style.display = 'none';
            }, 3000);
        };
    })();

    // Fungsi untuk memperbarui UI dengan data media
    const updateUIWithMediaData = (data, type) => {
        const downloadUrl = type === 'tiktok' 
            ? (data.hdplay || data.play) 
            : (data.is_video ? data.video_url : data.display_url);

        const previewImageUrl = type === 'tiktok' 
            ? data.cover 
            : (data.is_video ? (data.thumbnail_url || data.video_preview || data.display_url) 
              : (data.display_url || data.first_frame_url || data.thumbnail_url));

        elements.authorName.textContent = type === 'tiktok' 
            ? (data.author?.nickname || 'Unknown') 
            : (data.user?.username || 'Unknown');

        elements.likeCount.textContent = formatNumber(type === 'tiktok' 
            ? data.digg_count 
            : data.metrics?.like_count);

        elements.commentCount.textContent = formatNumber(type === 'tiktok' 
            ? data.comment_count 
            : data.metrics?.comment_count);

        elements.previewImage.src = previewImageUrl;
        elements.videoPreview.style.display = 'block';
        elements.downloadBtn.style.display = 'block';
        elements.downloadBtn.setAttribute('data-url', downloadUrl);
        elements.downloadBtn.disabled = !downloadUrl;
    };

    // Fungsi utama untuk mengambil data media dengan retry mechanism
    const fetchMediaData = async (url) => {
        const urlType = detectUrlType(url);
        if (!urlType) {
            showNotification('URL tidak valid. Masukkan URL TikTok atau Instagram yang benar.', 'warning');
            return;
        }

        if (apiCache.has(url)) {
            updateUIWithMediaData(apiCache.get(url), urlType);
            return;
        }

        try {
            showSpinner("Sedang Mencari...");
            elements.videoPreview.style.display = 'none';
            elements.downloadBtn.style.display = 'none';

            const apiConfig = API_CONFIG[urlType];
            const options = {
                method: 'GET',
                url: apiConfig.endpoint,
                params: urlType === 'tiktok' 
                    ? { url, hd: '1' } 
                    : { code_or_id_or_url: url },
                headers: {
                    'x-rapidapi-key': decryptApiKey(apiConfig.key),
                    'x-rapidapi-host': apiConfig.host
                },
                timeout: 15000,
                cache: 'no-store'
            };

            const response = await axios.request(options);
            const data = urlType === 'tiktok' ? response.data.data : response.data.data;

            if (data) {
                if (apiCache.size >= MAX_CACHE_SIZE) apiCache.clear();
                apiCache.set(url, data);
                updateUIWithMediaData(data, urlType);
            } else {
                showNotification('Tidak ada data ditemukan.', 'error');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            const errorMessage = error.response?.status === 429 
                ? 'Terlalu banyak permintaan. Silakan coba lagi nanti.' 
                : 'Gagal mengambil data. Coba lagi.';
            showNotification(errorMessage, 'error');
        } finally {
            hideSpinner();
        }
    };

    // Fungsi download dengan animasi loading dinamis dan refresh otomatis
    const downloadMedia = async (downloadUrl) => {
        if (!downloadUrl) {
            showNotification('URL download tidak ditemukan.', 'error');
            return;
        }

        showSpinner(`Sedang Mengunduh.. <span style="color: greenyellow;">0%</span>`);
        elements.downloadBtn.disabled = true;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);
            const response = await fetch(downloadUrl, { 
                signal: controller.signal,
                cache: 'no-store'
            });
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error('Network response was not ok');

            const contentLength = response.headers.get('content-length');
            const reader = response.body.getReader();
            const chunks = [];
            let loaded = 0;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(value);
                loaded += value.length;
                if (contentLength) {
                    const percentage = Math.round((loaded / contentLength) * 100);
                    if (percentage < 30) {
                        elements.loadingText.innerHTML = `Sedang Mengunduh.. <span style="color: greenyellow;">${percentage}%</span>`;
                    } else if (percentage >= 30 && percentage < 80) {
                        elements.loadingText.innerHTML = `Mohon sabar kak..🥹  <span style="color: greenyellow;">${percentage}%</span>`;
                    } else if (percentage >= 80) {
                        elements.loadingText.innerHTML = `Sedikit lagi kak.. 😁 <span style="color: greenyellow;">${percentage}%</span>`;
                    }
                }
            }

            const blob = new Blob(chunks);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            let filename = 'social-media-video.mp4';
            try {
                const urlMatch = elements.urlInput.value.trim().match(/\/([\w-]+)(?:\?|$)/);
                if (urlMatch?.[1]) filename = `social-${urlMatch[1]}.mp4`;
            } catch (e) {
                console.warn('Could not parse filename from URL', e);
            }

            link.download = filename;
            document.body.appendChild(link);
            link.click();

            setTimeout(() => {
                window.URL.revokeObjectURL(url);
                document.body.removeChild(link);
            }, 100);

            showNotification('Download berhasil! Halaman akan direfresh.', 'success');
            // Refresh otomatis setelah 1 detik
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error('Download error:', error);
            const errorMessage = error.name === 'AbortError' 
                ? 'Download timeout. Koneksi terlalu lambat.' 
                : 'Gagal mengunduh video. Coba lagi.';
            showNotification(errorMessage, 'error');
        } finally {
            hideSpinner();
            elements.downloadBtn.disabled = false;
        }
    };

    // Event listener dengan debounce
    const debouncedFetch = debounce(() => {
        const url = elements.urlInput.value.trim();
        if (url) fetchMediaData(url);
        else showNotification('Masukkan URL video yang valid.', 'warning');
    }, 300);

    elements.fetchBtn?.addEventListener('click', debouncedFetch);
    elements.urlInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') debouncedFetch();
    }, { passive: true });

    elements.downloadBtn?.addEventListener('click', () => {
        downloadMedia(elements.downloadBtn.getAttribute('data-url'));
    }, { passive: true });

    // Preload gambar default untuk preview
    elements.previewImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
});