const container = document.getElementById("swiperContainer");

let slideObjects = []; // [{ index, video, slideEl }]
let currentIndex = 0;
let previousCount = 0;
let startY = 0;
let deltaY = 0;
let isDragging = false;

const getRandomColor = () =>
    `hsl(${Math.floor(Math.random() * 360)}, 70%, 40%)`;

function createSlideObject(index, video = null) {
    const id = `slide-${Date.now()}`;
    const slide = document.createElement("div");
    slide.className = "swiper-slide";
    slide.id = id;
    slide.textContent = `Index ${index}`;
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
    container.appendChild(slide);

    return { index, video, slideEl: slide };
}

async function fetchVideoForSlide(slideObj) {
    try {
        const res = await fetch("https://meskit-backend.onrender.com/fetch-video");
        const videoData = await res.json();
        slideObj.video = videoData;
    } catch (error) {
        console.error("Failed to fetch video:", error, "retrying");
        setTimeout(() => fetchVideoForSlide(slideObj), 500); // retry after delay
    }
}

async function preloadSlides(centerIndex) {
    container.innerHTML = "";
    slideObjects = [];

    for (let i = -1; i <= 1; i++) {
        const index = centerIndex + i;
        const slideObj = createSlideObject(index);
        slideObjects.push(slideObj);
        fetchVideoForSlide(slideObj);
    }

    positionSlides(0);
}

function positionSlides(offsetPercent = 0) {
    slideObjects[0].slideEl.style.transition = "transform 0.3s ease";
    slideObjects[1].slideEl.style.transition = "transform 0.3s ease";
    slideObjects[2].slideEl.style.transition = "transform 0.3s ease";

    slideObjects[0].slideEl.style.transform = `translateY(${offsetPercent - 100}%)`;
    slideObjects[1].slideEl.style.transform = `translateY(${offsetPercent}%)`;
    slideObjects[2].slideEl.style.transform = `translateY(${offsetPercent + 100}%)`;
}

function dragSlide(offsetPercent) {
    slideObjects.forEach((obj, i) => {
        obj.slideEl.style.transition = "none";
    });

    slideObjects[0].slideEl.style.transform = `translateY(${offsetPercent - 100}%)`;
    slideObjects[1].slideEl.style.transform = `translateY(${offsetPercent}%)`;
    slideObjects[2].slideEl.style.transform = `translateY(${offsetPercent + 100}%)`;
}

async function updateSlides(direction) {
    slideObjects.forEach(obj => obj.slideEl.style.transition = "none");

    if (direction === "up") {
        const oldPrevious = slideObjects.shift();
        oldPrevious.slideEl.remove();

        const newIndex = ++currentIndex + 1;
        const newNext = createSlideObject(newIndex);
        slideObjects.push(newNext);
        fetchVideoForSlide(newNext);
    } else if (direction === "down" && currentIndex > 0) {
        const oldNext = slideObjects.pop();
        oldNext.slideEl.remove();

        const newIndex = --currentIndex - 1;
        const newPrevious = createSlideObject(newIndex);
        newPrevious.slideEl.style.transform = "translateY(-100%)";
        slideObjects.unshift(newPrevious);
        fetchVideoForSlide(newPrevious);
    }

    positionSlides(0);
}

// Touch controls
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
        requestAnimationFrame(() => positionSlides(-100));
        setTimeout(() => updateSlides("up"), 300);
    } else if (percent > threshold) {
        requestAnimationFrame(() => positionSlides(100));
        setTimeout(() => updateSlides("down"), 300);
    } else {
        requestAnimationFrame(() => positionSlides(0));
    }

    deltaY = 0;
});

// Initialize
preloadSlides(currentIndex);
