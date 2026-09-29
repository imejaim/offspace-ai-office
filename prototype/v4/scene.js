import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';

const TAU = Math.PI * 2;
const MOBILE_BREAKPOINT = 760;
const HOME = Object.freeze({ position: [28, 27, 35], target: [0, 1.8, 0], zoom: 1 });

export const ZONES = Object.freeze({
  business: Object.freeze({ position: [-7.8, 0, -3.7], focus: [-7.8, 2.2, -3.7], color: 0xeaa47e }),
  investment: Object.freeze({ position: [7.8, 0, -4.1], focus: [7.8, 2.1, -4.1], color: 0xe4bc70 }),
  work: Object.freeze({ position: [-8.4, 0, 5.7], focus: [-8.4, 2.1, 5.7], color: 0x8fbad1 }),
  research: Object.freeze({ position: [8.4, 0, 5.7], focus: [8.4, 2.2, 5.7], color: 0x99bea4 }),
  public: Object.freeze({ position: [0, 0, 9.4], focus: [0, 1.8, 9.4], color: 0xeccf9f }),
  life: Object.freeze({ position: [0, 0, -10.1], focus: [0, 2, -10.1], color: 0xdba6a0 }),
});

const CHARACTER_URLS = Object.freeze([
  new URL('../../assets/characters/transparent/Heo-sajang.svg', import.meta.url),
  new URL('../../assets/characters/transparent/Ko-bujang.svg', import.meta.url),
  new URL('../../assets/characters/transparent/Oh-gwajang.svg', import.meta.url),
  new URL('../../assets/characters/transparent/Jem-daeri.svg', import.meta.url),
]);

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const ease = (t) => 1 - Math.pow(1 - t, 3);

function roundedRectShape(width, depth, radius) {
  const x = -width / 2;
  const y = -depth / 2;
  const shape = new THREE.Shape();
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + depth - radius);
  shape.quadraticCurveTo(x + width, y + depth, x + width - radius, y + depth);
  shape.lineTo(x + radius, y + depth);
  shape.quadraticCurveTo(x, y + depth, x, y + depth - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

function roundedBox(width, height, depth, radius = 0.18) {
  const geometry = new THREE.ExtrudeGeometry(roundedRectShape(width, depth, Math.min(radius, width / 2, depth / 2)), {
    depth: height,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: Math.min(radius * 0.35, 0.09),
    bevelThickness: Math.min(radius * 0.35, 0.09),
    curveSegments: 4,
  });
  geometry.rotateX(Math.PI / 2);
  geometry.translate(0, height / 2, 0);
  geometry.computeVertexNormals();
  return geometry;
}

function createMaterial(color, options = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: options.roughness ?? 0.76,
    metalness: options.metalness ?? 0,
    transparent: options.transparent ?? false,
    opacity: options.opacity ?? 1,
    side: options.side ?? THREE.FrontSide,
  });
}

function mesh(geometry, material, position, options = {}) {
  const object = new THREE.Mesh(geometry, material);
  object.position.set(...position);
  if (options.rotation) object.rotation.set(...options.rotation);
  if (options.scale) object.scale.set(...options.scale);
  object.castShadow = options.castShadow ?? true;
  object.receiveShadow = options.receiveShadow ?? true;
  return object;
}

function addBox(group, size, position, material, options = {}) {
  const geometry = options.rounded ? roundedBox(...size, options.radius ?? 0.14) : new THREE.BoxGeometry(...size);
  const object = mesh(geometry, material, position, options);
  group.add(object);
  return object;
}

function addCylinder(group, radiusTop, radiusBottom, height, position, material, sides = 16, options = {}) {
  const object = mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, sides), material, position, options);
  group.add(object);
  return object;
}

function addRoof(group, width, depth, y, material, rotationY = 0) {
  const height = width * 0.22;
  const positions = new Float32Array([
    -width / 2, 0, -depth / 2, width / 2, 0, -depth / 2, 0, height, -depth / 2,
    -width / 2, 0, depth / 2, width / 2, 0, depth / 2, 0, height, depth / 2,
  ]);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setIndex([
    0, 1, 2, 5, 4, 3,
    0, 3, 4, 0, 4, 1,
    0, 2, 5, 0, 5, 3,
    2, 1, 4, 2, 4, 5,
  ]);
  geometry.computeVertexNormals();
  const roof = mesh(geometry, material, [0, y - 0.5, 0], { rotation: [0, rotationY, 0] });
  group.add(roof);
  return roof;
}

function buildTree(materials, scale = 1) {
  const tree = new THREE.Group();
  addCylinder(tree, 0.14 * scale, 0.2 * scale, 1.25 * scale, [0, 0.63 * scale, 0], materials.wood, 9);
  const crownGeometry = new THREE.IcosahedronGeometry(0.72 * scale, 1);
  const crown = mesh(crownGeometry, materials.leaf, [0, 1.55 * scale, 0]);
  crown.scale.set(1, 1.05, 0.92);
  tree.add(crown);
  const crown2 = mesh(crownGeometry, materials.leafLight, [0.38 * scale, 1.45 * scale, 0.08 * scale], { scale: [0.62, 0.62, 0.62] });
  tree.add(crown2);
  return tree;
}

function addPlant(group, position, materials, scale = 1) {
  addCylinder(group, 0.25 * scale, 0.19 * scale, 0.35 * scale, [position[0], position[1] + 0.18 * scale, position[2]], materials.terracotta, 14);
  for (let i = 0; i < 5; i += 1) {
    const leaf = mesh(new THREE.SphereGeometry(0.16 * scale, 10, 8), materials.leaf, [position[0], position[1] + (0.43 + i * 0.08) * scale, position[2]], {
      rotation: [0, i * 1.25, (i % 2 ? 1 : -1) * 0.65],
      scale: [0.46, 1.25, 0.32],
    });
    group.add(leaf);
  }
}

function buildDesk(materials, x, z, rotation = 0) {
  const desk = new THREE.Group();
  desk.position.set(x, 0, z);
  desk.rotation.y = rotation;
  addBox(desk, [2.25, 0.16, 1.05], [0, 1.02, 0], materials.woodLight, { rounded: true, radius: 0.12 });
  for (const lx of [-0.83, 0.83]) addBox(desk, [0.12, 0.95, 0.12], [lx, 0.52, 0.32], materials.charcoal, { rounded: true, radius: 0.04 });
  addBox(desk, [0.92, 0.58, 0.08], [0, 1.48, -0.18], materials.monitor, { rounded: true, radius: 0.08 });
  addBox(desk, [0.76, 0.42, 0.025], [0, 1.48, -0.125], materials.screen, { rounded: true, radius: 0.04, castShadow: false });
  addBox(desk, [0.08, 0.34, 0.08], [0, 1.17, -0.18], materials.charcoal);
  addBox(desk, [0.55, 0.035, 0.2], [0, 1.12, 0.14], materials.cream, { rounded: true, radius: 0.03 });
  const chair = new THREE.Group();
  chair.position.set(0, 0, 1.02);
  addCylinder(chair, 0.38, 0.38, 0.12, [0, 0.52, 0], materials.blue, 18);
  addBox(chair, [0.68, 0.75, 0.12], [0, 0.9, 0.3], materials.blue, { rounded: true, radius: 0.12, rotation: [-0.1, 0, 0] });
  addCylinder(chair, 0.07, 0.07, 0.43, [0, 0.25, 0], materials.charcoal, 10);
  for (let i = 0; i < 5; i += 1) {
    const a = i * TAU / 5;
    addBox(chair, [0.06, 0.06, 0.38], [Math.sin(a) * 0.16, 0.06, Math.cos(a) * 0.16], materials.charcoal, { rotation: [0, a, 0] });
  }
  desk.add(chair);
  return desk;
}

function buildOpenOffice(materials) {
  const office = new THREE.Group();
  office.position.set(...ZONES.business.position);
  office.userData.zoneId = 'business';

  addBox(office, [8.4, 0.45, 7], [0, 0.33, 0], materials.officeFloor, { rounded: true, radius: 0.35 });
  addBox(office, [8.4, 3.65, 0.25], [0, 2.18, -3.36], materials.cream, { rounded: true, radius: 0.08 });
  addBox(office, [0.25, 3.65, 7], [-4.06, 2.18, 0], materials.cream, { rounded: true, radius: 0.08 });
  addBox(office, [0.35, 0.28, 7.1], [4.1, 0.45, 0], materials.apricot);

  // Large windows and warm frames make the room read as a cutaway house.
  for (const x of [-2.5, 0, 2.5]) {
    addBox(office, [1.75, 1.55, 0.06], [x, 2.42, -3.22], materials.glass, { castShadow: false });
    addBox(office, [1.95, 0.11, 0.12], [x, 3.22, -3.17], materials.woodLight);
    addBox(office, [1.95, 0.11, 0.12], [x, 1.62, -3.17], materials.woodLight);
  }

  office.add(buildDesk(materials, -1.6, -0.65, 0));
  office.add(buildDesk(materials, 1.25, -0.65, 0));

  // Lounge: curved-looking sofa, rug, coffee table and floor lamp.
  addBox(office, [2.85, 0.14, 2.15], [1.5, 0.58, 1.95], materials.rug, { rounded: true, radius: 0.25 });
  addBox(office, [2.55, 0.55, 0.8], [1.5, 0.91, 2.55], materials.sofa, { rounded: true, radius: 0.25 });
  addBox(office, [2.45, 0.74, 0.25], [1.5, 1.25, 2.86], materials.sofaDark, { rounded: true, radius: 0.14, rotation: [-0.1, 0, 0] });
  for (const x of [0.38, 2.62]) addBox(office, [0.3, 0.75, 0.82], [x, 1.08, 2.55], materials.sofaDark, { rounded: true, radius: 0.15 });
  addCylinder(office, 0.65, 0.65, 0.13, [1.5, 0.85, 1.55], materials.woodLight, 24);
  addCylinder(office, 0.08, 0.12, 0.43, [1.5, 0.62, 1.55], materials.charcoal, 12);
  addCylinder(office, 0.05, 0.05, 2.15, [3.25, 1.48, 1.45], materials.brass, 12);
  const lampShade = mesh(new THREE.CylinderGeometry(0.42, 0.72, 0.58, 20, 1, true), materials.lamp, [3.25, 2.48, 1.45], { castShadow: false });
  office.add(lampShade);

  // Bookshelf with individually colored books.
  addBox(office, [0.42, 2.55, 2.3], [-3.7, 1.72, 1.62], materials.woodLight, { rounded: true, radius: 0.1 });
  for (const y of [0.8, 1.52, 2.24]) addBox(office, [0.5, 0.09, 2.12], [-3.44, y, 1.62], materials.wood);
  const bookColors = [materials.apricot, materials.blue, materials.sage, materials.gold, materials.rose];
  for (let shelf = 0; shelf < 3; shelf += 1) {
    for (let i = 0; i < 5; i += 1) {
      addBox(office, [0.16, 0.42 + (i % 2) * 0.1, 0.24], [-3.38, 1.04 + shelf * 0.72, 0.82 + i * 0.34], bookColors[(i + shelf) % bookColors.length], { rotation: [0, 0, (i - 2) * 0.025] });
    }
  }
  addPlant(office, [-2.85, 0.57, 2.6], materials, 1.12);
  return office;
}

function buildingBase(id, materials, width = 4.8, depth = 4) {
  const group = new THREE.Group();
  group.position.set(...ZONES[id].position);
  group.userData.zoneId = id;
  addBox(group, [width + 0.6, 0.36, depth + 0.6], [0, 0.28, 0], materials.stone, { rounded: true, radius: 0.32 });
  return group;
}

function buildInvestment(materials) {
  const group = buildingBase('investment', materials, 4.7, 4.1);
  addBox(group, [4.7, 2.75, 4.1], [0, 1.72, 0], materials.goldCream, { rounded: true, radius: 0.28 });
  addRoof(group, 4.9, 4.5, 3.6, materials.gold);
  addBox(group, [1.15, 1.85, 0.14], [0, 1.48, 2.08], materials.deepBlue, { rounded: true, radius: 0.12 });
  for (const x of [-1.45, 1.45]) {
    addBox(group, [0.9, 1.05, 0.12], [x, 1.85, 2.08], materials.glassBlue, { rounded: true, radius: 0.1, castShadow: false });
    addBox(group, [1.05, 0.1, 0.18], [x, 2.42, 2.12], materials.wood);
  }
  // Coin sculpture communicates investment without typography.
  addCylinder(group, 0.48, 0.48, 0.13, [-1.65, 0.82, 2.45], materials.brass, 28, { rotation: [Math.PI / 2, 0, 0] });
  addCylinder(group, 0.29, 0.29, 0.15, [-1.65, 0.82, 2.52], materials.gold, 28, { rotation: [Math.PI / 2, 0, 0] });
  return group;
}

function buildWorkStudio(materials) {
  const group = buildingBase('work', materials, 5, 4.2);
  addBox(group, [5, 2.85, 4.2], [0, 1.78, 0], materials.powderBlue, { rounded: true, radius: 0.32 });
  addBox(group, [5.25, 0.35, 4.45], [0, 3.24, 0], materials.blue, { rounded: true, radius: 0.22 });
  addBox(group, [2.5, 1.8, 0.12], [0.8, 1.73, 2.14], materials.glassBlue, { rounded: true, radius: 0.08, castShadow: false });
  for (const x of [-0.45, 0.8, 2.05]) addBox(group, [0.08, 1.85, 0.18], [x, 1.73, 2.18], materials.cream);
  addBox(group, [1.05, 1.85, 0.18], [-1.55, 1.46, 2.15], materials.blueDark, { rounded: true, radius: 0.12 });
  // rooftop antenna and tiny satellite dish
  addCylinder(group, 0.045, 0.045, 1.2, [-1.65, 3.95, 0], materials.charcoal, 10);
  const dish = mesh(new THREE.SphereGeometry(0.42, 16, 8, 0, TAU, 0, Math.PI / 2), materials.cream, [-1.65, 4.35, 0], { rotation: [0.4, 0, -0.65] });
  group.add(dish);
  return group;
}

function buildGreenhouse(materials) {
  const group = buildingBase('research', materials, 5.2, 4.3);
  addBox(group, [5.2, 0.48, 4.3], [0, 0.55, 0], materials.sage, { rounded: true, radius: 0.22 });
  addBox(group, [5.1, 2.35, 4.05], [0, 1.92, 0], materials.glassGreen, { rounded: true, radius: 0.2, castShadow: false });
  addRoof(group, 5.35, 4.35, 3.53, materials.glassGreen);
  for (const x of [-2.35, -1.18, 0, 1.18, 2.35]) addBox(group, [0.075, 2.5, 4.2], [x, 1.98, 0], materials.sageDark);
  for (const z of [-1.8, 0, 1.8]) addBox(group, [5.25, 0.075, 0.075], [0, 2.0, z], materials.sageDark);
  for (const x of [-1.45, 0, 1.45]) addPlant(group, [x, 0.8, 0.35 + (x === 0 ? -0.5 : 0.35)], materials, 1.25);
  addBox(group, [0.9, 1.85, 0.12], [0, 1.55, 2.17], materials.sageDark, { rounded: true, radius: 0.1 });
  return group;
}

function buildPavilion(materials) {
  const group = buildingBase('public', materials, 5.4, 3.7);
  for (const x of [-2.1, -0.7, 0.7, 2.1]) addCylinder(group, 0.17, 0.2, 2.75, [x, 1.75, 0], materials.cream, 16);
  addBox(group, [5.7, 0.34, 4], [0, 3.22, 0], materials.apricot, { rounded: true, radius: 0.22 });
  addRoof(group, 5.8, 4.15, 3.67, materials.rose);
  addBox(group, [4.65, 0.24, 0.65], [0, 0.76, -0.6], materials.woodLight, { rounded: true, radius: 0.12 });
  addBox(group, [3.4, 1.4, 0.15], [0, 1.85, -1.7], materials.cream, { rounded: true, radius: 0.12 });
  addBox(group, [2.95, 1.05, 0.03], [0, 1.85, -1.6], materials.boardGreen, { rounded: true, radius: 0.08, castShadow: false });
  return group;
}

function buildCottage(materials) {
  const group = buildingBase('life', materials, 4.8, 4.25);
  addBox(group, [4.8, 2.65, 4.25], [0, 1.7, 0], materials.roseCream, { rounded: true, radius: 0.3 });
  addRoof(group, 5.15, 4.65, 3.55, materials.rose);
  addBox(group, [1.05, 1.78, 0.15], [0, 1.37, 2.18], materials.terracotta, { rounded: true, radius: 0.14 });
  for (const x of [-1.5, 1.5]) {
    addBox(group, [0.96, 1.04, 0.12], [x, 1.85, 2.18], materials.glassBlue, { rounded: true, radius: 0.1, castShadow: false });
    addBox(group, [0.12, 1.1, 0.18], [x, 1.85, 2.22], materials.cream);
    addBox(group, [1.02, 0.12, 0.18], [x, 1.85, 2.22], materials.cream);
  }
  addBox(group, [0.65, 1.6, 0.65], [1.55, 3.75, -0.75], materials.terracotta, { rounded: true, radius: 0.08 });
  addPlant(group, [-2.25, 0.58, 2.35], materials, 0.9);
  return group;
}

function createMaterials() {
  return {
    grass: createMaterial(0x9fc68d), grassDark: createMaterial(0x6f9464), soil: createMaterial(0xa77b59),
    cream: createMaterial(0xfff4dd), stone: createMaterial(0xe8ddc7), stoneDark: createMaterial(0xc9b99e),
    apricot: createMaterial(0xefa883), rose: createMaterial(0xd98f8d), roseCream: createMaterial(0xf4c6b8),
    sage: createMaterial(0x87ad91), sageDark: createMaterial(0x587b66), leaf: createMaterial(0x5e9369), leafLight: createMaterial(0x83b97a),
    powderBlue: createMaterial(0xa8cede), blue: createMaterial(0x6099ba), blueDark: createMaterial(0x3f6f8c), deepBlue: createMaterial(0x34596f),
    goldCream: createMaterial(0xf5db9e), gold: createMaterial(0xdba958), brass: createMaterial(0xc99746, { metalness: 0.35, roughness: 0.48 }),
    terracotta: createMaterial(0xc8785b), wood: createMaterial(0x936747), woodLight: createMaterial(0xc79568), charcoal: createMaterial(0x404a4c),
    officeFloor: createMaterial(0xf3dfc4), rug: createMaterial(0xd9a58e), sofa: createMaterial(0x779b8d), sofaDark: createMaterial(0x587d70),
    monitor: createMaterial(0x3a4145, { roughness: 0.45 }), screen: createMaterial(0x82c6d6, { roughness: 0.3 }),
    lamp: createMaterial(0xffd89a, { side: THREE.DoubleSide }), boardGreen: createMaterial(0x537b6b),
    glass: createMaterial(0xbce4e3, { transparent: true, opacity: 0.58, roughness: 0.2 }),
    glassBlue: createMaterial(0x9dd7e7, { transparent: true, opacity: 0.58, roughness: 0.18 }),
    glassGreen: createMaterial(0xaedfc9, { transparent: true, opacity: 0.42, roughness: 0.18, side: THREE.DoubleSide }),
    water: createMaterial(0x79c7d0, { transparent: true, opacity: 0.78, roughness: 0.25 }),
    white: createMaterial(0xffffff), cloud: createMaterial(0xfff9eb, { roughness: 1 }),
  };
}

function buildWorld(scene, materials, selectables) {
  const world = new THREE.Group();
  scene.add(world);

  // Layered floating diorama island.
  addCylinder(world, 15.9, 14.7, 1.45, [0, -1.08, 0], materials.soil, 48);
  addCylinder(world, 15.45, 15.7, 0.52, [0, -0.16, 0], materials.grassDark, 48);
  addCylinder(world, 15.15, 15.35, 0.28, [0, 0.22, 0], materials.grass, 48);

  // Central courtyard and reflecting pool.
  addCylinder(world, 5.5, 5.5, 0.16, [0, 0.45, 0], materials.stone, 32);
  addCylinder(world, 2.25, 2.25, 0.18, [0, 0.56, 0], materials.water, 40, { castShadow: false });
  addCylinder(world, 2.5, 2.5, 0.14, [0, 0.48, 0], materials.stoneDark, 40);
  const fountain = addCylinder(world, 0.45, 0.62, 0.75, [0, 0.95, 0], materials.stone, 20);
  fountain.userData.waterFeature = true;
  addCylinder(world, 0.92, 0.92, 0.15, [0, 1.3, 0], materials.water, 28, { castShadow: false });

  // Curving path impression from overlapping stones; restrained draw count.
  const pathGeometry = roundedBox(1.65, 0.11, 1.2, 0.28);
  const pathPoints = [
    [-4.2, -2.1, 0.15], [-5.6, -2.9, 0.04], [4.2, -2.1, -0.12], [5.7, -3.0, -0.05],
    [-4.2, 2.35, -0.04], [-6.0, 3.7, 0.12], [4.25, 2.4, 0.08], [6.1, 3.8, -0.12],
    [-0.2, 4.6, 0.03], [0, 6.2, -0.08], [0.25, -4.6, 0.1], [0, -6.4, -0.03],
  ];
  const pathStones = new THREE.InstancedMesh(pathGeometry, materials.stone, pathPoints.length);
  const instance = new THREE.Object3D();
  pathPoints.forEach(([x, z, r], index) => {
    instance.position.set(x, 0.48, z);
    instance.rotation.set(0, r, 0);
    instance.scale.set(1, 1, 1);
    instance.updateMatrix();
    pathStones.setMatrixAt(index, instance.matrix);
  });
  pathStones.receiveShadow = true;
  pathStones.castShadow = false;
  world.add(pathStones);

  const buildings = [buildOpenOffice(materials), buildInvestment(materials), buildWorkStudio(materials), buildGreenhouse(materials), buildPavilion(materials), buildCottage(materials)];
  buildings.forEach((building) => {
    world.add(building);
    selectables.push(building);
    building.traverse((child) => { if (child.isMesh) child.userData.zoneId = building.userData.zoneId; });
  });

  const treePositions = [
    [-12.5, -6.5, 1.15], [-11.6, 1.8, 0.95], [-12, 8.9, 1.1], [-5.3, 11.8, 0.9],
    [5.7, 12.1, 1.05], [12.5, 8.5, 0.9], [12.7, 1.8, 1.15], [12.2, -8.6, 1.0],
    [5.9, -12.5, 0.82], [-6.1, -12.1, 1.0],
  ];
  const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.14, 0.2, 1.25, 9), materials.wood, treePositions.length);
  const crowns = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.72, 1), materials.leaf, treePositions.length);
  const crownTips = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.72, 1), materials.leafLight, treePositions.length);
  treePositions.forEach(([x, z, s], index) => {
    instance.position.set(x, 0.42 + 0.63 * s, z);
    instance.rotation.set(0, index * 1.7, 0);
    instance.scale.set(s, s, s);
    instance.updateMatrix();
    trunks.setMatrixAt(index, instance.matrix);
    instance.position.set(x, 0.42 + 1.55 * s, z);
    instance.scale.set(s, 1.05 * s, 0.92 * s);
    instance.updateMatrix();
    crowns.setMatrixAt(index, instance.matrix);
    instance.position.set(x + 0.38 * s, 0.42 + 1.45 * s, z + 0.08 * s);
    instance.scale.set(0.62 * s, 0.62 * s, 0.62 * s);
    instance.updateMatrix();
    crownTips.setMatrixAt(index, instance.matrix);
  });
  [trunks, crowns, crownTips].forEach((trees) => {
    trees.castShadow = true;
    trees.receiveShadow = true;
    world.add(trees);
  });

  // Flowers and stepping stones around the courtyard.
  const flowerGeometry = new THREE.SphereGeometry(0.11, 7, 6);
  const flowerMaterials = [materials.rose, materials.gold, materials.cream];
  flowerMaterials.forEach((material, colorIndex) => {
    const flowers = new THREE.InstancedMesh(flowerGeometry, material, 6);
    for (let index = 0; index < 6; index += 1) {
      const i = index * 3 + colorIndex;
      const a = i * TAU / 18;
      const r = 6.1 + colorIndex * 0.35;
      instance.position.set(Math.cos(a) * r, 0.72, Math.sin(a) * r);
      instance.rotation.set(0, a, 0);
      instance.scale.set(1, 1, 1);
      instance.updateMatrix();
      flowers.setMatrixAt(index, instance.matrix);
    }
    flowers.castShadow = false;
    world.add(flowers);
  });

  // Clouds are true world objects, far enough to add depth without obscuring interaction.
  const cloudBank = new THREE.Group();
  cloudBank.userData.cloud = true;
  const cloudGeometry = new THREE.SphereGeometry(0.9, 10, 8);
  const cloudParts = [[0, 0, 0, 1], [0.85, 0.05, 0, 0.75], [-0.82, -0.02, 0, 0.68], [0.2, 0.42, 0, 0.72]];
  const clouds = new THREE.InstancedMesh(cloudGeometry, materials.cloud, 16);
  for (let c = 0; c < 4; c += 1) {
    cloudParts.forEach(([x, y, z, s], part) => {
      instance.position.set(-14 + c * 9 + x, 10 + (c % 2) * 2 + y, -15 - c * 4 + z);
      instance.rotation.set(0, 0, 0);
      instance.scale.set(s * 1.25, s * 0.75, s);
      instance.updateMatrix();
      clouds.setMatrixAt(c * 4 + part, instance.matrix);
    });
  }
  clouds.castShadow = false;
  clouds.receiveShadow = false;
  cloudBank.add(clouds);
  world.add(cloudBank);

  return world;
}

async function addCharacterSprites(world, renderer) {
  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin('anonymous');
  const textures = await Promise.all(CHARACTER_URLS.map((url) => loader.loadAsync(url.href)));
  const positions = [[-3.3, 0.68, 2.2], [-1.1, 0.68, 3], [1.1, 0.68, 3], [3.3, 0.68, 2.2]];
  const sprites = textures.map((texture, index) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, alphaTest: 0.08 });
    const sprite = new THREE.Sprite(material);
    sprite.position.set(...positions[index]);
    sprite.position.y += 1.22;
    sprite.scale.set(1.75, 2.4, 1);
    sprite.userData.baseY = sprite.position.y;
    sprite.userData.characterGuide = true;
    world.add(sprite);
    return sprite;
  });
  return { sprites, textures };
}

function eventIsFromControl(event) {
  const target = event.target;
  if (!(target instanceof Element)) return false;
  return /^(INPUT|TEXTAREA|BUTTON|A|SELECT)$/.test(target.tagName) || Boolean(target.closest('[role="dialog"], [data-panel], .panel, .controls'));
}

export async function createCampus({ canvas, onSelect, onReady, reducedMotion = false } = {}) {
  if (!(canvas instanceof HTMLCanvasElement)) throw new TypeError('createCampus requires a canvas');
  const select = typeof onSelect === 'function' ? onSelect : () => {};
  const ready = typeof onReady === 'function' ? onReady : () => {};
  let mobile = window.innerWidth <= MOBILE_BREAKPOINT;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, alpha: true, powerPreference: 'high-performance' });
  } catch (error) {
    throw new Error(`WebGL initialization failed: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (!renderer.getContext()) {
    renderer.dispose();
    throw new Error('WebGL context unavailable');
  }

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0xf1f0e8, 1);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf1f0e8);
  scene.fog = new THREE.FogExp2(0xf1f0e8, 0.005);
  const camera = new THREE.OrthographicCamera(-18, 18, 13, -13, 0.1, 120);
  camera.position.set(...HOME.position);
  camera.lookAt(...HOME.target);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.075;
  controls.enablePan = false;
  controls.minZoom = 0.65;
  controls.maxZoom = 2.2;
  controls.minPolarAngle = Math.PI * 0.18;
  controls.maxPolarAngle = Math.PI * 0.46;
  controls.target.set(...HOME.target);
  controls.touches.ONE = THREE.TOUCH.ROTATE;
  controls.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;

  const ambient = new THREE.HemisphereLight(0xe5efff, 0x76885f, 1.5);
  scene.add(ambient);
  const sun = new THREE.DirectionalLight(0xffe0ad, 3.2);
  sun.position.set(-13, 23, 15);
  sun.castShadow = true;
  sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
  sun.shadow.camera.left = -22;
  sun.shadow.camera.right = 22;
  sun.shadow.camera.top = 22;
  sun.shadow.camera.bottom = -22;
  sun.shadow.camera.near = 2;
  sun.shadow.camera.far = 55;
  sun.shadow.bias = -0.0007;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xa9d9e8, 0.8);
  fill.position.set(15, 9, -10);
  scene.add(fill);

  // Distant matte ground catches the island shadow and visually anchors the diorama.
  const ground = mesh(new THREE.CircleGeometry(52, 64), createMaterial(0xf1f0e8, { roughness: 1 }), [0, -2, 0], {
    rotation: [-Math.PI / 2, 0, 0], castShadow: false, receiveShadow: true,
  });
  scene.add(ground);

  const materials = createMaterials();
  const selectables = [];
  const world = buildWorld(scene, materials, selectables);
  const { sprites, textures } = await addCharacterSprites(world, renderer);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const keys = new Set();
  let motionEnabled = !reducedMotion;
  let explorationEnabled = false;
  let destroyed = false;
  let hidden = document.hidden;
  let frame = 0;
  let dirty = true;
  let lastTime = performance.now();
  let cameraTween = null;
  let pressedAt = null;
  let renderFrames = 0;
  let selectedZone = null;

  // The user's guide is the existing Heo-sajang artwork, moved only in exploration mode.
  const explorer = sprites[0];
  const explorerHome = explorer.position.clone();

  function sizeRenderer() {
    const nextMobile = window.innerWidth <= MOBILE_BREAKPOINT;
    if (mobile !== nextMobile) {
      mobile = nextMobile;
      sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
      sun.shadow.map?.dispose();
      sun.shadow.map = null;
    }
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width || canvas.clientWidth || 1));
    const height = Math.max(1, Math.round(rect.height || canvas.clientHeight || 1));
    const dprCap = mobile ? 1.25 : 1.5;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
    renderer.setSize(width, height, false);
    const span = mobile ? 20 : 15.2;
    camera.left = -span * width / height;
    camera.right = span * width / height;
    camera.top = span;
    camera.bottom = -span;
    camera.updateProjectionMatrix();
    dirty = true;
    schedule();
  }

  function render() {
    renderer.render(scene, camera);
    renderFrames += 1;
    dirty = false;
  }

  function startTween(position, target, zoom = 1.3) {
    cameraTween = {
      started: performance.now(), duration: reducedMotion || !motionEnabled ? 1 : 850,
      fromPosition: camera.position.clone(), toPosition: new THREE.Vector3(...position),
      fromTarget: controls.target.clone(), toTarget: new THREE.Vector3(...target),
      fromZoom: camera.zoom, toZoom: zoom,
    };
    dirty = true;
    schedule();
  }

  function updateTween(now) {
    if (!cameraTween) return false;
    const t = clamp((now - cameraTween.started) / cameraTween.duration, 0, 1);
    const k = ease(t);
    camera.position.lerpVectors(cameraTween.fromPosition, cameraTween.toPosition, k);
    controls.target.lerpVectors(cameraTween.fromTarget, cameraTween.toTarget, k);
    camera.zoom = THREE.MathUtils.lerp(cameraTween.fromZoom, cameraTween.toZoom, k);
    camera.updateProjectionMatrix();
    controls.update();
    if (t >= 1) cameraTween = null;
    return true;
  }

  function updateExplorer(delta) {
    if (!explorationEnabled || keys.size === 0) return false;
    const dx = (keys.has('ArrowRight') || keys.has('KeyD') ? 1 : 0) - (keys.has('ArrowLeft') || keys.has('KeyA') ? 1 : 0);
    const dz = (keys.has('ArrowDown') || keys.has('KeyS') ? 1 : 0) - (keys.has('ArrowUp') || keys.has('KeyW') ? 1 : 0);
    if (!dx && !dz) return false;
    const length = Math.hypot(dx, dz);
    explorer.position.x += dx / length * delta * 4.2;
    explorer.position.z += dz / length * delta * 4.2;
    const radius = Math.hypot(explorer.position.x, explorer.position.z);
    if (radius > 13.8) {
      explorer.position.x *= 13.8 / radius;
      explorer.position.z *= 13.8 / radius;
    }
    return true;
  }

  function tick(now) {
    frame = 0;
    if (destroyed || hidden) return;
    const delta = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    const tweening = updateTween(now);
    const moving = updateExplorer(delta);
    const idleMotion = motionEnabled && !reducedMotion;
    if (idleMotion) {
      const t = now * 0.00032;
      world.children.forEach((child) => {
        if (child.userData.cloud) child.position.x += Math.sin(t + child.position.z) * 0.0008;
      });
      sprites.forEach((sprite, i) => { sprite.position.y = sprite.userData.baseY + Math.sin(t * 4 + i) * 0.055; });
    }
    const controlsChanged = controls.update();
    if (dirty || tweening || moving || idleMotion || controlsChanged) render();
    if (tweening || moving || idleMotion) schedule();
  }

  function schedule() {
    if (!frame && !destroyed && !hidden) frame = requestAnimationFrame(tick);
  }

  function focus(id) {
    const zone = ZONES[id];
    if (!zone) return false;
    selectedZone = id;
    const target = [...zone.focus];
    // Keep the selected room inside the unobstructed canvas left of the details card.
    if (!mobile) { target[0] += 2.25; target[2] -= 1.99; }
    const position = [target[0] + 11.5, target[1] + 10.5, target[2] + 13];
    startTween(position, target, mobile ? 1.65 : 2.15);
    return true;
  }

  function home() {
    selectedZone = null;
    startTween(HOME.position, HOME.target, HOME.zoom);
  }

  function setMotion(enabled) {
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    motionEnabled = Boolean(enabled) && !reducedMotion;
    dirty = true;
    if (motionEnabled) schedule();
    else render();
  }

  function setExploration(enabled) {
    explorationEnabled = Boolean(enabled);
    keys.clear();
    if (!explorationEnabled) {
      explorer.position.copy(explorerHome);
      explorer.userData.baseY = explorerHome.y;
      dirty = true;
      render();
    }
    return explorationEnabled;
  }

  function pick(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(selectables, true).find((item) => item.object.userData.zoneId);
    if (hit) {
      const id = hit.object.userData.zoneId;
      select(id);
      focus(id);
    }
  }

  function onPointerDown(event) { pressedAt = { x: event.clientX, y: event.clientY }; }
  function onPointerUp(event) {
    if (pressedAt && Math.hypot(event.clientX - pressedAt.x, event.clientY - pressedAt.y) < 5) pick(event);
    pressedAt = null;
  }
  function onKeyDown(event) {
    if (!explorationEnabled || eventIsFromControl(event)) return;
    if (/^(ArrowUp|ArrowDown|ArrowLeft|ArrowRight|KeyW|KeyA|KeyS|KeyD)$/.test(event.code)) {
      keys.add(event.code);
      event.preventDefault();
      schedule();
    }
  }
  function onKeyUp(event) { keys.delete(event.code); }
  function onBlur() { keys.clear(); }
  function onVisibility() {
    hidden = document.hidden;
    if (hidden && frame) cancelAnimationFrame(frame);
    frame = 0;
    lastTime = performance.now();
    if (!hidden) { dirty = true; schedule(); }
  }
  function onContextLost(event) {
    event.preventDefault();
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  }
  function onContextRestored() { dirty = true; schedule(); }

  controls.addEventListener('change', schedule);
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('webglcontextlost', onContextLost, false);
  canvas.addEventListener('webglcontextrestored', onContextRestored, false);
  window.addEventListener('keydown', onKeyDown, { passive: false });
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', onBlur);
  document.addEventListener('visibilitychange', onVisibility);
  const resizeObserver = new ResizeObserver(sizeRenderer);
  resizeObserver.observe(canvas);

  function getDiagnostics() {
    const info = renderer.info;
    return Object.freeze({
      renderer: 'WebGL',
      renderFrames,
      destroyed,
      selectedZone,
      explorerPosition: explorer.position.toArray(),
      zoneScreenPositions: Object.fromEntries(Object.entries(ZONES).map(([id, zone]) => {
        const p = new THREE.Vector3(...zone.focus).project(camera);
        const rect = canvas.getBoundingClientRect();
        return [id, {x: rect.left + (p.x + 1) * rect.width / 2, y: rect.top + (1 - p.y) * rect.height / 2}];
      })),
      zones: Object.keys(ZONES).length,
      drawCalls: info.render.calls,
      triangles: info.render.triangles,
      textures: info.memory.textures,
      geometries: info.memory.geometries,
      pixelRatio: renderer.getPixelRatio(),
      shadowMapSize: sun.shadow.mapSize.x,
      motionEnabled,
      explorationEnabled,
      hidden,
      reducedMotion: Boolean(reducedMotion),
    });
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    if (frame) cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    controls.removeEventListener('change', schedule);
    controls.dispose();
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('webglcontextlost', onContextLost);
    canvas.removeEventListener('webglcontextrestored', onContextRestored);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('blur', onBlur);
    document.removeEventListener('visibilitychange', onVisibility);
    scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        const list = Array.isArray(object.material) ? object.material : [object.material];
        list.forEach((material) => material.dispose());
      }
    });
    textures.forEach((texture) => texture.dispose());
    renderer.dispose();
  }

  sizeRenderer();
  render();
  ready();
  if (motionEnabled) schedule();

  return Object.freeze({ focus, home, setMotion, setExploration, destroy, getDiagnostics });
}
