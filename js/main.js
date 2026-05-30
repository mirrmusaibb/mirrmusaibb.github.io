(function () {
  'use strict';

  function initAmbientCursor() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const root = document.documentElement;
    let cursorX = window.innerWidth / 2;
    let cursorY = window.innerHeight / 2;
    let targetX = cursorX;
    let targetY = cursorY;
    let rafId = null;

    if (reduced || coarsePointer) {
      root.style.setProperty('--cursor-x', `${cursorX}px`);
      root.style.setProperty('--cursor-y', `${cursorY}px`);
      root.style.setProperty('--mouse-x', '50%');
      root.style.setProperty('--mouse-y', '42%');
      return;
    }

    function animate() {
      cursorX += (targetX - cursorX) * 0.08;
      cursorY += (targetY - cursorY) * 0.08;
      root.style.setProperty('--cursor-x', `${cursorX}px`);
      root.style.setProperty('--cursor-y', `${cursorY}px`);
      root.style.setProperty('--mouse-x', `${(cursorX / window.innerWidth) * 100}%`);
      root.style.setProperty('--mouse-y', `${(cursorY / window.innerHeight) * 100}%`);
      rafId = requestAnimationFrame(animate);
    }

    window.addEventListener('pointermove', (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!rafId) animate();
    }, { passive: true });

    window.addEventListener('pointerleave', () => {
      targetX = window.innerWidth / 2;
      targetY = window.innerHeight / 2;
    });

    animate();
  }

  function initCardReflections() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const cards = document.querySelectorAll('.glass-card');

    cards.forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--card-x', `${x}%`);
        card.style.setProperty('--card-y', `${y}%`);
      }, { passive: true });
    });
  }

  function initKeyboardFocus() {
    document.body.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') document.body.classList.add('is-tabbing');
    });

    document.body.addEventListener('pointerdown', () => {
      document.body.classList.remove('is-tabbing');
    });
  }

  window.addEventListener('DOMContentLoaded', () => {
    initAmbientCursor();
    initCardReflections();
    initKeyboardFocus();

    if (window.MirObservatoryAnimations) {
      window.MirObservatoryAnimations.init();
    }
  });
})();
