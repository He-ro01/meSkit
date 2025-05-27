const container = document.getElementById("swiperContainer");

// Global state
let slides = [];
let currentIndex = 0;
let previousCount = 0;
let startY = 0;
let deltaY = 0;
let isDragging = false;

// Video data
let fetched_videos = [];      // Prefetched video data
let maxFetchedIndex = -1;     // Track how many we've fetched

// Utility to get a random background color for testing
const getRandomColor = () =>
    `hsl(${Math.floor(Math.random() * 360)}, 70%, 40%)`;

// Create a slide with a unique ID
function createSlide(text, id) {
    const slide = document.createElement("div");
    slide.className = "swiper-slide";
    slide.id = id;
    slide.textContent = text;
    slide.style.background = getRandomColor();
    slide.style.transform = "translateY(100%)";

    // Create UI panel
    const panel = document.createElement("div");
    panel.className = "slide-panel";
    panel.innerHTML = `
        <div class="profile-icon" onclick="showUserProfile()">👤</div>
        <div><span>👍</span><span>${Math.floor(Math.random() * 1000)}</span></div>
        <div><span>💬</span><span>${Math.floor(Math.random() * 500)}</span></div>
        <div><span>👁️</span><span>${Math.floor(Math.random() * 5000)}</span></div>
      `;
    slide.appendChild(panel);
    container.appendChild(slide);
    return slide;
}

// Attach a video to a slide using HLS.js
function attachVideoToSlide(slide, hlsUrl, shouldAutoplay = false) {
    if (slide.querySelector("video")) return; // Already added

    const video = document.createElement("video");
    video.controls = false;
    video.playsInline = true;
    video.autoplay = shouldAutoplay;
    video.muted = true;

    // Load via HLS.js
    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = hlsUrl;
    }

    slide.appendChild(video);
}

// Load and play video only for the current visible slide
function onSlideReached() {
    slides.forEach((slide, i) => {
        const video = slide.querySelector("video");
        if (!video) return;
        if (i === 1) {
            video.play().catch(() => { });
        } else {
            video.pause();
        }
    });
}

// Main function to update slides based on swipe direction
function updateSlides(direction) {
    slides.forEach((slide) => (slide.style.transition = "none"));

    if (direction === "up") {
        const oldPrevious = slides[0];
        const newVisible = slides[2];
        const newNext = createSlide(`Index ${++currentIndex + 1}`, `slide-${Date.now()}`);
        newNext.className = "swiper-slide next";

        slides[1].id = `previous-${String(previousCount++).padStart(2, "0")}`;
        slides[1].className = "swiper-slide previous";
        newVisible.className = "swiper-slide visible";

        slides = [slides[1], newVisible, newNext];
        oldPrevious.remove();
    } else if (direction === "down" && currentIndex > 0) {
        const oldNext = slides[2];
        const newPrevious = createSlide(`Index ${--currentIndex - 1}`, `slide-${Date.now()}`);
        newPrevious.className = "swiper-slide previous";
        newPrevious.style.transform = "translateY(-100%)";

        slides[1].className = "swiper-slide next";
        slides[0].className = "swiper-slide visible";

        slides = [newPrevious, slides[0], slides[1]];
        oldNext.remove();
    }

    // Always prefetch 3 videos ahead
    while (fetched_videos.length < currentIndex + 3) {
        fetchVideo();
    }

    // Attach videos if available
    slides.forEach((slide, i) => {
        const index = currentIndex - 1 + i;
        const videoData = fetched_videos[index];
        if (videoData) {
            attachVideoToSlide(slide, videoData.hlsUrl, i === 1);
        }
    });

    resetSlidePositions(0);
    onSlideReached();
}

// Drag slide manually based on offset percentage
function dragSlide(offsetPercent) {
    slides.forEach((slide) => (slide.style.transition = "none"));
    slides[0].style.transform = `translateY(${offsetPercent - 100}%)`;
    slides[1].style.transform = `translateY(${offsetPercent}%)`;
    slides[2].style.transform = `translateY(${offsetPercent + 100}%)`;
}

// Animate back to a fixed slide position
function resetSlidePositions(offsetPercent = 0) {
    slides.forEach((slide) => (slide.style.transition = "transform 0.3s ease"));
    slides[0].style.transform = `translateY(${offsetPercent - 100}%)`;
    slides[1].style.transform = `translateY(${offsetPercent}%)`;
    slides[2].style.transform = `translateY(${offsetPercent + 100}%)`;
}

// Fetch a video and store in memory
async function fetchVideo() {
    try {
        const res = await fetch("https://meskit-backend.onrender.com/fetch-video");
        const videoData = await res.json();
        fetched_videos.push(videoData);
        maxFetchedIndex++;
    } catch (error) {
        console.error("Failed to fetch video:", error, " retrying...");
        fetchVideo(); // retry on failure
    }
}

// Init first 3 slides and videos
async function init() {
    for (let i = 0; i < 3; i++) {
        const slide = createSlide(`Index ${i}`, `slide-${i}`);
        slides.push(slide);
        if (fetched_videos.length <= i) await fetchVideo();
    }

    // Apply video to initial slides
    slides.forEach((slide, i) => {
        const videoData = fetched_videos[i];
        if (videoData) attachVideoToSlide(slide, videoData.hlsUrl, i === 1);
    });

    slides[0].className = "swiper-slide previous";
    slides[1].className = "swiper-slide visible";
    slides[2].className = "swiper-slide next";

    resetSlidePositions();
    onSlideReached();
}

// Handle touch gestures
container.addEventListener("touchstart", (e) => {
    startY = e.touches[0].clientY;
    isDragging = true;
});

container.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    deltaY = currentY - startY;
    const percent = (deltaY / window.innerHeight) * 100;
    requestAnimationFrame(() => dragSlide(percent));
});

container.addEventListener("touchend", () => {
    if (!isDragging) return;
    isDragging = false;

    const threshold = 25;
    const percent = (deltaY / window.innerHeight) * 100;

    if (percent < -threshold) {
        requestAnimationFrame(() => resetSlidePositions(-100));
        setTimeout(() => updateSlides("up"), 300);
    } else if (percent > threshold) {
        requestAnimationFrame(() => resetSlidePositions(100));
        setTimeout(() => updateSlides("down"), 300);
    } else {
        requestAnimationFrame(() => resetSlidePositions(0));
    }

    deltaY = 0;
});

// Start it up
init();

// Stub for profile click
function showUserProfile() {
    alert("User profile clicked.");
}