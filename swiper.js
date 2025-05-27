const container = document.getElementById("swiperContainer");
let slides = [];
let currentIndex = 0;
let fetchedVideoIndex = 0;
let maxFetchedIndex = -1;
let previousCount = 0;
let startY = 0;
let deltaY = 0;
let isDragging = false;
let fetched_videos = [];
let video_objects = [];
const getRandomColor = () =>
    `hsl(${Math.floor(Math.random() * 360)}, 70%, 40%)`;

function createSlide(index) {
    const slide = document.createElement("div");
    slide.className = "swiper-slide";
    slide.id = `slide-${index}`;
    slide.style.background = getRandomColor();
    slide.style.transform = "translateY(100%)";

    // Slide panel
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
function loadVideoIntoSlide(slide, videoData) {
    // Video container
    const videoContainer = document.createElement("div");
    videoContainer.className = "video-container";

    const video = document.createElement("video");
    video.setAttribute("playsinline", "");
    video.setAttribute("muted", "");
    video.setAttribute("controls", "");
    video.style.width = "100%";
    video.style.height = "100%";

    if (videoData && typeof videoData === 'object' && Object.keys(videoData).length !== 0) {
        loadVideoWithHLS(video, videoData.hlsUrl);
    }

    videoContainer.appendChild(video);
    slide.appendChild(videoContainer);
    container.appendChild(slide);
}

function loadVideoWithHLS(videoEl, url) {
    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(videoEl);
    } else if (videoEl.canPlayType("application/vnd.apple.mpegurl")) {
        videoEl.src = url;
    }
}

async function fetchVideo() {
    fetched_videos.push({});
}

async function prefetchVideos(count = 5) {
    for (let i = 0; i < count; i++) {
        fetched_videos.push({});
    }
}

async function initializeSlides() {
    await prefetchVideos(5);
    const previous = createSlide(currentIndex - 1);
    const visible = createSlide(currentIndex);
    const next = createSlide(currentIndex + 1);

    previous.className += " previous";
    visible.className += " visible";
    next.className += " next";

    slides = [previous, visible, next];
    resetSlidePositions();
    videoData = fetched_videos[0];
    if (videoData && typeof videoData === 'object' && Object.keys(videoData).length !== 0)
        controlVideoPlayback();
}

function controlVideoPlayback() {
    slides.forEach((slide, i) => {
        const video = slide.querySelector("video");
        if (!video) return;
        if (i === 1) {
            video.play();
        } else {
            video.pause();
        }
    });
}

async function updateSlides(direction) {

    slides.forEach(slide => (slide.style.transition = "none"));

    if (direction === "up") {
        currentIndex++;
        if (currentIndex + 1 > maxFetchedIndex) {
            await fetchVideo();
        }

        const oldPrevious = slides[0];
        const newVisible = slides[2];
        const newNext = createSlide(currentIndex + 1);
        newNext.className += " next";

        slides[1].className = "swiper-slide previous";
        newVisible.className = "swiper-slide visible";

        slides = [slides[1], newVisible, newNext];
        oldPrevious.remove();

        if (videoData && typeof videoData === 'object' && Object.keys(videoData).length !== 0)
            loadVideoIntoSlide(fetched_videos[currentIndex], slides[0]);
    } else if (direction === "down" && currentIndex > 0) {
        currentIndex--;

        const oldNext = slides[2];
        const newPrevious = createSlide(currentIndex - 1);
        newPrevious.className += " previous";
        newPrevious.style.transform = "translateY(-100%)";

        slides[1].className = "swiper-slide next";
        slides[0].className = "swiper-slide visible";

        slides = [newPrevious, slides[0], slides[1]];
        oldNext.remove();
        if (videoData && typeof videoData === 'object' && Object.keys(videoData).length !== 0)
            loadVideoIntoSlide(fetched_videos[currentIndex], slides[0]);
    }
    console.log(currentIndex);
    resetSlidePositions();
    if (videoData && typeof videoData === 'object' && Object.keys(videoData).length !== 0)
        controlVideoPlayback();
}

function resetSlidePositions(offsetPercent = 0) {
    slides.forEach((slide, i) => {
        slide.style.transition = "transform 0.3s ease";
        slide.style.transform = `translateY(${offsetPercent + (i - 1) * 100}%)`;
    });
}

function dragSlide(offsetPercent) {
    slides.forEach((slide, i) => {
        slide.style.transition = "none";
        slide.style.transform = `translateY(${offsetPercent + (i - 1) * 100}%)`;
    });
}

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
let loading_vid = false;

async function myLoop() {
    for (let i = 0; i < fetched_videos.length; i++) {
        let video = fetched_videos[i];
        // Check if object is empty
        if (video && Object.keys(video).length === 0) {
            console.log("Loading video for index:");
            let newVideo = await loadURL();

            if (newVideo) {
                console.log(currentIndex, fetchedVideoIndex);
                if (fetchedVideoIndex == currentIndex - 1 && currentIndex > 0) {
                    loadVideoIntoSlide(slides[0], newVideo);
                }
                if (fetchedVideoIndex == currentIndex) {
                    loadVideoIntoSlide(slides[1], newVideo);
                }
                if (fetchedVideoIndex == currentIndex + 1) {
                    loadVideoIntoSlide(slides[2], newVideo);
                }
            }
            fetchedVideoIndex++;
        }
    }

    requestAnimationFrame(myLoop); // Schedule next frame
}

async function loadURL() {
    try {
        const res = await fetch("https://meskit-backend.onrender.com/fetch-video");
        const videoData = await res.json();
        return videoData; // not "res videoData;" — that was invalid syntax
    } catch (error) {
        await loadURL();
        console.error("Failed to fetch video:", error, " retrying...");
        return null;
    }
}
myLoop(); // Start the loop

// 🔥 Start when DOM is ready
window.addEventListener("DOMContentLoaded", initializeSlides);