(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const stacks = [...document.querySelectorAll('.scroll-stack')];
  const planting = document.querySelector('.botanical-planting');
  let frame;
  const clamp = n => Math.max(0, Math.min(1, n));
  function render() {
    frame = null;
    const mobile = innerWidth <= 760;
    const nav = document.querySelector('.bar').getBoundingClientRect().height;
    const micro = document.querySelector('.micro-track');
    if (micro) {
      const cards = [...micro.querySelectorAll('.material-card')];
      const travel = micro.offsetHeight - (innerHeight - nav);
      // Begin only after the complete exhibition stage is pinned below the nav.
      const progress = clamp((nav - micro.getBoundingClientRect().top) / travel) * 3.4;
      const stageHeight = micro.querySelector('.micro-stage').offsetHeight;
      cards.forEach((card, i) => {
        if (mobile || motion.matches) {
          card.style.removeProperty('transform');
          card.style.removeProperty('opacity');
          card.style.removeProperty('pointer-events');
          card.inert = false;
          return;
        }
        const entry = clamp((progress - i * 1.05) / .9);
        const eased = entry * entry * (3 - 2 * entry);
        const rise = (1 - eased) * (stageHeight + card.offsetHeight) * .65;
        // Keep cards opaque: their physical movement into the clipped stage reveals them.
        card.style.opacity = '1';
        card.style.pointerEvents = entry > .95 ? '' : 'none';
        card.inert = entry <= .95;
        card.style.transform = `translate(${(i - 1) * 15}px, ${rise}px) rotate(${[-6, 0, 6][i] + (1 - eased) * 12}deg)`;
      });
    }
    for (const stack of stacks) {
      if (stack.classList.contains('material-stack')) continue;
      const cards = [...stack.querySelectorAll('.stack-card')];
      cards.forEach((card, i) => {
        if (motion.matches || mobile) { card.style.removeProperty('transform'); return; }
        const next = cards[i + 1];
        const overlap = next ? clamp((innerHeight * .85 - next.getBoundingClientRect().top) / (innerHeight * .85 - nav - 30)) : 0;
        const entry = clamp((card.getBoundingClientRect().top - nav - 30) / innerHeight);
        const tilt = stack.classList.contains('material-stack') ? (i % 2 ? 3 : -3) * entry : 0;
        card.style.transform = `perspective(1600px) scale(${1 - overlap * .055}) rotateX(${-overlap * 5}deg) rotate(${tilt}deg)`;
      });
    }
    if (planting) {
      const distance = motion.matches ? 0 : Math.max(-180, Math.min(180, -planting.getBoundingClientRect().top * .12));
      planting.style.setProperty('--botanical-shift', distance + 'px');
    }
  }
  const request = () => { if (!frame) frame = requestAnimationFrame(render); };
  addEventListener('scroll', request, {passive: true});
  addEventListener('resize', request);
  motion.addEventListener('change', request);
  const entryObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting || entry.boundingClientRect.bottom <= 0) entry.target.classList.add('is-card-visible');
      else entry.target.classList.remove('is-card-visible');
    }
  }, {rootMargin: '0px 0px -5% 0px'});
  document.querySelectorAll('.stack-card').forEach(card => entryObserver.observe(card));
  render();
})();
