function encryptApiKey(key) {
    return btoa(key.split('').reverse().join(''));
}

function decryptApiKey(encryptedKey) {
    return atob(encryptedKey).split('').reverse().join('');
}

const TIKTOK_API_KEY = encryptApiKey('5e42e42d02msh2e7abfe7aed9d46p149460jsnb67dbb68e538');
const INSTAGRAM_API_KEY = encryptApiKey('8a9451b54bmsh997e8b63578a8c7p1cdbcejsnd3dcbee782ed');

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

const apiCache = new WeakMap();
const MAX_CACHE_SIZE = 100;

function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

const detectUrlType = url => {
    const urlLower = url.toLowerCase();
    return urlLower.includes('tiktok.com') ? 'tiktok' : 
           urlLower.includes('instagram.com') ? 'instagram' : null;
};

const formatNumber = num => {
    if (!num) return '0';
    num = Number(num);
    if (num < 1000) return `${num}`;
    const exp = Math.min(Math.floor(Math.log10(num) / 3), 2);
    return `${(num / (1000 ** exp)).toFixed(1)}${['K', 'M'][exp - 1]}`;
};

document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        menuToggle: document.getElementById('menuToggle'),
        fullscreenMenu: document.getElementById('fullscreenMenu'),
        closeMenu: document.getElementById('closeMenu'),
        fetchBtn: document.getElementById('fetchBtn'),
        urlInput: document.getElementById('urlInput'),
        videoPreview: document.getElementById('videoPreview'),
        downloadBtn: document.getElementById('downloadBtn'),
        mediaPreview: document.getElementById('mediaPreview'), // Gantikan previewImage dan carouselPreview
        authorName: document.getElementById('authorName'),
        likeCount: document.getElementById('likeCount'),
        commentCount: document.getElementById('commentCount'),
        loadingSpinner: document.getElementById('loadingSpinner'),
        loadingText: document.getElementById('loadingText'),
        notificationBox: document.getElementById('notificationBox')
    };

    // Animasi scrolling dinamis
    const scrollElements = document.querySelectorAll('[data-scroll]');
    
    function handleScroll() {
        const windowHeight = window.innerHeight;
        scrollElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const elementTop = rect.top;
            const elementBottom = rect.bottom;

            if (elementTop < windowHeight * 0.8 && elementBottom > windowHeight * 0.2) {
                el.classList.add('in-view');
            } else {
                el.classList.remove('in-view');
            }
        });
    }

    window.addEventListener('scroll', debounce(handleScroll, 10));
    handleScroll();

    const toggleMenu = (show) => {
        const menu = elements.fullscreenMenu;
        const start = performance.now();
        const duration = 300;
        const initialBottom = show ? -100 : 0;
        const targetBottom = show ? 0 : -100;

        const animate = (time) => {
            const progress = Math.min((time - start) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 4);
            menu.style.bottom = `${initialBottom + (targetBottom - initialBottom) * ease}%`;
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                if (!show) menu.classList.remove('active');
                document.body.style.overflow = show ? 'hidden' : '';
            }
        };

        if (show) menu.classList.add('active');
        requestAnimationFrame(animate);
    };

    elements.menuToggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu(true);
    });

    elements.closeMenu?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu(false);
    });

    document.addEventListener('click', (e) => {
        const target = e.target;
        if (elements.fullscreenMenu.classList.contains('active') && 
            !elements.fullscreenMenu.contains(target) && 
            target !== elements.menuToggle) {
            toggleMenu(false);
        }
    }, { passive: true });

    const showSpinner = message => {
        elements.loadingText.innerHTML = message;
        elements.loadingSpinner.style.opacity = '0';
        elements.loadingSpinner.style.display = 'flex';
        requestAnimationFrame(() => {
            elements.loadingSpinner.style.transition = 'opacity 0.2s ease';
            elements.loadingSpinner.style.opacity = '1';
        });
    };

    const hideSpinner = () => {
        elements.loadingSpinner.style.opacity = '0';
        setTimeout(() => elements.loadingSpinner.style.display = 'none', 200);
    };

    const showNotification = (message, type = 'success') => {
        const notification = document.createElement('div');
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.padding = '15px';
        notification.style.borderRadius = '5px';
        notification.style.color = 'white';
        notification.style.zIndex = '1000';
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s ease-in-out';

        notification.style.backgroundColor = type === 'error' ? 'red' :
                                           type === 'warning' ? 'orange' :
                                           'green';

        notification.innerText = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);

        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => document.body.removeChild(notification), 500);
        }, 3000);
    };

    const updateUIWithMediaData = (data, type) => {
        elements.authorName.textContent = type === 'tiktok' ? (data.author?.nickname || 'Unknown') : 
                                         (data.user?.username || 'Unknown');
        elements.likeCount.textContent = formatNumber(type === 'tiktok' ? data.digg_count : data.metrics?.like_count);
        elements.commentCount.textContent = formatNumber(type === 'tiktok' ? data.comment_count : data.metrics?.comment_count);

        // Bersihkan preview sebelumnya
        elements.mediaPreview.innerHTML = '';
        elements.downloadBtn.style.display = 'none';

        if (type === 'tiktok') {
            if (data.images && Array.isArray(data.images)) {
                // Gambar slide (carousel)
                const carousel = document.createElement('div');
                carousel.className = 'carousel';
                carousel.innerHTML = `
                    <div class="carousel-images"></div>
                    <button class="carousel-btn prev"><i class="fas fa-chevron-left"></i></button>
                    <button class="carousel-btn next"><i class="fas fa-chevron-right"></i></button>
                `;
                const carouselImages = carousel.querySelector('.carousel-images');

                data.images.forEach((imageUrl, index) => {
                    const item = document.createElement('div');
                    item.className = 'carousel-item';
                    item.innerHTML = `
                        <img src="${imageUrl}" alt="Slide ${index + 1}">
                        <button class="download-btn" data-url="${imageUrl}">Download Gambar ${index + 1}</button>
                    `;
                    carouselImages.appendChild(item);
                });

                elements.mediaPreview.appendChild(carousel);

                let currentSlide = 0;
                const slides = carouselImages.children;
                const totalSlides = slides.length;

                const updateCarousel = () => {
                    carouselImages.style.transform = `translateX(-${currentSlide * 100}%)`;
                };

                carousel.querySelector('.prev').onclick = () => {
                    currentSlide = (currentSlide > 0) ? currentSlide - 1 : totalSlides - 1;
                    updateCarousel();
                };

                carousel.querySelector('.next').onclick = () => {
                    currentSlide = (currentSlide < totalSlides - 1) ? currentSlide + 1 : 0;
                    updateCarousel();
                };
            } else {
                // Video TikTok
                const videoUrl = data.hdplay || data.play;
                if (videoUrl) {
                    const videoElement = document.createElement('video');
                    videoElement.controls = true;
                    videoElement.src = videoUrl;
                    videoElement.style.width = '100%';
                    videoElement.style.maxWidth = '300px';
                    videoElement.style.height = '400px';
                    videoElement.style.objectFit = 'cover';
                    videoElement.style.borderRadius = '12px';
                    videoElement.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.1)';
                    videoElement.style.marginBottom = '2rem';

                    elements.mediaPreview.appendChild(videoElement);

                    elements.downloadBtn.setAttribute('data-url', videoUrl);
                    elements.downloadBtn.textContent = 'Download Video';
                    elements.downloadBtn.style.display = 'block';
                    elements.downloadBtn.disabled = false;
                } else {
                    showNotification('URL video tidak ditemukan.', 'error');
                }
            }
        } else {
            if (data.carousel_media && Array.isArray(data.carousel_media)) {
                // Gambar slide Instagram (carousel)
                const carousel = document.createElement('div');
                carousel.className = 'carousel';
                carousel.innerHTML = `
                    <div class="carousel-images"></div>
                    <button class="carousel-btn prev"><i class="fas fa-chevron-left"></i></button>
                    <button class="carousel-btn next"><i class="fas fa-chevron-right"></i></button>
                `;
                const carouselImages = carousel.querySelector('.carousel-images');

                data.carousel_media.forEach((item, index) => {
                    const mediaUrl = item.is_video ? item.video_url : item.display_url;
                    const previewUrl = item.is_video ? (item.thumbnail_url || item.display_url) : item.display_url;
                    const itemElement = document.createElement('div');
                    itemElement.className = 'carousel-item';
                    itemElement.innerHTML = `
                        <img src="${previewUrl}" alt="Slide ${index + 1}">
                        <button class="download-btn" data-url="${mediaUrl}">Download ${item.is_video ? 'Video' : 'Gambar'} ${index + 1}</button>
                    `;
                    carouselImages.appendChild(itemElement);
                });

                elements.mediaPreview.appendChild(carousel);

                let currentSlide = 0;
                const slides = carouselImages.children;
                const totalSlides = slides.length;

                const updateCarousel = () => {
                    carouselImages.style.transform = `translateX(-${currentSlide * 100}%)`;
                };

                carousel.querySelector('.prev').onclick = () => {
                    currentSlide = (currentSlide > 0) ? currentSlide - 1 : totalSlides - 1;
                    updateCarousel();
                };

                carousel.querySelector('.next').onclick = () => {
                    currentSlide = (currentSlide < totalSlides - 1) ? currentSlide + 1 : 0;
                    updateCarousel();
                };
            } else {
                // Video atau Gambar Tunggal Instagram
                const isVideo = data.is_video;
                const mediaUrl = isVideo ? data.video_url : data.display_url;
                const previewUrl = isVideo ? (data.thumbnail_url || data.display_url) : data.display_url;

                if (isVideo && mediaUrl) {
                    const videoElement = document.createElement('video');
                    videoElement.controls = true;
                    videoElement.src = mediaUrl;
                    videoElement.style.width = '100%';
                    videoElement.style.maxWidth = '300px';
                    videoElement.style.height = '400px';
                    videoElement.style.objectFit = 'cover';
                    videoElement.style.borderRadius = '12px';
                    videoElement.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.1)';
                    videoElement.style.marginBottom = '2rem';

                    elements.mediaPreview.appendChild(videoElement);

                    elements.downloadBtn.setAttribute('data-url', mediaUrl);
                    elements.downloadBtn.textContent = 'Download Video';
                    elements.downloadBtn.style.display = 'block';
                    elements.downloadBtn.disabled = false;
                } else if (mediaUrl) {
                    const imageElement = document.createElement('img');
                    imageElement.src = previewUrl;
                    imageElement.alt = 'Media Preview';
                    imageElement.style.width = '100%';
                    imageElement.style.maxWidth = '300px';
                    imageElement.style.height = '400px';
                    imageElement.style.objectFit = 'cover';
                    imageElement.style.borderRadius = '12px';
                    imageElement.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.1)';
                    imageElement.style.marginBottom = '2rem';

                    elements.mediaPreview.appendChild(imageElement);

                    elements.downloadBtn.setAttribute('data-url', mediaUrl);
                    elements.downloadBtn.textContent = 'Download Gambar';
                    elements.downloadBtn.style.display = 'block';
                    elements.downloadBtn.disabled = false;
                } else {
                    showNotification('Media tidak ditemukan.', 'error');
                }
            }
        }

        elements.videoPreview.style.display = 'block';

        document.querySelectorAll('.carousel-item .download-btn').forEach(btn => {
            btn.onclick = () => downloadMedia(btn.getAttribute('data-url'), btn.textContent.includes('Video') ? 'video' : 'image');
        });
    };

    const fetchMediaData = async url => {
        const urlType = detectUrlType(url);
        if (!urlType) {
            showNotification('URL tidak valid.', 'warning');
            return;
        }

        const cacheKey = { url, type: urlType };
        if (apiCache.has(cacheKey)) {
            updateUIWithMediaData(apiCache.get(cacheKey), urlType);
            return;
        }

        try {
            showSpinner('Sedang Mencari...');
            elements.videoPreview.style.display = 'none';
            elements.downloadBtn.style.display = 'none';

            const apiConfig = API_CONFIG[urlType];
            const options = {
                method: 'GET',
                url: apiConfig.endpoint,
                params: urlType === 'tiktok' ? { url, hd: '1' } : { code_or_id_or_url: url },
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
                apiCache.set(cacheKey, data);
                updateUIWithMediaData(data, urlType);
            } else {
                showNotification('Tidak ada data ditemukan.', 'error');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            showNotification(error.response?.status === 429 ? 
                'Terlalu banyak permintaan.' : 'Gagal mengambil data.', 'error');
        } finally {
            hideSpinner();
        }
    };

    const downloadMedia = async (downloadUrl, mediaType = 'video') => {
        if (!downloadUrl) {
            showNotification('URL download tidak ditemukan.', 'error');
            return;
        }

        showSpinner(`Sedang Mengunduh.. <span style="color: greenyellow;">0%</span>`);
        elements.downloadBtn.disabled = true;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);
            const response = await fetch(downloadUrl, { signal: controller.signal, cache: 'no-store' });
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error('Network response was not ok');

            const contentLength = +response.headers.get('content-length');
            const reader = response.body.getReader();
            const chunks = [];
            let loaded = 0;

            const updateProgress = () => {
                const percentage = contentLength ? Math.round((loaded / contentLength) * 100) : 0;
                let message;
                if (percentage < 30) message = `Sedang Mengunduh..`;
                else if (percentage < 80) message = `Mohon sabar kak`;
                else message = `Sedikit lagi kak`;
                elements.loadingText.innerHTML = `${message} <span style="color: greenyellow;">${percentage}%</span>`;
                if (percentage < 100) requestAnimationFrame(updateProgress);
            };
            requestAnimationFrame(updateProgress);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(value);
                loaded += value.length;
            }

            const blob = new Blob(chunks, { type: mediaType === 'video' ? 'video/mp4' : 'image/jpeg' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            const filenameMatch = elements.urlInput.value.match(/\/([\w-]+)(?:\?|$)/);
            const baseFilename = filenameMatch ? `social-${filenameMatch[1]}` : 'social-media';
            link.download = `${baseFilename}.${mediaType === 'video' ? 'mp4' : 'jpg'}`;

            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
                URL.revokeObjectURL(url);
                document.body.removeChild(link);
            }, 100);

            showNotification(`Unduhan ${mediaType === 'video' ? 'Video' : 'Gambar'} Selesai!`, 'success');
        } catch (error) {
            console.error('Download error:', error);
            showNotification(error.name === 'AbortError' ? 
                'Download timeout.' : 'Gagal mengunduh media.', 'error');
        } finally {
            hideSpinner();
            elements.downloadBtn.disabled = false;
        }
    };

    elements.fetchBtn?.addEventListener('click', () => {
        const url = elements.urlInput.value.trim();
        if (!url) {
            showNotification('Masukkan URL terlebih dahulu.', 'error');
            return;
        }
        fetchMediaData(url);
    });

    elements.urlInput?.addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            elements.fetchBtn.click();
        }
    });

    elements.downloadBtn?.addEventListener('click', () => {
        const url = elements.downloadBtn.getAttribute('data-url');
        const isVideo = elements.downloadBtn.textContent.includes('Video');
        downloadMedia(url, isVideo ? 'video' : 'image');
    });

    const processClipboard = async () => {
        try {
            const text = await navigator.clipboard.readText();
            const urlRegex = /(https?:\/\/(?:www\.)?(?:tiktok\.com|instagram\.com)\/[^\s]+)/i;
            const match = text.match(urlRegex);
            
            if (match && match[1]) {
                elements.urlInput.value = match[1];
                showNotification('URL dari clipboard ditemukan!', 'success');
            }
        } catch (error) {
            console.error('Clipboard error:', error);
        }
    };

    processClipboard();
});
