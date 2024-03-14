const bannerSubs = document.querySelectorAll('.banner_sub_div');
const prevBanner = document.querySelector('.prev_banner');
const nextBanner = document.querySelector('.next_banner');

let currentIndex = 0;
let intervalId;

function autoSlide() {
    currentIndex = (currentIndex + 1) % bannerSubs.length;
    moveBanners();
}

intervalId = setInterval(autoSlide, 4000);

function moveBanners() {
    const offset = currentIndex * -100;
    bannerSubs.forEach((sub) => {
        sub.style.transform =`translateX(${offset}%)`;
    });
}

function stopAndResumeAutoSlide() {
    clearInterval(intervalId);
    setTimeout(() => {
        intervalId = setInterval(autoSlide, 4000);
    }, 1000);
}

prevBanner.addEventListener('click', () => {
    currentIndex = currentIndex === 0 ? bannerSubs.length - 1 : currentIndex - 1;
    moveBanners();
    stopAndResumeAutoSlide();
});

nextBanner.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % bannerSubs.length;
    moveBanners();
    stopAndResumeAutoSlide();
});