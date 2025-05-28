const mainContainer = document.querySelector('.main-container');

function showUserProfile() {
    mainContainer.style.transform = 'translateX(-100vw)';
}

function showHome() {
    mainContainer.style.transform = 'translateX(0)';
}
function updateViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

window.addEventListener('resize', updateViewportHeight);
updateViewportHeight();
