const page1 = document.getElementById("page1");
const page2 = document.getElementById("page2");

let currentPage = 1;
let isAnimating = false;
let videoIndex = 0;
let videos = [];
let wheelTimeout;

function clearPageVideos(pageElement) {
    const oldVideo = pageElement.querySelector("video");
    if (oldVideo) {
        oldVideo.pause();
        oldVideo.src = "";
        oldVideo.load();
    }
    pageElement.innerHTML = "";
}

function pauseCurrentVideo() {
    const currentPageElement = currentPage === 1 ? page1 : page2;
    const video = currentPageElement.querySelector("video");
    if (video) video.pause();
}

function loadVideoToPage(pageElement, videoData, autoplay = true) {
    clearPageVideos(pageElement);

    if (!videoData || !videoData.videoUrl) {
        pageElement.innerHTML = "<p>No video available</p>";
        return;
    }

    const video = document.createElement("video");
    video.src = "mov_bbb.mp4";
    video.controls = true;
    video.autoplay = autoplay;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "auto";
    video.style.width = "100%";
    video.playsInline - true; // For iOS compatibility
    // On loadeddata, if autoplay requested, try to play
    video.addEventListener("loadeddata", () => {
        video.currentTime = 0;
        if (autoplay) {
            video.play().catch(() => {
                // Autoplay failed (likely on mobile), will require user gesture
                console.log("Autoplay prevented, waiting for user interaction.");
            });
        }
        console.log(`Video loaded: ${videoData.videoUrl}`);
    });

    pageElement.innerHTML = "<p>"video"<p>"; // Clear previous content
}

function switchToPage(newPageIndex) {
    // Swap currentPage and preload videos accordingly
    pauseCurrentVideo();
    isAnimating = true;
    videoIndex = newPageIndex;

    const nextPage = currentPage === 1 ? page2 : page1;
    // Load video to nextPage but paused, so ready for animation
    loadVideoToPage(nextPage, videos[videoIndex], false);

    // Animate pages moving depending on scroll direction
    // We will handle this in scrollUp and scrollDown functions
}

function scrollUp() {
    if (isAnimating || videoIndex >= videos.length - 1) return;
    isAnimating = true;
    videoIndex++;

    const nextPage = currentPage === 1 ? page2 : page1;

    // Prepare nextPage paused
    loadVideoToPage(nextPage, videos[videoIndex], false);

    // Animate pages up
    page1.style.transition = page2.style.transition = "transform 0.3s ease";
    page1.style.transform = "translateY(-100vh)";
    page2.style.transform = "translateY(-100vh)";

    setTimeout(() => {
        // Reset positions
        page1.style.transition = page2.style.transition = "none";
        page1.style.transform = "translateY(0)";
        page2.style.transform = "translateY(0)";

        // Swap pages: the nextPage becomes currentPage visually
        // So load video to the visible page and update currentPage
        if (currentPage === 1) {
            loadVideoToPage(page1, videos[videoIndex]);
            currentPage = 1; // page1 stays visible
        } else {
            loadVideoToPage(page2, videos[videoIndex]);
            currentPage = 2;
        }

        isAnimating = false;
    }, 300);
}

function scrollDown() {
    if (isAnimating || videoIndex <= 0) return;
    isAnimating = true;
    videoIndex--;

    const nextPage = currentPage === 1 ? page2 : page1;

    loadVideoToPage(nextPage, videos[videoIndex], false);

    // Animate pages down
    page1.style.transition = page2.style.transition = "transform 0.3s ease";
    page1.style.transform = "translateY(100vh)";
    page2.style.transform = "translateY(100vh)";

    setTimeout(() => {
        page1.style.transition = page2.style.transition = "none";
        page1.style.transform = "translateY(0)";
        page2.style.transform = "translateY(0)";

        if (currentPage === 1) {
            loadVideoToPage(page1, videos[videoIndex]);
            currentPage = 1;
        } else {
            loadVideoToPage(page2, videos[videoIndex]);
            currentPage = 2;
        }

        isAnimating = false;
    }, 300);
}

// Throttle wheel event
window.addEventListener(
    "wheel",
    (e) => {
        e.preventDefault();
        if (wheelTimeout) return;

        if (e.deltaY > 0) scrollUp();
        else scrollDown();

        wheelTimeout = setTimeout(() => {
            wheelTimeout = null;
        }, 400);
    },
    { passive: false }
);

// Keyboard controls
window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") scrollUp();
    else if (e.key === "ArrowUp") scrollDown();
});

// Mobile touch swipe support
let touchStartY = 0;
let touchCurrentY = 0;
let isSwiping = false;

window.addEventListener("touchstart", (e) => {
    if (isAnimating) return;
    if (e.touches.length !== 1) return; // single finger only
    touchStartY = e.touches[0].clientY;
    isSwiping = true;
});

window.addEventListener("touchmove", (e) => {
    if (!isSwiping) return;
    touchCurrentY = e.touches[0].clientY;

    // Calculate swipe distance & apply transform to pages to follow finger
    const deltaY = touchCurrentY - touchStartY;

    // Limit transform to prevent excessive movement
    const limitedDelta = Math.max(Math.min(deltaY, window.innerHeight), -window.innerHeight);

    // Move pages accordingly depending on currentPage
    if (currentPage === 1) {
        page1.style.transition = "none";
        page2.style.transition = "none";
        page1.style.transform = `translateY(${limitedDelta}px)`;
        page2.style.transform = `translateY(${limitedDelta}px)`;
    } else {
        page2.style.transition = "none";
        page1.style.transition = "none";
        page2.style.transform = `translateY(${limitedDelta}px)`;
        page1.style.transform = `translateY(${limitedDelta}px)`;
    }
});

window.addEventListener("touchend", (e) => {
    if (!isSwiping) return;
    isSwiping = false;

    const deltaY = touchCurrentY - touchStartY;
    const threshold = window.innerHeight / 4; // swipe must be at least 25% screen height

    // Reset transforms with animation
    page1.style.transition = page2.style.transition = "transform 0.3s ease";

    if (deltaY < -threshold) {
        // swipe up - scroll up
        scrollUp();
    } else if (deltaY > threshold) {
        // swipe down - scroll down
        scrollDown();
    } else {
        // Not enough swipe, revert positions
        page1.style.transform = "translateY(0)";
        page2.style.transform = "translateY(0)";
    }
});

// Unlock video playback on mobile after user interaction
function unlockVideoPlayback() {
    const currentPageElement = currentPage === 1 ? page1 : page2;
    const video = currentPageElement.querySelector("video");
    if (video) {
        video.play().catch(() => {
            // Autoplay still blocked
        });
    }
    window.removeEventListener("touchstart", unlockVideoPlayback);
    window.removeEventListener("scroll", unlockVideoPlayback);
}
window.addEventListener("touchstart", unlockVideoPlayback, { once: true });
window.addEventListener("scroll", unlockVideoPlayback, { once: true });

// Fetch videos and init
async function fetchVideos() {
    try {
        const response = await fetch(
            "https://meskit-backend.onrender.com/fetch-videos"
        ); // your API
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error("Error fetching videos:", err);
        return [];
    }
}

async function init() {
    videos = await fetchVideos();
    if (!videos.length) {
        page1.innerHTML = "<p>No videos found.</p>";
        return;
    }

    loadVideoToPage(page1, videos[0], true);

    if (videos.length > 1) {
        // preload second video but paused
        loadVideoToPage(page2, videos[1], false);
    }
}

init();
