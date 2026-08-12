import * as THREE from 'three';

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.engineOsc = null;
        this.engineGain = null;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.setupEngineSound();
        }
    }

    setupEngineSound() {
        this.engineOsc = this.ctx.createOscillator();
        this.engineGain = this.ctx.createGain();
        this.engineOsc.type = 'sawtooth';
        this.engineOsc.frequency.setValueAtTime(40, this.ctx.currentTime);
        this.engineGain.gain.setValueAtTime(0.02, this.ctx.currentTime);
        this.engineOsc.connect(this.engineGain);
        this.engineGain.connect(this.ctx.destination);
        this.engineOsc.start();
    }

    updateEngine(speedRatio) {
        if (this.ctx && this.engineOsc) {
            const freq = 40 + Math.abs(speedRatio) * 140;
            this.engineOsc.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.05);
        }
    }

    playHitSound() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
    }

    playItemSound(pitch = 1) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400 * pitch, this.ctx.currentTime);
        osc.frequency.setValueAtTime(700 * pitch, this.ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(1000 * pitch, this.ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }

    playJumpSound() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(900, this.ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.25);
    }

    playLapSound() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, this.ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.15);
        osc.frequency.setValueAtTime(783.99, this.ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.5);
    }
}

const sounds = new SoundEngine();

// 1. Cena e Câmera
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
document.getElementById('game-container').appendChild(renderer.domElement);

// 2. Iluminação
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
dirLight.position.set(50, 80, 50);
dirLight.castShadow = true;
scene.add(dirLight);

const groundGeo = new THREE.PlaneGeometry(600, 600);
const groundMat = new THREE.MeshLambertMaterial({ color: 0x2e8b57 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// 3. Sistema de Circuitos
const trackLayouts = {
    easy: [
        new THREE.Vector3(60, 0, 0),
        new THREE.Vector3(40, 0, 50),
        new THREE.Vector3(-40, 0, 50),
        new THREE.Vector3(-60, 0, 0),
        new THREE.Vector3(-40, 0, -50),
        new THREE.Vector3(40, 0, -50)
    ],
    medium: [
        new THREE.Vector3(80, 0, 0),
        new THREE.Vector3(60, 0, 70),
        new THREE.Vector3(0, 0, 90),
        new THREE.Vector3(-60, 0, 60),
        new THREE.Vector3(-90, 0, 0),
        new THREE.Vector3(-60, 0, -60),
        new THREE.Vector3(0, 0, -40),
        new THREE.Vector3(50, 0, -70)
    ],
    hard: [
        new THREE.Vector3(90, 0, 0),
        new THREE.Vector3(70, 0, 80),
        new THREE.Vector3(10, 0, 40),
        new THREE.Vector3(-50, 0, 85),
        new THREE.Vector3(-95, 0, 10),
        new THREE.Vector3(-40, 0, -30),
        new THREE.Vector3(-80, 0, -85),
        new THREE.Vector3(20, 0, -90),
        new THREE.Vector3(75, 0, -45)
    ]
};

let currentTrackKey = 'medium';
let trackCurve, trackMesh, trackCenterPoints;
const trackWidth = 28;

function buildTrack(layoutKey) {
    if (trackMesh) scene.remove(trackMesh);
    
    trackCurve = new THREE.CatmullRomCurve3(trackLayouts[layoutKey], true);
    const trackGeo = new THREE.TubeGeometry(trackCurve, 200, trackWidth / 2, 8, false);
    
    const trackMat = new THREE.MeshStandardMaterial({ 
        color: 0x444444, 
        roughness: 0.8
    });
    
    trackMesh = new THREE.Mesh(trackGeo, trackMat);
    trackMesh.scale.set(1, 0.01, 1);
    trackMesh.position.y = 0.01;
    scene.add(trackMesh);

    trackCenterPoints = trackCurve.getPoints(200);
}
buildTrack(currentTrackKey);

// Criação da Linha de Largada e Chegada limpa e visível
function createStartFinishLine() {
    const startPt = trackCurve.getPoint(0);
    const tangent = trackCurve.getTangent(0);
    const angle = Math.atan2(tangent.x, tangent.z);

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    const cols = 14;
    const rows = 4;
    const w = canvas.width / cols;
    const h = canvas.height / rows;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            ctx.fillStyle = (r + c) % 2 === 0 ? '#ffffff' : '#111111';
            ctx.fillRect(c * w, r * h, w, h);
        }
    }

    const texture = new THREE.CanvasTexture(canvas);
    const planeGeo = new THREE.PlaneGeometry(trackWidth - 0.5, 3.5);
    const planeMat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, depthTest: false });
    const finishLineMesh = new THREE.Mesh(planeGeo, planeMat);

    finishLineMesh.rotation.x = -Math.PI / 2;
    finishLineMesh.position.set(startPt.x, 0.035, startPt.z);
    finishLineMesh.rotation.z = angle; // Rotação corrigida para cruzar a pista de lado a lado
    scene.add(finishLineMesh);
}
createStartFinishLine();

// Seleção de Pistas no Menu
document.querySelectorAll('.track-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.track-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const trackVal = e.currentTarget.getAttribute('data-track');
        if (trackVal in trackLayouts) {
            currentTrackKey = trackVal;
        } else {
            currentTrackKey = 'medium';
        }
        buildTrack(currentTrackKey);
        createStartFinishLine();
        setTimeout(() => createBarriersForTrack(), 50);
    });
});

// 4. Texturas Dinâmicas e Itens
function createDollarTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 256, 256);
    ctx.fillStyle = '#ffd700';
    ctx.strokeStyle = '#8b5a00';
    ctx.lineWidth = 14;
    ctx.font = '900 170px "Arial", sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.strokeText('$', 128, 135); ctx.fillText('$', 128, 135);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

function createRampTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ff3300'; ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#ffea00';
    
    for (let y = 30; y < 256; y += 80) {
        ctx.beginPath();
        ctx.moveTo(128, y);
        ctx.lineTo(210, y + 50);
        ctx.lineTo(170, y + 50);
        ctx.lineTo(170, y + 70);
        ctx.lineTo(86, y + 70);
        ctx.lineTo(86, y + 50);
        ctx.lineTo(46, y + 50);
        ctx.closePath();
        ctx.fill();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

const dollarTexture = createDollarTexture();
const rampTexture = createRampTexture();

function createCoinMesh() {
    const coinGroup = new THREE.Group();
    const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xff8c00, emissiveIntensity: 0.35, metalness: 0.85, roughness: 0.15 });
    const innerGoldMat = new THREE.MeshStandardMaterial({ color: 0xffea00, metalness: 0.6, roughness: 0.3 });
    const symbolMat = new THREE.MeshBasicMaterial({ map: dollarTexture, transparent: true });

    coinGroup.add(new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.22, 16, 32), goldMaterial));
    const center = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, 0.12, 32), innerGoldMat);
    center.rotation.x = Math.PI / 2;
    coinGroup.add(center);

    const plane = new THREE.PlaneGeometry(2.0, 2.0);
    const front = new THREE.Mesh(plane, symbolMat); front.position.z = 0.07;
    const back = new THREE.Mesh(plane, symbolMat); back.position.z = -0.07; back.rotation.y = Math.PI;
    coinGroup.add(front, back);

    return coinGroup;
}

function createMushroomMesh() {
    const shroomGroup = new THREE.Group();
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.9, 12), new THREE.MeshLambertMaterial({ color: 0xfffdd0 }));
    stem.position.y = 0.45; shroomGroup.add(stem);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshLambertMaterial({ color: 0xee0000 }));
    cap.position.y = 0.9; shroomGroup.add(cap);
    return shroomGroup;
}

function createQuestionCubeMesh() {
    return new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 1.8), new THREE.MeshStandardMaterial({ color: 0xffaa00, roughness: 0.3 }));
}

const itemBoxes = [];
const obstacles = [];
const ramps = [];

function spawnRewardItem(pt, itemType) {
    let meshGroup;
    if (itemType === 'coin') meshGroup = createCoinMesh();
    else if (itemType === 'mushroom') meshGroup = createMushroomMesh();
    else meshGroup = createQuestionCubeMesh();

    meshGroup.position.set(pt.x, 1.6, pt.z);
    scene.add(meshGroup);
    itemBoxes.push({ group: meshGroup, active: true, type: itemType });
}

function createRamp(pt, tangent) {
    const rampGroup = new THREE.Group();
    const rampGeo = new THREE.BoxGeometry(7, 1.4, 5);
    const rampMat = new THREE.MeshStandardMaterial({ map: rampTexture, roughness: 0.3 });
    const rampMesh = new THREE.Mesh(rampGeo, rampMat);
    rampMesh.rotation.x = -0.22;
    rampMesh.position.y = 0.5;
    rampGroup.add(rampMesh);

    rampGroup.position.set(pt.x, 0, pt.z);
    rampGroup.rotation.y = Math.atan2(tangent.x, tangent.z);
    scene.add(rampGroup);

    ramps.push({ position: pt.clone(), radius: 4 });
}

function createOilSlick(pt) {
    const oil = new THREE.Mesh(new THREE.CircleGeometry(3.5, 16), new THREE.MeshBasicMaterial({ color: 0x111111, side: THREE.DoubleSide }));
    oil.rotation.x = -Math.PI / 2;
    oil.position.set(pt.x, 0.04, pt.z);
    scene.add(oil);
    obstacles.push({ mesh: oil, radius: 3.5 });
}

spawnRewardItem(trackCurve.getPoint(0.12), 'coin');
spawnRewardItem(trackCurve.getPoint(0.38), 'mushroom');
spawnRewardItem(trackCurve.getPoint(0.62), 'cube');
spawnRewardItem(trackCurve.getPoint(0.82), 'coin');
[0.25, 0.7].forEach(t => createRamp(trackCurve.getPoint(t), trackCurve.getTangent(t)));
[0.3, 0.6].forEach(t => createOilSlick(trackCurve.getPoint(t)));

// 5. Kart do Jogador e Acessórios
let originalKartColor = 0xe60000;
let playerBodyMat = null;
let facePlaneMesh = null;
let playerAccessoriesGroup = null;

function createAccessoriesGroup(charKey, capColorHex) {
    const group = new THREE.Group();
    if (charKey === 'peach' || charKey === 'daisy') {
        const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.3, 0.3, 6), new THREE.MeshStandardMaterial({ color: charKey === 'peach' ? 0xffd700 : 0xff8c00, metalness: 0.8 }));
        crown.position.set(0, 0.95, 0); group.add(crown);
    } else {
        const cap = new THREE.Mesh(new THREE.SphereGeometry(0.88, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: capColorHex, roughness: 0.4 }));
        cap.position.set(0, 0.1, 0); group.add(cap);
        const visor = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.06, 0.5), new THREE.MeshStandardMaterial({ color: capColorHex, roughness: 0.4 }));
        visor.position.set(0, 0.25, 0.8); visor.rotation.x = 0.2; group.add(visor);
    }
    if (['mario', 'luigi', 'wario', 'bowser'].includes(charKey)) {
        const stache = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.12, 0.15), new THREE.MeshStandardMaterial({ color: charKey === 'wario' ? 0x111111 : 0x221100 }));
        stache.position.set(0, -0.22, 0.88); group.add(stache);
    }
    return group;
}

function buildDetailed3DKart(color, isPlayer = false) {
    const kartGroup = new THREE.Group();
    const kartBodyMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.2, metalness: 0.4 });
    if (isPlayer) playerBodyMat = kartBodyMat;

    const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.6, 3.8), kartBodyMat);
    body.position.y = 0.6; kartGroup.add(body);

    const bumper = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.3, 0.6), new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 }));
    bumper.position.set(0, 0.4, 2.0); kartGroup.add(bumper);

    const wing = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.15, 0.8), kartBodyMat);
    wing.position.set(0, 1.4, -1.8); kartGroup.add(wing);

    const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 18);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    [{ x: -1.3, y: 0.5, z: 1.2 }, { x: 1.3, y: 0.5, z: 1.2 }, { x: -1.3, y: 0.5, z: -1.2 }, { x: 1.3, y: 0.5, z: -1.2 }].forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(pos.x, pos.y, pos.z);
        kartGroup.add(wheel);
    });

    const helmetGroup = new THREE.Group();
    helmetGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.85, 24, 24), new THREE.MeshStandardMaterial({ color: 0xffe0bd, roughness: 0.5 })));

    if (isPlayer) {
        facePlaneMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.0), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true }));
        facePlaneMesh.position.set(0, -0.05, 0.84); helmetGroup.add(facePlaneMesh);
        playerAccessoriesGroup = createAccessoriesGroup('mario', 0xe60000);
        helmetGroup.add(playerAccessoriesGroup);
    }
    helmetGroup.position.set(0, 1.6, 0.1); kartGroup.add(helmetGroup);

    return kartGroup;
}

const kartGroup = buildDetailed3DKart(originalKartColor, true);
scene.add(kartGroup);

// Posicionamento tradicional: logo antes da linha de chegada (t = 0.99)
let speed = 0, angle = 0, verticalSpeed = 0, isJumping = false, boostTimer = 0;
const startPt = trackCurve.getPoint(0.99);
const startTangent = trackCurve.getTangent(0.0);
kartGroup.position.set(startPt.x, 0, startPt.z);
kartGroup.rotation.y = Math.atan2(startTangent.x, startTangent.z);
angle = kartGroup.rotation.y;

// 6. Inimigos IA
const aiKarts = [];
const aiColors = [0x00a000, 0xff69b4, 0xff9900, 0x0055ff, 0xffff00];

function createAIKarts() {
    aiColors.forEach((color, index) => {
        const aiGroup = buildDetailed3DKart(color, false);
        scene.add(aiGroup);
        aiKarts.push({ group: aiGroup, progress: (index + 1) * 0.15, speed: 0.0008 + Math.random() * 0.0003, offset: (index % 2 === 0 ? 4 : -4) });
    });
}
createAIKarts();

// 7. Personagens
const textureLoader = new THREE.TextureLoader();
const expressions = { neutro: null, feliz: null, triste: null };
const characterAssets = {
    mario: { color: 0xe60000 }, luigi: { color: 0x00a000 }, peach: { color: 0xff69b4 },
    daisy: { color: 0xff9900 }, yoshi: { color: 0x32cd32 }, toad: { color: 0x0055ff },
    bowser: { color: 0x228b22 }, wario: { color: 0xffd700 }, donkey_kong: { color: 0x8b4513 }
};

let selectedCharKey = 'mario';
let currentExpression = 'neutro';

function updatePlayerAccessories(charKey) {
    if (!playerAccessoriesGroup) return;
    const helmetGroup = playerAccessoriesGroup.parent;
    helmetGroup.remove(playerAccessoriesGroup);
    const charColor = characterAssets[charKey] ? characterAssets[charKey].color : 0xe60000;
    playerAccessoriesGroup = createAccessoriesGroup(charKey, charColor);
    helmetGroup.add(playerAccessoriesGroup);
}

document.querySelectorAll('.char-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.char-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const selectedChar = e.currentTarget.getAttribute('data-char');

        if (selectedChar === 'custom') {
            document.getElementById('custom-upload-panel').style.display = 'flex';
            updatePlayerAccessories(selectedCharKey);
        } else {
            document.getElementById('custom-upload-panel').style.display = 'none';
            selectedCharKey = selectedChar;
            const charData = characterAssets[selectedChar];
            if (charData) {
                originalKartColor = charData.color;
                if (playerBodyMat) playerBodyMat.color.setHex(originalKartColor);
            }
            updatePlayerAccessories(selectedCharKey);
        }
    });
});

let gameActive = false;
document.getElementById('btn-start').addEventListener('click', () => {
    sounds.init();
    document.getElementById('menu-screen').style.display = 'none';
    document.getElementById('hud-game').style.display = 'flex';
    document.getElementById('minimap-container').style.display = 'block';
    document.getElementById('speedometer-container').style.display = 'flex';
    
    if (window.matchMedia("(max-width: 900px), (pointer: coarse)").matches) {
        document.getElementById('mobile-controls').style.display = 'flex';
    }
    
    gameActive = true;
});

// 8. MINI-MAPA 2D
const minimapCanvas = document.getElementById('minimap');
const minimapCtx = minimapCanvas.getContext('2d');

function updateMinimap() {
    if (!gameActive) return;
    minimapCtx.clearRect(0, 0, 160, 160);

    minimapCtx.beginPath();
    minimapCtx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    minimapCtx.lineWidth = 10;
    trackCenterPoints.forEach((pt, idx) => {
        const mx = 80 + (pt.x / 180) * 70;
        const my = 80 + (pt.z / 180) * 70;
        if (idx === 0) minimapCtx.moveTo(mx, my);
        else minimapCtx.lineTo(mx, my);
    });
    minimapCtx.closePath();
    minimapCtx.stroke();

    aiKarts.forEach(ai => {
        const pos = ai.group.position;
        const mx = 80 + (pos.x / 180) * 70;
        const my = 80 + (pos.z / 180) * 70;
        minimapCtx.beginPath();
        minimapCtx.arc(mx, my, 4, 0, Math.PI * 2);
        minimapCtx.fillStyle = '#ff3300';
        minimapCtx.fill();
    });

    const pPos = kartGroup.position;
    const pmx = 80 + (pPos.x / 180) * 70;
    const pmy = 80 + (pPos.z / 180) * 70;
    minimapCtx.beginPath();
    minimapCtx.arc(pmx, pmy, 6, 0, Math.PI * 2);
    minimapCtx.fillStyle = '#00ffff';
    minimapCtx.fill();
    minimapCtx.strokeStyle = '#ffffff';
    minimapCtx.lineWidth = 2;
    minimapCtx.stroke();
}

// 9. Movimentação e Controles
const keys = { 
    ArrowUp: false, 
    ArrowDown: false, 
    ArrowLeft: false, 
    ArrowRight: false, 
    w: false, 
    s: false, 
    a: false, 
    d: false 
};

let coinsCount = 0, cubesCount = 0, mushroomsCount = 0, playerLives = 3;
let currentLap = 0;
let passedHalfTrack = false;

window.addEventListener('keydown', (e) => { if (e.key in keys) keys[e.key] = true; });
window.addEventListener('keyup', (e) => { if (e.key in keys) keys[e.key] = false; });

function bindTouchControl(elementId, keyName) {
    const btn = document.getElementById(elementId);
    if (!btn) return;
    
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); keys[keyName] = true; }, { passive: false });
    btn.addEventListener('touchend', (e) => { e.preventDefault(); keys[keyName] = false; }, { passive: false });
    btn.addEventListener('mousedown', (e) => { e.preventDefault(); keys[keyName] = true; });
    btn.addEventListener('mouseup', (e) => { e.preventDefault(); keys[keyName] = false; });
}

bindTouchControl('btn-left', 'ArrowLeft');
bindTouchControl('btn-right', 'ArrowRight');
bindTouchControl('btn-up', 'ArrowUp');
bindTouchControl('btn-down', 'ArrowDown');
bindTouchControl('btn-accelerate', 'ArrowUp');
bindTouchControl('btn-brake', 'ArrowDown');

const hudBoosterBtn = document.getElementById('hud-booster-btn');
if (hudBoosterBtn) {
    hudBoosterBtn.addEventListener('click', () => {
        if (mushroomsCount >= 10) {
            mushroomsCount -= 10;
            boostTimer = 150;
            sounds.playItemSound(1.8);
            updateHUD();
        }
    });
}

function updateHUD() {
    const lapElem = document.getElementById('lap-num');
    if (lapElem) lapElem.innerText = `${currentLap} / 3`;

    document.getElementById('coin-num').innerText = coinsCount;
    document.getElementById('cube-num').innerText = cubesCount;
    document.getElementById('mushroom-num').innerText = mushroomsCount;
    document.getElementById('lives-num').innerText = "❤️".repeat(playerLives);

    if (hudBoosterBtn) {
        if (mushroomsCount >= 10) {
            hudBoosterBtn.style.display = 'block';
        } else {
            hudBoosterBtn.style.display = 'none';
        }
    }
}

function checkLapProgression() {
    const kartPos = kartGroup.position;
    const startPoint = trackCurve.getPoint(0);
    const halfPoint = trackCurve.getPoint(0.5);

    if (kartPos.distanceTo(startPoint) > 10) {
        if (kartPos.distanceTo(halfPoint) < 8) {
            passedHalfTrack = true;
        }
    } else {
        if (passedHalfTrack && currentLap < 3) {
            currentLap++;
            passedHalfTrack = false;
            sounds.playLapSound();
            updateHUD();

            if (currentLap >= 3) {
                gameActive = false;
                setTimeout(() => {
                    alert("Parabéns! Você completou todas as voltas!");
                    location.reload();
                }, 500);
            }
        }
    }
}

function updateSpeedometer() {
    const kmh = Math.round(Math.abs(speed) * 220);
    const speedValueElem = document.getElementById('speed-value');
    const speedNeedleElem = document.getElementById('speed-needle');
    
    if (speedValueElem) speedValueElem.innerText = kmh;
    if (speedNeedleElem) {
        const rotationDegrees = -120 + Math.min(kmh, 160) * 1.5;
        speedNeedleElem.style.transform = `rotate(${rotationDegrees}deg)`;
    }
}

function checkCollisions() {
    const kartPos = kartGroup.position;

    ramps.forEach(ramp => {
        if (kartPos.distanceTo(ramp.position) < ramp.radius && !isJumping) {
            isJumping = true;
            verticalSpeed = 0.55;
            boostTimer = 45;
            sounds.playJumpSound();
        }
    });

    itemBoxes.forEach(item => {
        if (!item.active) return;
        if (kartPos.distanceTo(item.group.position) < 2.4) {
            item.active = false;
            item.group.visible = false;
            if (item.type === 'coin') coinsCount++;
            else if (item.type === 'cube') cubesCount++;
            else if (item.type === 'mushroom') { mushroomsCount++; }
            updateHUD();
            setTimeout(() => { item.active = true; item.group.visible = true; }, 5000);
        }
    });
}

// --- FAIXA XADREZ NAS BORDAS + PILHAS DE PNEUS PERTO DA PISTA E SEGURAS ---
const barriers = [];

function createBarriersForTrack() {
    barriers.forEach(b => {
        if (b.mesh) scene.remove(b.mesh);
    });
    barriers.length = 0;

    const points = trackCurve.getPoints(400);
    
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3 });
    const tireMat = new THREE.MeshStandardMaterial({ roughness: 0.4, color: 0x333333 });
    
    const edgeGeo = new THREE.BoxGeometry(1.5, 0.04, (trackWidth / 400) * 16);

    points.forEach((pt, idx) => {
        if (idx < points.length - 1) {
            const tangent = trackCurve.getTangent(idx / 400);
            const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
            const angle = Math.atan2(tangent.x, tangent.z);

            const currentMat = (idx % 2 === 0) ? whiteMat : blackMat;

            // Esquerda (Xadrez)
            const leftPos = pt.clone().add(normal.clone().multiplyScalar(trackWidth / 2 - 0.2));
            const leftEdge = new THREE.Mesh(edgeGeo, currentMat);
            leftEdge.position.set(leftPos.x, 0.03, leftPos.z);
            leftEdge.rotation.y = angle;
            scene.add(leftEdge);
            barriers.push({ mesh: leftEdge });

            // Direita (Xadrez)
            const rightPos = pt.clone().sub(normal.clone().multiplyScalar(trackWidth / 2 - 0.2));
            const rightEdge = new THREE.Mesh(edgeGeo, currentMat);
            rightEdge.position.set(rightPos.x, 0.03, rightPos.z);
            rightEdge.rotation.y = angle;
            scene.add(rightEdge);
            barriers.push({ mesh: rightEdge });
        }
    });

    const tirePoints = trackCurve.getPoints(200);
    const tireGeo = new THREE.CylinderGeometry(1.0, 1.0, 1.0, 16);

    tirePoints.forEach((pt, idx) => {
        if (idx % 2 === 0) {
            const tangent = trackCurve.getTangent(idx / 200);
            const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

            const leftPos = pt.clone().add(normal.clone().multiplyScalar(trackWidth / 2 + 2.4));
            const rightPos = pt.clone().sub(normal.clone().multiplyScalar(trackWidth / 2 + 2.4));

            let safeLeft = true;
            let safeRight = true;

            trackCenterPoints.forEach(centerPt => {
                if (leftPos.distanceTo(centerPt) < trackWidth / 2 + 0.5) safeLeft = false;
                if (rightPos.distanceTo(centerPt) < trackWidth / 2 + 0.5) safeRight = false;
            });

            if (safeLeft) {
                const leftTire = new THREE.Mesh(tireGeo, tireMat);
                leftTire.position.set(leftPos.x, 0.45, leftPos.z);
                scene.add(leftTire);
                barriers.push({ mesh: leftTire });
            }

            if (safeRight) {
                const rightTire = new THREE.Mesh(tireGeo, tireMat);
                rightTire.position.set(rightPos.x, 0.45, rightPos.z);
                scene.add(rightTire);
                barriers.push({ mesh: rightTire });
            }
        }
    });
}
createBarriersForTrack();

function checkBoundaryCollisions() {
    const kartPos = kartGroup.position;
    let closestPoint = trackCurve.getPoint(0);
    let minDistance = 9999;
    
    for (let i = 0; i <= 100; i++) {
        const pt = trackCurve.getPoint(i / 100);
        const dist = kartPos.distanceTo(pt);
        if (dist < minDistance) {
            minDistance = dist;
            closestPoint = pt;
        }
    }

    if (minDistance > (trackWidth / 2 - 1.0)) {
        speed = -0.1;
        sounds.playHitSound();
        const pushDir = closestPoint.clone().sub(kartPos).normalize();
        kartGroup.position.add(pushDir.multiplyScalar(0.4));
    }
}

function updateKart() {
    if (!gameActive) return;

    let maxSpeed = 0.45;
    if (boostTimer > 0) { boostTimer--; maxSpeed = 0.85; speed = maxSpeed; }

    if (keys.ArrowUp || keys.w) speed = Math.min(speed + 0.008, maxSpeed);
    else if (keys.ArrowDown || keys.s) speed = Math.max(speed - 0.012, -0.18);
    else speed *= 0.95;

    const turnFactor = 0.035 * (Math.abs(speed) / 0.45 + 0.3);
    if (keys.ArrowLeft || keys.a) angle += turnFactor * (speed >= 0 ? 1 : -1);
    if (keys.ArrowRight || keys.d) angle -= turnFactor * (speed >= 0 ? 1 : -1);

    if (isJumping) {
        kartGroup.position.y += verticalSpeed;
        verticalSpeed -= 0.028;
        if (kartGroup.position.y <= 0) { kartGroup.position.y = 0; isJumping = false; }
    }

    kartGroup.rotation.y = angle;
    kartGroup.translateZ(speed);

    checkCollisions();
    checkBoundaryCollisions();
    checkLapProgression();
    sounds.updateEngine(speed / 0.45);
    updateSpeedometer();

    const cameraOffset = new THREE.Vector3(0, 6, -11).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
    camera.position.copy(kartGroup.position).add(cameraOffset);
    camera.lookAt(kartGroup.position.clone().add(new THREE.Vector3(0, 1.2, 2)));
}

function updateAIKarts() {
    if (!gameActive) return;
    aiKarts.forEach(ai => {
        ai.progress = (ai.progress + ai.speed) % 1;
        const pt = trackCurve.getPoint(ai.progress);
        const tangent = trackCurve.getTangent(ai.progress);
        const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
        ai.group.position.copy(pt.clone().add(normal.multiplyScalar(ai.offset)));
        ai.group.rotation.y = Math.atan2(tangent.x, tangent.z);
    });
}

function animate() {
    requestAnimationFrame(animate);
    itemBoxes.forEach(item => { if (item.active && item.group) item.group.rotation.y += 0.04; });
    updateAIKarts();
    updateKart();
    updateMinimap();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

animate();