/* =========================================================
   js/robot3d.js
   ---------------------------------------------------------
   Exotic Salon premium 3D concierge robot.

   - Three.js is vendored locally so there is no CDN dependency.
   - Obsidian, dark-plum and champagne-gold materials with
     studio reflections, glowing champagne eyes and articulated
     idle motion.
   - The robot is decorative; all chat behaviour stays in
     js/chatbot.js.
   ========================================================= */

import * as THREE from "./vendor/three.module.min.js";

const GOLD = 0xd8b476;
const GOLD_LIGHT = 0xffe9bd;
const GOLD_DEEP = 0x9a6c36;
const PLUM = 0x2b1026;
const PLUM_DARK = 0x10060e;
const OBSIDIAN = 0x08060a;
const EYE = 0xf4ce8b;

function makeGlowTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.22, "rgba(255,255,255,0.82)");
  gradient.addColorStop(0.55, "rgba(255,255,255,0.25)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function glowSprite(texture, color, size, opacity) {
  const material = new THREE.SpriteMaterial({
    map: texture,
    color: color,
    transparent: true,
    opacity: opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(size, size, 1);
  return sprite;
}

function mesh(geometry, material, position) {
  const item = new THREE.Mesh(geometry, material);
  if (position) item.position.set(position[0], position[1], position[2]);
  return item;
}

function createStudioEnvironment(renderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0x050308);

  function panel(color, width, height, position, rotation) {
    const material = new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide
    });
    const item = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
    item.position.set(position[0], position[1], position[2]);
    item.rotation.set(rotation[0], rotation[1], rotation[2]);
    envScene.add(item);
  }

  /* A tiny warm studio: soft key, champagne rim, plum fill. */
  panel(0xfff2d8, 7, 4, [0, 2.4, 6], [0, Math.PI, 0]);
  panel(0xffd092, 5, 1.4, [5.5, 1.2, 0.5], [0, -Math.PI / 2, 0]);
  panel(0x5b2449, 5, 4, [-5.5, 0.5, 0.5], [0, Math.PI / 2, 0]);
  panel(0xffe4b0, 8, 2, [0, 6, 0], [Math.PI / 2, 0, 0]);
  panel(0x26101f, 7, 4, [0, -4.5, 0], [-Math.PI / 2, 0, 0]);

  const texture = pmrem.fromScene(envScene, 0.04).texture;
  pmrem.dispose();

  envScene.traverse(function (item) {
    if (item.geometry) item.geometry.dispose();
    if (item.material) item.material.dispose();
  });

  return texture;
}

export function mountRobot3D(canvas) {
  if (!canvas) return null;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
  } catch (error) {
    return null;
  }

  const reducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const engineLabel = "three.js r" + THREE.REVISION;
  canvas.setAttribute("data-engine", engineLabel);
  if (canvas.parentElement) {
    canvas.parentElement.setAttribute("data-engine", engineLabel);
  }
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0.16, 7.2);
  camera.lookAt(0, 0.12, 0);

  let environment = null;
  try {
    environment = createStudioEnvironment(renderer);
    scene.environment = environment;
  } catch (error) {
    /* Studio reflections are a bonus; the studio lights below remain. */
    environment = null;
  }

  scene.add(new THREE.HemisphereLight(0xffe8c6, 0x120712, 1.1));
  scene.add(new THREE.AmbientLight(0x6d4b62, 0.55));

  const keyLight = new THREE.DirectionalLight(0xfff0d2, 2.8);
  keyLight.position.set(3.4, 4.6, 5.8);
  scene.add(keyLight);

  const goldRim = new THREE.PointLight(0xffd08a, 3.4, 10, 2);
  goldRim.position.set(-3.2, 1.4, 3.1);
  scene.add(goldRim);

  const plumFill = new THREE.PointLight(0xb34383, 2.1, 10, 2);
  plumFill.position.set(3.3, -0.6, 2.2);
  scene.add(plumFill);

  const eyeLight = new THREE.PointLight(0xffdca0, 1.4, 3.2, 2);
  eyeLight.position.set(0, 0.75, 1.2);
  scene.add(eyeLight);

  const glowTexture = makeGlowTexture();

  const shell = new THREE.MeshPhysicalMaterial({
    color: OBSIDIAN,
    metalness: 0.72,
    roughness: 0.2,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    envMapIntensity: 1.25
  });

  const shellSoft = new THREE.MeshPhysicalMaterial({
    color: 0x150b13,
    metalness: 0.58,
    roughness: 0.3,
    clearcoat: 0.8,
    clearcoatRoughness: 0.22,
    envMapIntensity: 0.95
  });

  const plum = new THREE.MeshPhysicalMaterial({
    color: PLUM,
    metalness: 0.62,
    roughness: 0.22,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    envMapIntensity: 1.15
  });

  const visorMaterial = new THREE.MeshPhysicalMaterial({
    color: PLUM_DARK,
    metalness: 0.72,
    roughness: 0.045,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    envMapIntensity: 1.6
  });

  const gold = new THREE.MeshPhysicalMaterial({
    color: GOLD,
    metalness: 1,
    roughness: 0.17,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.65
  });

  const goldDeep = new THREE.MeshStandardMaterial({
    color: GOLD_DEEP,
    metalness: 0.92,
    roughness: 0.32,
    envMapIntensity: 1.1
  });

  const goldGlow = new THREE.MeshBasicMaterial({ color: GOLD_LIGHT });
  const eyeMaterial = new THREE.MeshBasicMaterial({ color: EYE });

  const robot = new THREE.Group();
  robot.position.y = 0.04;
  robot.scale.setScalar(0.96);
  scene.add(robot);

  const aura = glowSprite(glowTexture, 0xb07843, 2.5, 0.2);
  aura.position.set(0, 0.18, -0.7);
  robot.add(aura);

  const body = new THREE.Group();
  body.position.y = -0.45;
  body.scale.set(1.08, 1, 1.04);
  robot.add(body);

  /* Torso and layered armour. */
  const chest = mesh(new THREE.SphereGeometry(0.58, 56, 36), shell, [0, 0, 0]);
  chest.scale.set(1, 0.82, 0.64);
  body.add(chest);

  const chestPlate = mesh(new THREE.SphereGeometry(0.46, 44, 30), plum, [0, -0.03, 0.33]);
  chestPlate.scale.set(1, 0.76, 0.32);
  body.add(chestPlate);

  const chestTrim = mesh(
    new THREE.TorusGeometry(0.3, 0.014, 8, 44, Math.PI),
    gold,
    [0, 0.09, 0.47]
  );
  chestTrim.rotation.z = Math.PI;
  body.add(chestTrim);

  const chestRing = mesh(
    new THREE.TorusGeometry(0.145, 0.014, 8, 42),
    gold,
    [0, -0.03, 0.48]
  );
  body.add(chestRing);

  const chestInner = mesh(
    new THREE.TorusGeometry(0.085, 0.007, 6, 32),
    goldGlow,
    [0, -0.03, 0.49]
  );
  body.add(chestInner);

  const chestCore = mesh(
    new THREE.SphereGeometry(0.037, 20, 16),
    goldGlow,
    [0, -0.03, 0.5]
  );
  body.add(chestCore);

  const chestGlow = glowSprite(glowTexture, GOLD_LIGHT, 0.52, 0.46);
  chestGlow.position.set(0, -0.03, 0.53);
  body.add(chestGlow);

  const waist = mesh(
    new THREE.CylinderGeometry(0.3, 0.22, 0.34, 36),
    shellSoft,
    [0, -0.58, 0]
  );
  body.add(waist);

  const waistRingTop = mesh(
    new THREE.TorusGeometry(0.3, 0.012, 8, 40),
    goldDeep,
    [0, -0.4, 0]
  );
  waistRingTop.rotation.x = Math.PI / 2;
  body.add(waistRingTop);

  const waistRingBottom = mesh(
    new THREE.TorusGeometry(0.235, 0.011, 8, 40),
    gold,
    [0, -0.75, 0]
  );
  waistRingBottom.rotation.x = Math.PI / 2;
  body.add(waistRingBottom);

  const spine = mesh(
    new THREE.CylinderGeometry(0.042, 0.055, 0.24, 16),
    goldDeep,
    [0, -0.88, 0]
  );
  body.add(spine);

  const spineCore = mesh(
    new THREE.CylinderGeometry(0.015, 0.02, 0.2, 12),
    goldGlow,
    [0, -0.88, 0]
  );
  body.add(spineCore);

  /* Neck and collar. */
  const neck = mesh(
    new THREE.CylinderGeometry(0.135, 0.165, 0.32, 28),
    shellSoft,
    [0, 0.44, 0]
  );
  body.add(neck);

  const collar = mesh(
    new THREE.TorusGeometry(0.19, 0.014, 8, 40),
    gold,
    [0, 0.3, 0]
  );
  collar.rotation.x = Math.PI / 2;
  body.add(collar);

  const neckRing = mesh(
    new THREE.TorusGeometry(0.168, 0.01, 7, 36),
    goldDeep,
    [0, 0.51, 0]
  );
  neckRing.rotation.x = Math.PI / 2;
  body.add(neckRing);

  /* Shoulders and articulated arms. */
  const shoulders = [];
  [-1, 1].forEach(function (side) {
    const shoulder = mesh(
      new THREE.SphereGeometry(0.23, 32, 22),
      shell,
      [side * 0.58, -0.11, 0]
    );
    shoulder.scale.set(1.15, 0.72, 0.92);
    body.add(shoulder);

    const shoulderTrim = mesh(
      new THREE.TorusGeometry(0.17, 0.011, 7, 30),
      gold,
      [side * 0.69, -0.11, 0]
    );
    shoulderTrim.rotation.y = Math.PI / 2;
    body.add(shoulderTrim);
    shoulders.push(shoulder);
  });

  const arms = [];
  [-1, 1].forEach(function (side) {
    const arm = new THREE.Group();
    arm.position.set(side * 0.67, -0.27, 0);
    arm.rotation.z = side * 0.17;
    body.add(arm);

    const upper = mesh(
      new THREE.CapsuleGeometry(0.07, 0.28, 6, 18),
      shellSoft,
      [0, -0.18, 0]
    );
    upper.scale.set(1, 1, 0.9);
    arm.add(upper);

    const cuff = mesh(
      new THREE.TorusGeometry(0.078, 0.01, 6, 20),
      side > 0 ? gold : goldDeep,
      [0, -0.32, 0]
    );
    cuff.rotation.x = Math.PI / 2;
    arm.add(cuff);

    const hand = mesh(
      new THREE.SphereGeometry(0.105, 22, 16),
      shell,
      [0, -0.43, 0]
    );
    hand.scale.set(0.92, 1, 0.86);
    arm.add(hand);

    const palm = mesh(
      new THREE.SphereGeometry(0.026, 12, 10),
      goldGlow,
      [0, -0.47, 0.08]
    );
    arm.add(palm);

    arm.userData.side = side;
    arms.push(arm);
  });

  /* Head. */
  const head = new THREE.Group();
  head.position.set(0, 0.72, 0);
  head.scale.setScalar(0.9);
  robot.add(head);

  const skull = mesh(new THREE.SphereGeometry(0.68, 64, 44), shell, [0, 0, 0]);
  skull.scale.set(1, 1, 0.9);
  head.add(skull);

  const backSeam = mesh(
    new THREE.TorusGeometry(0.66, 0.007, 6, 64),
    goldDeep,
    [0, 0, -0.08]
  );
  backSeam.rotation.y = Math.PI / 2;
  backSeam.scale.set(1, 1, 0.9);
  head.add(backSeam);

  const visor = mesh(
    new THREE.SphereGeometry(0.55, 56, 38),
    visorMaterial,
    [0, -0.015, 0.49]
  );
  visor.scale.set(1, 0.76, 0.42);
  head.add(visor);

  const visorFrame = mesh(
    new THREE.TorusGeometry(0.545, 0.018, 8, 64),
    gold,
    [0, -0.015, 0.71]
  );
  visorFrame.scale.set(1, 0.78, 1);
  head.add(visorFrame);

  const visorInnerLine = mesh(
    new THREE.TorusGeometry(0.478, 0.005, 6, 60),
    goldGlow,
    [0, -0.015, 0.725]
  );
  visorInnerLine.scale.set(1, 0.78, 1);
  head.add(visorInnerLine);

  const faceGlow = glowSprite(glowTexture, GOLD, 1.2, 0.17);
  faceGlow.position.set(0, -0.02, 0.77);
  head.add(faceGlow);

  const eyes = [];
  [-1, 1].forEach(function (side) {
    const eye = mesh(
      new THREE.SphereGeometry(0.078, 24, 18),
      eyeMaterial,
      [side * 0.19, 0.04, 0.732]
    );
    eye.scale.set(1.45, 0.42, 0.16);
    head.add(eye);
    eyes.push(eye);

    const eyeGlow = glowSprite(glowTexture, EYE, 0.28, 0.58);
    eyeGlow.position.set(side * 0.19, 0.04, 0.758);
    head.add(eyeGlow);
    eye.userData.glow = eyeGlow;

    const brow = mesh(
      new THREE.BoxGeometry(0.15, 0.01, 0.008),
      gold,
      [side * 0.19, 0.135, 0.735]
    );
    brow.rotation.z = side * 0.09;
    head.add(brow);
  });

  const mouth = mesh(
    new THREE.TorusGeometry(0.065, 0.007, 6, 20, Math.PI),
    gold,
    [0, -0.19, 0.735]
  );
  mouth.rotation.z = Math.PI;
  head.add(mouth);

  [-1, 1].forEach(function (side) {
    const cheek = mesh(
      new THREE.SphereGeometry(0.018, 12, 10),
      goldGlow,
      [side * 0.34, -0.1, 0.69]
    );
    head.add(cheek);
  });

  /* Ear pods. */
  [-1, 1].forEach(function (side) {
    const pod = mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 0.09, 28),
      shellSoft,
      [side * 0.65, -0.02, 0]
    );
    pod.rotation.z = Math.PI / 2;
    head.add(pod);

    const podRing = mesh(
      new THREE.TorusGeometry(0.095, 0.01, 6, 28),
      gold,
      [side * 0.705, -0.02, 0]
    );
    podRing.rotation.y = Math.PI / 2;
    head.add(podRing);

    const podCore = mesh(
      new THREE.SphereGeometry(0.04, 16, 12),
      plum,
      [side * 0.708, -0.02, 0]
    );
    head.add(podCore);
  });

  /* Champagne crest. */
  const crest = new THREE.Group();
  crest.position.set(0, 0.63, -0.06);
  head.add(crest);

  const crestStem = mesh(
    new THREE.CylinderGeometry(0.014, 0.035, 0.28, 8),
    gold,
    [0, 0.12, 0]
  );
  crestStem.rotation.x = -0.12;
  crest.add(crestStem);

  const crestGem = mesh(
    new THREE.SphereGeometry(0.034, 18, 14),
    goldGlow,
    [0, 0.29, 0.02]
  );
  crest.add(crestGem);

  const crestGlow = glowSprite(glowTexture, GOLD_LIGHT, 0.3, 0.58);
  crestGlow.position.set(0, 0.29, 0.04);
  crest.add(crestGlow);

  /* Floating energy rings. */
  const rings = new THREE.Group();
  rings.position.y = -1.38;
  robot.add(rings);

  const ringA = mesh(
    new THREE.TorusGeometry(0.56, 0.011, 8, 64),
    gold,
    [0, 0, 0]
  );
  ringA.rotation.x = Math.PI / 2;
  rings.add(ringA);

  const ringB = mesh(
    new THREE.TorusGeometry(0.39, 0.007, 6, 56),
    goldDeep,
    [0, 0.02, 0]
  );
  ringB.rotation.x = Math.PI / 2;
  rings.add(ringB);

  const ringC = mesh(
    new THREE.TorusGeometry(0.24, 0.005, 6, 48),
    goldGlow,
    [0, 0.04, 0]
  );
  ringC.rotation.x = Math.PI / 2;
  rings.add(ringC);

  const ringGlow = glowSprite(glowTexture, GOLD, 1.45, 0.24);
  ringGlow.scale.set(1.45, 0.4, 1);
  rings.add(ringGlow);

  const shadow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture,
      color: 0x000000,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      blending: THREE.NormalBlending
    })
  );
  shadow.position.set(0, -1.47, 0);
  shadow.scale.set(1.5, 0.32, 1);
  robot.add(shadow);

  /* Fine champagne dust. */
  const particles = [];
  for (let i = 0; i < 9; i += 1) {
    const particle = mesh(
      new THREE.SphereGeometry(0.008 + Math.random() * 0.009, 8, 8),
      new THREE.MeshBasicMaterial({
        color: i % 3 === 0 ? 0xfff1cf : GOLD,
        transparent: true,
        opacity: 0.7
      })
    );
    particle.userData.angle = (i / 9) * Math.PI * 2;
    particle.userData.radius = 0.72 + Math.random() * 0.3;
    particle.userData.speed = 0.16 + Math.random() * 0.15;
    particle.userData.height = -1.1 + Math.random() * 2.1;
    robot.add(particle);
    particles.push(particle);
  }

  let pointerX = 0;
  let pointerY = 0;
  let targetPointerX = 0;
  let targetPointerY = 0;
  let waveUntil = 0;
  let blinkAt = 1.8;
  let blinkStart = -1;
  let lastTime = 0;
  let raf = 0;
  let disposed = false;

  function wave() {
    waveUntil = performance.now() / 1000 + 1.5;
  }

  const host = canvas.closest(".chat-launcher") || canvas;

  function onPointerMove(event) {
    const rect = host.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    targetPointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    targetPointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
  }

  function onPointerLeave() {
    targetPointerX = 0;
    targetPointerY = 0;
  }

  host.addEventListener("pointermove", onPointerMove, { passive: true });
  host.addEventListener("pointerleave", onPointerLeave, { passive: true });
  host.addEventListener("pointerenter", wave, { passive: true });
  host.addEventListener("focus", wave, { passive: true });

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width || 104));
    const height = Math.max(1, Math.round(rect.height || 104));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  const resizeObserver =
    typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null;
  if (resizeObserver) resizeObserver.observe(canvas);
  window.addEventListener("resize", resize, { passive: true });
  resize();

  function frame(nowMs) {
    if (disposed) return;
    raf = requestAnimationFrame(frame);

    const now = nowMs / 1000;
    const dt = lastTime ? Math.min(0.05, now - lastTime) : 0.016;
    lastTime = now;
    const t = now;

    pointerX += (targetPointerX - pointerX) * Math.min(1, dt * 5);
    pointerY += (targetPointerY - pointerY) * Math.min(1, dt * 5);

    const motion = reducedMotion ? 0.3 : 1;
    const bob = Math.sin(t * 1.18) * 0.045 * motion;
    robot.position.y = 0.04 + bob;
    robot.rotation.y = Math.sin(t * 0.46) * 0.1 * motion + pointerX * 0.15;
    robot.rotation.x = Math.sin(t * 0.72) * 0.015 * motion - pointerY * 0.035;

    head.rotation.y = Math.sin(t * 0.34) * 0.045 * motion + pointerX * 0.09;
    head.rotation.x = Math.sin(t * 0.58) * 0.022 * motion - pointerY * 0.045;
    head.rotation.z = Math.sin(t * 0.48) * 0.014 * motion;

    crest.rotation.z = Math.sin(t * 1.55) * 0.08 * motion;
    crest.rotation.x = Math.cos(t * 1.15) * 0.035 * motion;

    chestRing.rotation.z = Math.sin(t * 0.55) * 0.05;
    chestInner.rotation.z = -t * 0.35 * motion;
    chestCore.scale.setScalar(0.9 + Math.sin(t * 2.05) * 0.12);
    chestGlow.material.opacity = 0.44 + Math.sin(t * 2.05) * 0.14;
    eyeLight.intensity = 1.25 + Math.sin(t * 1.8) * 0.18;

    rings.rotation.y = t * 0.35 * motion;
    ringA.rotation.z = t * 0.48 * motion;
    ringB.rotation.z = -t * 0.62 * motion;
    ringC.rotation.z = t * 0.82 * motion;
    ringGlow.material.opacity = 0.18 + Math.sin(t * 1.6) * 0.05;
    aura.material.opacity = 0.16 + Math.sin(t * 1.1) * 0.035;

    if (t > blinkAt && blinkStart < 0) {
      blinkStart = t;
      blinkAt = t + 2.8 + Math.random() * 4.2;
    }
    let blink = 1;
    if (blinkStart >= 0) {
      const progress = (t - blinkStart) / 0.16;
      if (progress >= 1) {
        blinkStart = -1;
      } else {
        blink = 1 - Math.sin(progress * Math.PI) * 0.9;
      }
    }
    eyes.forEach(function (eye) {
      eye.scale.y = 0.42 * blink;
      if (eye.userData.glow) {
        eye.userData.glow.material.opacity = 0.16 + blink * 0.42;
        eye.userData.glow.scale.setScalar(0.26 + blink * 0.025);
      }
    });

    arms.forEach(function (arm) {
      const side = arm.userData.side;
      const sway = Math.sin(t * 0.95 + (side > 0 ? 0.7 : 0)) * 0.035 * motion;
      arm.rotation.z = side * (0.17 + sway);
      arm.rotation.x = Math.sin(t * 0.72 + side) * 0.028 * motion;
    });

    if (t < waveUntil) {
      const right = arms.find(function (arm) {
        return arm.userData.side > 0;
      });
      if (right) {
        right.rotation.z = -1.28 + Math.sin(t * 9) * 0.28;
        right.rotation.x = 0.1;
      }
    }

    particles.forEach(function (particle) {
      const data = particle.userData;
      const angle = data.angle + t * data.speed;
      particle.position.set(
        Math.cos(angle) * data.radius,
        data.height + Math.sin(t * 0.7 + data.angle) * 0.09,
        Math.sin(angle) * data.radius * 0.55
      );
      particle.material.opacity = 0.3 + Math.sin(t * 1.5 + data.angle) * 0.22;
    });

    renderer.render(scene, camera);
  }

  raf = requestAnimationFrame(frame);

  return {
    wave: wave,
    dispose: function () {
      disposed = true;
      cancelAnimationFrame(raf);
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener("resize", resize);
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerleave", onPointerLeave);
      host.removeEventListener("pointerenter", wave);
      host.removeEventListener("focus", wave);
      scene.traverse(function (item) {
        if (item.geometry) item.geometry.dispose();
        if (item.material) {
          if (Array.isArray(item.material)) {
            item.material.forEach(function (material) { material.dispose(); });
          } else {
            item.material.dispose();
          }
        }
      });
      if (environment) environment.dispose();
      glowTexture.dispose();
      renderer.dispose();
    }
  };
}
