const page1 = document.getElementById("page1");
const page2 = document.getElementById("page2");

let currentPage = 1;
let isAnimating = false;
let videoIndex = 0;
let videos = [];
let wheelTimeout;

function clearPageVideos(pageElement) {
    const oldVideo = pageElement.querySelector('video');
    if (oldVideo) {
        oldVideo.pause();
        oldVideo.src = "";
        oldVideo.load();
    }
    pageElement.innerHTML = '';
}

function pauseCurrentVideo() {
    const currentPageElement = currentPage === 1 ? page1 : page2;
    const video = currentPageElement.querySelector('video');
    if (video) video.pause();
}

function loadVideoToPage(pageElement, videoData) {
    clearPageVideos(pageElement);

    if (!videoData || !videoData.videoUrl) {
        pageElement.innerHTML = '<p>No video available</p>';
        return;
    }

    const video = document.createElement('video');
    video.src = videoData.videoUrl;
    video.controls = true;
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.style.width = '100%';

    video.addEventListener('loadeddata', () => {
        video.currentTime = 0;
        video.play();
        console.log(`Video loaded: ${videoData.videoUrl}`);
    });

    pageElement.appendChild(video);
}
//
function loadVideoToPagePaused(pageElement, videoData) {
    clearPageVideos(pageElement);

    if (!videoData || !videoData.videoUrl) {
        pageElement.innerHTML = '<p>No video available</p>';
        return;
    }

    const video = document.createElement('video');
    video.src = videoData.videoUrl;
    video.controls = true;
    video.autoplay = false;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.style.width = '100%';

    video.addEventListener('loadeddata', () => {
        video.currentTime = 0;
        video.play();
        console.log(`Video loaded: ${videoData.videoUrl}`);
    });

    pageElement.appendChild(video);
}
//
function scrollUp() {
    if (isAnimating) return;
    if (videoIndex >= videos.length - 1) return;

    pauseCurrentVideo();
    isAnimating = true;
    videoIndex++;

    const nextPage = currentPage === 1 ? page2 : page1;
    loadVideoToPagePaused(nextPage, videos[videoIndex]);

    // Animate both pages moving up by 100vh
    page1.style.transition = page2.style.transition = "transform 0.3s ease";
    page1.style.transform = "translateY(-100vh)";
    page2.style.transform = "translateY(-100vh)";

    setTimeout(() => {
        // Reset transitions and positions after animation
        page1.style.transition = page2.style.transition = "none";
        page2.style.transform = "translateY(0)";
        page1.style.transform = "translateY(0)";
        loadVideoToPage(page1, videos[videoIndex]);
        isAnimating = false;

    }, 300);
}

function scrollDown() {
    if (isAnimating) return;
    if (videoIndex <= 0) return;

    pauseCurrentVideo();
    isAnimating = true;
    videoIndex--;

    const nextPage = currentPage === 1 ? page2 : page1;
    loadVideoToPagePaused(nextPage, videos[videoIndex]);

    // Animate both pages moving down by 100vh
    page1.style.transition = page2.style.transition = "transform 0.3s ease";
    page1.style.transform = "translateY(100vh)";
    page2.style.transform = "translateY(100vh)";

    setTimeout(() => {
        // Reset transitions and positions after animation
        page1.style.transition = page2.style.transition = "none";
        page2.style.transform = "translateY(0)";
        page1.style.transform = "translateY(0)";
        loadVideoToPage(page1, videos[videoIndex]);
        isAnimating = false;

    }, 300);
}

window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") scrollUp();
    else if (e.key === "ArrowUp") scrollDown();
});

window.addEventListener("wheel", (e) => {
    e.preventDefault();
    if (wheelTimeout) return; // throttle rapid scrolls

    if (e.deltaY > 0) scrollUp();
    else scrollDown();

    wheelTimeout = setTimeout(() => {
        wheelTimeout = null;
    }, 400); // slightly longer than transition time
}, { passive: false });

async function fetchVideos() {
    try {
        const response = await fetch('https://meskit-backend.onrender.com/fetch-videos'); // replace with actual API
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error('Error fetching videos:', err);
        return [];
    }
}

async function init() {
    videos = await fetchVideos();
    console.log('Fetched videos:', videos);

    console.log('loading:', videos);
    loadVideoToPage(page1, videos[0]);
    if (videos.length > 1) loadVideoToPage(page2, videos[1]);
}

init();
