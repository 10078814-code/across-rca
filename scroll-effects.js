(() => {
  if (!('IntersectionObserver' in window)) return;

  const imageSelectors = [
    '.journey-stage figure',
    '.proposal-layout figure',
    '.prototype-studies figure',
    '.overview-photo',
    '.accordion-gallery',
    '.species-tile',
    '.sketch-card figure',
    '.annotated-details figure'
  ];
  const textSelectors = [
    '.section-heading > *',
    '.journey-copy',
    '.research-layout > *',
    '.word-origin',
    '.overview-copy > *',
    '.chapter .subhead',
    '.site-notes',
    '.columns > article',
    '.species-gallery > p',
    '.species-profile',
    '.sketch-card > :is(h3, p, dl)',
    '.outcome-note',
    '.guide-list > li',
    '.footer-grid > div'
  ];
  const selector = [...imageSelectors, ...textSelectors].join(',');
  const imageSelector = imageSelectors.join(',');
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting || entry.boundingClientRect.bottom <= 0) {
        entry.target.classList.add('scroll-revealed');
      } else if (entry.boundingClientRect.top >= (entry.rootBounds?.bottom ?? window.innerHeight)) {
        entry.target.classList.remove('scroll-revealed');
      }
    }
  }, { rootMargin: '0px 0px -12% 0px' });

  for (const element of document.querySelectorAll(selector)) {
    element.classList.add('scroll-reveal');
    if (element.matches(imageSelector)) element.classList.add('scroll-reveal-image');
    observer.observe(element);
  }
})();
