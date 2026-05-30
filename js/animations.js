(function () {
  'use strict';

  window.MirObservatoryAnimations = {
    init() {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const canvas = document.getElementById('neural-constellation');
      const vignette = document.querySelector('.orbital-vignette');

      const visibleElements = '.hero__title, .hero__tagline, .scroll-cue, .hero__halo, #neural-constellation, .orbital-vignette';

      if (!window.gsap || reduced) {
        document.querySelectorAll(visibleElements).forEach((node) => {
          node.style.opacity = node.classList.contains('orbital-vignette') ? '0.85' : '1';
        });
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      const intro = gsap.timeline({ defaults: { ease: 'power2.out' } });
      intro
        .to(canvas, { opacity: 0.46, duration: 2.2 }, 0)
        .to(vignette, { opacity: 1, duration: 2.6 }, 0.05)
        .fromTo('.hero__halo', { opacity: 0, scale: 1.04 }, { opacity: 0.56, scale: 1, duration: 2.8 }, 0.2)
        .fromTo('.hero__title', { y: 14, filter: 'blur(4px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.15 }, 0.9)
        .fromTo('.hero__tagline', { y: 20, filter: 'blur(6px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.25 }, 1.14)
        .fromTo('.scroll-cue', { y: 8 }, { y: 0, opacity: 1, duration: 1.05 }, 1.92);

      gsap.to('.scroll-cue i', {
        opacity: 0.35,
        repeat: -1,
        yoyo: true,
        duration: 2.6,
        ease: 'sine.inOut',
      });

      gsap.to('.hero__halo', {
        yPercent: 1.8,
        repeat: -1,
        yoyo: true,
        duration: 8.5,
        ease: 'sine.inOut',
      });

      gsap.utils.toArray('.reveal-block').forEach((block) => {
        gsap.from(block, {
          opacity: 0,
          y: 24,
          duration: 1.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: block,
            start: 'top 86%',
          },
        });
      });

      gsap.utils.toArray('.platform-card, .exploration-card').forEach((card, index) => {
        gsap.from(card, {
          opacity: 0,
          y: 28,
          duration: 0.95,
          delay: (index % 3) * 0.06,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
          },
        });
      });
    },
  };
})();
