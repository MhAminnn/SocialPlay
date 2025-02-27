// Seleksi elemen-elemen yang diperlukan
const menuToggle = document.getElementById('menuToggle');
const fullscreenMenu = document.getElementById('fullscreenMenu');
const closeMenu = document.getElementById('closeMenu');

// Event listener untuk membuka menu
menuToggle.addEventListener('click', () => {
    fullscreenMenu.classList.add('active');
    // Tambahkan class untuk mencegah scroll pada body saat menu terbuka
    document.body.style.overflow = 'hidden';
});

// Event listener untuk menutup menu
closeMenu.addEventListener('click', () => {
    fullscreenMenu.classList.remove('active');
    // Kembalikan scroll pada body
    document.body.style.overflow = '';
});

// Tutup menu saat mengklik di luar menu
document.addEventListener('click', (e) => {
    if (!fullscreenMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        fullscreenMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Tambahkan event listener untuk menutup menu saat item menu diklik
const menuItems = document.querySelectorAll('.menu-item');
menuItems.forEach(item => {
    item.addEventListener('click', () => {
        fullscreenMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});

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

// Video data fetching
async function fetchVideoData(videoUrl) {
    const apiKey = '5e42e42d02msh2e7abfe7aed9d46p149460jsnb67dbb68e538';
    const apiHost = 'tiktok-scraper7.p.rapidapi.com';

    const options = {
        method: 'GET',
        url: 'https://tiktok-scraper7.p.rapidapi.com/',
        params: {
            url: videoUrl,
            hd: '1'
        },
        headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': apiHost
        }
    };

    showSpinner("Sedang Mencari..."); // Tampilkan spinner untuk pencarian
    document.getElementById('videoPreview').style.display = 'none';

    try {
        const response = await axios.request(options);
        console.log(response.data); // Log the response data for debugging
        const data = response.data.data;

        if (data) {
            // Update the UI with the fetched data
            document.getElementById('authorName').innerText = data.author.nickname || 'Unknown';
            document.getElementById('likeCount').innerText = data.digg_count || '0';
            document.getElementById('commentCount').innerText = data.comment_count || '0';
            
            if (data.cover) {
                document.getElementById('previewImage').src = data.cover;
            }

            hideSpinner(); // Sembunyikan spinner setelah data berhasil diambil
            document.getElementById('videoPreview').style.display = 'block';
            document.getElementById('downloadBtn').style.display = 'block';

            // Store video download URL for later use
            document.getElementById('downloadBtn').setAttribute('data-url', data.play || data.hdplay);
        } else {
            alert('No data found for this video.');
            hideSpinner(); // Sembunyikan spinner jika tidak ada data
        }
    } catch (error) {
        console.error(error);
        hideSpinner(); // Sembunyikan spinner jika terjadi kesalahan
        alert('Error fetching video data. Please try again.');
    }
}

// Add event listeners
document.getElementById('fetchBtn').addEventListener('click', () => {
    const videoUrl = document.getElementById('urlInput').value;
    if (videoUrl) {
        fetchVideoData(videoUrl);
    } else {
        alert('Please enter a valid TikTok video URL.');
    }
});

// Add download functionality
document.getElementById('downloadBtn').addEventListener('click', async () => {
    const downloadUrl = document.getElementById('downloadBtn').getAttribute('data-url');
    if (downloadUrl) {
        showSpinner("Sedang Mengunduh Harap Bersabar:)");// Tampilkan spinner untuk pengunduhan
        try {
            // Fetch the video file
            const response = await fetch(downloadUrl);
            if (!response.ok) throw new Error('Network response was not ok');

            // Create a blob from the response
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // Create a temporary link element
            const link = document.createElement('a');
            link.href = url;
            link.download = 'video.mp4'; // Set the download filename
            document.body.appendChild(link); // Append to the body
            link.click(); // Programmatically click the link to trigger the download
            document.body.removeChild(link); // Remove the link after triggering download

            // Show notification
            showNotification('Download completed successfully!');

            // Reset button text and state
            document.getElementById('downloadBtn').innerText = 'Download Video';
            document.getElementById('downloadBtn').disabled = false; // Re-enable button

            // Sembunyikan spinner setelah selesai mengunduh
            hideSpinner();
        } catch (error) {
            console.error(error);
            alert('Error downloading video. Please try again.');
            hideSpinner(); // Sembunyikan spinner jika terjadi kesalahan
        }
    }
});

// Fungsi untuk menampilkan notifikasi
function showNotification(message) {
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
        notification.style.backgroundColor = '#28a745';
        notification.style.color = 'white';
        notification.style.borderRadius = '5px';
        notification.style.zIndex = '9999';
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s ease-in-out';
        document.body.appendChild(notification);
    }
    
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