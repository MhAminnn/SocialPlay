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

    document.getElementById('loadingSpinner').style.display = 'flex';
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

            document.getElementById('loadingSpinner').style.display = 'none';
            document.getElementById('videoPreview').style.display = 'block';
            document.getElementById('downloadBtn').style.display = 'block';

            // Store video download URL for later use
            document.getElementById('downloadBtn').setAttribute('data-url', data.play || data.hdplay);
        } else {
            alert('No data found for this video.');
        }
    } catch (error) {
        console.error(error);
        document.getElementById('loadingSpinner').style.display = 'none';
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
        try {
            // Change button text
            const downloadBtn = document.getElementById('downloadBtn');
            downloadBtn.innerText = 'Memulai Unduhan ⚡';
            downloadBtn.disabled = true; // Disable button during download

            // Show loading spinner
            document.getElementById('loadingSpinner').style.display = 'flex';

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
            downloadBtn.innerText = 'Download Video';
            downloadBtn.disabled = false; // Re-enable button

            // Hide loading spinner
            document.getElementById('loadingSpinner').style.display = 'none';
        } catch (error) {
            console.error(error);
            alert('Error downloading video. Please try again.');
            document.getElementById('loadingSpinner').style.display = 'none';
        }
    }
});

// Function to show notification
function showNotification(message) {
    const notificationBox = document.getElementById('notificationBox');
    notificationBox.innerText = message;
    notificationBox.style.display = 'block'; // Show the notification
    notificationBox.style.right = '20px'; // Move into view
    notificationBox.style.opacity = '1'; // Make it visible

    setTimeout(() => {
        notificationBox.style.right = '-300px'; // Move out of view
        notificationBox.style.opacity = '0'; // Fade out
    }, 6000); // Keep it visible for 6 seconds
}

// Add enter key support for input
document.getElementById('urlInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const videoUrl = e.target.value;
        if (videoUrl) {
            fetchVideoData(videoUrl);
        } else {
            alert('Please enter a valid TikTok video URL.');
        }
    }
});

// Initialize loading spinner
document.getElementById('loadingSpinner').style.display = 'none';
document.getElementById('downloadBtn').style.display = 'none';

// Tombol Coba Sekarang
document.querySelector('.coba').addEventListener('click', () => {
    document.getElementById('urlInput').focus();
    // Scroll ke bagian input
    document.querySelector('.input-section').scrollIntoView({ behavior: 'smooth' });
});