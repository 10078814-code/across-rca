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
      const progress = clamp((nav - micro.getBoundingClientRect().top) / travel) * 2.8;
      cards.forEach((card, i) => {
        if (mobile || motion.matches) { card.style.removeProperty('transform'); card.style.removeProperty('opacity'); return; }
        const entry = i === 0 ? 1 : clamp(progress - (i - 1) * 1.1);
        card.style.opacity = entry > 0 ? '1' : '0';
        card.style.transform = `translate(${(i - 1) * 15}px, ${(1 - entry) * 5}%) rotate(${[-6, 0, 6][i] + (1 - entry) * 16}deg)`;
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
