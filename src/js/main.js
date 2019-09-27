const findNext = element => {
    let el = element.nextSibling;

    while (el && (!el.nodeName || el.nodeName[0] === '#')) {
        el = el.nextSibling;
    }

    return el;
};
const findPrev = element => {
    let el = element.previousSibling;

    while (el && (!el.nodeName || el.nodeName[0] === '#')) {
        el = el.previousSibling;
    }

    return el;
};

document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.getElementsByClassName('carousel')[0];

    if (carousel) {
        const prev = carousel.querySelector('.prev');
        const next = carousel.querySelector('.next');

        prev.addEventListener('click', () => {
            const activeImg = carousel.querySelector('.active');
            let prevImg = findPrev(activeImg);
            if (!prevImg) {
                prevImg = Array.prototype.slice.call(carousel.querySelectorAll('img')).pop();
            }

            activeImg.classList.remove('active');
            prevImg.classList.add('active');
        });
        next.addEventListener('click', () => {
            const activeImg = carousel.querySelector('.active');
            let nextImg = findNext(activeImg);
            if (!nextImg) {
                nextImg = carousel.querySelectorAll('img')[0];
            }

            activeImg.classList.remove('active');
            nextImg.classList.add('active');
        });
    }
});
