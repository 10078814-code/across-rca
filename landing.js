(() => {
  const track = document.querySelector('.landing-track');
  const scene = track.querySelector('.landing-scene');
  const stage = scene.querySelector('.hero-stage');
  const wipe = track.querySelector('.plant-wipe');
  const hole = wipe.querySelector('.wipe-hole');
  const header = document.querySelector('.bar');
  const chapters = Array.from(header.querySelectorAll('nav a'), link => ({
    link,
    section: document.querySelector(link.hash)
  }));
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const covers = [...document.querySelectorAll('.chapter-cover')];

  const firstImage = stage.querySelector('.hero-media img');
  const previews = Array.from(stage.querySelectorAll('.hero-preview'));
  const slides = [
    {
      photo: firstImage.getAttribute('src'),
      caption: stage.querySelector('.hero-media figcaption').textContent,
      alt: firstImage.alt
    },
    ...previews.map(({dataset}) => ({...dataset, alt: dataset.caption}))
  ];
  const controls = stage.querySelector('.hero-controls');
  const count = controls.querySelector('.hero-count');
  const pause = controls.querySelector('[data-carousel="pause"]');
  const zoom = stage.querySelector('.hero-zoom');
  const copy = stage.querySelector('.hero');
  const pad = value => String(value).padStart(2, '0');
  let current = 0;
  let timer;
  let frame;
  let autoplay = !motion.matches;
  let landingVisible = true;
  let activeChapter;

  function showSlide(index) {
    current = (index + slides.length) % slides.length;
    previews.forEach((preview, i) => preview.classList.toggle('is-current', i + 1 === current));
    count.textContent = pad(current + 1) + ' / ' + pad(slides.length);
    zoom.setAttribute('aria-label', 'View site photo: ' + slides[current].alt);
  }

  function scheduleSlide() {
    clearInterval(timer);
    if (autoplay && landingVisible && !document.hidden && !document.querySelector('#image-viewer').open) {
      timer = setInterval(() => showSlide(current + 1), 6500);
    }
  }

  function updatePause() {
    pause.firstElementChild.textContent = autoplay ? 'Ⅱ' : '▶';
    pause.setAttribute('aria-label', autoplay ? 'Pause background slideshow' : 'Play background slideshow');
    scheduleSlide();
  }

  controls.addEventListener('click', event => {
    switch (event.target.closest('button')?.dataset.carousel) {
      case 'previous':
        showSlide(current - 1);
        break;
      case 'next':
        showSlide(current + 1);
        break;
      case 'pause':
        autoplay = !autoplay;
        updatePause();
        return;
      default:
        return;
    }
    scheduleSlide();
  });
  zoom.addEventListener('click', () => {
    const {photo, alt, caption} = slides[current];
    openImage(zoom, photo, alt, caption);
    scheduleSlide();
  });
  document.querySelector('#image-viewer').addEventListener('close', scheduleSlide);
  document.addEventListener('visibilitychange', scheduleSlide);

  const clamp = value => Math.min(1, Math.max(0, value));
  function ease(value) {
    const t = clamp(value);
    return t * t * (3 - 2 * t);
  }
  
  function updateWipe(progress, width, height) {
    const plantSize = Math.min(width * .76, height * .58, 580);
    const scale = plantSize / 80;
    const outerRadius = Math.hypot(width, height) / 2 + 28;
    const contraction = ease(progress / .68);
    const paperFill = ease((progress - .70) / .23);
    const titleReveal = ease((progress - .65) / .27);
  
    // Dilate the plant outline past the viewport, then contract it into the original silhouette.
    hole.setAttribute('transform', 'translate(' + width / 2 + ' ' + height / 2 +
      ') scale(' + scale + ') translate(-50 -49)');
    hole.setAttribute('stroke-width', 2 * outerRadius / scale * (1 - contraction));
    hole.setAttribute('opacity', 1 - paperFill);
    wipe.classList.toggle('is-visible', progress > 0);
  
    stage.style.setProperty('--hero-copy-opacity', 1 - ease(progress / .36));
    stage.style.setProperty('--hero-shade', 1 - contraction * .55);
    scene.style.setProperty('--overview-visible', progress >= .65 ? 'visible' : 'hidden');
    scene.style.setProperty('--overview-copy', titleReveal);
    scene.style.setProperty('--overview-shift', (1 - titleReveal) * 20 + 'px');
    scene.style.setProperty('--overview-texture', paperFill * .30);
  }
  function updateCovers(navHeight) {
    const viewport = document.documentElement.clientHeight;
    const entry = viewport * .94;
    const full = navHeight + viewport * .08;
    const available = Math.max(1, entry - full);
    for (const cover of covers) {
      const progress = clamp((entry - cover.getBoundingClientRect().top) / available);
      const expansion = ease(progress / .92);
      const title = ease((progress - .24) / .57);
      const description = ease((progress - .38) / .56);
      const inset = Math.min(0.17 * cover.clientWidth, 180) * (1 - expansion);
      cover.style.setProperty('--cover-inset', inset + 'px');
      cover.style.setProperty('--cover-photo-opacity', .45 + .55 * ease(progress / .66));
      cover.style.setProperty('--cover-title', title);
      cover.style.setProperty('--cover-title-offset', (1 - title) * 18 + 'px');
      cover.style.setProperty('--cover-description', description);
      cover.style.setProperty('--cover-description-offset', (1 - description) * 16 + 'px');
    }
  }
  
  function updateScroll() {
    frame = undefined;
    const stageHeight = stage.offsetHeight;
    const stageWidth = stage.clientWidth;
    const navHeight = header.offsetHeight;
    const trackTop = track.getBoundingClientRect().top;
    const duration = Math.max(1, track.offsetHeight - stageHeight);
    const progress = motion.matches ? 0 : clamp(-trackTop / duration);

    if (motion.matches) track.style.setProperty("--landing-height", stageHeight + "px");
    else {
      updateWipe(progress, stageWidth, stageHeight);
      updateCovers(navHeight);
    }

    const probe = navHeight + Math.min(80, innerHeight * .11);
    const chapter = chapters.findLast(({section}) => section.getBoundingClientRect().top <= probe)
      ?? (!motion.matches && progress >= .65 ? chapters[0] : undefined);
    if (activeChapter !== chapter) {
      activeChapter?.link.removeAttribute('aria-current');
      chapter?.link.setAttribute('aria-current', 'location');
      activeChapter = chapter;
    }
    header.classList.toggle('is-solid', motion.matches
      ? track.getBoundingClientRect().bottom <= navHeight
      : progress >= .29);

    const showLanding = motion.matches ? track.getBoundingClientRect().bottom > navHeight : progress < .34;
    if (landingVisible !== showLanding) {
      landingVisible = showLanding;
      scheduleSlide();
    }
    copy.inert = !showLanding && !copy.contains(document.activeElement);
  }

  function queueScroll() {
    if (frame === undefined) frame = requestAnimationFrame(updateScroll);
  }

  function updateMotion() {
    if (motion.matches) {
      for (const cover of covers) {
        for (const property of ['inset', 'photo-opacity', 'title', 'title-offset', 'description', 'description-offset']) {
          cover.style.removeProperty('--cover-' + property);
        }
      }
    }
    track.classList.toggle('has-wipe', !motion.matches);
    stage.style.removeProperty('--hero-copy-opacity');
    stage.style.removeProperty('--hero-shade');
    scene.style.removeProperty('--overview-texture');
    updateScroll();
  }

  motion.addEventListener('change', () => {
    autoplay = !motion.matches;
    updateMotion();
    updatePause();
  });
  addEventListener('scroll', queueScroll, {passive: true});
  addEventListener('resize', queueScroll);
  addEventListener('pageshow', queueScroll);
  copy.addEventListener('focusout', queueScroll);
  const layoutObserver = new ResizeObserver(queueScroll);
  for (const {section} of chapters) {
    layoutObserver.observe(section);
  }

  controls.hidden = false;
  zoom.hidden = false;
  zoom.setAttribute('aria-haspopup', 'dialog');
  showSlide(0);
  updateMotion();
  updatePause();
})();
