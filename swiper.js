const container = document.getElementById("swiperContainer");
let slides = [];
let currentIndex = 0;
let previousCount = 0;
let startY = 0;
let deltaY = 0;
let isDragging = false;
let maxFetchedIndex = 0;
let fetched_videos = [];
let slide_objects = [];

// Prefetch 3 videos initially
for (let i = 0; i < 3; i++) fetchVideo();

// Utility
const getRandomColor = () =>
    `hsl(${Math.floor(Math.random() * 360)}, 70%, 40%)`;

function createSlide(text, id) {
    const slide = document.createElement("div");
    slide.className = "swiper-slide";
    slide.id = id;
    slide.textContent = text;
    slide.style.background = getRandomColor();
    slide.style.transform = "translateY(100%)";

    const panel = document.createElement("div");
    panel.className = "slide-panel";
    panel.innerHTML = `
        <div class="profile-icon" onclick="showUserProfile()">👤</div>
        <div><span>👍</span><span>${Math.floor(Math.random() * 1000)}</span></div>
        <div><span>💬</span><span>${Math.floor(Math.random() * 500)}</span></div>
        <div><span>👁️</span><span>${Math.floor(Math.random() * 5000)}</span></div>
    `;
    slide.appendChild(panel);

    const videoIndex = currentIndex + slides.length - 1;
    if (slide_objects[videoIndex] && slide_objects[videoIndex].hlsUrl) {
        const video = document.createElement("video");
        video.controls = false;
        video.autoplay = false;
        video.loop = true;
        video.muted = true;
        video.style.width = "100%";
        video.style.height = "100%";
        video.style.objectFit = "cover";
        video.src = slide_objects[videoIndex].hlsUrl;
        slide.appendChild(video);

        // autoplay if this is the current slide
        if (slides.length === 1) {
            video.play();
        }
    }

    container.appendChild(slide);
    return slide;
}

function updateSlides(direction) {
    slides.forEach(slide => slide.style.transition = "none");

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

    prefetchVideoBuffer(currentIndex + 2);
    resetSlidePositions(0);
    onSlideReached();
}

function onSlideReached() {
    const video = slides[1].querySelector("video");
    if (video) {
        video.play();
    }
}

function resetSlidePositions(offsetPercent = 0) {
    slides.forEach((slide, index) => {
        slide.style.transition = "transform 0.3s ease";
        slide.style.transform = `translateY(${offsetPercent + (index - 1) * 100}%)`;
    });
}

async function fetchVideo() {
    try {
        const res = await fetch("https://meskit-backend.onrender.com/fetch-video");
        const videoData = await res.json();
        slide_objects.push(videoData);
        maxFetchedIndex++;
    } catch (error) {
        console.error("Failed to fetch video:", error, " retrying");
        setTimeout(fetchVideo, 1000);
    }
}

function prefetchVideoBuffer(targetIndex) {
    while (slide_objects.length <= targetIndex + 1) {
        fetchVideo();
    }
}

function dragSlide(offsetPercent) {
    slides.forEach((slide, index) => {
        slide.style.transition = "none";
        slide.style.transform = `translateY(${offsetPercent + (index - 1) * 100}%)`;
    });
}

// Touch Events
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
