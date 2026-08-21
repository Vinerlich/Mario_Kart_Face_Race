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

    playShootSound() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
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

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 4000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

const container = document.getElementById('game-container');
if (container) {
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
}

// 2. Iluminação
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(200, 300, 200);
dirLight.castShadow = true;
scene.add(dirLight);

const groundGeo = new THREE.PlaneGeometry(5000, 5000);
const groundMat = new THREE.MeshLambertMaterial({ color: 0x2e8b57 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.05;
scene.add(ground);

// 3. Circuitos Expandidos (Estilo Paris-Dakar)
const trackLayouts = {
    easy: [
        new THREE.Vector3(500, 0, 0),
        new THREE.Vector3(400, 0, 300),
        new THREE.Vector3(0, 0, 350),
        new THREE.Vector3(-400, 0, 300),
        new THREE.Vector3(-500, 0, 0),
        new THREE.Vector3(-400, 0, -300),
        new THREE.Vector3(0, 0, -350),
        new THREE.Vector3(400, 0, -300)
    ],
    medium: [
        new THREE.Vector3(750, 0, 0),
        new THREE.Vector3(550, 0, 500),
        new THREE.Vector3(0, 0, 600),
        new THREE.Vector3(-550, 0, 450),
        new THREE.Vector3(-750, 0, 0),
        new THREE.Vector3(-500, 0, -500),
        new THREE.Vector3(0, 0, -300),
        new THREE.Vector3(450, 0, -550)
    ],
    hard: [
        new THREE.Vector3(1000, 0, 0),
        new THREE.Vector3(800, 0, 800),
        new THREE.Vector3(200, 0, 450),
        new THREE.Vector3(-600, 0, 900),
        new THREE.Vector3(-1000, 0, 200),
        new THREE.Vector3(-500, 0, -400),
        new THREE.Vector3(-850, 0, -850),
        new THREE.Vector3(250, 0, -900),
        new THREE.Vector3(800, 0, -450)
    ]
};

const trackOrder = ['easy', 'medium', 'hard'];
let currentTrackKey = 'medium';
let trackCurve, trackMesh, trackMat, trackCenterPoints;
const snowMoundsGroup = new THREE.Group();
const meltingPropsGroup = new THREE.Group();
const rallyPropsGroup = new THREE.Group();
scene.add(snowMoundsGroup);
scene.add(meltingPropsGroup);
scene.add(rallyPropsGroup);
const trackWidth = 28;
const TOTAL_LAPS = 5;

// Arrays de Objetos e Itens
const itemBoxes = [];
const obstacles = [];
const ramps = [];
const activeShells = [];
const activeBananas = [];
let starTimer = 0;
let starsCount = 0;
let isCrashing = false;
let crashTimer = 0;

function clearTrackItems() {
    itemBoxes.forEach(item => scene.remove(item.group));
    itemBoxes.length = 0;

    obstacles.forEach(obs => scene.remove(obs.mesh));
    obstacles.length = 0;

    ramps.forEach(ramp => scene.remove(ramp.group));
    ramps.length = 0;

    activeBananas.forEach(b => scene.remove(b.mesh));
    activeBananas.length = 0;
}

// --- SISTEMA DE EXPRESSÕES FACIAIS DINÂMICAS ---
function createFaceTexture(expression = 'neutral') {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 128, 128);

    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 6;
    ctx.strokeRect(4, 4, 120, 120);

    // Olhos
    ctx.fillStyle = '#111111';
    if (expression === 'happy') {
        ctx.beginPath();
        ctx.arc(40, 50, 12, Math.PI, 0, true);
        ctx.arc(88, 50, 12, Math.PI, 0, true);
        ctx.fill();
    } else if (expression === 'super_happy') {
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('^v^', 64, 58);
    } else if (expression === 'determined') {
        ctx.font = 'bold 26px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('\\ /', 64, 42);
        ctx.beginPath();
        ctx.arc(40, 54, 10, 0, Math.PI * 2);
        ctx.arc(88, 54, 10, 0, Math.PI * 2);
        ctx.fill();
    } else if (expression === 'surprised') {
        ctx.beginPath();
        ctx.arc(40, 50, 16, 0, Math.PI * 2);
        ctx.arc(88, 50, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(44, 46, 5, 0, Math.PI * 2);
        ctx.arc(92, 46, 5, 0, Math.PI * 2);
        ctx.fill();
    } else if (expression === 'sad') {
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('>', 40, 56);
        ctx.fillText('<', 88, 56);
    } else {
        ctx.beginPath();
        ctx.arc(40, 50, 10, 0, Math.PI * 2);
        ctx.arc(88, 50, 10, 0, Math.PI * 2);
        ctx.fill();
    }

    // Boca
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 7;
    ctx.beginPath();
    if (expression === 'happy') {
        ctx.arc(64, 70, 24, 0, Math.PI, false);
        ctx.stroke();
    } else if (expression === 'super_happy') {
        ctx.fillStyle = '#ff3333';
        ctx.beginPath();
        ctx.arc(64, 75, 26, 0, Math.PI, false);
        ctx.fill();
        ctx.stroke();
    } else if (expression === 'determined') {
        ctx.lineWidth = 6;
        ctx.moveTo(44, 82);
        ctx.lineTo(84, 82);
        ctx.stroke();
    } else if (expression === 'surprised') {
        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.arc(64, 80, 14, 0, Math.PI * 2);
        ctx.fill();
    } else if (expression === 'sad') {
        ctx.arc(64, 100, 22, Math.PI, 0, false);
        ctx.stroke();
    } else {
        ctx.arc(64, 80, 18, 0.1 * Math.PI, 0.9 * Math.PI, false);
        ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

let playerAccessoriesGroup = null;

function updatePlayerFace(expression) {
    if (!kartGroup || !kartGroup.facePlane) return;
    const newTex = createFaceTexture(expression);
    kartGroup.facePlane.material.map = newTex;
    kartGroup.facePlane.material.needsUpdate = true;
}

// --- CONTROLE DO MODAL E FLUXO DE VITÓRIA ---
function showGameOverModal(isVictory, position, totalTime) {
    const modal = document.getElementById('game-over-modal');
    const title = document.getElementById('modal-title');
    const message = document.getElementById('modal-message');
    const statPosition = document.getElementById('stat-position');
    const statTime = document.getElementById('stat-time');
    const nextBtn = document.getElementById('next-track-btn');

    if (isVictory) {
        title.innerText = "VITÓRIA! 🏆";
        title.style.color = "#00ffcc";
        message.innerText = "Você dominou o Circuito com maestria!";
        if (nextBtn) nextBtn.style.display = 'block';
        updatePlayerFace('super_happy');
    } else {
        title.innerText = "FIM DE JOGO 💥";
        title.style.color = "#ff3333";
        message.innerText = "Não foi dessa vez! Tente novamente.";
        if (nextBtn) nextBtn.style.display = 'none';
        updatePlayerFace('sad');
    }

    statPosition.innerText = `Posição: ${position}º`;
    statTime.innerText = `Tempo: ${totalTime}`;
    modal.style.display = 'flex';
}

function advanceToNextTrack() {
    document.getElementById('game-over-modal').style.display = 'none';
    const currentIndex = trackOrder.indexOf(currentTrackKey);
    const nextIndex = (currentIndex + 1) % trackOrder.length;
    currentTrackKey = trackOrder[nextIndex];

    document.querySelectorAll('.track-btn').forEach(b => {
        if (b.getAttribute('data-track') === currentTrackKey) {
            b.classList.add('active');
        } else {
            b.classList.remove('active');
        }
    });

    currentLap = 0;
    coinsCount = 0;
    cubesCount = 0;
    mushroomsCount = 0;
    starsCount = 0;
    starTimer = 0;
    speed = 0;
    isCrashing = false;
    gameActive = true;

    buildTrack(currentTrackKey);
    resetPlayerPosition(currentTrackKey);
    updateHUD();
    updatePlayerFace('neutral');
}

function resetGame() {
    document.getElementById('game-over-modal').style.display = 'none';
    currentLap = 0;
    coinsCount = 0;
    cubesCount = 0;
    mushroomsCount = 0;
    starsCount = 0;
    starTimer = 0;
    playerLives = 3;
    speed = 0;
    isCrashing = false;
    gameActive = true;
    updateHUD();
    resetPlayerPosition(currentTrackKey);
    spawnDynamicTrackItems();
    updatePlayerFace('neutral');
}

document.getElementById('restart-btn').addEventListener('click', resetGame);
const nextTrackBtnElem = document.getElementById('next-track-btn');
if (nextTrackBtnElem) nextTrackBtnElem.addEventListener('click', advanceToNextTrack);

// --- SISTEMA DE PARTÍCULAS ---
let smokeParticles, sparkParticles, dustParticles;
const maxParticles = 200;

function setupParticleSystems() {
    const smokeGeo = new THREE.BufferGeometry();
    const smokePositions = new Float32Array(maxParticles * 3);
    for (let i = 0; i < maxParticles * 3; i++) smokePositions[i] = -9999;
    smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));
    smokeParticles = new THREE.Points(smokeGeo, new THREE.PointsMaterial({
        color: 0xdddddd, size: 0.8, transparent: true, opacity: 0.5, depthWrite: false
    }));
    scene.add(smokeParticles);

    const sparkGeo = new THREE.BufferGeometry();
    const sparkPositions = new Float32Array(maxParticles * 3);
    for (let i = 0; i < maxParticles * 3; i++) sparkPositions[i] = -9999;
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
    sparkParticles = new THREE.Points(sparkGeo, new THREE.PointsMaterial({
        color: 0xffaa00, size: 0.6, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false
    }));
    scene.add(sparkParticles);

    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(maxParticles * 3);
    for (let i = 0; i < maxParticles * 3; i++) dustPositions[i] = -9999;
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    dustParticles = new THREE.Points(dustGeo, new THREE.PointsMaterial({
        color: 0xd2b48c, size: 1.2, transparent: true, opacity: 0.6, depthWrite: false
    }));
    scene.add(dustParticles);
}

setupParticleSystems();

let smokeIndex = 0, sparkIndex = 0, dustIndex = 0;

function emitSmoke(position) {
    if (!smokeParticles) return;
    const positions = smokeParticles.geometry.attributes.position.array;
    positions[smokeIndex * 3] = position.x + (Math.random() - 0.5) * 0.5;
    positions[smokeIndex * 3 + 1] = position.y + 0.2;
    positions[smokeIndex * 3 + 2] = position.z + (Math.random() - 0.5) * 0.5;
    smokeParticles.geometry.attributes.position.needsUpdate = true;
    smokeIndex = (smokeIndex + 1) % maxParticles;
}

function emitSparks(position) {
    if (!sparkParticles) return;
    const positions = sparkParticles.geometry.attributes.position.array;
    positions[sparkIndex * 3] = position.x + (Math.random() - 0.5) * 1.2;
    positions[sparkIndex * 3 + 1] = position.y + 0.3;
    positions[sparkIndex * 3 + 2] = position.z + (Math.random() - 0.5) * 1.2;
    sparkParticles.geometry.attributes.position.needsUpdate = true;
    sparkIndex = (sparkIndex + 1) % maxParticles;
}

function emitDust(position) {
    if (!dustParticles) return;
    const positions = dustParticles.geometry.attributes.position.array;
    positions[dustIndex * 3] = position.x + (Math.random() - 0.5) * 1.5;
    positions[dustIndex * 3 + 1] = position.y + 0.1;
    positions[dustIndex * 3 + 2] = position.z + (Math.random() - 0.5) * 1.5;
    dustParticles.geometry.attributes.position.needsUpdate = true;
    dustIndex = (dustIndex + 1) % maxParticles;
}

// --- BIVAQUE DE APOIO E TORCIDA ---
function createRallyPropsAndCrowd() {
    rallyPropsGroup.clear();

    const tentFabricMat = new THREE.MeshStandardMaterial({ color: 0xff2200, roughness: 0.4 });
    const tentFabricWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.4 });
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.8 });

    const truckCabMat = new THREE.MeshStandardMaterial({ color: 0x2255cc, roughness: 0.3 });
    const truckBoxMat = new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.5 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    const windshieldMat = new THREE.MeshBasicMaterial({ color: 0x111111 });

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x3366ff });
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffe0bd });
    const hatMat = new THREE.MeshStandardMaterial({ color: 0xff3300 });

    const points = trackCurve.getPoints(120);
    points.forEach((pt, idx) => {
        if (idx % 8 === 0) {
            const tangent = trackCurve.getTangent(idx / 120);
            const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

            const teamGroup = new THREE.Group();

            if (idx % 16 === 0) {
                const sideSupport = (idx % 32 === 0) ? (trackWidth / 2 + 14) : -(trackWidth / 2 + 14);
                const supportPos = pt.clone().add(normal.clone().multiplyScalar(sideSupport));

                const tentRoof = new THREE.Mesh(
                    new THREE.CylinderGeometry(2.5, 2.5, 4.5, 8, 1, false, 0, Math.PI),
                    (idx % 2 === 0) ? tentFabricMat : tentFabricWhiteMat
                );
                tentRoof.rotation.z = Math.PI / 2;
                tentRoof.position.y = 2.0;

                const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.0), poleMat);
                p1.position.set(0, 1.0, -2.1);
                const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.0), poleMat);
                p2.position.set(0, 1.0, 2.1);
                teamGroup.add(tentRoof, p1, p2);

                const truckGroup = new THREE.Group();
                const cab = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.5, 1.8), truckCabMat);
                cab.position.set(0, 0.9, 1.2);

                const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.7, 0.1), windshieldMat);
                windshield.position.set(0, 1.1, 2.1);

                const box = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.2, 3.2), truckBoxMat);
                box.position.set(0, 1.2, -0.6);

                const wGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 12);
                wGeo.rotateZ(Math.PI / 2);
                [-1.0, 1.0].forEach(wx => {
                    [-1.2, 0.8].forEach(wz => {
                        const wheel = new THREE.Mesh(wGeo, wheelMat);
                        wheel.position.set(wx, 0.4, wz);
                        truckGroup.add(wheel);
                    });
                });

                truckGroup.add(cab, windshield, box);
                truckGroup.position.set(3.5, 0, 0);
                teamGroup.add(truckGroup);

                teamGroup.position.set(supportPos.x, 0, supportPos.z);
            } else {
                const sideFan = (idx % 2 === 0) ? (trackWidth / 2 + 2.5) : -(trackWidth / 2 + 2.5);
                const fanPos = pt.clone().add(normal.clone().multiplyScalar(sideFan));

                for (let c = -1; c <= 1; c++) {
                    const fanGroup = new THREE.Group();
                    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 0.9), bodyMat);
                    torso.position.y = 0.45;
                    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), headMat);
                    head.position.y = 1.05;
                    const hat = new THREE.Mesh(new THREE.SphereGeometry(0.21, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2), hatMat);
                    hat.position.y = 1.12;

                    fanGroup.add(torso, head, hat);
                    fanGroup.position.set(c * 0.7, 0, 0);
                    teamGroup.add(fanGroup);
                }

                teamGroup.position.set(fanPos.x, 0, fanPos.z);
            }

            teamGroup.rotation.y = Math.atan2(tangent.x, tangent.z);
            rallyPropsGroup.add(teamGroup);
        }
    });
}

// --- SISTEMA DE ITENS ---
function dropBanana() {
    sounds.playItemSound(0.8);
    const bananaGeo = new THREE.CylinderGeometry(0.1, 0.4, 0.9, 8);
    const bananaMat = new THREE.MeshStandardMaterial({ color: 0xffea00, roughness: 0.2 });
    const bananaMesh = new THREE.Mesh(bananaGeo, bananaMat);
    bananaMesh.rotation.z = Math.PI / 3;

    const backOffset = new THREE.Vector3(0, 0.2, -2.5).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
    bananaMesh.position.copy(kartGroup.position).add(backOffset);

    scene.add(bananaMesh);
    activeBananas.push({ mesh: bananaMesh, radius: 1.8 });
}

function shootShell(isRed = false) {
    if (cubesCount <= 0) return;
    cubesCount--;
    updateHUD();
    sounds.playShootSound();

    const shellGeo = new THREE.SphereGeometry(0.6, 16, 16);
    const shellMat = new THREE.MeshStandardMaterial({ color: isRed ? 0xff0000 : 0x00ff00, roughness: 0.2 });
    const shellMesh = new THREE.Mesh(shellGeo, shellMat);

    const forwardOffset = new THREE.Vector3(0, 0.5, 2.5).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
    shellMesh.position.copy(kartGroup.position).add(forwardOffset);

    scene.add(shellMesh);
    activeShells.push({
        mesh: shellMesh,
        isRed: isRed,
        direction: new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle),
        speed: 0.95,
        lifeTime: 140
    });
}

function updateShells() {
    for (let i = activeShells.length - 1; i >= 0; i--) {
        const shell = activeShells[i];

        if (shell.isRed && aiKarts.length > 0) {
            let closestAi = null;
            let minDist = 999;
            aiKarts.forEach(ai => {
                const dist = shell.mesh.position.distanceTo(ai.group.position);
                if (dist < minDist) {
                    minDist = dist;
                    closestAi = ai;
                }
            });

            if (closestAi && minDist < 80) {
                const targetDir = closestAi.group.position.clone().sub(shell.mesh.position).normalize();
                shell.direction.lerp(targetDir, 0.1);
            }
        }

        shell.mesh.position.addScaledVector(shell.direction, shell.speed);
        shell.lifeTime--;

        aiKarts.forEach(ai => {
            if (shell.mesh.position.distanceTo(ai.group.position) < 2.5) {
                ai.speed = 0.0001;
                scene.remove(shell.mesh);
                activeShells.splice(i, 1);
                sounds.playHitSound();
            }
        });

        if (shell.lifeTime <= 0) {
            scene.remove(shell.mesh);
            activeShells.splice(i, 1);
        }
    }
}

function activateMushroomBoost() {
    if (mushroomsCount >= 3) {
        mushroomsCount -= 3;
        boostTimer = 150;
        sounds.playItemSound(1.8);
        updateHUD();
        updatePlayerFace('happy');
        setTimeout(() => updatePlayerFace('neutral'), 2000);
    }
}

function activateStarPower() {
    if (starsCount > 0) {
        starsCount--;
        starTimer = 250;
        sounds.playItemSound(2.2);
        updateHUD();
        updatePlayerFace('super_happy');
        setTimeout(() => updatePlayerFace('neutral'), 3000);
    }
}

// --- HUD ---
function createIntegratedHUD() {
    const hudContainer = document.getElementById('hud-game');
    if (!hudContainer) return;

    hudContainer.innerHTML = `
        <div id="unified-panel" style="
            position: absolute; top: 15px; left: 15px;
            background: rgba(0, 0, 0, 0.75); border: 2px solid #ffd700;
            border-radius: 16px; padding: 12px 18px; color: #fff;
            font-family: Arial, sans-serif; font-size: 14px; font-weight: bold;
            display: flex; flex-direction: column; gap: 8px; z-index: 100;
            box-shadow: 0 8px 20px rgba(0,0,0,0.6); backdrop-filter: blur(4px);
            min-width: 220px;
        ">
            <div>🚩 VOLTA: <span id="lap-num" style="color:#00ffff;">0 / ${TOTAL_LAPS}</span></div>
            
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                <span>🍄 TURBO: <span id="mushroom-num" style="color:#ffcc00;">0</span></span>
                <button id="panel-booster-btn" style="
                    background: #444; color: #888; border: 1px solid #666;
                    border-radius: 8px; padding: 4px 8px; font-size: 11px; font-weight: bold;
                    cursor: not-allowed; transition: all 0.2s; outline: none;
                ">🚀 USAR (0/3)</button>
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                <span>⭐ ESTRELA: <span id="star-num" style="color:#ffff00;">0</span></span>
                <button id="panel-star-btn" style="
                    background: #444; color: #888; border: 1px solid #666;
                    border-radius: 8px; padding: 4px 8px; font-size: 11px; font-weight: bold;
                    cursor: not-allowed; transition: all 0.2s; outline: none;
                ">⭐ ATIVAR</button>
            </div>

            <div>🪙 MOEDAS: <span id="coin-num" style="color:#ffd700;">0</span></div>

            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                <span>❓ CUBOS: <span id="cube-num" style="color:#ff3366;">0</span></span>
                <button id="panel-shell-btn" style="
                    background: #444; color: #888; border: 1px solid #666;
                    border-radius: 8px; padding: 4px 8px; font-size: 11px; font-weight: bold;
                    cursor: not-allowed; transition: all 0.2s; outline: none;
                ">🐢 DISPARAR</button>
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                <span>🍌 ARMADILHA:</span>
                <button id="panel-banana-btn" style="
                    background: linear-gradient(135deg, #ffcc00, #ff9900); color: #000;
                    border: 1px solid #fff; border-radius: 8px; padding: 4px 8px;
                    font-size: 11px; font-weight: bold; cursor: pointer; outline: none;
                ">🍌 BANANA (B)</button>
            </div>

            <div>❤️ VIDAS: <span id="lives-num">❤️❤️❤️</span></div>
        </div>
    `;

    document.getElementById('panel-booster-btn').addEventListener('click', activateMushroomBoost);
    document.getElementById('panel-star-btn').addEventListener('click', activateStarPower);
    document.getElementById('panel-shell-btn').addEventListener('click', () => {
        if (cubesCount > 0) {
            if (Math.random() > 0.5) shootShell(true);
            else shootShell(false);
        }
    });
    document.getElementById('panel-banana-btn').addEventListener('click', dropBanana);
}

createIntegratedHUD();

const instructionsModal = document.getElementById('instructions-modal');
const btnInstructions = document.getElementById('btn-instructions');
const btnCloseInstructions = document.getElementById('btn-close-instructions');

if (btnInstructions && instructionsModal && btnCloseInstructions) {
    btnInstructions.addEventListener('click', () => { instructionsModal.style.display = 'flex'; });
    btnCloseInstructions.addEventListener('click', () => { instructionsModal.style.display = 'none'; });
}

// --- CENÁRIO ---
const horizonProps = [];

function createDistantScenery() {
    horizonProps.forEach(p => scene.remove(p));
    horizonProps.length = 0;

    const hillMat = new THREE.MeshLambertMaterial({ color: 0x38b000, roughness: 0.9 });
    const mountainMat = new THREE.MeshLambertMaterial({ color: 0x4a5759, roughness: 0.8 });

    let maxTrackRadius = 600;
    if (trackCenterPoints) {
        trackCenterPoints.forEach(pt => {
            const dist = Math.hypot(pt.x, pt.z);
            if (dist > maxTrackRadius) maxTrackRadius = dist;
        });
    }

    const sceneryRadius = maxTrackRadius + 200;

    for (let i = 0; i < 32; i++) {
        const angle = (i / 32) * Math.PI * 2;
        const radius = sceneryRadius + Math.random() * 80;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        const isMountain = (i % 3 === 0);
        const scale = 70 + Math.random() * 40;
        const geo = isMountain ?
            new THREE.ConeGeometry(scale, scale * 1.2, 5) :
            new THREE.SphereGeometry(scale, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);

        const mesh = new THREE.Mesh(geo, isMountain ? mountainMat : hillMat);
        mesh.position.set(x, 0, z);
        if (!isMountain) mesh.scale.set(1.5, 0.6, 1.5);

        scene.add(mesh);
        horizonProps.push(mesh);
    }
}

// --- SISTEMA CLIMÁTICO ---
let weatherParticles = null;
let currentWeatherType = null;
let currentClima = 'sol';

function setupWeatherSystem(type) {
    if (weatherParticles) {
        scene.remove(weatherParticles);
        weatherParticles.geometry.dispose();
        weatherParticles.material.dispose();
        weatherParticles = null;
    }

    currentWeatherType = type;
    const particleCount = 1200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 250;
        positions[i + 1] = Math.random() * 60;
        positions[i + 2] = (Math.random() - 0.5) * 250;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    let material;

    if (type === 'chuva') {
        material = new THREE.PointsMaterial({ color: 0xaaaaaa, size: 0.6, transparent: true, opacity: 0.6 });
    } else if (type === 'neve') {
        material = new THREE.PointsMaterial({ color: 0xffffff, size: 1.2, transparent: true, opacity: 0.8 });
    } else if (type === 'calor') {
        material = new THREE.PointsMaterial({ color: 0xffaa00, size: 0.8, transparent: true, opacity: 0.4 });
    } else {
        return;
    }

    weatherParticles = new THREE.Points(geometry, material);
    scene.add(weatherParticles);
}

function updateWeatherParticles() {
    if (!weatherParticles || !kartGroup) return;
    const positions = weatherParticles.geometry.attributes.position.array;
    const playerPos = kartGroup.position;
    const areaSize = 250;

    for (let i = 0; i < positions.length; i += 3) {
        if (currentWeatherType === 'chuva') {
            positions[i + 1] -= 2.5;
            if (positions[i + 1] < playerPos.y) positions[i + 1] = playerPos.y + 60;
        } else if (currentWeatherType === 'neve') {
            positions[i + 1] -= 0.3;
            positions[i] += Math.sin(Date.now() * 0.002 + i) * 0.05;
            if (positions[i + 1] < playerPos.y) positions[i + 1] = playerPos.y + 60;
        } else if (currentWeatherType === 'calor') {
            positions[i + 1] += 0.2;
            if (positions[i + 1] > playerPos.y + 50) positions[i + 1] = playerPos.y;
        }

        if (Math.abs(positions[i] - playerPos.x) > areaSize / 2) {
            positions[i] = playerPos.x + (Math.random() - 0.5) * areaSize;
        }
        if (Math.abs(positions[i + 2] - playerPos.z) > areaSize / 2) {
            positions[i + 2] = playerPos.z + (Math.random() - 0.5) * areaSize;
        }
    }
    weatherParticles.geometry.attributes.position.needsUpdate = true;
}

// --- TUBOS E BLOCOS ---
const marioProps = [];

function createMarioBlockArch(tPos) {
    const pt = trackCurve.getPoint(tPos);
    const tangent = trackCurve.getTangent(tPos);
    const angle = Math.atan2(tangent.x, tangent.z);

    const archGroup = new THREE.Group();
    const brickMat = new THREE.MeshStandardMaterial({ color: 0xb22222, roughness: 0.6 });
    const qBlockMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, roughness: 0.2, metalness: 0.1 });
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x00aa00, roughness: 0.3 });

    const pillarGeo = new THREE.CylinderGeometry(1.2, 1.2, 7.5, 16);
    const leftPillar = new THREE.Mesh(pillarGeo, pipeMat);
    leftPillar.position.set(-trackWidth / 2 + 1, 3.75, 0);
    const rightPillar = new THREE.Mesh(pillarGeo, pipeMat);
    rightPillar.position.set(trackWidth / 2 - 1, 3.75, 0);
    archGroup.add(leftPillar, rightPillar);

    const blockGeo = new THREE.BoxGeometry(2.0, 2.0, 2.0);
    for (let i = -2; i <= 2; i++) {
        const mat = (i % 2 === 0) ? qBlockMat : brickMat;
        const block = new THREE.Mesh(blockGeo, mat);
        block.position.set(i * 3.2, 8.5, 0);
        archGroup.add(block);
    }

    archGroup.position.set(pt.x, 0, pt.z);
    archGroup.rotation.y = angle;
    scene.add(archGroup);
    marioProps.push(archGroup);
}

function createMarioEnvironmentProps() {
    marioProps.forEach(prop => scene.remove(prop));
    marioProps.length = 0;

    const greenPipeMat = new THREE.MeshStandardMaterial({ color: 0x00aa00, roughness: 0.3 });
    const pipeRimMat = new THREE.MeshStandardMaterial({ color: 0x00cc00, roughness: 0.2 });

    const pipeBodyGeo = new THREE.CylinderGeometry(1.5, 1.3, 4, 16);
    const pipeRimGeo = new THREE.CylinderGeometry(1.7, 1.7, 0.8, 16);

    const points = trackCurve.getPoints(80);
    points.forEach((pt, idx) => {
        if (idx % 8 === 0) {
            const tangent = trackCurve.getTangent(idx / 80);
            const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

            const sideMultiplier = (idx % 16 === 0) ? (trackWidth / 2 + 3) : -(trackWidth / 2 + 3);
            const propPos = pt.clone().add(normal.multiplyScalar(sideMultiplier));

            const pipeGroup = new THREE.Group();
            const body = new THREE.Mesh(pipeBodyGeo, greenPipeMat);
            body.position.y = 2;
            const rim = new THREE.Mesh(pipeRimGeo, pipeRimMat);
            rim.position.y = 3.8;
            pipeGroup.add(body, rim);

            pipeGroup.position.set(propPos.x, 0, propPos.z);
            scene.add(pipeGroup);
            marioProps.push(pipeGroup);
        }
    });

    createMarioBlockArch(0.2);
    createMarioBlockArch(0.45);
    createMarioBlockArch(0.7);
}

// BORDAS E PNEUS
const barriers = [];

function createBarriersForTrack() {
    barriers.forEach(b => {
        if (b.mesh) scene.remove(b.mesh);
    });
    barriers.length = 0;

    const points = trackCurve.getPoints(600);
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3 });
    const tireMat = new THREE.MeshStandardMaterial({ roughness: 0.4, color: 0x333333 });
    const edgeGeo = new THREE.BoxGeometry(1.5, 0.04, (trackWidth / 600) * 24);

    points.forEach((pt, idx) => {
        if (idx < points.length - 1) {
            const tangent = trackCurve.getTangent(idx / 600);
            const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
            const angle = Math.atan2(tangent.x, tangent.z);
            const currentMat = (idx % 2 === 0) ? whiteMat : blackMat;

            const leftPos = pt.clone().add(normal.clone().multiplyScalar(trackWidth / 2 - 0.2));
            const leftEdge = new THREE.Mesh(edgeGeo, currentMat);
            leftEdge.position.set(leftPos.x, 0.03, leftPos.z);
            leftEdge.rotation.y = angle;
            scene.add(leftEdge);
            barriers.push({ mesh: leftEdge });

            const rightPos = pt.clone().sub(normal.clone().multiplyScalar(trackWidth / 2 - 0.2));
            const rightEdge = new THREE.Mesh(edgeGeo, currentMat);
            rightEdge.position.set(rightPos.x, 0.03, rightPos.z);
            rightEdge.rotation.y = angle;
            scene.add(rightEdge);
            barriers.push({ mesh: rightEdge });
        }
    });

    const tirePoints = trackCurve.getPoints(300);
    const tireGeo = new THREE.CylinderGeometry(1.0, 1.0, 1.0, 16);

    tirePoints.forEach((pt, idx) => {
        if (idx % 2 === 0) {
            const tangent = trackCurve.getTangent(idx / 300);
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

let finishLineMesh = null;
function createStartFinishLine() {
    if (finishLineMesh) scene.remove(finishLineMesh);

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
    const planeGeo = new THREE.PlaneGeometry(trackWidth - 2.5, 3.5);

    const planeMat = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1
    });

    finishLineMesh = new THREE.Mesh(planeGeo, planeMat);
    finishLineMesh.rotation.x = -Math.PI / 2;
    finishLineMesh.position.set(startPt.x, 0.25, startPt.z);
    finishLineMesh.rotation.z = angle;
    finishLineMesh.renderOrder = 2;
    scene.add(finishLineMesh);
}

// Texturas de Itens
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

function createStarMesh() {
    const starGroup = new THREE.Group();
    const starMat = new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffaa00, emissiveIntensity: 0.8, roughness: 0.1 });

    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const point = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.2, 4), starMat);
        point.rotation.z = -angle;
        point.position.set(Math.sin(angle) * 0.6, Math.cos(angle) * 0.6, 0);
        starGroup.add(point);
    }
    const centerCore = new THREE.Mesh(new THREE.SphereGeometry(0.6, 12, 12), starMat);
    starGroup.add(centerCore);

    return starGroup;
}

function createQuestionCubeMesh() {
    return new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 1.8), new THREE.MeshStandardMaterial({ color: 0xffaa00, roughness: 0.3 }));
}

function spawnRewardItem(tPos, itemType) {
    const pt = trackCurve.getPoint(tPos);
    let meshGroup;
    if (itemType === 'coin') meshGroup = createCoinMesh();
    else if (itemType === 'mushroom') meshGroup = createMushroomMesh();
    else if (itemType === 'star') meshGroup = createStarMesh();
    else meshGroup = createQuestionCubeMesh();

    meshGroup.position.set(pt.x, 1.6, pt.z);
    scene.add(meshGroup);
    itemBoxes.push({ group: meshGroup, active: true, type: itemType });
}

// --- RAMPA SÓLIDA ---
function createRamp(tPos) {
    const pt = trackCurve.getPoint(tPos);
    const tangent = trackCurve.getTangent(tPos);
    const rampGroup = new THREE.Group();

    const rampGeo = new THREE.BoxGeometry(7, 1.4, 5);
    const rampMat = new THREE.MeshStandardMaterial({ map: rampTexture, roughness: 0.3 });
    const rampMesh = new THREE.Mesh(rampGeo, rampMat);
    rampMesh.rotation.x = -0.22;
    rampMesh.position.y = 0.5;
    rampGroup.add(rampMesh);

    const sideBarrierGeo = new THREE.BoxGeometry(0.6, 1.5, 5);
    const sideBarrierMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });

    const leftBarrier = new THREE.Mesh(sideBarrierGeo, sideBarrierMat);
    leftBarrier.position.set(-3.7, 0.5, 0);

    const rightBarrier = new THREE.Mesh(sideBarrierGeo, sideBarrierMat);
    rightBarrier.position.set(3.7, 0.5, 0);

    rampGroup.add(leftBarrier, rightBarrier);

    rampGroup.position.set(pt.x, 0, pt.z);
    rampGroup.rotation.y = Math.atan2(tangent.x, tangent.z);
    scene.add(rampGroup);

    ramps.push({
        group: rampGroup,
        position: pt.clone(),
        tVal: tPos,
        radius: 3.5,
        leftBarrierPos: leftBarrier.getWorldPosition(new THREE.Vector3()),
        rightBarrierPos: rightBarrier.getWorldPosition(new THREE.Vector3())
    });
}

function createOilSlick(tPos) {
    const pt = trackCurve.getPoint(tPos);
    const oil = new THREE.Mesh(new THREE.CircleGeometry(3.5, 16), new THREE.MeshBasicMaterial({ color: 0x111111, side: THREE.DoubleSide }));
    oil.rotation.x = -Math.PI / 2;
    oil.position.set(pt.x, 0.04, pt.z);
    scene.add(oil);
    obstacles.push({ mesh: oil, radius: 3.5 });
}

function spawnDynamicTrackItems() {
    clearTrackItems();

    const rewardTypes = ['coin', 'cube', 'mushroom', 'star'];
    const rampPositions = [0.12, 0.28, 0.44, 0.60, 0.76, 0.90];
    const oilPositions = [0.20, 0.35, 0.52, 0.68, 0.82];

    rampPositions.forEach(t => createRamp(t));
    oilPositions.forEach(t => createOilSlick(t));

    for (let i = 0.05; i < 0.98; i += 0.04) {
        const tooCloseToRamp = rampPositions.some(r => Math.abs(r - i) < 0.03);
        const tooCloseToOil = oilPositions.some(o => Math.abs(o - i) < 0.03);

        if (!tooCloseToRamp && !tooCloseToOil) {
            const type = rewardTypes[Math.floor(Math.random() * rewardTypes.length)];
            spawnRewardItem(i, type);
        }
    }
}

function buildTrack(layoutKey) {
    if (trackMesh) scene.remove(trackMesh);

    trackCurve = new THREE.CatmullRomCurve3(trackLayouts[layoutKey], true);
    const trackGeo = new THREE.TubeGeometry(trackCurve, 600, trackWidth / 2, 8, false);

    trackMat = new THREE.MeshStandardMaterial({
        color: 0x444444,
        roughness: 0.8
    });

    trackMesh = new THREE.Mesh(trackGeo, trackMat);
    trackMesh.scale.set(1, 0.01, 1);
    trackMesh.position.y = 0.01;
    scene.add(trackMesh);

    trackCenterPoints = trackCurve.getPoints(600);

    createStartFinishLine();
    createBarriersForTrack();
    createMarioEnvironmentProps();
    createRallyPropsAndCrowd();
    createDistantScenery();
    spawnDynamicTrackItems();
}

function updateSnowMounds(isSnowActive) {
    snowMoundsGroup.clear();
    if (!isSnowActive) return;

    const moundGeo = new THREE.SphereGeometry(1.5, 8, 6);
    const moundMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
    const points = trackCurve.getPoints(150);

    points.forEach((pt, idx) => {
        if (idx % 4 === 0) {
            const tangent = trackCurve.getTangent(idx / 150);
            const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

            const leftPos = pt.clone().add(normal.clone().multiplyScalar(trackWidth / 2 + 1.2));
            const rightPos = pt.clone().sub(normal.clone().multiplyScalar(trackWidth / 2 + 1.2));

            const leftMound = new THREE.Mesh(moundGeo, moundMat);
            leftMound.position.set(leftPos.x, 0.2, leftPos.z);
            leftMound.scale.set(1.5, 0.8, 1.5);
            snowMoundsGroup.add(leftMound);

            const rightMound = new THREE.Mesh(moundGeo, moundMat);
            rightMound.position.set(rightPos.x, 0.2, rightPos.z);
            rightMound.scale.set(1.5, 0.8, 1.5);
            snowMoundsGroup.add(rightMound);
        }
    });
}

function updateMeltingProps(isHeatActive) {
    meltingPropsGroup.clear();
    if (!isHeatActive) return;

    const popsicleMat = new THREE.MeshStandardMaterial({ color: 0xff2255, roughness: 0.1 });
    const puddleMat = new THREE.MeshBasicMaterial({ color: 0xff5588, transparent: true, opacity: 0.9 });
    const stickMat = new THREE.MeshStandardMaterial({ color: 0xd2b48c });
    const coneMat = new THREE.MeshStandardMaterial({ color: 0xff4500, roughness: 0.3 });

    const points = trackCurve.getPoints(100);
    points.forEach((pt, idx) => {
        if (idx % 5 === 0) {
            const tangent = trackCurve.getTangent(idx / 100);
            const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

            const side = (idx % 10 === 0) ? (trackWidth / 2 + 1.2) : -(trackWidth / 2 + 1.2);
            const pos = pt.clone().add(normal.multiplyScalar(side));

            if (idx % 10 === 0) {
                const popGroup = new THREE.Group();
                const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.5, 0.8), popsicleMat);
                body.position.y = 0.8;
                body.scale.set(1.6, 0.4, 1.6);

                const stick = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, 0.2), stickMat);
                stick.position.set(0, 0.3, -0.3);
                stick.rotation.x = 0.4;

                const puddleGeo = new THREE.CircleGeometry(2.0, 16);
                const puddle = new THREE.Mesh(puddleGeo, puddleMat);
                puddle.rotation.x = -Math.PI / 2;
                puddle.position.y = 0.03;

                popGroup.add(body, stick, puddle);
                popGroup.position.set(pos.x, 0, pos.z);
                meltingPropsGroup.add(popGroup);
            } else {
                const coneGroup = new THREE.Group();
                const coneGeo = new THREE.ConeGeometry(1.6, 2.2, 8);
                const cone = new THREE.Mesh(coneGeo, coneMat);
                cone.position.set(0, 0.6, 0);
                cone.rotation.z = 1.25;
                cone.rotation.x = 0.2;

                const puddleGeo = new THREE.CircleGeometry(1.8, 16);
                const puddleMatCone = new THREE.MeshBasicMaterial({ color: 0xff7722, transparent: true, opacity: 0.85 });
                const puddle = new THREE.Mesh(puddleGeo, puddleMatCone);
                puddle.rotation.x = -Math.PI / 2;
                puddle.position.y = 0.03;

                coneGroup.add(cone, puddle);
                coneGroup.position.set(pos.x, 0, pos.z);
                meltingPropsGroup.add(coneGroup);
            }
        }
    });
}

// 5. Kart e Acessórios
let originalKartColor = 0xe60000;
let playerBodyMat = null;

function createAccessoriesGroup(charKey, capColorHex) {
    const group = new THREE.Group();

    if (charKey === 'toad') {
        const toadCap = new THREE.Mesh(
            new THREE.SphereGeometry(1.0, 16, 12, 0, Math.PI * 2, 0, Math.PI / 1.5),
            new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
        );
        toadCap.position.set(0, 0.2, 0);
        group.add(toadCap);

        const spotMat = new THREE.MeshStandardMaterial({ color: 0xee0000, roughness: 0.3 });
        const spotGeo = new THREE.SphereGeometry(0.32, 12, 12);

        const spotFront = new THREE.Mesh(spotGeo, spotMat);
        spotFront.position.set(0, 0.85, 0.6);
        const spotLeft = new THREE.Mesh(spotGeo, spotMat);
        spotLeft.position.set(-0.7, 0.6, 0);
        const spotRight = new THREE.Mesh(spotGeo, spotMat);
        spotRight.position.set(0.7, 0.6, 0);

        group.add(spotFront, spotLeft, spotRight);
    }
    else if (charKey === 'peach' || charKey === 'daisy') {
        const crownMat = new THREE.MeshStandardMaterial({
            color: charKey === 'peach' ? 0xffd700 : 0xffaa00,
            metalness: 0.9,
            roughness: 0.1
        });
        const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.35, 0.35, 6), crownMat);
        crown.position.set(0, 0.95, 0);
        group.add(crown);
    }
    else if (charKey === 'yoshi') {
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });

        const eyeGeo = new THREE.SphereGeometry(0.3, 12, 12);
        const pupilGeo = new THREE.SphereGeometry(0.12, 8, 8);

        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.35, 0.5, 0.7);
        const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
        leftPupil.position.set(-0.35, 0.5, 0.92);

        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.35, 0.5, 0.7);
        const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
        rightPupil.position.set(0.35, 0.5, 0.92);

        const spineMat = new THREE.MeshStandardMaterial({ color: 0xff6600 });
        const spine = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.6, 4), spineMat);
        spine.position.set(0, 0.6, -0.8);
        spine.rotation.x = -0.5;

        group.add(leftEye, leftPupil, rightEye, rightPupil, spine);
    }
    else if (charKey === 'bowser') {
        const hornMat = new THREE.MeshStandardMaterial({ color: 0xfffff0, roughness: 0.4 });
        const hornGeo = new THREE.ConeGeometry(0.25, 0.7, 8);

        const leftHorn = new THREE.Mesh(hornGeo, hornMat);
        leftHorn.position.set(-0.8, 0.6, 0.1);
        leftHorn.rotation.z = -0.5;

        const rightHorn = new THREE.Mesh(hornGeo, hornMat);
        rightHorn.position.set(0.8, 0.6, 0.1);
        rightHorn.rotation.z = 0.5;

        const hairMat = new THREE.MeshStandardMaterial({ color: 0xff2200 });
        const hair = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 1.0), hairMat);
        hair.position.set(0, 0.7, -0.3);

        group.add(leftHorn, rightHorn, hair);
    }
    else {
        const cap = new THREE.Mesh(
            new THREE.SphereGeometry(0.88, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
            new THREE.MeshStandardMaterial({ color: capColorHex, roughness: 0.4 })
        );
        cap.position.set(0, 0.1, 0);
        group.add(cap);

        const visor = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.06, 0.5),
            new THREE.MeshStandardMaterial({ color: capColorHex, roughness: 0.4 })
        );
        visor.position.set(0, 0.25, 0.8);
        visor.rotation.x = 0.2;
        group.add(visor);
    }

    if (['mario', 'luigi', 'wario'].includes(charKey)) {
        const stacheGeo = charKey === 'wario' ?
            new THREE.BoxGeometry(0.8, 0.2, 0.18) :
            new THREE.BoxGeometry(0.6, 0.12, 0.15);

        const stacheMat = new THREE.MeshStandardMaterial({
            color: charKey === 'wario' ? 0x111111 : 0x221100
        });

        const stache = new THREE.Mesh(stacheGeo, stacheMat);
        stache.position.set(0, -0.22, 0.88);
        group.add(stache);
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

    const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffaa });
    const headGeo = new THREE.SphereGeometry(0.2, 12, 12);

    const headLeft = new THREE.Mesh(headGeo, lightMat);
    headLeft.position.set(-0.8, 0.5, 2.2);
    kartGroup.add(headLeft);

    const headRight = new THREE.Mesh(headGeo, lightMat);
    headRight.position.set(0.8, 0.5, 2.2);
    kartGroup.add(headRight);

    const tailMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const tailLeft = new THREE.Mesh(headGeo, tailMat);
    tailLeft.position.set(-0.9, 0.6, -1.9);
    const tailRight = new THREE.Mesh(headGeo, tailMat);
    tailRight.position.set(0.9, 0.6, -1.9);
    kartGroup.add(tailLeft, tailRight);

    const tailPointLight = new THREE.PointLight(0xff0000, 0.8, 10);
    tailPointLight.position.set(0, 0.6, -2.0);
    kartGroup.add(tailPointLight);

    if (isPlayer) {
        const frontLight = new THREE.PointLight(0xffffaa, 0, 45);
        frontLight.position.set(0, 1.2, 3.5);
        kartGroup.add(frontLight);

        kartGroup.frontLight = frontLight;
        kartGroup.tailLight = tailPointLight;
    }

    const helmetGroup = new THREE.Group();
    helmetGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.85, 24, 24), new THREE.MeshStandardMaterial({ color: 0xffe0bd, roughness: 0.5 })));

    if (isPlayer) {
        const facePlane = new THREE.Mesh(
            new THREE.PlaneGeometry(0.9, 0.9),
            new THREE.MeshBasicMaterial({
                map: createFaceTexture('neutral'),
                transparent: true,
                side: THREE.DoubleSide,
                depthWrite: false
            })
        );
        facePlane.position.set(0, 0.15, 0.82);
        facePlane.rotation.x = -0.2;
        helmetGroup.add(facePlane);

        kartGroup.facePlane = facePlane;

        playerAccessoriesGroup = createAccessoriesGroup('mario', 0xe60000);
        helmetGroup.add(playerAccessoriesGroup);
    }

    helmetGroup.position.set(0, 1.6, 0.1); 
    kartGroup.add(helmetGroup);

    return kartGroup;
}

const kartGroup = buildDetailed3DKart(originalKartColor, true);
scene.add(kartGroup);

let speed = 0, angle = 0, verticalSpeed = 0, isJumping = false, boostTimer = 0;
let coinsCount = 0, cubesCount = 0, mushroomsCount = 0, playerLives = 3;
let currentLap = 0;
let passedHalfTrack = false;
let currentDriftFactor = 1.0;
let gameActive = false;

function resetPlayerPosition(trackKey) {
    let tValue = 0.98;
    if (trackKey === 'hard') tValue = 0.985;

    const startPt = trackCurve.getPoint(tValue);
    const startTangent = trackCurve.getTangent(0.0);

    kartGroup.position.set(startPt.x, 0.1, startPt.z);
    kartGroup.rotation.y = Math.atan2(startTangent.x, startTangent.z);
    angle = kartGroup.rotation.y;
    speed = 0;
    isCrashing = false;
    currentLap = 0;
    passedHalfTrack = false;

    const cameraOffset = new THREE.Vector3(0, 5, -12).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
    camera.position.copy(kartGroup.position).add(cameraOffset);
    camera.lookAt(kartGroup.position.clone().add(new THREE.Vector3(0, 1.2, 2)));
}

buildTrack(currentTrackKey);
resetPlayerPosition(currentTrackKey);

// Seleção de Pistas no Menu
document.querySelectorAll('.track-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (e.currentTarget.id === 'btn-instructions') return;
        document.querySelectorAll('.track-btn').forEach(b => {
            if (b.id !== 'btn-instructions') b.classList.remove('active');
        });
        e.currentTarget.classList.add('active');
        const trackVal = e.currentTarget.getAttribute('data-track');
        if (trackVal in trackLayouts) {
            currentTrackKey = trackVal;
        } else {
            currentTrackKey = 'medium';
        }
        buildTrack(currentTrackKey);
        resetPlayerPosition(currentTrackKey);
        updateHUD();
    });
});

// 6. Inimigos IA
const aiKarts = [];
const aiColors = [0x00a000, 0xff69b4, 0xff9900, 0x0055ff, 0xffff00];

function createAIKarts() {
    aiColors.forEach((color, index) => {
        const aiGroup = buildDetailed3DKart(color, false);
        scene.add(aiGroup);
        aiKarts.push({
            group: aiGroup,
            progress: (index + 1) * 0.12,
            baseSpeed: 0.0008 + Math.random() * 0.0001,
            speed: 0.0008,
            offset: (index % 2 === 0 ? 5 : -5),
            targetOffset: (index % 2 === 0 ? 5 : -5),
            aggression: Math.random() * 0.5 + 0.5
        });
    });
}
createAIKarts();

// 7. Personagens
const characterAssets = {
    mario: { color: 0xe60000 }, luigi: { color: 0x00a000 }, peach: { color: 0xff69b4 },
    daisy: { color: 0xff9900 }, yoshi: { color: 0x32cd32 }, toad: { color: 0x0055ff },
    bowser: { color: 0x228b22 }, wario: { color: 0xffd700 }, donkey_kong: { color: 0x8b4513 }
};

let selectedCharKey = 'mario';

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
        selectedCharKey = e.currentTarget.getAttribute('data-char');

        const charData = characterAssets[selectedCharKey];
        if (charData) {
            originalKartColor = charData.color;
            if (playerBodyMat) playerBodyMat.color.setHex(originalKartColor);
        }
        updatePlayerAccessories(selectedCharKey);
    });
});

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
    updateHUD();
});

// 8. MINI-MAPA
const minimapCanvas = document.getElementById('minimap');
const minimapCtx = minimapCanvas ? minimapCanvas.getContext('2d') : null;

function updateMinimap() {
    if (!gameActive || !minimapCtx) return;
    minimapCtx.clearRect(0, 0, 160, 160);

    minimapCtx.beginPath();
    minimapCtx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    minimapCtx.lineWidth = 8;
    trackCenterPoints.forEach((pt, idx) => {
        const mx = 80 + (pt.x / 1100) * 70;
        const my = 80 + (pt.z / 1100) * 70;
        if (idx === 0) minimapCtx.moveTo(mx, my);
        else minimapCtx.lineTo(mx, my);
    });
    minimapCtx.closePath();
    minimapCtx.stroke();

    aiKarts.forEach(ai => {
        const pos = ai.group.position;
        const mx = 80 + (pos.x / 1100) * 70;
        const my = 80 + (pos.z / 1100) * 70;
        minimapCtx.beginPath();
        minimapCtx.arc(mx, my, 4, 0, Math.PI * 2);
        minimapCtx.fillStyle = '#ff3300';
        minimapCtx.fill();
    });

    const pPos = kartGroup.position;
    const pmx = 80 + (pPos.x / 1100) * 70;
    const pmy = 80 + (pPos.z / 1100) * 70;
    minimapCtx.beginPath();
    minimapCtx.arc(pmx, pmy, 6, 0, Math.PI * 2);
    minimapCtx.fillStyle = '#00ffff';
    minimapCtx.fill();
    minimapCtx.strokeStyle = '#ffffff';
    minimapCtx.lineWidth = 2;
    minimapCtx.stroke();
}

// 9. Controles
const keys = {
    ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
    w: false, s: false, a: false, d: false,
    Space: false, Shift: false, b: false,
    btnAccelerate: false, btnBrake: false
};

window.addEventListener('keydown', (e) => {
    const keyLower = e.key.toLowerCase();
    if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (cubesCount > 0) {
            if (Math.random() > 0.5) shootShell(true);
            else shootShell(false);
        }
    }
    if (keyLower === 'b') dropBanana();
    if (e.key === 'Shift' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') activateMushroomBoost();
    if (keyLower === 'e') activateStarPower();

    if (e.key in keys) keys[e.key] = true;
    if (keyLower === 'w') keys.w = true;
    if (keyLower === 's') keys.s = true;
    if (keyLower === 'a') keys.a = true;
    if (keyLower === 'd') keys.d = true;
});

window.addEventListener('keyup', (e) => {
    const keyLower = e.key.toLowerCase();
    if (e.key in keys) keys[e.key] = false;
    if (keyLower === 'w') keys.w = false;
    if (keyLower === 's') keys.s = false;
    if (keyLower === 'a') keys.a = false;
    if (keyLower === 'd') keys.d = false;
});

let joystickInputX = 0, joystickInputY = 0;
const baseElem = document.getElementById('joystick-base');
const stickElem = document.getElementById('joystick-stick');

if (baseElem && stickElem) {
    let joystickActive = false;
    let baseRect = null;
    const maxRadius = 40;

    const handleStart = () => {
        joystickActive = true;
        baseRect = baseElem.getBoundingClientRect();
    };

    const handleMove = (e) => {
        if (!joystickActive || !baseRect) return;
        const touch = e.touches ? e.touches[0] : e;
        const centerX = baseRect.left + baseRect.width / 2;
        const centerY = baseRect.top + baseRect.height / 2;

        let deltaX = touch.clientX - centerX;
        let deltaY = touch.clientY - centerY;

        const distance = Math.hypot(deltaX, deltaY);
        if (distance > maxRadius) {
            deltaX = (deltaX / distance) * maxRadius;
            deltaY = (deltaY / distance) * maxRadius;
        }

        stickElem.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;
        joystickInputX = deltaX / maxRadius;
        joystickInputY = -(deltaY / maxRadius);
    };

    const handleEnd = () => {
        joystickActive = false;
        stickElem.style.transform = 'translate(-50%, -50%)';
        joystickInputX = 0;
        joystickInputY = 0;
    };

    baseElem.addEventListener('touchstart', handleStart, { passive: true });
    window.addEventListener('touchmove', handleMove, { passive: true });
    window.addEventListener('touchend', handleEnd, { passive: true });
    baseElem.addEventListener('mousedown', handleStart);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
}

function bindTouchButton(elementId, keyProp) {
    const btn = document.getElementById(elementId);
    if (!btn) return;
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); keys[keyProp] = true; }, { passive: false });
    btn.addEventListener('touchend', (e) => { e.preventDefault(); keys[keyProp] = false; }, { passive: false });
    btn.addEventListener('mousedown', (e) => { e.preventDefault(); keys[keyProp] = true; });
    btn.addEventListener('mouseup', (e) => { e.preventDefault(); keys[keyProp] = false; });
}
bindTouchButton('btn-accelerate', 'btnAccelerate');
bindTouchButton('btn-brake', 'btnBrake');

function updateHUD() {
    const lapElem = document.getElementById('lap-num');
    if (lapElem) lapElem.innerText = `${currentLap} / ${TOTAL_LAPS}`;

    const coinElem = document.getElementById('coin-num');
    if (coinElem) coinElem.innerText = coinsCount;

    const cubeElem = document.getElementById('cube-num');
    if (cubeElem) cubeElem.innerText = cubesCount;

    const shroomElem = document.getElementById('mushroom-num');
    if (shroomElem) shroomElem.innerText = mushroomsCount;

    const starElem = document.getElementById('star-num');
    if (starElem) starElem.innerText = starsCount;

    const livesElem = document.getElementById('lives-num');
    if (livesElem) livesElem.innerText = "❤️".repeat(playerLives);

    const boosterBtn = document.getElementById('panel-booster-btn');
    if (boosterBtn) {
        boosterBtn.innerText = `🚀 TURBO (${mushroomsCount}/3)`;
        if (mushroomsCount >= 3) {
            boosterBtn.style.background = 'linear-gradient(135deg, #ff8c00, #ff0055)';
            boosterBtn.style.color = '#ffffff';
            boosterBtn.style.borderColor = '#ffffff';
            boosterBtn.style.cursor = 'pointer';
            boosterBtn.style.boxShadow = '0 0 10px rgba(255, 140, 0, 0.8)';
        } else {
            boosterBtn.style.background = '#444444';
            boosterBtn.style.color = '#888888';
            boosterBtn.style.borderColor = '#666666';
            boosterBtn.style.cursor = 'not-allowed';
            boosterBtn.style.boxShadow = 'none';
        }
    }

    const starBtn = document.getElementById('panel-star-btn');
    if (starBtn) {
        starBtn.innerText = `⭐ ATIVAR (${starsCount})`;
        if (starsCount > 0) {
            starBtn.style.background = 'linear-gradient(135deg, #ffcc00, #ffea00)';
            starBtn.style.color = '#000000';
            starBtn.style.borderColor = '#ffffff';
            starBtn.style.cursor = 'pointer';
            starBtn.style.boxShadow = '0 0 10px rgba(255, 255, 0, 0.8)';
        } else {
            starBtn.style.background = '#444444';
            starBtn.style.color = '#888888';
            starBtn.style.borderColor = '#666666';
            starBtn.style.cursor = 'not-allowed';
            starBtn.style.boxShadow = 'none';
        }
    }

    const shellBtn = document.getElementById('panel-shell-btn');
    if (shellBtn) {
        shellBtn.innerText = `🐢 DISPARAR (${cubesCount})`;
        if (cubesCount > 0) {
            shellBtn.style.background = 'linear-gradient(135deg, #00aa00, #00ff66)';
            shellBtn.style.color = '#ffffff';
            shellBtn.style.borderColor = '#ffffff';
            shellBtn.style.cursor = 'pointer';
            shellBtn.style.boxShadow = '0 0 10px rgba(0, 255, 100, 0.8)';
        } else {
            shellBtn.style.background = '#444444';
            shellBtn.style.color = '#888888';
            shellBtn.style.borderColor = '#666666';
            shellBtn.style.cursor = 'not-allowed';
            shellBtn.style.boxShadow = 'none';
        }
    }
}

let lastProgressCheck = 0;

function checkLapProgression() {
    const progress = getTrackProgress(kartGroup.position);

    if (progress > 0.45 && progress < 0.55) {
        passedHalfTrack = true;
    }

    if ((progress < 0.05 || progress > 0.95) && passedHalfTrack) {
        if (lastProgressCheck > 0.8) {
            currentLap++;
            passedHalfTrack = false;
            sounds.playLapSound();
            updateHUD();

            if (currentLap >= TOTAL_LAPS) {
                gameActive = false;
                showGameOverModal(true, 1, "03:45.00");
            }
        }
    }
    lastProgressCheck = progress;
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
        if (!isCrashing && (kartPos.distanceTo(ramp.leftBarrierPos) < 2.0 || kartPos.distanceTo(ramp.rightBarrierPos) < 2.0)) {
            if (starTimer <= 0) {
                isCrashing = true;
                crashTimer = 50;
                speed = 0;
                sounds.playHitSound();
                updatePlayerFace('sad');
                return;
            }
        }

        if (!isCrashing && kartPos.distanceTo(ramp.position) < ramp.radius && !isJumping) {
            isJumping = true;
            verticalSpeed = 0.65;
            boostTimer = 90;
            sounds.playJumpSound();
            updatePlayerFace('surprised');
            setTimeout(() => updatePlayerFace('neutral'), 1200);
        }
    });

    itemBoxes.forEach(item => {
        if (!item.active) return;
        if (kartPos.distanceTo(item.group.position) < 2.4) {
            item.active = false;
            item.group.visible = false;
            if (item.type === 'coin') {
                coinsCount++;
                updatePlayerFace('happy');
                setTimeout(() => updatePlayerFace('neutral'), 1000);
            } else if (item.type === 'cube') {
                cubesCount++;
                updatePlayerFace('surprised');
                setTimeout(() => updatePlayerFace('neutral'), 1200);
            } else if (item.type === 'mushroom') {
                mushroomsCount++;
                updatePlayerFace('happy');
                setTimeout(() => updatePlayerFace('neutral'), 1200);
            } else if (item.type === 'star') {
                starsCount++;
                sounds.playItemSound(1.5);
                updatePlayerFace('super_happy');
                setTimeout(() => updatePlayerFace('neutral'), 2000);
            }
            updateHUD();
            setTimeout(() => { item.active = true; item.group.visible = true; }, 5000);
        }
    });

    activeBananas.forEach((banana, bIdx) => {
        if (kartPos.distanceTo(banana.mesh.position) < banana.radius) {
            if (starTimer <= 0) {
                speed = 0.05;
                angle += Math.PI / 2;
                sounds.playHitSound();
                updatePlayerFace('sad');
                setTimeout(() => updatePlayerFace('neutral'), 2000);
            }
            scene.remove(banana.mesh);
            activeBananas.splice(bIdx, 1);
        }
    });
}

function checkEnvironmentCollisions() {
    if (isCrashing) return;
    const kartPos = kartGroup.position;
    let closestPoint = trackCurve.getPoint(0);
    let minDistance = 9999;

    for (let i = 0; i <= 600; i++) {
        const t = i / 600;
        const pt = trackCurve.getPoint(t);
        const dist = kartPos.distanceTo(pt);
        if (dist < minDistance) {
            minDistance = dist;
            closestPoint = pt;
        }
    }

    const maxAllowedDistance = trackWidth / 2 - 1.2;

    if (minDistance > maxAllowedDistance) {
        speed = -0.1;
        sounds.playHitSound();
        updatePlayerFace('sad');
        setTimeout(() => updatePlayerFace('neutral'), 1500);
        const pushDir = closestPoint.clone().sub(kartPos).normalize();
        kartGroup.position.copy(closestPoint).add(pushDir.multiplyScalar(-maxAllowedDistance));
        return;
    }
}

function updateEnvironment(progress) {
    const playerKart = kartGroup;
    let targetClima = 'sol';

    if (progress >= 0.0 && progress < 0.25) targetClima = 'sol';
    else if (progress >= 0.25 && progress < 0.5) targetClima = 'calor';
    else if (progress >= 0.5 && progress < 0.75) targetClima = 'chuva';
    else targetClima = 'neve';

    if (currentClima !== targetClima) {
        currentClima = targetClima;

        if (currentClima === 'sol') {
            scene.background.setHex(0x87ceeb);
            groundMat.color.setHex(0x2e8b57);
            dirLight.intensity = 1.2;
            ambientLight.intensity = 0.8;
            if (trackMat) { trackMat.color.setHex(0x444444); trackMat.roughness = 0.8; }
            updateSnowMounds(false);
            updateMeltingProps(false);
            setupWeatherSystem('sol');
            currentDriftFactor = 1.0;
            if (playerKart.frontLight) { playerKart.frontLight.intensity = 0; playerKart.tailLight.intensity = 0.4; }
        } else if (currentClima === 'calor') {
            scene.background.setHex(0xffaa33);
            groundMat.color.setHex(0xd2b48c);
            dirLight.intensity = 1.4;
            ambientLight.intensity = 0.8;
            if (trackMat) { trackMat.color.setHex(0x554433); trackMat.roughness = 0.7; }
            updateSnowMounds(false);
            updateMeltingProps(true);
            setupWeatherSystem('calor');
            currentDriftFactor = 1.0;
            if (playerKart.frontLight) { playerKart.frontLight.intensity = 0; playerKart.tailLight.intensity = 0.4; }
        } else if (currentClima === 'chuva') {
            scene.background.setHex(0x4a4e69);
            groundMat.color.setHex(0x3a4d39);
            dirLight.intensity = 0.5;
            ambientLight.intensity = 0.4;
            if (trackMat) { trackMat.color.setHex(0x222222); trackMat.roughness = 0.35; }
            updateSnowMounds(false);
            updateMeltingProps(false);
            setupWeatherSystem('chuva');
            currentDriftFactor = 0.45;
            if (playerKart.frontLight) { playerKart.frontLight.intensity = 4.5; playerKart.tailLight.intensity = 1.5; }
        } else if (currentClima === 'neve') {
            scene.background.setHex(0x0c0f1d);
            groundMat.color.setHex(0xbbbbcc);
            dirLight.intensity = 0.1;
            ambientLight.intensity = 0.25;
            if (trackMat) { trackMat.color.setHex(0xaaaaaa); trackMat.roughness = 0.9; }
            updateSnowMounds(true);
            updateMeltingProps(false);
            setupWeatherSystem('neve');
            currentDriftFactor = 0.3;
            if (playerKart.frontLight) { playerKart.frontLight.intensity = 9.0; playerKart.tailLight.intensity = 2.5; }
        }
    }
}

function getTrackProgress(position) {
    let closestT = 0;
    let minDistance = 99999;
    for (let i = 0; i <= 300; i++) {
        const t = i / 300;
        const pt = trackCurve.getPoint(t);
        const dist = position.distanceTo(pt);
        if (dist < minDistance) {
            minDistance = dist;
            closestT = t;
        }
    }
    return closestT;
}

let currentSteeringAngle = 0;

function updateKart() {
    if (!gameActive) return;

    if (isCrashing) {
        crashTimer--;
        const progressT = (1 - (crashTimer / 50));
        kartGroup.rotation.x = progressT * (Math.PI * 4);
        kartGroup.position.y = Math.sin(progressT * Math.PI) * 2.5;

        const forwardDir = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
        kartGroup.position.addScaledVector(forwardDir, 0.15);

        if (crashTimer <= 0) {
            isCrashing = false;
            kartGroup.rotation.x = 0;
            kartGroup.position.y = 0.1;
            const safePt = trackCurve.getPoint(getTrackProgress(kartGroup.position));
            kartGroup.position.set(safePt.x, 0.1, safePt.z);
            updatePlayerFace('neutral');
        }
        return;
    }

    // --- AJUSTE DE VELOCIDADE DO GAMEPLAY (Passo 2) ---
    // maxSpeed consolidado em 1.0 e aceleração em 0.020 para maior dinamismo
    let maxSpeed = 1.0;
    if (starTimer > 0) {
        starTimer--;
        maxSpeed = 1.35;
        speed = maxSpeed;
    } else if (boostTimer > 0) {
        boostTimer--;
        maxSpeed = 1.2;
        speed = maxSpeed;
    }

    const isAccelerating = keys.ArrowUp || keys.w || keys.btnAccelerate || joystickInputY > 0.2;
    const isBraking = keys.ArrowDown || keys.s || keys.btnBrake || joystickInputY < -0.2;

    if (isAccelerating) speed = Math.min(speed + 0.020, maxSpeed); // Aceleração oficial: 0.020
    else if (isBraking) speed = Math.max(speed - 0.020, -0.20);
    else speed *= 0.95;

    const turnFactor = 0.014 * (Math.abs(speed) / 1.0 + 0.25);
    let targetSteering = 0;

    if (!isJumping) {
        if (Math.abs(joystickInputX) > 0.05) {
            targetSteering = -joystickInputX * turnFactor * (speed >= 0 ? 1 : -1);
        } else if (keys.ArrowLeft || keys.a) {
            targetSteering = turnFactor * (speed >= 0 ? 1 : -1);
        } else if (keys.ArrowRight || keys.d) {
            targetSteering = -turnFactor * (speed >= 0 ? 1 : -1);
        }
    }

    currentSteeringAngle += (targetSteering - currentSteeringAngle) * (0.07 * currentDriftFactor);
    const driftSlide = (currentClima === 'neve' || currentClima === 'chuva') ? 1.3 : 1.0;
    angle += currentSteeringAngle * driftSlide;

    if (isJumping) {
        kartGroup.position.y += verticalSpeed;
        verticalSpeed -= 0.028;
        if (kartGroup.position.y <= 0) { kartGroup.position.y = 0; isJumping = false; }
    }

    kartGroup.rotation.y = angle;
    kartGroup.translateZ(speed);

    let nearbyRival = false;
    aiKarts.forEach(ai => {
        if (kartGroup.position.distanceTo(ai.group.position) < 8.0) {
            nearbyRival = true;
        }
    });

    if (nearbyRival && starTimer <= 0 && boostTimer <= 0) {
        updatePlayerFace('determined');
    } else if (starTimer <= 0 && boostTimer <= 0 && !isCrashing) {
        updatePlayerFace('neutral');
    }

    if (Math.abs(speed) > 0.2) {
        const backPos = kartGroup.position.clone().add(new THREE.Vector3(0, 0, -1.2).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle));
        emitDust(backPos);
    }

    if (boostTimer > 0 || starTimer > 0) {
        const backPos = kartGroup.position.clone().add(new THREE.Vector3(0, 0, -1.5).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle));
        emitSparks(backPos);
        emitSparks(backPos);
    }

    if (Math.abs(currentSteeringAngle) > 0.025 || currentClima === 'neve' || currentClima === 'chuva') {
        if (Math.abs(speed) > 0.1) emitSmoke(kartGroup.position);
    }

    const progress = getTrackProgress(kartGroup.position);
    updateEnvironment(progress);

    checkCollisions();
    checkEnvironmentCollisions();
    checkLapProgression();
    sounds.updateEngine(speed / 1.0);
    updateSpeedometer();

    const cameraOffset = new THREE.Vector3(0, 5, -12).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
    const targetCameraPos = kartGroup.position.clone().add(cameraOffset);
    camera.position.copy(targetCameraPos);
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

animate();

function animate() {
    requestAnimationFrame(animate);

    if (gameActive) {
        itemBoxes.forEach(item => { if (item.active && item.group) item.group.rotation.y += 0.04; });
        updateAIKarts();
        updateShells();
        updateKart();
        updateWeatherParticles();
        updateMinimap();
    } else {
        const cameraOffset = new THREE.Vector3(0, 5, -12).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
        camera.position.copy(kartGroup.position).add(cameraOffset);
        camera.lookAt(kartGroup.position.clone().add(new THREE.Vector3(0, 1.2, 2)));
    }

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});