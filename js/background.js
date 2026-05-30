(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.getElementById('neural-constellation');

  if (!canvas) return;
  if (prefersReducedMotion || !window.THREE) {
    canvas.style.opacity = '0.3';
    return;
  }

  const state = {
    width: window.innerWidth,
    height: window.innerHeight,
    mouseX: 0,
    mouseY: 0,
    targetX: 0,
    targetY: 0,
  };

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050505, 0.0017);

  const camera = new THREE.PerspectiveCamera(45, state.width / state.height, 1, 900);
  camera.position.z = 360;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setSize(state.width, state.height);
  renderer.setClearColor(0x000000, 0);

  function createGlowTexture() {
    const textureCanvas = document.createElement('canvas');
    textureCanvas.width = 256;
    textureCanvas.height = 256;
    const context = textureCanvas.getContext('2d');

    if (!context) return null;

    const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, 'rgba(255,255,255,0.55)');
    gradient.addColorStop(0.4, 'rgba(255,255,255,0.2)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');

    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);

    return new THREE.CanvasTexture(textureCanvas);
  }

  const glowTexture = createGlowTexture();
  if (!glowTexture) return;

  const glowGroup = new THREE.Group();
  const glows = [];
  const glowCount = state.width < 720 ? 3 : 5;

  for (let i = 0; i < glowCount; i += 1) {
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture,
        color: 0xf5f5f5,
        transparent: true,
        opacity: 0.08 + Math.random() * 0.05,
        depthWrite: false,
      }),
    );

    const scale = 170 + Math.random() * 180;
    sprite.scale.set(scale, scale, 1);
    sprite.position.set(
      (Math.random() - 0.5) * 500,
      (Math.random() - 0.5) * 320,
      -180 + Math.random() * 220,
    );

    sprite.userData = {
      baseX: sprite.position.x,
      baseY: sprite.position.y,
      baseZ: sprite.position.z,
      phase: Math.random() * Math.PI * 2,
      speed: 0.05 + Math.random() * 0.08,
      driftX: 12 + Math.random() * 16,
      driftY: 10 + Math.random() * 14,
      driftZ: 8 + Math.random() * 12,
      baseOpacity: sprite.material.opacity,
    };

    glows.push(sprite);
    glowGroup.add(sprite);
  }

  scene.add(glowGroup);

  const dustCount = state.width < 720 ? 30 : 48;
  const dustPositions = new Float32Array(dustCount * 3);
  const dustMeta = [];

  for (let i = 0; i < dustCount; i += 1) {
    dustPositions[i * 3] = (Math.random() - 0.5) * 620;
    dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 420;
    dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 360;
    dustMeta.push({
      phase: Math.random() * Math.PI * 2,
      speed: 0.08 + Math.random() * 0.11,
      x: dustPositions[i * 3],
      y: dustPositions[i * 3 + 1],
      z: dustPositions[i * 3 + 2],
    });
  }

  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));

  const dustMaterial = new THREE.PointsMaterial({
    color: 0xd4d4d4,
    size: state.width < 720 ? 1.6 : 1.3,
    transparent: true,
    opacity: 0.14,
    depthWrite: false,
  });

  const dust = new THREE.Points(dustGeometry, dustMaterial);
  scene.add(dust);

  function onResize() {
    state.width = window.innerWidth;
    state.height = window.innerHeight;
    camera.aspect = state.width / state.height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(state.width, state.height);
  }

  function onPointerMove(event) {
    state.targetX = (event.clientX / state.width - 0.5) * 2;
    state.targetY = (event.clientY / state.height - 0.5) * 2;
  }

  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('pointermove', onPointerMove, { passive: true });

  const clock = new THREE.Clock();

  function render() {
    const elapsed = clock.getElapsedTime();
    state.mouseX += (state.targetX - state.mouseX) * 0.025;
    state.mouseY += (state.targetY - state.mouseY) * 0.025;

    glows.forEach((glow) => {
      const data = glow.userData;
      glow.position.x = data.baseX + Math.sin(elapsed * data.speed + data.phase) * data.driftX + state.mouseX * 8;
      glow.position.y = data.baseY + Math.cos(elapsed * data.speed * 0.9 + data.phase) * data.driftY - state.mouseY * 6;
      glow.position.z = data.baseZ + Math.sin(elapsed * data.speed * 0.6 + data.phase) * data.driftZ;
      glow.material.opacity = data.baseOpacity + Math.sin(elapsed * 0.22 + data.phase) * 0.015;
    });

    for (let i = 0; i < dustCount; i += 1) {
      const info = dustMeta[i];
      dustPositions[i * 3] = info.x + Math.sin(elapsed * info.speed + info.phase) * 5;
      dustPositions[i * 3 + 1] = info.y + Math.cos(elapsed * info.speed * 0.9 + info.phase) * 4;
      dustPositions[i * 3 + 2] = info.z + Math.sin(elapsed * info.speed * 0.7 + info.phase) * 3;
    }

    dustGeometry.attributes.position.needsUpdate = true;

    glowGroup.rotation.y = state.mouseX * 0.08;
    glowGroup.rotation.x = state.mouseY * 0.04;

    camera.position.x += (state.mouseX * 14 - camera.position.x) * 0.02;
    camera.position.y += (-state.mouseY * 10 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  render();
})();
