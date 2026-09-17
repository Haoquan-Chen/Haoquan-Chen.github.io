const slides = [...document.querySelectorAll('.slide')].sort(
  (first, second) => Number(first.dataset.slide) - Number(second.dataset.slide),
);
const navItems = [...document.querySelectorAll('[data-slide-target]')];
const brandLink = document.querySelector('.topbar__brand');
const previousButton = document.querySelector('[data-action="previous-slide"]');
const nextButton = document.querySelector('[data-action="next-slide"]');
let activeIndex = 0;

function getSlideIndex(target) {
  if (typeof target === 'number') {
    return target;
  }

  return slides.findIndex((slide) => slide.id === target);
}

function showSlide(target, { updateHash = true, focus = false } = {}) {
  const nextIndex = getSlideIndex(target);

  if (nextIndex < 0 || nextIndex >= slides.length) {
    return;
  }

  activeIndex = nextIndex;

  slides.forEach((slide, index) => {
    const isActive = index === activeIndex;
    slide.classList.toggle('is-active', isActive);
    slide.setAttribute('aria-hidden', String(!isActive));
  });

  navItems.forEach((item) => {
    const isActive = item.dataset.slideTarget === slides[activeIndex].id;
    item.classList.toggle('is-active', isActive);

    if (isActive) {
      item.setAttribute('aria-current', 'page');
    } else {
      item.removeAttribute('aria-current');
    }
  });

  if (previousButton) {
    previousButton.disabled = activeIndex === 0;
  }

  if (nextButton) {
    nextButton.disabled = activeIndex === slides.length - 1;
  }

  if (updateHash && window.location.hash !== `#${slides[activeIndex].id}`) {
    history.replaceState(null, '', `#${slides[activeIndex].id}`);
  }

  slides[activeIndex].scrollTop = 0;

  if (focus) {
    slides[activeIndex].focus({ preventScroll: true });
  }
}

navItems.forEach((item) => {
  item.addEventListener('click', () => {
    showSlide(item.dataset.slideTarget, { focus: true });
  });
});

previousButton?.addEventListener('click', () => {
  showSlide(activeIndex - 1, { focus: true });
});

nextButton?.addEventListener('click', () => {
  showSlide(activeIndex + 1, { focus: true });
});

brandLink?.addEventListener('click', (event) => {
  event.preventDefault();
  showSlide('slide-1', { focus: true });
});

document.addEventListener('keydown', (event) => {
  if (!['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(event.key)) {
    return;
  }

  const direction = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1;
  const nextIndex = Math.min(Math.max(activeIndex + direction, 0), slides.length - 1);

  event.preventDefault();
  showSlide(nextIndex, { focus: true });
});

const initialSlide = window.location.hash.slice(1);
showSlide(slides.some((slide) => slide.id === initialSlide) ? initialSlide : 'slide-1', {
  updateHash: false,
});
