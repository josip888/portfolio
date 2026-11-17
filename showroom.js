import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';

const COL = { row: 0xd9ff5b, bike: 0x5bd0ff, cross: 0xff8a5b };
const box = document.getElementById('showroom');
const canvas = document.getElementById('showroom-canvas');

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
} catch (e) {
  box.classList.add('no3d');
  throw e;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0c0c0d, 7, 14);
const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
camera.position.set(4.4, 2.5, 4.4);

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0.75, 0);
controls.enableDamping = true;
controls.enableZoom = false;
controls.enablePan = false;
controls.autoRotate = true;
controls.autoRotateSpeed = 1.4;
controls.minPolarAngle = 0.6;
controls.maxPolarAngle = 1.45;

// Licht
scene.add(new THREE.HemisphereLight(0xffffff, 0x111111, 1.1));
const key = new THREE.DirectionalLight(0xffffff, 2.2);
key.position.set(3, 5, 2);
scene.add(key);
const rim = new THREE.PointLight(COL.row, 6, 8);
rim.position.set(-2.5, 1.8, -2);
scene.add(rim);

// Plattform
const platform = new THREE.Mesh(
  new THREE.CylinderGeometry(2.1, 2.2, 0.08, 64),
  new THREE.MeshStandardMaterial({ color: 0x141416, metalness: 0.4, roughness: 0.6 })
);
platform.position.y = -0.04;
scene.add(platform);
const ringMat = new THREE.MeshBasicMaterial({ color: COL.row });
const ring = new THREE.Mesh(new THREE.TorusGeometry(2.12, 0.012, 8, 128), ringMat);
ring.rotation.x = Math.PI / 2;
scene.add(ring);
const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.006, 8, 128), ringMat);
ring2.rotation.x = Math.PI / 2;
ring2.position.y = 0.002;
scene.add(ring2);

// Partikel
const pGeo = new THREE.BufferGeometry();
const pts = [];
for (let i = 0; i < 260; i++) {
  const r = 2.4 + Math.random() * 3, a = Math.random() * Math.PI * 2;
  pts.push(Math.cos(a) * r, Math.random() * 3.5, Math.sin(a) * r);
}
pGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
const pMat = new THREE.PointsMaterial({ color: COL.row, size: 0.03, transparent: true, opacity: 0.7 });
const particles = new THREE.Points(pGeo, pMat);
scene.add(particles);

// Bausteine
const dark = new THREE.MeshStandardMaterial({ color: 0x1d1d22, metalness: 0.7, roughness: 0.32 });
const light = new THREE.MeshStandardMaterial({ color: 0x3a3a42, metalness: 0.5, roughness: 0.4 });
const UP = new THREE.Vector3(0, 1, 0);

function edges(mesh, color, thresh = 25) {
  const l = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry, thresh),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.85 })
  );
  mesh.add(l);
  return mesh;
}
function boxM(g, w, h, d, x, y, z, color, mat = dark) {
  const m = edges(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat), color);
  m.position.set(x, y, z);
  g.add(m);
  return m;
}
function tube(g, r, color, mat = dark) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1, 14), mat);
  edges(m, color, 60);
  g.add(m);
  return m;
}
function setTube(m, a, b) {
  const dir = new THREE.Vector3().subVectors(b, a);
  m.position.copy(a).addScaledVector(dir, 0.5);
  m.scale.set(1, dir.length(), 1);
  m.quaternion.setFromUnitVectors(UP, dir.normalize());
}
const V = (x, y, z = 0) => new THREE.Vector3(x, y, z);
function staticTube(g, r, a, b, color, mat) {
  const m = tube(g, r, color, mat);
  setTube(m, a, b);
  return m;
}
function wheel(g, r, w, x, y, z, color, mat = dark) {
  const m = edges(new THREE.Mesh(new THREE.CylinderGeometry(r, r, w, 40), mat), color, 40);
  m.rotation.x = Math.PI / 2;
  m.position.set(x, y, z);
  g.add(m);
  return m;
}
function screen(g, x, y, w, h, color, tilt = 0.35) {
  const s = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, h, w),
    new THREE.MeshStandardMaterial({ color: 0x0a0a0a, emissive: color, emissiveIntensity: 0.55 })
  );
  edges(s, color);
  s.position.set(x, y, 0);
  s.rotation.z = -tilt;
  g.add(s);
  return s;
}

// ---------- Rudergerät ----------
function buildRower() {
  const c = COL.row, g = new THREE.Group(), anim = {};
  boxM(g, 2.7, 0.07, 0.2, 0.15, 0.36, 0, c);
  boxM(g, 0.1, 0.36, 0.55, 1.42, 0.18, 0, c);
  boxM(g, 0.14, 0.08, 0.8, -1.12, 0.04, 0, c);
  staticTube(g, 0.04, V(-1.12, 0.06), V(-1.12, 0.3), c);
  const tank = wheel(g, 0.44, 0.3, -1.12, 0.48, 0,
    c, new THREE.MeshStandardMaterial({ color: 0x0d2a33, metalness: 0.1, roughness: 0.05, transparent: true, opacity: 0.55 }));
  const paddle = new THREE.Group();
  paddle.position.set(-1.12, 0.48, 0);
  for (let i = 0; i < 4; i++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.05, 0.18),
      new THREE.MeshStandardMaterial({ color: 0x111111, emissive: c, emissiveIntensity: 0.25 }));
    b.rotation.z = (i * Math.PI) / 4;
    paddle.add(b);
  }
  g.add(paddle);
  anim.paddle = paddle;
  staticTube(g, 0.045, V(-0.7, 0.48), V(-0.2, 0.37), c);
  [-0.15, 0.15].forEach(z => {
    const f = boxM(g, 0.1, 0.34, 0.15, -0.5, 0.5, z, c, light);
    f.rotation.z = -0.55;
  });
  staticTube(g, 0.03, V(-0.95, 0.75), V(-0.82, 1.12), c);
  screen(g, -0.8, 1.2, 0.3, 0.2, c, 0.6);
  anim.seat = boxM(g, 0.36, 0.07, 0.34, 0.4, 0.44, 0, c, light);
  const handle = tube(g, 0.025, c, light);
  handle.rotation.x = Math.PI / 2;
  handle.scale.y = 0.62;
  anim.handle = handle;
  const strap = tube(g, 0.008, c);
  anim.strap = strap;
  anim.update = t => {
    const s = (Math.sin(t * 2.2) + 1) / 2;
    anim.seat.position.x = 0.0 + s * 0.75;
    handle.position.set(-0.75 + s * 0.85, 0.62 + s * 0.08, 0);
    setTube(strap, V(-1.0, 0.55), handle.position.clone());
    paddle.rotation.z -= 0.03 + s * 0.06;
  };
  return { g, anim };
}

// ---------- Speedbike ----------
function buildBike() {
  const c = COL.bike, g = new THREE.Group(), anim = {};
  const fb = staticTube(g, 0.05, V(-0.75, 0.05, -0.38), V(-0.75, 0.05, 0.38), c);
  const rb = staticTube(g, 0.05, V(0.75, 0.05, -0.38), V(0.75, 0.05, 0.38), c);
  staticTube(g, 0.06, V(0.75, 0.06), V(0.05, 0.62), c);
  staticTube(g, 0.06, V(-0.75, 0.06), V(-0.32, 0.78), c);
  staticTube(g, 0.055, V(-0.32, 0.78), V(0.05, 0.62), c);
  staticTube(g, 0.045, V(0.05, 0.62), V(0.28, 1.12), c, light);
  const saddle = boxM(g, 0.34, 0.07, 0.2, 0.32, 1.15, 0, c, light);
  saddle.rotation.z = 0.06;
  staticTube(g, 0.045, V(-0.32, 0.78), V(-0.46, 1.22), c, light);
  staticTube(g, 0.035, V(-0.46, 1.22), V(-0.74, 1.26), c, light);
  staticTube(g, 0.03, V(-0.74, 1.26, -0.24), V(-0.74, 1.26, 0.24), c, light);
  [-0.24, 0.24].forEach(z => staticTube(g, 0.028, V(-0.74, 1.26, z), V(-0.9, 1.32, z), c, light));
  staticTube(g, 0.03, V(-0.5, 1.25), V(-0.62, 1.55), c);
  screen(g, -0.66, 1.72, 0.85, 0.5, c, 0.4);
  anim.fly = wheel(g, 0.33, 0.07, -0.5, 0.44, 0, c, light);
  const guard = wheel(g, 0.36, 0.02, -0.5, 0.44, 0.06, c);
  guard.material = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, emissive: c, emissiveIntensity: 0.18, transparent: true, opacity: 0.7 });
  const crankC = V(0.02, 0.45);
  const cranks = [0, Math.PI].map(off => {
    const arm = tube(g, 0.025, c, light);
    const pedal = boxM(g, 0.14, 0.03, 0.09, 0, 0, 0, c, light);
    return { arm, pedal, off };
  });
  anim.update = t => {
    anim.fly.rotation.y -= 0.12;
    cranks.forEach(({ arm, pedal, off }, i) => {
      const a = t * 3.2 + off, z = i ? -0.18 : 0.18;
      const p = V(crankC.x + Math.cos(a) * 0.18, crankC.y + Math.sin(a) * 0.18, z);
      setTube(arm, V(crankC.x, crankC.y, z), p);
      pedal.position.copy(p);
    });
  };
  return { g, anim };
}

// ---------- Crosstrainer ----------
function buildCross() {
  const c = COL.cross, g = new THREE.Group(), anim = {};
  boxM(g, 2.0, 0.08, 0.32, 0.15, 0.06, 0, c);
  staticTube(g, 0.05, V(1.05, 0.05, -0.36), V(1.05, 0.05, 0.36), c);
  anim.fly = wheel(g, 0.34, 0.3, -0.72, 0.44, 0, c);
  const hub = wheel(g, 0.12, 0.34, -0.72, 0.44, 0, c);
  hub.material = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, emissive: c, emissiveIntensity: 0.6 });
  staticTube(g, 0.055, V(-0.72, 0.6), V(-0.5, 1.45), c);
  screen(g, -0.47, 1.55, 0.36, 0.24, c, 0.5);
  const pivot = V(-0.52, 1.15);
  const sides = [0.22, -0.22].map((z, i) => ({
    z, off: i * Math.PI,
    arm: tube(g, 0.04, c, light),
    pad: boxM(g, 0.4, 0.04, 0.16, 0, 0, z, c, light),
    upper: tube(g, 0.035, c, light),
    lower: tube(g, 0.035, c, light),
  }));
  anim.update = t => {
    anim.fly.rotation.y -= 0.05;
    sides.forEach(s => {
      const a = t * 2.4 + s.off;
      const crank = V(-0.72 + Math.cos(a) * 0.22, 0.44 + Math.sin(a) * 0.22, s.z);
      const rear = V(0.95, 0.16 + Math.sin(a) * 0.04, s.z);
      setTube(s.arm, crank, rear);
      const padPos = crank.clone().lerp(rear, 0.55).add(V(0, 0.05, 0));
      s.pad.position.copy(padPos);
      s.pad.rotation.z = Math.atan2(rear.y - crank.y, rear.x - crank.x);
      const swing = Math.cos(a) * 0.32;
      const top = V(pivot.x - 0.2 + Math.sin(swing) * 0.6, pivot.y + 0.62, s.z);
      const bottom = V(pivot.x + Math.sin(-swing) * 0.45, pivot.y - 0.42, s.z);
      setTube(s.upper, V(pivot.x, pivot.y, s.z), top);
      setTube(s.lower, V(pivot.x, pivot.y, s.z), bottom);
    });
  };
  return { g, anim };
}

const models = { row: buildRower(), bike: buildBike(), cross: buildCross() };
Object.values(models).forEach(m => { m.g.scale.setScalar(0.001); scene.add(m.g); });

let active = 'row';
let auto = true;
const label = document.getElementById('showroom-label');
const INFO = {
  row: ['Rudergeräte', '6 Modelle · Wasser & Magnet'],
  bike: ['Speedbikes', '6 Modelle · bis 21,5" Touch'],
  cross: ['Crosstrainer', '4 Modelle · bis 32 Stufen'],
};
function setActive(k, fromUser) {
  active = k;
  if (fromUser) auto = false;
  const col = new THREE.Color(COL[k]);
  ringMat.color.copy(col);
  pMat.color.copy(col);
  rim.color.copy(col);
  label.innerHTML = `<b>${INFO[k][0]}</b><span>${INFO[k][1]}</span>`;
  label.style.setProperty('--c', '#' + col.getHexString());
  document.querySelectorAll('[data-show]').forEach(b => b.classList.toggle('on', b.dataset.show === k));
}
document.querySelectorAll('[data-show]').forEach(b =>
  b.addEventListener('click', () => {
    setActive(b.dataset.show, true);
    const tab = document.querySelector(`#tabs button[data-f="${b.dataset.show}"]`);
    if (tab) tab.click();
  })
);
window.showroomSet = k => k !== 'all' && setActive(k, true);
setActive('row');

const order = ['row', 'bike', 'cross'];
let lastSwitch = 0;
function resize() {
  const w = box.clientWidth, h = box.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(box);
resize();

let visible = true;
new IntersectionObserver(e => { visible = e[0].isIntersecting; }).observe(box);
canvas.addEventListener('pointerdown', () => { auto = false; });

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  if (!visible) return;
  const t = clock.getElapsedTime();
  if (auto && t - lastSwitch > 5) {
    lastSwitch = t;
    setActive(order[(order.indexOf(active) + 1) % 3]);
  }
  for (const [k, m] of Object.entries(models)) {
    const target = k === active ? 1 : 0.001;
    const s = THREE.MathUtils.lerp(m.g.scale.x, target, 0.09);
    m.g.scale.setScalar(s);
    m.g.visible = s > 0.01;
    m.g.position.y = (1 - s) * -0.4;
    if (m.g.visible) m.anim.update(t);
  }
  particles.rotation.y = t * 0.03;
  controls.update();
  renderer.render(scene, camera);
});
