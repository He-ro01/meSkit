const container = document.getElementById("swiperContainer");
let slides = [];
let nearPrevious = 0;
let nearNext = 2;
let currentIndex = 0;
let fetchedVideoIndex = 0;

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
    // slide.style.background = getRandomColor();
    slide.style.transform = "translateY(100%)";

    // Slide panel
    const panel = document.createElement("div");
    panel.className = "slide-panel";
    panel.innerHTML = `
    <div class = "bottom-right ">
        <div class = "profile-icon" onclick="showUserProfile()">👤</div>
        <i class="fi fi-rr-eye icon metered"><span class = "icon-text" style = "font-size:35px;">${Math.floor(Math.random() * 1000)}<span></i>
        <i class="fi fi-rr-heart icon metered"><span class = "icon-text" style = "font-size:35px;">${Math.floor(Math.random() * 1000)}<span></i>
        <i class="fi fi-rr-bookmark icon"></i>
        <i class="fi fi-rr-circle-ellipsis icon"></i>
    </div>
    <div class = "bottom-left">
    <div class = "name-description">
        <div class = "name-container">
            <span>John Doe</span>
        </div>
        <div class = "description-container">
            <span id = "description">
                Lorem, ipsum, long something something then the quick brown fox jumped over the lazy dog #quick #brown # fox
            </span>
        </div>
    </div>
    </div>
     
    `;

    slide.appendChild(panel);
    container.appendChild(slide);
    return slide;
}
function loadVideoIntoSlide(slide, videoData) {
    if (slide.querySelector("video")) {
        // Video already loaded, skip loading again
        return;
    }

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
        if (currentIndex + 1 >= fetched_videos.length) {
            await fetchVideo(); // Ensure we have space in array
        }

        const oldPrevious = slides[0];
        const newVisible = slides[2];
        const newNext = createSlide(currentIndex + 1);
        newNext.className += " next";

        slides[1].className = "swiper-slide previous";
        newVisible.className = "swiper-slide visible";

        slides = [slides[1], newVisible, newNext];
        oldPrevious.remove();

    } else if (direction === "down") {
        if (currentIndex === 0) {
            resetSlidePositions(0); // Snap back to original position
            return; // 🛑 Do nothing if already at the top
        }

        currentIndex--;

        const oldNext = slides[2];
        const newPrevious = createSlide(currentIndex - 1);
        newPrevious.className += " previous";
        newPrevious.style.transform = "translateY(-100%)";

        slides[1].className = "swiper-slide next";
        slides[0].className = "swiper-slide visible";

        slides = [newPrevious, slides[0], slides[1]];
        oldNext.remove();
    }


    // Load video if data already fetched
    const previousVideoData = fetched_videos[currentIndex - 1];
    const videoData = fetched_videos[currentIndex];
    const nextVideoData = fetched_videos[currentIndex + 1];
    if (previousVideoData && Object.keys(previousVideoData).length !== 0) {
        loadVideoIntoSlide(slides[0], previousVideoData);
    }
    if (nextVideoData && Object.keys(nextVideoData).length !== 0) {
        loadVideoIntoSlide(slides[2], nextVideoData);
    }

    if (videoData && Object.keys(videoData).length !== 0) {
        loadVideoIntoSlide(slides[1], videoData);
    }

    resetSlidePositions();
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
        if (!video || Object.keys(video).length === 0) {
            console.log("Loading video for index:", i);
            let newVideo = await loadURL();

            if (newVideo) {
                fetched_videos[i] = newVideo;

                // Load into correct slide if it's visible
                if (i === currentIndex - 1 && slides[0]) {
                    loadVideoIntoSlide(slides[0], newVideo);
                } else if (i === currentIndex && slides[1]) {
                    loadVideoIntoSlide(slides[1], newVideo);
                } else if (i === currentIndex + 1 && slides[2]) {
                    loadVideoIntoSlide(slides[2], newVideo);
                }
            }
        }
    }

    requestAnimationFrame(myLoop);
}


async function loadURL() {
    try {
        const res = await fetch("https://meskit-backend.onrender.com/fetch-video");
        const videoData = await res.json();
        return videoData; // not "res videoData;" — that was invalid syntax
    } catch (error) {
        retry = await loadURL();
        //  console.error("Failed to fetch video:", error, " retrying...");
        return retry;
    }
}
myLoop(); // Start the loop

// 🔥 Start when DOM is ready
window.addEventListener("DOMContentLoaded", initializeSlides);