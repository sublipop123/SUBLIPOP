import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js';

/* ===================== 3D ENGINE CONFIG ===================== */
const PALETTE = [
    '#ffffff','#1a1a2e','#e040fb','#7c4dff','#00bcd4','#ff5252',
    '#4caf50','#ff9800','#9c27b0','#4169e1','#f44336','#795548',
    '#607d8b','#ffeb3b','#ff6b35','#2e7d32','#c2185b','#5d4037'
];

const MODEL_PRESETS = {
    taza_clasica:       { icon:'☕', name:'Taza Clásica',       category:'tazas',     parts:['body','rim','handle'] },
    taza_corazon:       { icon:'❤️', name:'Taza Asa Corazón',   category:'tazas',     parts:['body','rim','handle'] },
    taza_conica:        { icon:'🔺', name:'Taza Cónica',        category:'tazas',     parts:['body','rim','handle'] },
    taza_alta:          { icon:'🥤', name:'Taza Larga',         category:'tazas',     parts:['body','rim','handle'] },
    taza_metal:         { icon:'⚙️', name:'Taza Metal',         category:'tazas',     parts:['body','rim','handle'] },
    taza_cristal:       { icon:'💎', name:'Taza Cristal',       category:'tazas',     parts:['body','rim','handle'] },
    camisa_hombre:      { icon:'👕', name:'Camiseta Hombre',    category:'textiles',  parts:['body','sleeves','collar'] },
    camisa_mujer:       { icon:'👚', name:'Camiseta Mujer',     category:'textiles',  parts:['body','sleeves','collar'] },
    camisa_manga_larga: { icon:'🧥', name:'Camiseta Manga Larga', category:'textiles', parts:['body','sleeves','collar'] },
    sudadera:           { icon:'🧣', name:'Sudadera',           category:'textiles',  parts:['body','sleeves','hood'] },
    shaker:             { icon:'🍼', name:'Shaker Gym',         category:'tarros',    parts:['body','lid','cap'] },
    termo:              { icon:'🍶', name:'Termo',              category:'termos',    parts:['body','lid','cap'] },
    tarro_cervecero:    { icon:'🍺', name:'Tarro Cervecero',    category:'tarros',    parts:['body','rim','handle'] },
    vaso_highball:      { icon:'🥃', name:'Vaso Highball',        category:'tarros',    parts:['body','rim'] },
    tote_bag:           { icon:'🛍️', name:'Tote Bag',           category:'accesorios',parts:['body','handles'] },
    gorra:              { icon:'🧢', name:'Gorra',              category:'accesorios',parts:['crown','visor','strap'] },
    funda_cojin:        { icon:'🛋️', name:'Funda Cojín',        category:'hogar',     parts:['body','zipper'] },
    pantuflas:          { icon:'🥿', name:'Pantuflas',          category:'accesorios',parts:['body','sole'] },
    calcetines:         { icon:'🧦', name:'Calcetines',         category:'textiles',  parts:['body','cuff'] },
};

let scene, camera, renderer, controls, mainGroup, animId;
let autoRotate = true;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let intersection = {
    isIntersecting: false,
    point: new THREE.Vector3(),
    normal: new THREE.Vector3()
};

let currentModelData = {
    type: 'taza_clasica',
    bodyColor: '#ffffff',
    rimColor: '#ffffff',
    handleColor: '#ffffff',
    sleeveColor: '#ffffff',
    collarColor: '#ffffff',
    lidColor: '#ffffff',
    texture: null,
    textureOpacity: 0.9,
    labelText: '',
    labelColor: '#ffffff',
    labelSize: 48
};

const materialCache = {};

/* ===================== GEOMETRY BUILDERS ===================== */

function getMat(colorHex, opts = {}) {
    const key = colorHex + JSON.stringify(opts);
    if (materialCache[key]) return materialCache[key];
    const mat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(colorHex),
        metalness: opts.metalness || 0.1,
        roughness: opts.roughness || 0.4,
        clearcoat: opts.clearcoat || 0.3,
        clearcoatRoughness: 0.1,
        transparent: opts.transparent || false,
        opacity: opts.opacity !== undefined ? opts.opacity : 1.0,
        side: opts.side || THREE.FrontSide,
    });
    materialCache[key] = mat;
    return mat;
}

/* ---------- MUG BUILDERS (LatheGeometry for realistic curves) ---------- */
function buildMug(type, group) {
    const isMetal = type === 'taza_metal';
    const isGlass = type === 'taza_cristal';
    const isConic = type === 'taza_conica';
    const isTall  = type === 'taza_alta';

    const bodyCol = currentModelData.bodyColor || '#ffffff';
    const rimCol  = currentModelData.rimColor  || bodyCol;
    const handleCol = currentModelData.handleColor || bodyCol;

    // Create realistic mug profile with LatheGeometry
    const points = [];
    const segments = 30;
    const height = isTall ? 3.2 : 2.6;
    const baseR  = isConic ? 1.15 : (isTall ? 0.95 : 1.0);
    const topR   = isConic ? 0.85 : (isTall ? 0.9 : 1.0);
    const wallThick = 0.12;

    // Outer wall profile
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        let r = baseR - (baseR - topR) * t;
        // Add slight curve at bottom
        if (t < 0.08) r += 0.03 * Math.sin((t / 0.08) * Math.PI * 0.5);
        // Add slight curve at top rim
        if (t > 0.92) r += 0.02 * Math.sin(((1 - t) / 0.08) * Math.PI * 0.5);
        const y = (t - 0.5) * height;
        points.push(new THREE.Vector2(r, y));
    }
    // Inner wall profile (going up)
    for (let i = segments; i >= 0; i--) {
        const t = i / segments;
        let r = baseR - (baseR - topR) * t - wallThick;
        if (t < 0.08) r += 0.02 * Math.sin((t / 0.08) * Math.PI * 0.5);
        if (r < 0.1) r = 0.1;
        const y = (t - 0.5) * height + 0.05;
        points.push(new THREE.Vector2(r, y));
    }
    // Close the bottom
    points.push(new THREE.Vector2(0.1, -height * 0.5 + 0.05));

    const bodyGeo = new THREE.LatheGeometry(points, 64);
    const body = new THREE.Mesh(bodyGeo, getMat(bodyCol, {
        metalness: isMetal ? 0.85 : 0.05,
        roughness: isMetal ? 0.15 : 0.35,
        clearcoat: isGlass ? 1.0 : 0.4,
        transparent: isGlass,
        opacity: isGlass ? 0.45 : 1.0,
    }));
    body.castShadow = true;
    body.receiveShadow = true;
    body.name = 'body';
    group.add(body);

    // Rim torus
    const rimGeo = new THREE.TorusGeometry(topR, 0.035, 12, 64);
    const rim = new THREE.Mesh(rimGeo, getMat(rimCol, {
        metalness: isMetal ? 0.85 : 0.05,
        roughness: 0.3,
    }));
    rim.rotation.x = Math.PI / 2;
    rim.position.y = height * 0.5;
    rim.name = 'rim';
    group.add(rim);

    // Handle - smooth C curve with TubeGeometry
    const handleCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(baseR,  height * 0.25, 0),
        new THREE.Vector3(baseR + 0.55, height * 0.3, 0),
        new THREE.Vector3(baseR + 0.65, 0, 0),
        new THREE.Vector3(baseR + 0.55, -height * 0.25, 0),
        new THREE.Vector3(baseR, -height * 0.3, 0),
    ]);
    const handleTube = new THREE.TubeGeometry(handleCurve, 32, isMetal ? 0.07 : 0.085, 12, false);
    const handle = new THREE.Mesh(handleTube, getMat(handleCol, {
        metalness: isMetal ? 0.85 : 0.05,
        roughness: isMetal ? 0.2 : 0.4,
    }));
    handle.castShadow = true;
    handle.name = 'handle';
    group.add(handle);

    return body; // return main mesh for decal target
}

/* ---------- SHIRT BUILDER ---------- */
function buildShirt(type, group) {
    const isLongSleeve = type === 'camisa_manga_larga' || type === 'sudadera';
    const isSudadera = type === 'sudadera';
    const isWoman = type === 'camisa_mujer';

    const bodyCol = currentModelData.bodyColor || '#ffffff';
    const sleeveCol = currentModelData.sleeveColor || bodyCol;
    const collarCol = currentModelData.collarColor || bodyCol;

    // Torso - Box with modified vertices for shape
    const torsoW = isWoman ? 1.5 : 1.7;
    const torsoH = isSudadera ? 2.4 : 2.2;
    const torsoD = 0.55;
    const torsoGeo = new THREE.BoxGeometry(torsoW, torsoH, torsoD, 10, 10, 4);
    const pos = torsoGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
        let nx = x, ny = y, nz = z;
        // Taper waist
        const waistFactor = 1.0 - Math.abs(y / torsoH) * 0.12;
        nx *= waistFactor;
        // Round shoulders
        if (y > torsoH * 0.35) {
            nx *= (1.0 + (y - torsoH * 0.35) * 0.15);
        }
        // Woman shape - wider hips
        if (isWoman && y < -torsoH * 0.15) {
            nx *= 1.08;
        }
        // Chest bulge forward
        if (z > 0 && Math.abs(x) < torsoW * 0.4 && y > -0.2 && y < 0.6) {
            nz += 0.06 * Math.cos((x / (torsoW * 0.4)) * Math.PI * 0.5);
        }
        pos.setXYZ(i, nx, ny, nz);
    }
    torsoGeo.computeVertexNormals();
    const body = new THREE.Mesh(torsoGeo, getMat(bodyCol, { roughness: 0.7 }));
    body.castShadow = true;
    body.receiveShadow = true;
    body.name = 'body';
    group.add(body);

    // Sleeves
    const sleeveLen = isLongSleeve ? 1.4 : 0.75;
    const sleeveR = isLongSleeve ? 0.28 : 0.32;
    const sleeveGeo = new THREE.CylinderGeometry(sleeveR, sleeveR * 0.9, sleeveLen, 16, 4, true);
    // Curve sleeves slightly downward
    const spos = sleeveGeo.attributes.position;
    for (let i = 0; i < spos.count; i++) {
        const y = spos.getY(i);
        if (y < 0) spos.setX(i, spos.getX(i) + 0.08);
    }
    sleeveGeo.computeVertexNormals();

    const leftSleeve = new THREE.Mesh(sleeveGeo, getMat(sleeveCol, { roughness: 0.7 }));
    leftSleeve.position.set(-(torsoW * 0.5 + sleeveLen * 0.35), torsoH * 0.25, 0);
    leftSleeve.rotation.z = Math.PI / 2 + 0.15;
    leftSleeve.name = 'sleeves';
    group.add(leftSleeve);

    const rightSleeve = new THREE.Mesh(sleeveGeo, getMat(sleeveCol, { roughness: 0.7 }));
    rightSleeve.position.set((torsoW * 0.5 + sleeveLen * 0.35), torsoH * 0.25, 0);
    rightSleeve.rotation.z = -(Math.PI / 2 + 0.15);
    rightSleeve.name = 'sleeves2';
    group.add(rightSleeve);

    // Collar / Neck
    if (isSudadera) {
        const hoodCol = currentModelData.hoodColor || collarCol;
        // Hood - simplified as a half-sphere behind
        const hoodGeo = new THREE.SphereGeometry(0.6, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.6);
        const hood = new THREE.Mesh(hoodGeo, getMat(hoodCol, { roughness: 0.7 }));
        hood.position.set(0, torsoH * 0.55, -0.25);
        hood.rotation.x = -0.3;
        hood.name = 'hood';
        group.add(hood);
    } else {
        const collarGeo = new THREE.TorusGeometry(0.35, 0.05, 8, 24, Math.PI * 1.3);
        const collar = new THREE.Mesh(collarGeo, getMat(collarCol, { roughness: 0.7 }));
        collar.position.set(0, torsoH * 0.52, 0.02);
        collar.rotation.x = Math.PI / 2;
        collar.rotation.z = Math.PI * 0.85;
        collar.name = 'collar';
        group.add(collar);
    }

    return body;
}

/* ---------- SHAKER / THERMO BUILDER (Lathe) ---------- */
function buildShaker(type, group) {
    const isThermo = type === 'termo';
    const bodyCol = currentModelData.bodyColor || '#ffffff';
    const lidCol = currentModelData.lidColor || bodyCol;

    const points = [];
    const h = isThermo ? 3.8 : 2.8;
    const baseR = 0.85;

    // Shaker profile
    for (let i = 0; i <= 40; i++) {
        const t = i / 40;
        let r = baseR;
        if (t < 0.05) r = baseR * (t / 0.05); // rounded bottom
        else if (t > 0.85 && t < 0.92) r = baseR - (t - 0.85) * 0.3; // shoulder
        else if (t >= 0.92) r = baseR - 0.21; // neck
        const y = (t - 0.5) * h;
        points.push(new THREE.Vector2(r, y));
    }

    const bodyGeo = new THREE.LatheGeometry(points, 48);
    const body = new THREE.Mesh(bodyGeo, getMat(bodyCol, {
        metalness: isThermo ? 0.7 : 0.2,
        roughness: isThermo ? 0.25 : 0.35,
        clearcoat: 0.5,
    }));
    body.castShadow = true;
    body.name = 'body';
    group.add(body);

    // Lid
    const lidH = isThermo ? 0.35 : 0.5;
    const lidR = baseR - 0.21;
    const lidGeo = new THREE.CylinderGeometry(lidR, lidR, lidH, 48);
    const lid = new THREE.Mesh(lidGeo, getMat(lidCol, {
        metalness: 0.5, roughness: 0.3, clearcoat: 0.6,
    }));
    lid.position.y = h * 0.5 + lidH * 0.5;
    lid.name = 'lid';
    group.add(lid);

    // Cap / Spout
    const capCol = currentModelData.capColor || lidCol;
    const capGeo = new THREE.CylinderGeometry(lidR * 0.45, lidR * 0.5, 0.15, 24);
    const cap = new THREE.Mesh(capGeo, getMat(capCol, { metalness: 0.5, roughness: 0.3 }));
    cap.position.y = h * 0.5 + lidH + 0.075;
    cap.name = 'cap';
    group.add(cap);

    return body;
}

/* ---------- BEER MUG BUILDER ---------- */
function buildBeerMug(group) {
    const bodyCol = currentModelData.bodyColor || '#ffffff';
    const rimCol = currentModelData.rimColor || bodyCol;
    const handleCol = currentModelData.handleColor || bodyCol;

    const points = [];
    for (let i = 0; i <= 30; i++) {
        const t = i / 30;
        let r = 1.0;
        if (t < 0.05) r *= (t / 0.05);
        if (t > 0.9) r *= (1.0 + (1 - t) * 0.8);
        const y = (t - 0.5) * 2.4;
        points.push(new THREE.Vector2(r, y));
    }
    const bodyGeo = new THREE.LatheGeometry(points, 48);
    const body = new THREE.Mesh(bodyGeo, getMat(bodyCol, { roughness: 0.2, clearcoat: 0.8 }));
    body.castShadow = true;
    body.name = 'body';
    group.add(body);

    const rimGeo = new THREE.TorusGeometry(1.0, 0.04, 12, 48);
    const rim = new THREE.Mesh(rimGeo, getMat(rimCol, { roughness: 0.2 }));
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 1.2;
    rim.name = 'rim';
    group.add(rim);

    // Thick handle
    const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(1.0, 0.6, 0),
        new THREE.Vector3(1.6, 0.7, 0),
        new THREE.Vector3(1.75, 0, 0),
        new THREE.Vector3(1.6, -0.6, 0),
        new THREE.Vector3(1.0, -0.5, 0),
    ]);
    const handle = new THREE.Mesh(new THREE.TubeGeometry(curve, 32, 0.12, 12, false), getMat(handleCol, { roughness: 0.3 }));
    handle.name = 'handle';
    group.add(handle);

    return body;
}

/* ---------- HIGHBALL GLASS BUILDER ---------- */
function buildHighball(group) {
    const bodyCol = currentModelData.bodyColor || '#ffffff';
    const rimCol = currentModelData.rimColor || bodyCol;

    const points = [];
    for (let i = 0; i <= 30; i++) {
        const t = i / 30;
        const r = 0.7 + t * 0.2; // slight taper outward
        const y = (t - 0.5) * 3.0;
        points.push(new THREE.Vector2(r, y));
    }
    const bodyGeo = new THREE.LatheGeometry(points, 48);
    const body = new THREE.Mesh(bodyGeo, getMat(bodyCol, {
        transparent: true, opacity: 0.35, roughness: 0.05, metalness: 0.0, clearcoat: 1.0,
    }));
    body.castShadow = true;
    body.name = 'body';
    group.add(body);

    const rimGeo = new THREE.TorusGeometry(0.9, 0.03, 12, 48);
    const rim = new THREE.Mesh(rimGeo, getMat(rimCol, { transparent: true, opacity: 0.4, roughness: 0.05 }));
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 1.5;
    rim.name = 'rim';
    group.add(rim);

    return body;
}

/* ---------- TOTE BAG BUILDER ---------- */
function buildToteBag(group) {
    const bodyCol = currentModelData.bodyColor || '#ffffff';
    const handleCol = currentModelData.handleColor || bodyCol;

    const w = 1.8, h = 2.0, d = 0.45;
    const bodyGeo = new THREE.BoxGeometry(w, h, d, 8, 8, 2);
    // Round bottom corners slightly
    const pos = bodyGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
        if (y < -h * 0.4) {
            const factor = 1.0 - ((-h * 0.4 - y) / (h * 0.1)) * 0.08;
            pos.setX(i, x * Math.max(0.92, factor));
        }
    }
    bodyGeo.computeVertexNormals();
    const body = new THREE.Mesh(bodyGeo, getMat(bodyCol, { roughness: 0.8, side: THREE.DoubleSide }));
    body.castShadow = true;
    body.name = 'body';
    group.add(body);

    // Handles
    const curveL = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-w * 0.3, h * 0.5, 0),
        new THREE.Vector3(-w * 0.35, h * 0.5 + 0.5, 0),
        new THREE.Vector3(-w * 0.2, h * 0.5 + 0.6, 0),
        new THREE.Vector3(0, h * 0.5 + 0.65, 0),
    ]);
    const curveR = new THREE.CatmullRomCurve3([
        new THREE.Vector3(w * 0.3, h * 0.5, 0),
        new THREE.Vector3(w * 0.35, h * 0.5 + 0.5, 0),
        new THREE.Vector3(w * 0.2, h * 0.5 + 0.6, 0),
        new THREE.Vector3(0, h * 0.5 + 0.65, 0),
    ]);
    const handleL = new THREE.Mesh(new THREE.TubeGeometry(curveL, 24, 0.04, 8, false), getMat(handleCol, { roughness: 0.8 }));
    const handleR = new THREE.Mesh(new THREE.TubeGeometry(curveR, 24, 0.04, 8, false), getMat(handleCol, { roughness: 0.8 }));
    handleL.name = 'handles';
    handleR.name = 'handles2';
    group.add(handleL);
    group.add(handleR);

    return body;
}

/* ---------- CAP BUILDER ---------- */
function buildCap(group) {
    const crownCol = currentModelData.crownColor || currentModelData.bodyColor || '#ffffff';
    const visorCol = currentModelData.visorColor || currentModelData.rimColor || crownCol;
    const strapCol = currentModelData.strapColor || currentModelData.handleColor || crownCol;

    // Crown - half ellipsoid
    const crownGeo = new THREE.SphereGeometry(0.75, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const crown = new THREE.Mesh(crownGeo, getMat(crownCol, { roughness: 0.6 }));
    crown.position.y = 0.1;
    crown.castShadow = true;
    crown.name = 'crown';
    group.add(crown);

    // Visor
    const visorShape = new THREE.Shape();
    visorShape.moveTo(-0.65, 0);
    visorShape.quadraticCurveTo(0, -0.25, 0.65, 0);
    visorShape.lineTo(0.7, 0.35);
    visorShape.quadraticCurveTo(0, 0.5, -0.7, 0.35);
    visorShape.lineTo(-0.65, 0);
    const visorGeo = new THREE.ExtrudeGeometry(visorShape, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 });
    const visor = new THREE.Mesh(visorGeo, getMat(visorCol, { roughness: 0.6 }));
    visor.rotation.x = Math.PI / 2;
    visor.position.set(0, 0.05, 0.5);
    visor.name = 'visor';
    group.add(visor);

    // Strap at back
    const strapGeo = new THREE.BoxGeometry(0.4, 0.08, 0.15);
    const strap = new THREE.Mesh(strapGeo, getMat(strapCol, { roughness: 0.7 }));
    strap.position.set(0, 0.1, -0.72);
    strap.name = 'strap';
    group.add(strap);

    return crown;
}

/* ---------- CUSHION COVER BUILDER ---------- */
function buildCushion(group) {
    const bodyCol = currentModelData.bodyColor || '#ffffff';
    const w = 2.2, h = 2.2, d = 0.4;
    const bodyGeo = new THREE.BoxGeometry(w, h, d, 12, 12, 2);
    // Puff effect - round the edges
    const pos = bodyGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
        const dx = Math.abs(x) / (w * 0.5);
        const dy = Math.abs(y) / (h * 0.5);
        const dist = Math.max(dx, dy);
        if (dist > 0.85) {
            const bulge = (dist - 0.85) * 0.3;
            pos.setZ(i, z + (z > 0 ? bulge : -bulge));
        }
    }
    bodyGeo.computeVertexNormals();
    const body = new THREE.Mesh(bodyGeo, getMat(bodyCol, { roughness: 0.9, side: THREE.DoubleSide }));
    body.castShadow = true;
    body.name = 'body';
    group.add(body);

    // Zipper line on bottom edge
    const zipperCol = currentModelData.zipperColor || currentModelData.rimColor || '#cccccc';
    const zipperGeo = new THREE.BoxGeometry(w * 0.9, 0.04, d * 0.05);
    const zipper = new THREE.Mesh(zipperGeo, getMat(zipperCol, { roughness: 0.6, metalness: 0.3 }));
    zipper.position.set(0, -h * 0.5 + 0.02, d * 0.52);
    zipper.name = 'zipper';
    group.add(zipper);

    return body;
}

/* ---------- SLIPPER BUILDER ---------- */
function buildSlipper(group) {
    const bodyCol = currentModelData.bodyColor || '#ffffff';
    const soleCol = currentModelData.soleColor || currentModelData.rimColor || '#333333';

    // Sole
    const soleShape = new THREE.Shape();
    soleShape.moveTo(-0.5, -1.0);
    soleShape.bezierCurveTo(-0.6, -0.3, -0.55, 0.5, -0.4, 1.0);
    soleShape.bezierCurveTo(-0.1, 1.15, 0.1, 1.15, 0.4, 1.0);
    soleShape.bezierCurveTo(0.55, 0.5, 0.6, -0.3, 0.5, -1.0);
    soleShape.bezierCurveTo(0.2, -1.15, -0.2, -1.15, -0.5, -1.0);
    const soleGeo = new THREE.ExtrudeGeometry(soleShape, { depth: 0.15, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2 });
    const sole = new THREE.Mesh(soleGeo, getMat(soleCol, { roughness: 0.7 }));
    sole.rotation.x = Math.PI / 2;
    sole.name = 'sole';
    group.add(sole);

    // Upper
    const upperCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.4, 0.15, -0.8),
        new THREE.Vector3(-0.45, 0.55, -0.2),
        new THREE.Vector3(-0.35, 0.6, 0.3),
        new THREE.Vector3(-0.15, 0.55, 0.7),
        new THREE.Vector3(0.15, 0.55, 0.7),
        new THREE.Vector3(0.35, 0.6, 0.3),
        new THREE.Vector3(0.45, 0.55, -0.2),
        new THREE.Vector3(0.4, 0.15, -0.8),
    ]);
    const upper = new THREE.Mesh(new THREE.TubeGeometry(upperCurve, 32, 0.12, 12, false), getMat(bodyCol, { roughness: 0.8 }));
    upper.name = 'body';
    group.add(upper);

    return upper;
}

/* ---------- SOCK BUILDER ---------- */
function buildSock(group) {
    const bodyCol = currentModelData.bodyColor || '#ffffff';
    const cuffCol = currentModelData.cuffColor || currentModelData.rimColor || bodyCol;

    // Foot
    const points = [];
    for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        let r = 0.3;
        if (t < 0.1) r *= (0.5 + t * 5);
        if (t > 0.85) r *= (1.0 - (t - 0.85) * 6.0);
        const y = (t - 0.5) * 1.6;
        points.push(new THREE.Vector2(r, y));
    }
    const footGeo = new THREE.LatheGeometry(points, 24);
    const foot = new THREE.Mesh(footGeo, getMat(bodyCol, { roughness: 0.75 }));
    foot.name = 'body';
    group.add(foot);

    // Leg tube
    const legGeo = new THREE.CylinderGeometry(0.3, 0.32, 1.2, 24, 1, true);
    const leg = new THREE.Mesh(legGeo, getMat(bodyCol, { roughness: 0.75, side: THREE.DoubleSide }));
    leg.position.y = 1.4;
    leg.name = 'leg';
    group.add(leg);

    // Cuff
    const cuffGeo = new THREE.TorusGeometry(0.3, 0.04, 8, 24);
    const cuff = new THREE.Mesh(cuffGeo, getMat(cuffCol, { roughness: 0.75 }));
    cuff.rotation.x = Math.PI / 2;
    cuff.position.y = 2.0;
    cuff.name = 'cuff';
    group.add(cuff);

    return foot;
}

/* ===================== MAIN BUILD ROUTER ===================== */
function buildModel(type) {
    if (mainGroup) {
        scene.remove(mainGroup);
        mainGroup.traverse(c => {
            if (c.geometry) c.geometry.dispose();
            if (c.material) {
                if (Array.isArray(c.material)) c.material.forEach(m => m.dispose());
                else c.material.dispose();
            }
        });
    }
    mainGroup = new THREE.Group();
    currentModelData.type = type;

    let targetMesh = null;

    if (type.startsWith('taza_')) {
        targetMesh = buildMug(type, mainGroup);
    } else if (type.startsWith('camisa_') || type === 'sudadera') {
        targetMesh = buildShirt(type, mainGroup);
    } else if (type === 'shaker' || type === 'termo') {
        targetMesh = buildShaker(type, mainGroup);
    } else if (type === 'tarro_cervecero') {
        targetMesh = buildBeerMug(mainGroup);
    } else if (type === 'vaso_highball') {
        targetMesh = buildHighball(mainGroup);
    } else if (type === 'tote_bag') {
        targetMesh = buildToteBag(mainGroup);
    } else if (type === 'gorra') {
        targetMesh = buildCap(mainGroup);
    } else if (type === 'funda_cojin') {
        targetMesh = buildCushion(mainGroup);
    } else if (type === 'pantuflas') {
        targetMesh = buildSlipper(mainGroup);
    } else if (type === 'calcetines') {
        targetMesh = buildSock(mainGroup);
    } else {
        targetMesh = buildMug('taza_clasica', mainGroup);
    }

    // Apply stored colors
    applyStoredColors();

    // Apply texture decal
    if (currentModelData.texture) applyTextureDecal();

    // Apply text label
    if (currentModelData.labelText) applyTextDecal();

    scene.add(mainGroup);

    // Center camera on model
    const box = new THREE.Box3().setFromObject(mainGroup);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const dist = maxDim * 1.8;
    if (controls) {
        controls.target.copy(center);
        controls.update();
    }
    camera.position.set(center.x, center.y + maxDim * 0.2, center.z + dist);
    camera.lookAt(center);

    return targetMesh;
}

/* ===================== DECAL / TEXTURE SYSTEM ===================== */
function applyTextureDecal() {
    if (!mainGroup || !currentModelData.texture) return;
    const loader = new THREE.TextureLoader();
    loader.load(currentModelData.texture, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        const decalMat = new THREE.MeshBasicMaterial({
            map: tex, transparent: true,
            opacity: currentModelData.textureOpacity || 0.9,
            depthTest: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4,
        });

        // Find main body mesh for projection target
        const bodyMesh = mainGroup.getObjectByName('body') || mainGroup.getObjectByName('crown') || mainGroup.children[0];
        if (!bodyMesh) return;

        // Create decal positioned on front surface
        const box = new THREE.Box3().setFromObject(bodyMesh);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const pos = center.clone();
        pos.z += size.z * 0.5 + 0.01;
        pos.y += size.y * 0.05;

        const orientation = new THREE.Euler(0, 0, 0);
        const decalSize = new THREE.Vector3(size.x * 0.75, size.y * 0.55, 0.5);

        const decalGeo = new DecalGeometry(bodyMesh, pos, orientation, decalSize);

        // Remove old decal
        const old = mainGroup.getObjectByName('imageDecal');
        if (old) { mainGroup.remove(old); old.geometry.dispose(); if (old.material.map) old.material.map.dispose(); old.material.dispose(); }

        const decal = new THREE.Mesh(decalGeo, decalMat);
        decal.name = 'imageDecal';
        mainGroup.add(decal);
    });
}

function removeTexture() {
    currentModelData.texture = null;
    const preview = document.getElementById('texturePreview');
    if (preview) { preview.classList.remove('active'); preview.style.backgroundImage = ''; }
    const input = document.getElementById('textureUpload');
    if (input) input.value = '';
    if (mainGroup) {
        const old = mainGroup.getObjectByName('imageDecal');
        if (old) { mainGroup.remove(old); old.geometry.dispose(); if (old.material.map) old.material.map.dispose(); old.material.dispose(); }
    }
}

function applyTextDecal() {
    if (!mainGroup || !currentModelData.labelText) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 1024;
    canvas.width = size; canvas.height = size;
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = currentModelData.labelColor || '#ffffff';
    ctx.font = `bold ${Math.min(currentModelData.labelSize || 48, 200)}px Poppins, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(currentModelData.labelText, size / 2, size / 2);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;

    const decalMat = new THREE.MeshBasicMaterial({
        map: tex, transparent: true, opacity: 0.95,
        depthTest: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4,
    });

    const bodyMesh = mainGroup.getObjectByName('body') || mainGroup.getObjectByName('crown') || mainGroup.children[0];
    if (!bodyMesh) return;
    const box = new THREE.Box3().setFromObject(bodyMesh);
    const center = box.getCenter(new THREE.Vector3());
    const sz = box.getSize(new THREE.Vector3());

    const pos = center.clone();
    pos.z += sz.z * 0.5 + 0.02;

    const orientation = new THREE.Euler(0, 0, 0);
    const decalSize = new THREE.Vector3(sz.x * 0.6, sz.y * 0.3, 0.5);

    const decalGeo = new DecalGeometry(bodyMesh, pos, orientation, decalSize);

    const old = mainGroup.getObjectByName('textDecal');
    if (old) { mainGroup.remove(old); old.geometry.dispose(); if (old.material.map) old.material.map.dispose(); old.material.dispose(); }

    const decal = new THREE.Mesh(decalGeo, decalMat);
    decal.name = 'textDecal';
    mainGroup.add(decal);
}

/* ===================== COLOR SYSTEM ===================== */
function applyStoredColors() {
    if (!mainGroup) return;
    const nameToPart = {
        body: 'body', leg: 'body', crown: 'crown',
        rim: 'rim', cuff: 'cuff', sole: 'sole', zipper: 'zipper',
        handle: 'handle', handles: 'handle', handles2: 'handle', strap: 'strap',
        cap: 'cap', lid: 'lid',
        sleeves: 'sleeves', sleeves2: 'sleeves',
        collar: 'collar', visor: 'visor', hood: 'hood',
    };
    mainGroup.children.forEach(child => {
        if (!child.material || !child.name) return;
        const part = nameToPart[child.name];
        if (!part) return;
        const colorKey = part + 'Color';
        if (currentModelData[colorKey]) {
            child.material.color.set(new THREE.Color(currentModelData[colorKey]));
        }
    });
}

function setPartColor(part, hex, el) {
    currentModelData[part + 'Color'] = hex;
    if (el && el.parentElement) {
        el.parentElement.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        el.classList.add('active');
    }
    applyStoredColors();
}

/* ===================== CONTROLS & INTERACTION ===================== */
function initEngine() {
    const container = document.getElementById('admin3dViewer');
    if (!container || renderer) return;

    const cw = container.clientWidth || 800;
    const ch = container.clientHeight || 600;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, cw / ch, 0.1, 100);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(cw, ch);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // OrbitControls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 2;
    controls.maxDistance = 15;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2.0;

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xd0c8ff, 0.4);
    fillLight.position.set(-5, 3, -3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffd0e0, 0.3);
    rimLight.position.set(0, 2, -6);
    scene.add(rimLight);

    // Floor grid
    const grid = new THREE.GridHelper(10, 20, 0x444444, 0x222222);
    grid.position.y = -2.5;
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    scene.add(grid);

    buildModel(currentModelData.type);
    renderColorGrids();
    initMugSelector();
    initDropZone();
    animate();

    // Resize observer
    new ResizeObserver(() => {
        if (!renderer || !container) return;
        const w = container.clientWidth, h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }).observe(container);
}

function animate() {
    animId = requestAnimationFrame(animate);
    if (controls) controls.update();
    if (renderer && scene && camera) renderer.render(scene, camera);
}

const PART_LABELS = {
    body: 'Cuerpo / Base', rim: 'Interior / Borde', handle: 'Asa / Agarre',
    sleeves: 'Mangas', collar: 'Cuello', lid: 'Tapa / Base',
    hood: 'Capucha', strap: 'Correa', cap: 'Tapón', crown: 'Corona',
    visor: 'Visera', sole: 'Suela', cuff: 'Puño', zipper: 'Cierre',
};

/* ===================== UI BINDINGS ===================== */
function renderColorGrids() {
    const container = document.getElementById('dynamicColorGrids');
    if (!container) return;
    const preset = MODEL_PRESETS[currentModelData.type] || MODEL_PRESETS.taza_clasica;
    const parts = preset.parts;
    container.innerHTML = parts.map(part => {
        const label = PART_LABELS[part] || part;
        const activeColor = currentModelData[part + 'Color'] || '#ffffff';
        return `
        <div style="margin-bottom:0.6rem;">
            <label style="font-size:0.7rem;color:var(--text-muted);display:block;margin-bottom:0.3rem;">${label}</label>
            <div class="color-grid" id="${part}ColorGrid">${PALETTE.map(c =>
                `<div class="color-swatch ${activeColor === c ? 'active' : ''}" style="background:${c};" onclick="window.MODEL3D.setPartColor('${part}','${c}',this)"></div>`
            ).join('')}</div>
        </div>`;
    }).join('');
}

function initMugSelector() {
    const sel = document.getElementById('mugTypeSelector');
    if (!sel) return;
    // Rebuild selector with all presets
    const cats = {};
    Object.entries(MODEL_PRESETS).forEach(([key, p]) => {
        if (!cats[p.category]) cats[p.category] = [];
        cats[p.category].push({ key, ...p });
    });

    let html = '';
    for (const [cat, items] of Object.entries(cats)) {
        html += `<div style="font-size:0.65rem;color:var(--text-muted);text-transform:uppercase;margin:0.5rem 0 0.2rem;">${cat}</div>`;
        html += `<div style="display:flex;gap:0.4rem;flex-wrap:wrap;">`;
        items.forEach(item => {
            html += `<div class="mug-thumb ${currentModelData.type === item.key ? 'active' : ''}" data-type="${item.key}" title="${item.name}" style="flex:0 0 52px;height:52px;font-size:1.2rem;">${item.icon}</div>`;
        });
        html += `</div>`;
    }
    sel.innerHTML = html;

    sel.querySelectorAll('.mug-thumb').forEach(th => {
        th.addEventListener('click', () => {
            sel.querySelectorAll('.mug-thumb').forEach(t => t.classList.remove('active'));
            th.classList.add('active');
            buildModel(th.dataset.type);
            renderColorGrids();
        });
    });
}

function initDropZone() {
    const zone = document.getElementById('dropZone');
    const input = document.getElementById('textureUpload');
    if (!zone || !input) return;
    zone.addEventListener('click', () => input.click());
    input.addEventListener('change', (e) => { if (e.target.files[0]) handleTextureFile(e.target.files[0]); });
    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('dragover'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('dragover');
        if (e.dataTransfer.files[0]) handleTextureFile(e.dataTransfer.files[0]);
    });
}

function handleTextureFile(file) {
    if (file.size > 10 * 1024 * 1024) { window.showToast?.('La imagen no debe superar 10MB', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
        currentModelData.texture = e.target.result;
        const preview = document.getElementById('texturePreview');
        if (preview) { preview.style.backgroundImage = `url(${e.target.result})`; preview.classList.add('active'); }
        applyTextureDecal();
        window.showToast?.('Imagen cargada', 'success');
    };
    reader.readAsDataURL(file);
}

function updateTextureOpacity(val) { currentModelData.textureOpacity = val / 100; applyTextureDecal(); }
function updateLabelText(val) { currentModelData.labelText = val; applyTextDecal(); }
function updateLabelColor(val) { currentModelData.labelColor = val; applyTextDecal(); }
function updateLabelSize(val) { currentModelData.labelSize = parseInt(val); applyTextDecal(); }
function toggleAutoRotate() {
    autoRotate = !autoRotate;
    if (controls) controls.autoRotate = autoRotate;
    const btn = document.getElementById('btnRotateAuto');
    if (btn) btn.classList.toggle('active', autoRotate);
}
function resetCamera() {
    if (controls) {
        controls.reset();
        controls.autoRotate = autoRotate;
    }
    if (mainGroup) {
        const box = new THREE.Box3().setFromObject(mainGroup);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        camera.position.set(center.x, center.y + maxDim * 0.2, center.z + maxDim * 1.8);
        camera.lookAt(center);
        controls.target.copy(center);
        controls.update();
    }
}
function captureSnapshot() {
    if (!renderer) return;
    const link = document.createElement('a');
    link.download = 'modelo-3d-' + Date.now() + '.png';
    link.href = renderer.domElement.toDataURL('image/png');
    link.click();
    window.showToast?.('Captura descargada', 'success');
}

/* ===================== SAVE / LOAD / GALLERY ===================== */
function saveModel() {
    const preset = MODEL_PRESETS[currentModelData.type] || MODEL_PRESETS.taza_clasica;
    const id = Date.now();
    const model = {
        ...currentModelData, id,
        name: preset.name + ' ' + new Date().toLocaleString('es-MX', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }),
        createdAt: Date.now()
    };
    window.db = window.db || {};
    window.db.modelos3d = window.db.modelos3d || [];
    window.db.modelos3d.push(model);
    if (window.saveDatabase) window.saveDatabase();
    window.showToast?.('Modelo guardado en galería', 'success');
    renderSavedModels();
}

function renderSavedModels() {
    const grid = document.getElementById('savedModelsGrid');
    if (!grid) return;
    window.db = window.db || {};
    const models = window.db.modelos3d || [];
    const selected = window.db.modelos3dSeleccionados || [];
    if (models.length === 0) {
        grid.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;grid-column:1/-1;text-align:center;padding:2rem;">No hay modelos guardados. Crea uno en el Editor.</p>';
        return;
    }
    grid.innerHTML = models.map(m => {
        const isSel = selected.includes(m.id);
        const preset = MODEL_PRESETS[m.type] || MODEL_PRESETS.taza_clasica;
        const partColors = preset.parts.map(p => m[p + 'Color'] || '#ffffff');
        const bg = `linear-gradient(145deg, ${partColors[0] || '#fff'}, ${partColors[1] || partColors[0] || '#eee'})`;
        return `
        <div class="saved-model-card ${isSel ? 'selected-for-display' : ''}" data-id="${m.id}">
            ${isSel ? '<div class="selection-badge">✓</div>' : ''}
            <div class="model-preview" style="background:${bg};"><span style="font-size:3rem;">${preset.icon}</span></div>
            <h4>${m.name}</h4>
            <p>${preset.name} · ${m.labelText || 'Sin texto'}</p>
            <div class="model-actions">
                <button class="btn-select ${isSel ? 'active' : ''}" onclick="window.MODEL3D.toggleModelSelection(${m.id})">${isSel ? 'Seleccionado' : 'Exhibir'}</button>
                <button class="btn-edit" onclick="window.MODEL3D.loadModelIntoEditor(${m.id})">Editar</button>
                <button class="btn-delete" onclick="window.MODEL3D.deleteModel(${m.id})">Eliminar</button>
            </div>
        </div>`;
    }).join('');
}

function toggleModelSelection(id) {
    window.db = window.db || {};
    window.db.modelos3dSeleccionados = window.db.modelos3dSeleccionados || [];
    const idx = window.db.modelos3dSeleccionados.indexOf(id);
    if (idx > -1) {
        window.db.modelos3dSeleccionados.splice(idx, 1);
    } else {
        if (window.db.modelos3dSeleccionados.length >= 2) {
            window.showToast?.('Solo puedes seleccionar 2 modelos', 'error');
            return;
        }
        window.db.modelos3dSeleccionados.push(id);
    }
    if (window.saveDatabase) window.saveDatabase();
    renderSavedModels();
}

function loadModelIntoEditor(id) {
    window.db = window.db || {};
    const m = (window.db.modelos3d || []).find(x => x.id === id);
    if (!m) return;
    currentModelData = { ...m };
    buildModel(m.type);
    if (m.texture) {
        const preview = document.getElementById('texturePreview');
        if (preview) { preview.style.backgroundImage = `url(${m.texture})`; preview.classList.add('active'); }
    } else { removeTexture(); }
    const lt = document.getElementById('labelText');
    if (lt) lt.value = m.labelText || '';
    const lc = document.getElementById('labelColor');
    if (lc) lc.value = m.labelColor || '#ffffff';
    const ls = document.getElementById('labelSize');
    if (ls) ls.value = m.labelSize || 48;
    const to = document.getElementById('textureOpacity');
    if (to) to.value = Math.round((m.textureOpacity || 0.9) * 100);
    renderColorGrids();
    switchTab('editor');
    window.showToast?.('Modelo cargado en editor', 'success');
}

function deleteModel(id) {
    window.db = window.db || {};
    window.db.modelos3d = (window.db.modelos3d || []).filter(m => m.id !== id);
    window.db.modelos3dSeleccionados = (window.db.modelos3dSeleccionados || []).filter(sid => sid !== id);
    if (window.saveDatabase) window.saveDatabase();
    renderSavedModels();
    window.showToast?.('Modelo eliminado', 'success');
}

function switchTab(tab) {
    const pe = document.getElementById('panel-editor');
    const pg = document.getElementById('panel-gallery');
    const te = document.getElementById('tab-editor');
    const tg = document.getElementById('tab-gallery');
    if (pe) pe.style.display = tab === 'editor' ? 'block' : 'none';
    if (pg) pg.style.display = tab === 'gallery' ? 'block' : 'none';
    if (te) te.classList.toggle('active', tab === 'editor');
    if (tg) tg.classList.toggle('active', tab === 'gallery');
    if (tab === 'gallery') renderSavedModels();
    if (tab === 'editor' && !renderer) setTimeout(initEngine, 100);
}

/* ===================== EXPOSE API ===================== */
window.MODEL3D = {
    init: initEngine,
    build: buildModel,
    setPartColor,
    applyStoredColors,
    renderColorGrids,
    initMugSelector,
    initDropZone,
    handleTextureFile,
    removeTexture,
    updateTextureOpacity,
    updateLabelText,
    updateLabelColor,
    updateLabelSize,
    toggleAutoRotate,
    resetCamera,
    captureSnapshot,
    saveModel,
    renderSavedModels,
    renderGallery: renderSavedModels,
    toggleModelSelection,
    loadModelIntoEditor,
    deleteModel,
    switchTab,
    get currentModelData() { return currentModelData; },
    MODEL_PRESETS,
    PALETTE,
};
