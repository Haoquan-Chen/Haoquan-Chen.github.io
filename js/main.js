const slides = [...document.querySelectorAll('.slide')];
const navItems = [...document.querySelectorAll('[data-slide-target]')];
const brandLink = document.querySelector('.topbar__brand');
const appShell = document.querySelector('.app-shell');
const sidebarToggle = document.querySelector('.sidebar-toggle');
const sidebarToggleLabel = sidebarToggle?.querySelector('.sidebar-toggle__label');
const sidebarToggleIcon = sidebarToggle?.querySelector('.sidebar-toggle__icon');
const previousButton = document.querySelector('[data-action="previous-slide"]');
const nextButton = document.querySelector('[data-action="next-slide"]');
const sidebarStorageKey = 'intern-summary-sidebar-collapsed';
let activeIndex = 0;

function setSidebarCollapsed(collapsed, { persist = true } = {}) {
  if (!appShell || !sidebarToggle) {
    return;
  }

  appShell.classList.toggle('is-sidebar-collapsed', collapsed);
  sidebarToggle.setAttribute('aria-expanded', String(!collapsed));
  sidebarToggle.setAttribute(
    'aria-label',
    collapsed ? 'Expand chapter navigation' : 'Collapse chapter navigation',
  );

  if (sidebarToggleLabel) {
    sidebarToggleLabel.textContent = collapsed ? 'EXPAND' : 'COLLAPSE';
  }

  if (sidebarToggleIcon) {
    sidebarToggleIcon.textContent = collapsed ? '→' : '←';
  }

  if (persist) {
    try {
      window.localStorage.setItem(sidebarStorageKey, String(collapsed));
    } catch {
      // Storage can be unavailable for local files; the control still works.
    }
  }
}

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

sidebarToggle?.addEventListener('click', () => {
  setSidebarCollapsed(!appShell?.classList.contains('is-sidebar-collapsed'));
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

let initialSidebarCollapsed = false;
try {
  initialSidebarCollapsed = window.localStorage.getItem(sidebarStorageKey) === 'true';
} catch {
  initialSidebarCollapsed = false;
}

setSidebarCollapsed(initialSidebarCollapsed, { persist: false });

const initialSlide = window.location.hash.slice(1);
showSlide(slides.some((slide) => slide.id === initialSlide) ? initialSlide : 'slide-1', {
  updateHash: false,
});
