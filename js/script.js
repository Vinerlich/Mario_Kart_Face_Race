import * as THREE from 'three';

// 1. Configuração da Cena, Câmera e Renderizador
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Céu azul

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('game-container').appendChild(renderer.domElement);

// 2. Iluminação
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(20, 40, 20);
scene.add(dirLight);

// 3. Pista (Chão, Asfalto e Zebras)
const groundGeo = new THREE.PlaneGeometry(300, 300);
const groundMat = new THREE.MeshLambertMaterial({ color: 0x2e8b57 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

const innerRadius = 30;
const outerRadius = 50;
const trackRadius = 40; // Caminho central da pista
const trackGeo = new THREE.RingGeometry(innerRadius, outerRadius, 64);
const trackMat = new THREE.MeshLambertMaterial({ color: 0x333333, side: THREE.DoubleSide });
const track = new THREE.Mesh(trackGeo, trackMat);
track.rotation.x = -Math.PI / 2;
track.position.y = 0.01;
scene.add(track);

function createCurbs() {
    const curbSegments = 64;
    const innerCurbRadius = innerRadius - 0.5;
    const outerCurbRadius = outerRadius + 0.5;

    for (let i = 0; i < curbSegments; i++) {
        const thetaStart = (i / curbSegments) * Math.PI * 2;
        const thetaLength = (1 / curbSegments) * Math.PI * 2;
        const color = i % 2 === 0 ? 0xff0000 : 0xffffff;

        const inGeo = new THREE.RingGeometry(innerCurbRadius, innerRadius, 8, 1, thetaStart, thetaLength);
        const inMat = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
        const inMesh = new THREE.Mesh(inGeo, inMat);
        inMesh.rotation.x = -Math.PI / 2;
        inMesh.position.y = 0.02;
        scene.add(inMesh);

        const outGeo = new THREE.RingGeometry(outerRadius, outerCurbRadius, 8, 1, thetaStart, thetaLength);
        const outMat = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
        const outMesh = new THREE.Mesh(outGeo, outMat);
        outMesh.rotation.x = -Math.PI / 2;
        outMesh.position.y = 0.02;
        scene.add(outMesh);
    }
}
createCurbs();

// 4. Elementos da Pista e Obstáculos
const itemBoxes = [];
const obstacles = [];

function createItemBox(x, z) {
    const boxGroup = new THREE.Group();
    const boxGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const boxMat = new THREE.MeshLambertMaterial({ color: 0xffd700, transparent: true, opacity: 0.85 });
    const mesh = new THREE.Mesh(boxGeo, boxMat);
    boxGroup.add(mesh);

    boxGroup.position.set(x, 1.5, z);
    scene.add(boxGroup);
    itemBoxes.push(boxGroup);
}

function createOilSlick(x, z) {
    const oilGeo = new THREE.CircleGeometry(2, 16);
    const oilMat = new THREE.MeshBasicMaterial({ color: 0x111111, side: THREE.DoubleSide });
    const oil = new THREE.Mesh(oilGeo, oilMat);
    oil.rotation.x = -Math.PI / 2;
    oil.position.set(x, 0.03, z);
    scene.add(oil);
    obstacles.push({ mesh: oil, type: 'oil', radius: 2 });
}

function createCone(x, z) {
    const coneGeo = new THREE.ConeGeometry(0.6, 1.5, 12);
    const coneMat = new THREE.MeshLambertMaterial({ color: 0xff5500 });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.set(x, 0.75, z);
    scene.add(cone);
    obstacles.push({ mesh: cone, type: 'cone', radius: 1 });
}

const numItems = 6;
for (let i = 0; i < numItems; i++) {
    const angle = (i / numItems) * Math.PI * 2;
    createItemBox(Math.cos(angle) * trackRadius, Math.sin(angle) * trackRadius);
}

createOilSlick(0, 40);
createOilSlick(0, -40);
createCone(40, 0);
createCone(-40, 0);

// 5. Kart do Jogador
const kartGroup = new THREE.Group();

const bodyGeo = new THREE.BoxGeometry(2, 0.8, 3);
const bodyMat = new THREE.MeshLambertMaterial({ color: 0xe60000 });
const body = new THREE.Mesh(bodyGeo, bodyMat);
body.position.y = 0.5;
kartGroup.add(body);

const textureLoader = new THREE.TextureLoader();
const expressions = { neutro: null, feliz: null, triste: null };

const headMaterials = [
    new THREE.MeshLambertMaterial({ color: 0xffcc99 }),
    new THREE.MeshLambertMaterial({ color: 0xffcc99 }),
    new THREE.MeshLambertMaterial({ color: 0xffcc99 }),
    new THREE.MeshLambertMaterial({ color: 0xffcc99 }),
    new THREE.MeshLambertMaterial({ color: 0xffffff }), // FRENTE
    new THREE.MeshLambertMaterial({ color: 0xffcc99 })
];

const headGeo = new THREE.BoxGeometry(1.4, 1.4, 1.4);
const head = new THREE.Mesh(headGeo, headMaterials);
head.position.set(0, 1.6, 0.2);
kartGroup.add(head);

scene.add(kartGroup);
kartGroup.position.set(40, 0, 0);

// 6. Criando Karts Inimigos (Bots A.I.)
const aiKarts = [];
const aiColors = [0x00a000, 0xff69b4, 0xffa500, 0x0055ff, 0xffff00]; // Luigi, Peach, Daisy, Toad, Wario

function createAIKarts() {
    aiColors.forEach((color, index) => {
        const aiGroup = new THREE.Group();

        // Corpo do Kart AI
        const aiBodyMat = new THREE.MeshLambertMaterial({ color });
        const aiBody = new THREE.Mesh(bodyGeo, aiBodyMat);
        aiBody.position.y = 0.5;
        aiGroup.add(aiBody);

        // Cabeça simples do AI
        const aiHeadMat = new THREE.MeshLambertMaterial({ color: 0xffcc99 });
        const aiHead = new THREE.Mesh(headGeo, aiHeadMat);
        aiHead.position.set(0, 1.6, 0.2);
        aiGroup.add(aiHead);

        // Posições e velocidades ligeiramente diferentes
        const startAngle = (index + 1) * (Math.PI / 3);
        const radiusOffset = (index % 2 === 0 ? 3 : -3); // Distribui em raios diferentes da pista
        
        scene.add(aiGroup);
        
        aiKarts.push({
            group: aiGroup,
            angle: startAngle,
            radius: trackRadius + radiusOffset,
            speed: 0.008 + Math.random() * 0.004 // Velocidades variadas
        });
    });
}
createAIKarts();

// 7. Mapeamento de Personagens
const characterAssets = {
    mario: { color: 0xe60000, neutro: 'assets/mario/neutro.png', feliz: 'assets/mario/feliz.png', triste: 'assets/mario/triste.png' },
    luigi: { color: 0x00a000, neutro: 'assets/luigi/neutro.png', feliz: 'assets/luigi/feliz.png', triste: 'assets/luigi/triste.png' },
    peach: { color: 0xff69b4, neutro: 'assets/peach/neutro.png', feliz: 'assets/peach/feliz.png', triste: 'assets/peach/triste.png' },
    daisy: { color: 0xffa500, neutro: 'assets/daisy/neutro.png', feliz: 'assets/daisy/feliz.png', triste: 'assets/daisy/triste.png' },
    yoshi: { color: 0x32cd32, neutro: 'assets/yoshi/neutro.png', feliz: 'assets/yoshi/feliz.png', triste: 'assets/yoshi/triste.png' },
    toad: { color: 0x0055ff, neutro: 'assets/toad/neutro.png', feliz: 'assets/toad/feliz.png', triste: 'assets/toad/triste.png' },
    bowser: { color: 0x228b22, neutro: 'assets/bowser/neutro.png', feliz: 'assets/bowser/feliz.png', triste: 'assets/bowser/triste.png' },
    wario: { color: 0xffd700, neutro: 'assets/wario/neutro.png', feliz: 'assets/wario/feliz.png', triste: 'assets/wario/triste.png' },
    donkey_kong: { color: 0x8b4513, neutro: 'assets/donkey_kong/neutro.png', feliz: 'assets/donkey_kong/feliz.png', triste: 'assets/donkey_kong/triste.png' }
};

let currentExpression = 'neutro';

function setExpression(type) {
    if (expressions[type] && currentExpression !== type) {
        currentExpression = type;
        headMaterials[4].map = expressions[type];
        headMaterials[4].needsUpdate = true;
    }
}

function loadCharacterTextures(paths) {
    ['neutro', 'feliz', 'triste'].forEach(type => {
        textureLoader.load(paths[type], (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            expressions[type] = texture;
            if (type === 'neutro') setExpression('neutro');
        });
    });
}

// 8. Menu
let selectedChar = null;

document.querySelectorAll('.char-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.char-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        selectedChar = e.target.getAttribute('data-char');
        
        if (selectedChar === 'custom') {
            document.getElementById('custom-upload-panel').style.display = 'flex';
        } else {
            document.getElementById('custom-upload-panel').style.display = 'none';
            const charData = characterAssets[selectedChar];
            bodyMat.color.setHex(charData.color);
            loadCharacterTextures(charData);
        }
        
        document.getElementById('btn-start').style.display = 'block';
    });
});

function handleImageUpload(type, event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            textureLoader.load(e.target.result, (texture) => {
                texture.colorSpace = THREE.SRGBColorSpace;
                expressions[type] = texture;
                setExpression(type);
            });
        };
        reader.readAsDataURL(file);
    }
}

document.getElementById('img-neutro').addEventListener('change', (e) => handleImageUpload('neutro', e));
document.getElementById('img-feliz').addEventListener('change', (e) => handleImageUpload('feliz', e));
document.getElementById('img-triste').addEventListener('change', (e) => handleImageUpload('triste', e));

document.getElementById('btn-start').addEventListener('click', () => {
    document.getElementById('menu-screen').style.display = 'none';
    document.getElementById('hud-game').style.display = 'block';
});

window.addEventListener('keydown', (e) => {
    if (e.key === '1') setExpression('neutro');
    if (e.key === '2') setExpression('feliz');
    if (e.key === '3') setExpression('triste');
});

// 9. Movimentação e Atualização dos Bots A.I.
function updateAIKarts() {
    aiKarts.forEach(ai => {
        ai.angle += ai.speed;
        
        // Posição no circulo da pista
        const x = Math.cos(ai.angle) * ai.radius;
        const z = Math.sin(ai.angle) * ai.radius;
        
        ai.group.position.set(x, 0, z);
        // Aponta para a direção do movimento (tangente do círculo)
        ai.group.rotation.y = -ai.angle + Math.PI / 2;
    });
}

// 10. Controles, Física e Colisões
const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, w: false, s: false, a: false, d: false };
let speed = 0;
let angle = 0;
let isHit = false;
let hitTimer = 0;

window.addEventListener('keydown', (e) => { if (e.key in keys) keys[e.key] = true; });
window.addEventListener('keyup', (e) => { if (e.key in keys) keys[e.key] = false; });

function checkCollisions() {
    if (isHit) return;

    // Colisão com Obstáculos
    obstacles.forEach(obs => {
        const dist = kartGroup.position.distanceTo(obs.mesh.position);
        if (dist < obs.radius + 1.2) {
            isHit = true;
            hitTimer = 60;
            speed = -0.1;
            setExpression('triste');
        }
    });

    // Colisão com Karts Inimigos
    aiKarts.forEach(ai => {
        const dist = kartGroup.position.distanceTo(ai.group.position);
        if (dist < 2.2) {
            isHit = true;
            hitTimer = 40;
            speed = -0.2; // Empurrão para trás
            setExpression('triste'); // Fica triste com a batida
        }
    });

    // Colisão com Caixas '?'
    itemBoxes.forEach(box => {
        const dist = kartGroup.position.distanceTo(box.position);
        if (dist < 2.0) {
            setExpression('feliz');
            box.position.y = -10;
            setTimeout(() => { box.position.y = 1.5; }, 5000);
        }
    });
}

function updateKart() {
    if (isHit) {
        angle += 0.2;
        speed *= 0.9;
        hitTimer--;
        if (hitTimer <= 0) isHit = false;
    } else {
        if (keys.ArrowUp || keys.w) speed = Math.min(speed + 0.02, 0.8);
        else if (keys.ArrowDown || keys.s) speed = Math.max(speed - 0.02, -0.3);
        else speed *= 0.95;

        if (keys.ArrowLeft || keys.a) angle += 0.03 * (speed >= 0 ? 1 : -1);
        if (keys.ArrowRight || keys.d) angle -= 0.03 * (speed >= 0 ? 1 : -1);

        if (speed > 0.6) {
            setExpression('feliz');
        } else if (speed < -0.05) {
            setExpression('triste');
        } else if (Math.abs(speed) <= 0.6) {
            setExpression('neutro');
        }
    }

    checkCollisions();

    kartGroup.rotation.y = angle;
    kartGroup.translateZ(speed);

    // Câmera Perseguição
    const cameraOffset = new THREE.Vector3(0, 5, -10).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
    camera.position.copy(kartGroup.position).add(cameraOffset);
    camera.lookAt(kartGroup.position.clone().add(new THREE.Vector3(0, 1.5, 0)));
}

// 11. Loop do Jogo
function animate() {
    requestAnimationFrame(animate);

    itemBoxes.forEach(box => { box.rotation.y += 0.02; });
    
    updateAIKarts();
    updateKart();
    
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();