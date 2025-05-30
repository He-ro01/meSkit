const container = document.getElementById("swiperContainer");
let slides = [];
let nearPrevious = 0;
let nearNext = 2;
let currentIndex = 0;
let fetchedVideoIndex = 0;
let dirty = false;
let previousCount = 0;
let startY = 0;
let startX = 0;
let deltaY = 0;
let deltaX = 0;
let isDragging = false;
let fetched_videos = [];
let slide_objects = [{}];
let max_slide = -1;
let loaded_index = 0;
const getRandomColor = () =>
    `hsl(${Math.floor(Math.random() * 360)}, 70%, 40%)`;

function createSlide(index) {

    //this is a java workspace
    //check if the element slide_objects[index] exists, if it is, then create a new one and set slide created to true
    let slideCreated = false;
    console.log(`state of slide_objects ..2`)
    console.log(slide_objects);
    console.log(`creating slide @ ${index}`);
    if (slide_objects[index] == null) {
        console.log(`creating slide_object @ ${index} on the condition that slide_object[${index}] does not exist`);
        // Create a new Slide object and assign it
        slide_object = {
            index: index,
            description: ``,
            job: {
                cancelled: false,
                running: false,
                hlsInstance: null,
                cancel() {
                    if (this.running && !this.cancelled) {
                        this.cancelled = true;
                        if (this.hlsInstance) {
                            this.hlsInstance.destroy();
                            this.hlsInstance = null;
                        }
                        this.running = false;
                    }
                }
            }
        };
        slideCreated = true;
        //
        if (index == -1)
            slide_objects[0] = (slide_object);
        else
            slide_objects.push(slide_object);
    }
    //

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
        <i class="fi fi-rs-play icon metered"><span class = "icon-text">${Math.floor(Math.random() * 1000)}<span></i>
        <i class="fi fi-rs-heart icon metered"><span class = "icon-text">${Math.floor(Math.random() * 1000)}<span></i>
        <i class="fi fi-rs-bookmark icon metered"><span class = "icon-text">${Math.floor(Math.random() * 1000)}<span></i>
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
                                <div class = "user-profile-wrapper"><i class="fi fi-rr-user"></i></div></div> 
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
function loadVideoIntoSlide(slide, videoData, slide_object) {
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
    sliderContainer.style.display = "flex";
    sliderContainer.style.alignItems = "center";
    //
    sliderContainer.style.background = ` linear - gradient(to right,
    #FE0086 0 %,
    #FE0086 40 %,
    rgba(255, 255, 255, 0.46) 60 %,
    rgba(255, 255, 255, 0.48) 100 %)`

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
        rgba(255, 248, 248, 0.53) ${progress}%)`;
    });

    if (
        videoData &&
        typeof videoData === 'object' &&
        Object.keys(videoData).length !== 0 &&
        typeof videoData.videoUrl === 'string' &&
        videoData.videoUrl.trim() !== ''
    ) {

        loadVideoWithHLS(video, videoData.videoUrl, slide_object);
    }

    videoContainer.appendChild(video);
    videoContainer.appendChild(sliderContainer);
    videoContainer.appendChild(playButton);
    slide.appendChild(videoContainer);


    if (videoData.description) updateDescription(slide, videoData.description); else updateDescription(slide, ``)
    if (videoData.username) updateName(slide, videoData.username); else updateName(slide, `anoynimous`)
    if (videoData.imageUrl) updateProfileIcon(slide, videoData.imageUrl);
    //
    controlVideoPlayback();
}



// 

async function loadVideoWithHLS(videoEl, url, slide) {
    console.log(`and we are working with:`);
    console.log(slide);
    const job = slide.job;
    job.running = true;

    if (Hls.isSupported()) {
        const hls = new Hls();
        job.hlsInstance = hls;

        if (job.cancelled) {
            hls.destroy();
            job.running = false;
            return;
        }

        hls.loadSource(url);
        hls.attachMedia(videoEl);

        hls.on(Hls.Events.ERROR, () => {
            if (job.cancelled) {
                hls.destroy();
            }
        });
    } else if (videoEl.canPlayType("application/vnd.apple.mpegurl")) {
        if (!job.cancelled) {
            videoEl.src = url;
        }
    }
}


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
    console.log(`${currentIndex}----start ing with-----------------`);
    console.log(slide_objects);
    console.log(`${currentIndex}---------------------------`);
    if (direction === "up") {
        cancelJobByIndex(currentIndex - 1);
        currentIndex++;

        if (currentIndex + 5 >= fetched_videos.length) {
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
            resetSlidePositions(0);
            return;
        }

        cancelJobByIndex(currentIndex + 1);
        currentIndex--;

        const oldNext = slides[2];

        const newPrevious = createSlide(currentIndex - 1);
        newPrevious.className += " previous";

        const newVisible = slides[0];
        newVisible.className = "swiper-slide visible";

        slides[1].className = "swiper-slide next";

        slides = [newPrevious, newVisible, slides[1]];

        oldNext.remove();
    }

    resetSlidePositions();
    controlVideoPlayback();
    updateSystem();
    // Load video if data already fetched
    const previousVideoData = fetched_videos[currentIndex - 1];
    const videoData = fetched_videos[currentIndex];
    const nextVideoData = fetched_videos[currentIndex + 1];
    if (currentIndex - 1 >= 0 && previousVideoData.videoUrl && previousVideoData.videoUrl.endsWith(`m3u8`)) {
        console.log(`all slide objects`);
        console.log(slide_objects);
        console.log(`loading -1 with ${currentIndex - 1}`);
        //
        loadVideoIntoSlide(slides[0], previousVideoData, slide_objects[currentIndex - 1]);
    }

    if (nextVideoData.videoUrl && nextVideoData.videoUrl.endsWith(`m3u8`)) {
        console.log(`all slide objects`);
        console.log(slide_objects);
        console.log(`loading 1 with ${currentIndex + 1}`);
        console.log()
        loadVideoIntoSlide(slides[2], nextVideoData, slide_objects[currentIndex + 1]);
    }

    if (videoData.videoUrl && videoData.videoUrl.endsWith(`m3u8`)) {
        console.log(`all slide objects`);
        console.log(slide_objects);
        console.log(`loading 0 with ${currentIndex - 1}`);
        //
        loadVideoIntoSlide(slides[0], previousVideoData, slide_objects[currentIndex - 1]);
        //
        loadVideoIntoSlide(slides[1], videoData, slide_objects[currentIndex]);
    }
    console.log(slide_objects);


}
function cancelJobByIndex(index) {
    return;
    const slide = slide_objects.find(s => s.index === index);
    const job = slide?.job;

    if (job && job.running && typeof job.cancel === 'function') {
        job.cancel();
        console.log(`Cancelled running job for slide index ${index}`);
    } else if (job && !job.running) {
        console.warn(`Job for slide index ${index} exists but is not running.`);
    } else {
        console.warn(`No valid job found for slide index ${index}`);
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
    startX = e.touches[0].clientX;
    startTime = Date.now(); // Capture start time
    isDragging = true;
});

// Clamp function
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
let dragging_up = false;
let dragging_sideways = false;
// Touch move event listener
container.addEventListener("touchmove", (e) => {
    if (!isDragging) return;

    // Safety check for touch points
    if (!e.touches || e.touches.length === 0) return;

    e.preventDefault(); // Prevent scrolling while dragging (needs passive: false below)

    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;
    deltaY = currentY - startY;
    deltaX = currentX - startX;
    // Clamp to prevent dragging beyond the last loaded slide
    // console.log(`delta y: ${deltaY} current index: ${currentIndex} : ${currentIndex >= loaded_index + 1 && deltaY < 0}`);
    if (currentIndex >= loaded_index && deltaY < 0) {
        dragLegit = false;
        return;
    }

    if (Math.abs(deltaX) > Math.abs(deltaY) && !dragging_up) {
        dragLegit = false;
        dragging_sideways = true;
        return;

    }
    if (dragging_sideways) {
        dragLegit = false;
        return;
    }
    dragging_up = true;
    dragLegit = true;
    const percent = (deltaY / window.innerHeight) * 100;

    requestAnimationFrame(() => dragSlide(percent));
}); // Required for preventDefault to work


let averageVelocity = 0.5; // Typical speed in px/ms — adjust as needed

container.addEventListener("touchend", () => {
    dragging_up = false;
    dragging_sideways = false;
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
                loadVideoIntoSlide(slides[0], video, slide_objects[currentIndex - 1]);
            }
            else if (loaded_index === currentIndex) {
                loadVideoIntoSlide(slides[1], video, slide_objects[currentIndex]);
            }
            else if (loaded_index === currentIndex + 1) {
                loadVideoIntoSlide(slides[2], video, slide_objects[currentIndex + 1]);
            }
            else {
                //  loadHeadlessVideoWithHLS(video.videoUrl);
            }

            loaded_index++;
        } catch (err) {
            console.warn("Error fetching video:", err);
        }
    }
}

// 🔥 Start when DOM is ready
window.addEventListener("DOMContentLoaded", initializeSlides);