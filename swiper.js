const container = document.getElementById("swiperContainer");
let slides = [];
let nearPrevious = 0;
let nearNext = 2;
let currentIndex = 0;
let fetchedVideoIndex = 0;
let dirty = false;
let previousCount = 0;
let startY = 0;
let deltaY = 0;
let isDragging = false;
let fetched_videos = [];
let slide_objects = [{}];
let loaded_index = 0;
const getRandomColor = () =>
    `hsl(${Math.floor(Math.random() * 360)}, 70%, 40%)`;

function createSlide(index) {
    slide_objects.push({
        index: index,
        description: ``
    });

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
       
        <i class="fi fi-rs-play icon metered"><span class = "icon-text" style = "font-size:35px;">${Math.floor(Math.random() * 1000)}<span></i>
        <i class="fi fi-rs-heart icon metered"><span class = "icon-text" style = "font-size:35px;">${Math.floor(Math.random() * 1000)}<span></i>
        <i class="fi fi-rs-bookmark icon metered"><span class = "icon-text" style = "font-size:35px;">${Math.floor(Math.random() * 1000)}<span></i>
        <i class="fi fi-rs-circle-ellipsis icon unmetered"></i>
    </div>
    <div class = "bottom-left">
        <div class = "name-description">
            <div class = "name-container">
                <span class = "name-text"> <div class = "profile-icon">
                    <div class = "user-profile-wrapper"><i class="fi fi-rr-user"></i></div></div> 
                       <div class = "description loading-placeholder">
                            <div class="skeleton-line short"></div>
                        </div>
                        <div class = "follow-icon-wrapper"> Follow
                    </div>
                </span>
            </div>
            <div class = "description-container">
                <span class = "description-text text" >
                   <div class = "description loading-placeholder">
                     <div class="skeleton-line long"></div>
                          <div class="skeleton-line short"></div>
                   </div>
                </span>
               
            </div >
        </div >
    </div >`;

    slide.appendChild(panel);
    container.appendChild(slide);
    return slide;
}

function updateName(slide, newName) {
    if (!slide) {
        console.warn("Slide not provided");
        return;
    }

    const nameSpan = slide.querySelector(".name-text");
    if (!nameSpan) {
        console.warn("No .name-text element found within the slide");
        return;
    }



    // If no existing text node was found, append it
    nameSpan.innerHTML = `<div class = "profile-icon">
                                <div class = "user-profile-wrapper"><i class="fi fi-rr-user"></div></div> 
                                    ${newName} 
                                <div class = "follow-icon-wrapper"> Follow
                            </div>`
}

function updateProfileIcon(slide, imageUrl) {
    const profileIcon = slide.querySelector(".user-profile-wrapper");
    if (!profileIcon) return;

    profileIcon.innerHTML = `<img src="${imageUrl}" alt="Profile Image" "> </div>`;
}


function getSlideObjectByIndex(index) {
    return slide_objects.find(obj => obj.index === index) || null;
}


//
function loadVideoIntoSlide(slide, videoData) {
    if (!slide || slide.querySelector("video")) {
        return;
    }

    const videoContainer = document.createElement("div");
    videoContainer.className = "video-container";
    videoContainer.style.position = "relative";

    const video = document.createElement("video");
    video.setAttribute("playsinline", "");
    video.setAttribute("muted", "");
    video.controls = false;
    video.style.width = "100%";
    video.style.height = "100%";
    video.style.display = "block";

    // Slider container
    const sliderContainer = document.createElement("div");
    sliderContainer.className = "video-slider-container";
    sliderContainer.style.position = "absolute";
    sliderContainer.style.bottom = "0";
    sliderContainer.style.left = "0";
    sliderContainer.style.width = "100%";
    sliderContainer.style.zIndex = "2";
    sliderContainer.style.height = "5px"; // Optional: some padding
    sliderContainer.style.display = "flex";
    sliderContainer.style.alignItems = "center";
    //
    sliderContainer.style.background = ` linear - gradient(to right,
    #FE0086 0 %,
    #FE0086 40 %,
    rgba(0, 0, 255, 0) 60 %,
    rgba(0, 0, 255, 0) 100 %)`

    //
    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = 0;
    slider.max = 100;
    slider.value = 0;
    slider.className = "video-slider";
    slider.style.width = "100%";
    slider.style.margin = "0";

    sliderContainer.appendChild(slider);

    const playButton = document.createElement("div");
    playButton.innerHTML = `<i class="fi fi-sr-play"></i>`;
    playButton.className = "play-button";
    playButton.style.position = "absolute";
    playButton.style.top = "50%";
    playButton.style.left = "50%";
    playButton.style.transform = "translate(-50%, -50%)";
    playButton.style.fontSize = "48px";
    playButton.style.color = "white";
    playButton.style.zIndex = "3";
    playButton.style.cursor = "pointer";
    playButton.style.display = "none";

    video.addEventListener("click", () => {
        if (video.paused) video.play();
        else video.pause();
    });

    video.addEventListener("pause", () => {
        playButton.style.display = "block";
    });
    video.addEventListener("play", () => {
        playButton.style.display = "none";
    });

    playButton.addEventListener("click", () => {
        video.play();
    });

    video.addEventListener("timeupdate", () => {
        slider.value = (video.currentTime / video.duration) * 100;
    });

    slider.addEventListener("input", () => {
        video.currentTime = (slider.value / 100) * video.duration;
    });
    video.addEventListener("timeupdate", () => {
        const progress = (video.currentTime / video.duration) * 100;
        slider.value = progress;

        // Update gradient background based on progress
        sliderContainer.style.background = `linear-gradient(to right,
        #FE0086 ${progress}%,
        rgba(255, 255, 255, 0.1) ${progress}%)`;
    });

    if (
        videoData &&
        typeof videoData === 'object' &&
        Object.keys(videoData).length !== 0 &&
        typeof videoData.videoUrl === 'string' &&
        videoData.videoUrl.trim() !== ''
    ) {

        loadVideoWithHLS(video, videoData.videoUrl);
    }

    videoContainer.appendChild(video);
    videoContainer.appendChild(sliderContainer);
    videoContainer.appendChild(playButton);
    slide.appendChild(videoContainer);


    if (videoData.description != null) updateDescription(slide, videoData.description); else updateDescription(slide, ``)
    if (videoData.username != null) updateName(slide, videoData.username); else updateName(slide, `anoynimous`)
    if (videoData.imageUrl != null) updateProfileIcon(slide, videoData.imageUrl);
    //
    controlVideoPlayback();
}



// 
git 
async function loadHeadlessVideoWithHLS(url) {
    return;
    if (Hls.isSupported()) {
        const hls = new Hls();
        console.log("loading headlessly: " + url);
        await hls.loadSource(url);
        console.log(`loaded`);
    }
}
function removeSlideObjectByIndex(indexToRemove) {
    const i = slide_objects.findIndex(obj => obj.index === indexToRemove);
    if (i !== -1) {
        slide_objects.splice(i, 1);

    } else {

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
    updateSystem();
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

        // Only interact if metadata is loaded
        if (video.readyState < 2) {
            // Attach a one-time listener to play/pause when it's ready
            video.addEventListener("loadeddata", () => {
                if (i === 1) {
                    video.play().catch(err => console.warn("Play error:", err));
                } else {
                    video.pause();
                }
            }, { once: true });
            return;
        }

        // If already ready, handle immediately
        if (i === 1) {
            video.play().catch(err => console.warn("Play error:", err));
        } else {
            video.pause();
        }
    });
}


async function updateSlides(direction) {
    slides.forEach(slide => (slide.style.transition = "none"));

    if (direction === "up") {
        currentIndex++;
        if (currentIndex + 5 >= fetched_videos.length) {
            await fetchVideo(); // Ensure we have space in array

        }

        const oldPrevious = slides[0];
        removeSlideObjectByIndex(currentIndex - 2);
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
        removeSlideObjectByIndex(currentIndex + 2);
        const newPrevious = createSlide(currentIndex - 1);
        newPrevious.className += " previous";
        newPrevious.style.transform = "translateY(-100%)";

        slides[1].className = "swiper-slide next";
        slides[0].className = "swiper-slide visible";

        slides = [newPrevious, slides[0], slides[1]];

        oldNext.remove();
    }

    resetSlidePositions();
    controlVideoPlayback();
    updateSystem();
    // Load video if data already fetched
    const previousVideoData = fetched_videos[currentIndex - 1];
    const videoData = fetched_videos[currentIndex];
    const nextVideoData = fetched_videos[currentIndex + 1];
    if (previousVideoData != {} && previousVideoData.videoUrl.endsWith(`m3u8`)) {
        loadVideoIntoSlide(slides[0], previousVideoData);
    }
    if (!nextVideoData.empty && nextVideoData.videoUrl.endsWith(`m3u8`)) {
        loadVideoIntoSlide(slides[2], nextVideoData);
    }

    if (!videoData.empty && videoData.videoUrl.endsWith(`m3u8`)) {
        loadVideoIntoSlide(slides[1], videoData);
    }


}


function resetSlidePositions(offsetPercent = 0) {
    slides.forEach((slide, i) => {
        slide.style.transition = "transform 0.3s ease";
        slide.style.transform = `translateY(${offsetPercent + (i - 1) * 100}%)`;
    });
}
function toggleDescription(toggleBtn) {


    const descriptionContainer = toggleBtn.closest(".description-container");
    const textSpan = descriptionContainer.querySelector(".description-text.text");
    const slide = toggleBtn.closest(".swiper-slide");

    if (!slide || !slide.id) {
        console.warn("Slide or slide ID not found");
        return;
    }

    // Extract index from ID like "slide-3"
    const slideIdMatch = slide.id.match(/slide-(\d+)/);
    if (!slideIdMatch) {
        console.warn("Slide ID format invalid:", slide.id);
        return;
    }

    const slideIndex = parseInt(slideIdMatch[1], 10);

    description = getSlideObjectByIndex(slideIndex).description;

    const videoData = fetched_videos[slideIndex];


    const isExpanded = toggleBtn.textContent.trim().toLowerCase() === "show less";

    if (isExpanded) {
        // Collapse
        textSpan.innerHTML = `${description.slice(0, 55) + "......"} <span class = "description-text toggle" onclick="toggleDescription(this)">show more</span>`;
        toggleBtn.textContent = "show more";
    } else {
        // Expand
        textSpan.innerHTML = `${description}     <span class = "description-text toggle" onclick="toggleDescription(this)">show less</span>`;
        toggleBtn.textContent = "show less";
    }

}
function updateDescription(slide, desc) {
    if (!slide || !slide.id) {
        console.warn("Slide or slide ID not found");
        return;
    }

    const slideIdMatch = slide.id.match(/slide-(\d+)/);
    if (!slideIdMatch) {
        console.warn("Slide ID format invalid:", slide.id);
        return;
    }

    const slideIndex = parseInt(slideIdMatch[1], 10);

    // Update in slide_objects
    const slideObj = getSlideObjectByIndex(slideIndex);
    if (slideObj) {
        slideObj.description = desc;
    } else {
        console.warn("No slide object found for index", slideIndex);
        return;
    }

    // Update in DOM
    const textSpan = slide.querySelector(".description-text.text");
    if (!textSpan) {
        console.warn("Description text span not found in slide");
        return;
    }

    if (desc.length > 55) {
        // Add truncation and toggle
        textSpan.innerHTML = `
            ${desc.slice(0, 55)}......
            <span class="description-text toggle" onclick="toggleDescription(this)">show more</span>
        `;
    } else {
        // Just show full text (no toggle)
        textSpan.textContent = desc;
    }
}

//
let startTime = 0;
let endTime = 0;
let dragLegit = false;
// Function to move slides based on drag offset percentage
function dragSlide(offsetPercent) {
    slides.forEach((slide, i) => {
        slide.style.transition = "none";
        slide.style.transform = `translateY(${offsetPercent + (i - 1) * 100}%)`;
    });
}

container.addEventListener("touchstart", (e) => {
    startY = e.touches[0].clientY;
    startTime = Date.now(); // Capture start time
    isDragging = true;
});

// Clamp function
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// Touch move event listener
container.addEventListener("touchmove", (e) => {
    if (!isDragging) return;

    // Safety check for touch points
    if (!e.touches || e.touches.length === 0) return;

    e.preventDefault(); // Prevent scrolling while dragging (needs passive: false below)

    const currentY = e.touches[0].clientY;
    deltaY = currentY - startY;

    // Clamp to prevent dragging beyond the last loaded slide
    // console.log(`delta y: ${deltaY} current index: ${currentIndex} : ${currentIndex >= loaded_index + 1 && deltaY < 0}`);
    if (currentIndex >= loaded_index && deltaY < 0) {
        dragLegit = false;
        return;
    }
    dragLegit = true;
    const percent = (deltaY / window.innerHeight) * 100;

    requestAnimationFrame(() => dragSlide(percent));
}); // Required for preventDefault to work


let averageVelocity = 2; // Typical speed in px/ms — adjust as needed

container.addEventListener("touchend", () => {
    if (!dragLegit) return;
    if (!isDragging) return;
    isDragging = false;
    endTime = Date.now();

    const timeElapsed = endTime - startTime;
    const absDeltaY = Math.abs(deltaY);
    const velocity = absDeltaY / timeElapsed; // pixels per ms

    // Speed multiplier (1 = average, >1 = fast, <1 = slow)
    let speedMultiplier = velocity / averageVelocity;

    // Optional: Clamp the multiplier to prevent extremes
    speedMultiplier = Math.max(0.5, Math.min(speedMultiplier, 3));



    // Use it to adjust your threshold
    const baseThreshold = 25;
    const dynamicThreshold = baseThreshold / speedMultiplier;

    const percent = (deltaY / window.innerHeight) * 100;

    if (percent < -dynamicThreshold) {
        requestAnimationFrame(() => resetSlidePositions(-100));
        setTimeout(() => updateSlides("up"), 300);
    } else if (percent > dynamicThreshold) {
        requestAnimationFrame(() => resetSlidePositions(100));
        setTimeout(() => updateSlides("down"), 300);
    } else {
        requestAnimationFrame(() => resetSlidePositions(0));
    }

    deltaY = 0;
}); loading_vid = false;
function updateSystem() {
    urlLoopLoad();
}
// LOOP A: Fetch videos if not already fetched
async function urlLoopLoad() {
    let process_id = currentIndex;
    for (let i = 0; i < 5; i++) {
        startLoading();
    }
}

// LOOP B: Process videos that haven’t been converted to HLS
async function startLoading() {

    video = fetched_videos[loaded_index];
    if (!video || Object.keys(video).length === 0) {
        try {
            const res = await fetch("https://meskit-backend.onrender.com/fetch-video");
            const videoData = await res.json();

            //
            fetched_videos[loaded_index] = video = videoData;
            //

            //
            if (loaded_index === currentIndex - 1) {
                loadVideoIntoSlide(slides[0], video);
            }
            else if (loaded_index === currentIndex) {
                loadVideoIntoSlide(slides[1], video);
            }
            else if (loaded_index === currentIndex + 1) {
                loadVideoIntoSlide(slides[2], video);
            }
            else {
                loadHeadlessVideoWithHLS(video.videoUrl);
            }

            loaded_index++;
        } catch (err) {
            console.warn("Error fetching video:", err);
        }
    }
}

// 🔥 Start when DOM is ready
window.addEventListener("DOMContentLoaded", initializeSlides);