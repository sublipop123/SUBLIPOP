import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js';

/* ===================== SHARED MODEL BUILDER ===================== */

function getMat(colorHex, opts = {}) {
    return new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(colorHex),
        metalness: opts.metalness || 0.1,
        roughness: opts.roughness || 0.4,
        clearcoat: opts.clearcoat || 0.3,
        clearcoatRoughness: 0.1,
        transparent: opts.transparent || false,
        opacity: opts.opacity !== undefined ? opts.opacity : 1.0,
        side: opts.side || THREE.FrontSide,
    });
}

function buildMug(type, group, colors) {
    const isMetal = type === 'taza_metal';
    const isGlass = type === 'taza_cristal';
    const isConic = type === 'taza_conica';
    const isTall  = type === 'taza_alta';
    const bodyCol = colors.bodyColor || '#ffffff';
    const rimCol  = colors.rimColor  || bodyCol;
    const handleCol = colors.handleColor || bodyCol;

    const points = [];
    const segments = 30;
    const height = isTall ? 3.2 : 2.6;
    const baseR  = isConic ? 1.15 : (isTall ? 0.95 : 1.0);
    const topR   = isConic ? 0.85 : (isTall ? 0.9 : 1.0);
    const wallThick = 0.12;

    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        let r = baseR - (baseR - topR) * t;
        if (t < 0.08) r += 0.03 * Math.sin((t / 0.08) * Math.PI * 0.5);
        if (t > 0.92) r += 0.02 * Math.sin(((1 - t) / 0.08) * Math.PI * 0.5);
        const y = (t - 0.5) * height;
        points.push(new THREE.Vector2(r, y));
    }
    for (let i = segments; i >= 0; i--) {
        const t = i / segments;
        let r = baseR - (baseR - topR) * t - wallThick;
        if (t < 0.08) r += 0.02 * Math.sin((t / 0.08) * Math.PI * 0.5);
        if (r < 0.1) r = 0.1;
        const y = (t - 0.5) * height + 0.05;
        points.push(new THREE.Vector2(r, y));
    }
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

    const rimGeo = new THREE.TorusGeometry(topR, 0.035, 12, 64);
    const rim = new THREE.Mesh(rimGeo, getMat(rimCol, {
        metalness: isMetal ? 0.85 : 0.05,
        roughness: 0.3,
    }));
    rim.rotation.x = Math.PI / 2;
    rim.position.y = height * 0.5;
    rim.name = 'rim';
    group.add(rim);

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

    return body;
}

function buildShirt(type, group, colors) {
    const isLongSleeve = type === 'camisa_manga_larga' || type === 'sudadera';
    const isSudadera = type === 'sudadera';
    const isWoman = type === 'camisa_mujer';
    const bodyCol = colors.bodyColor || '#ffffff';
    const sleeveCol = colors.sleeveColor || bodyCol;
    const collarCol = colors.collarColor || bodyCol;

    const torsoW = isWoman ? 1.5 : 1.7;
    const torsoH = isSudadera ? 2.4 : 2.2;
    const torsoD = 0.55;
    const torsoGeo = new THREE.BoxGeometry(torsoW, torsoH, torsoD, 10, 10, 4);
    const pos = torsoGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
        let nx = x, ny = y, nz = z;
        const waistFactor = 1.0 - Math.abs(y / torsoH) * 0.12;
        nx *= waistFactor;
        if (y > torsoH * 0.35) nx *= (1.0 + (y - torsoH * 0.35) * 0.15);
        if (isWoman && y < -torsoH * 0.15) nx *= 1.08;
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

    const sleeveLen = isLongSleeve ? 1.4 : 0.75;
    const sleeveR = isLongSleeve ? 0.28 : 0.32;
    const sleeveGeo = new THREE.CylinderGeometry(sleeveR, sleeveR * 0.9, sleeveLen, 16, 4, true);
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

    if (isSudadera) {
        const hoodCol = colors.hoodColor || collarCol;
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

function buildShaker(type, group, colors) {
    const isThermo = type === 'termo';
    const bodyCol = colors.bodyColor || '#ffffff';
    const lidCol = colors.lidColor || bodyCol;
    const points = [];
    const h = isThermo ? 3.8 : 2.8;
    const baseR = 0.85;
    for (let i = 0; i <= 40; i++) {
        const t = i / 40;
        let r = baseR;
        if (t < 0.05) r = baseR * (t / 0.05);
        else if (t > 0.85 && t < 0.92) r = baseR - (t - 0.85) * 0.3;
        else if (t >= 0.92) r = baseR - 0.21;
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

    const lidH = isThermo ? 0.35 : 0.5;
    const lidR = baseR - 0.21;
    const lidGeo = new THREE.CylinderGeometry(lidR, lidR, lidH, 48);
    const lid = new THREE.Mesh(lidGeo, getMat(lidCol, { metalness: 0.5, roughness: 0.3, clearcoat: 0.6 }));
    lid.position.y = h * 0.5 + lidH * 0.5;
    lid.name = 'lid';
    group.add(lid);

    const capCol = colors.capColor || lidCol;
    const capGeo = new THREE.CylinderGeometry(lidR * 0.45, lidR * 0.5, 0.15, 24);
    const cap = new THREE.Mesh(capGeo, getMat(capCol, { metalness: 0.5, roughness: 0.3 }));
    cap.position.y = h * 0.5 + lidH + 0.075;
    cap.name = 'cap';
    group.add(cap);
    return body;
}

function buildBeerMug(group, colors) {
    const bodyCol = colors.bodyColor || '#ffffff';
    const rimCol = colors.rimColor || bodyCol;
    const handleCol = colors.handleColor || bodyCol;
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

function buildHighball(group, colors) {
    const bodyCol = colors.bodyColor || '#ffffff';
    const rimCol = colors.rimColor || bodyCol;
    const points = [];
    for (let i = 0; i <= 30; i++) {
        const t = i / 30;
        const r = 0.7 + t * 0.2;
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

function buildToteBag(group, colors) {
    const bodyCol = colors.bodyColor || '#ffffff';
    const handleCol = colors.handleColor || bodyCol;
    const w = 1.8, h = 2.0, d = 0.45;
    const bodyGeo = new THREE.BoxGeometry(w, h, d, 8, 8, 2);
    const pos = bodyGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i);
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

function buildCap(group, colors) {
    const crownCol = colors.crownColor || colors.bodyColor || '#ffffff';
    const visorCol = colors.visorColor || colors.rimColor || crownCol;
    const strapCol = colors.strapColor || colors.handleColor || crownCol;
    const crownGeo = new THREE.SphereGeometry(0.75, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const crown = new THREE.Mesh(crownGeo, getMat(crownCol, { roughness: 0.6 }));
    crown.position.y = 0.1;
    crown.castShadow = true;
    crown.name = 'crown';
    group.add(crown);

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

    const strapGeo = new THREE.BoxGeometry(0.4, 0.08, 0.15);
    const strap = new THREE.Mesh(strapGeo, getMat(strapCol, { roughness: 0.7 }));
    strap.position.set(0, 0.1, -0.72);
    strap.name = 'strap';
    group.add(strap);
    return crown;
}

function buildCushion(group, colors) {
    const bodyCol = colors.bodyColor || '#ffffff';
    const w = 2.2, h = 2.2, d = 0.4;
    const bodyGeo = new THREE.BoxGeometry(w, h, d, 12, 12, 2);
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

    const zipperCol = colors.zipperColor || colors.rimColor || '#cccccc';
    const zipperGeo = new THREE.BoxGeometry(w * 0.9, 0.04, d * 0.05);
    const zipper = new THREE.Mesh(zipperGeo, getMat(zipperCol, { roughness: 0.6, metalness: 0.3 }));
    zipper.position.set(0, -h * 0.5 + 0.02, d * 0.52);
    zipper.name = 'zipper';
    group.add(zipper);

    return body;
}

function buildSlipper(group, colors) {
    const bodyCol = colors.bodyColor || '#ffffff';
    const soleCol = colors.soleColor || colors.rimColor || '#333333';
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

function buildSock(group, colors) {
    const bodyCol = colors.bodyColor || '#ffffff';
    const cuffCol = colors.cuffColor || colors.rimColor || bodyCol;
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

    const legGeo = new THREE.CylinderGeometry(0.3, 0.32, 1.2, 24, 1, true);
    const leg = new THREE.Mesh(legGeo, getMat(bodyCol, { roughness: 0.75, side: THREE.DoubleSide }));
    leg.position.y = 1.4;
    leg.name = 'leg';
    group.add(leg);

    const cuffGeo = new THREE.TorusGeometry(0.3, 0.04, 8, 24);
    const cuff = new THREE.Mesh(cuffGeo, getMat(cuffCol, { roughness: 0.75 }));
    cuff.rotation.x = Math.PI / 2;
    cuff.position.y = 2.0;
    cuff.name = 'cuff';
    group.add(cuff);
    return foot;
}

function buildModel(type, group, colors) {
    let targetMesh = null;
    if (type.startsWith('taza_')) targetMesh = buildMug(type, group, colors);
    else if (type.startsWith('camisa_') || type === 'sudadera') targetMesh = buildShirt(type, group, colors);
    else if (type === 'shaker' || type === 'termo') targetMesh = buildShaker(type, group, colors);
    else if (type === 'tarro_cervecero') targetMesh = buildBeerMug(group, colors);
    else if (type === 'vaso_highball') targetMesh = buildHighball(group, colors);
    else if (type === 'tote_bag') targetMesh = buildToteBag(group, colors);
    else if (type === 'gorra') targetMesh = buildCap(group, colors);
    else if (type === 'funda_cojin') targetMesh = buildCushion(group, colors);
    else if (type === 'pantuflas') targetMesh = buildSlipper(group, colors);
    else if (type === 'calcetines') targetMesh = buildSock(group, colors);
    else targetMesh = buildMug('taza_clasica', group, colors);
    return targetMesh;
}

/* ===================== DECAL HELPERS ===================== */
function applyTextureDecal(group, textureData, opacity, targetMeshName = 'body') {
    if (!group || !textureData) return;
    const loader = new THREE.TextureLoader();
    loader.load(textureData, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        const decalMat = new THREE.MeshBasicMaterial({
            map: tex, transparent: true, opacity: opacity || 0.9,
            depthTest: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4,
        });
        const bodyMesh = group.getObjectByName(targetMeshName) || group.getObjectByName('crown') || group.children[0];
        if (!bodyMesh) return;
        const box = new THREE.Box3().setFromObject(bodyMesh);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const pos = center.clone();
        pos.z += size.z * 0.5 + 0.01;
        pos.y += size.y * 0.05;
        const orientation = new THREE.Euler(0, 0, 0);
        const decalSize = new THREE.Vector3(size.x * 0.75, size.y * 0.55, 0.5);
        const decalGeo = new DecalGeometry(bodyMesh, pos, orientation, decalSize);
        const old = group.getObjectByName('imageDecal');
        if (old) { group.remove(old); old.geometry.dispose(); if (old.material.map) old.material.map.dispose(); old.material.dispose(); }
        const decal = new THREE.Mesh(decalGeo, decalMat);
        decal.name = 'imageDecal';
        group.add(decal);
    });
}

function applyTextDecal(group, text, color, size, targetMeshName = 'body') {
    if (!group || !text) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const s = 1024;
    canvas.width = s; canvas.height = s;
    ctx.clearRect(0, 0, s, s);
    ctx.fillStyle = color || '#ffffff';
    ctx.font = `bold ${Math.min(size || 48, 200)}px Poppins, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, s / 2, s / 2);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    const decalMat = new THREE.MeshBasicMaterial({
        map: tex, transparent: true, opacity: 0.95,
        depthTest: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4,
    });
    const bodyMesh = group.getObjectByName(targetMeshName) || group.getObjectByName('crown') || group.children[0];
    if (!bodyMesh) return;
    const box = new THREE.Box3().setFromObject(bodyMesh);
    const center = box.getCenter(new THREE.Vector3());
    const sz = box.getSize(new THREE.Vector3());
    const pos = center.clone();
    pos.z += sz.z * 0.5 + 0.02;
    const orientation = new THREE.Euler(0, 0, 0);
    const decalSize = new THREE.Vector3(sz.x * 0.6, sz.y * 0.3, 0.5);
    const decalGeo = new DecalGeometry(bodyMesh, pos, orientation, decalSize);
    const old = group.getObjectByName('textDecal');
    if (old) { group.remove(old); old.geometry.dispose(); if (old.material.map) old.material.map.dispose(); old.material.dispose(); }
    const decal = new THREE.Mesh(decalGeo, decalMat);
    decal.name = 'textDecal';
    group.add(decal);
}

/* ===================== PUBLIC API ===================== */
export function createViewer(container, modelData) {
    if (!container) return null;

    const cw = container.clientWidth || 800;
    const ch = container.clientHeight || 600;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, cw / ch, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(cw, ch);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 2;
    controls.maxDistance = 15;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2.0;

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

    const grid = new THREE.GridHelper(10, 20, 0x444444, 0x222222);
    grid.position.y = -2.5;
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    scene.add(grid);

    const group = new THREE.Group();
    buildModel(modelData.type || 'taza_clasica', group, modelData);

    if (modelData.texture) applyTextureDecal(group, modelData.texture, modelData.textureOpacity || 0.9);
    if (modelData.labelText) applyTextDecal(group, modelData.labelText, modelData.labelColor, modelData.labelSize);

    const box = new THREE.Box3().setFromObject(group);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const dist = maxDim * 1.8;
    controls.target.copy(center);
    camera.position.set(center.x, center.y + maxDim * 0.2, center.z + dist);
    camera.lookAt(center);
    controls.update();

    scene.add(group);

    let animId;
    function animate() {
        animId = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    const ro = new ResizeObserver(() => {
        const w = container.clientWidth, h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    });
    ro.observe(container);

    return {
        renderer, scene, camera, controls, group,
        dispose() {
            cancelAnimationFrame(animId);
            ro.disconnect();
            controls.dispose();
            renderer.dispose();
            group.traverse(c => {
                if (c.geometry) c.geometry.dispose();
                if (c.material) {
                    if (Array.isArray(c.material)) c.material.forEach(m => m.dispose());
                    else c.material.dispose();
                }
            });
            if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
        }
    };
}
