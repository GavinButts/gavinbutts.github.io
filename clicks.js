/* Decorative click bursts. No dependencies or interference with navigation. */
(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const symbols = ['+', '−', '×', '÷', '=', 'π', '∞', 'Σ'];
  const colors = ['#d63b60', '#007ea8', '#8752cc', '#d17b00', '#168563', '#d45229'];
  const active = new Set();
  const limit = 64;
  let lastBurst = -Infinity;
  let layer;

  function clearParticles() {
    for (const animation of active) animation.cancel();
    active.clear();
  }

  function burst(event) {
    // Keyboard activation has no click location; keep it free of decoration.
    if (reducedMotion.matches || event.detail === 0 || event.button !== 0 ||
        typeof Element.prototype.animate !== 'function') return;
    const now = performance.now();
    if (now - lastBurst < 80) return;
    lastBurst = now;

    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'math-burst-layer';
      layer.setAttribute('aria-hidden', 'true');
      document.body.append(layer);
    }

    const count = Math.min(9, limit - active.size);
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('span');
      particle.className = 'math-burst-symbol';
      particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      particle.style.color = colors[Math.floor(Math.random() * colors.length)];
      particle.style.left = `${event.clientX}px`;
      particle.style.top = `${event.clientY}px`;
      particle.style.fontSize = `${18 + Math.random() * 12}px`;
      layer.append(particle);

      const angle = (Math.PI * 2 * i / count) + (Math.random() - 0.5) * 0.5;
      const distance = 45 + Math.random() * 75;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance - 25;
      const rotation = (Math.random() - 0.5) * 110;
      const transform = (x, y, r, scale) =>
        `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${r}deg) scale(${scale})`;
      const animation = particle.animate([
        { transform: transform(0, 0, 0, 0.45), opacity: 0, offset: 0 },
        { transform: transform(dx * 0.2, dy * 0.2 - 5, rotation * 0.2, 1), opacity: 1, offset: 0.16 },
        { transform: transform(dx * 0.8, dy * 0.8, rotation * 0.8, 0.95), opacity: 0.8, offset: 0.65 },
        { transform: transform(dx, dy + 28, rotation, 0.6), opacity: 0, offset: 1 }
      ], { duration: 650 + Math.random() * 250, easing: 'ease-out' });
      active.add(animation);
      const cleanup = () => {
        particle.remove();
        active.delete(animation);
      };
      animation.onfinish = cleanup;
      animation.oncancel = cleanup;
    }
  }

  document.addEventListener('click', burst, { passive: true });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) clearParticles();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearParticles();
  });
})();
