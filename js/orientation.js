/**
 * INDIA SPACE LAB - CANSAT & CUBESAT GROUND CONTROL SOFTWARE (GCS)
 * 3D Orientation & Attitude Visualizer (Three.js WebGL)
 * Supports CanSat & CubeSat 3D models with interactive orbit controls & ADI Horizon
 */

class OrientationVisualizer {
    constructor(containerId = 'threeOrientationContainer') {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.satelliteGroup = null;
        this.canSatMeshGroup = null;
        this.cubeSatMeshGroup = null;
        this.currentModelType = 'cansat';

        // Target Euler angles (degrees) from telemetry
        this.targetRoll = 0;
        this.targetPitch = 0;
        this.targetYaw = 0;

        // Current rendered Euler angles
        this.currentRoll = 0;
        this.currentPitch = 0;
        this.currentYaw = 0;

        // Interactive Orbit Controls State
        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };
        this.cameraOrbit = { theta: 0, phi: 0.45, radius: 6.0 };

        this.initThree();
        this.buildCanSatModel();
        this.buildCubeSatModel();
        this.setModelType('cansat');
        this.setupPointerControls();
        this.animate();

        window.addEventListener('resize', () => this.onWindowResize());
    }

    initThree() {
        if (!this.container) return;

        const width = this.container.clientWidth || 300;
        const height = this.container.clientHeight || 200;

        // Scene
        this.scene = new THREE.Scene();

        // Camera
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        this.updateCameraPosition();

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
        this.scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0x00f0ff, 1.3);
        sunLight.position.set(5, 10, 7);
        this.scene.add(sunLight);

        const backLight = new THREE.DirectionalLight(0x7c4dff, 0.9);
        backLight.position.set(-5, -5, -5);
        this.scene.add(backLight);

        // Coordinate Grid
        const grid = new THREE.GridHelper(8, 16, 0x00f0ff, 0x112244);
        grid.position.y = -1.6;
        this.scene.add(grid);

        // Master satellite group for attitude rotation
        this.satelliteGroup = new THREE.Group();
        this.scene.add(this.satelliteGroup);
    }

    updateCameraPosition() {
        if (!this.camera) return;
        const { theta, phi, radius } = this.cameraOrbit;
        const clampedPhi = Math.max(0.05, Math.min(Math.PI - 0.05, phi));
        this.camera.position.x = radius * Math.sin(clampedPhi) * Math.sin(theta);
        this.camera.position.y = radius * Math.cos(clampedPhi);
        this.camera.position.z = radius * Math.sin(clampedPhi) * Math.cos(theta);
        this.camera.lookAt(0, 0, 0);
    }

    setupPointerControls() {
        if (!this.container) return;

        this.container.addEventListener('pointerdown', (e) => {
            this.isDragging = true;
            this.previousMousePosition = { x: e.clientX, y: e.clientY };
        });

        window.addEventListener('pointermove', (e) => {
            if (!this.isDragging) return;
            const deltaX = e.clientX - this.previousMousePosition.x;
            const deltaY = e.clientY - this.previousMousePosition.y;

            this.cameraOrbit.theta -= deltaX * 0.01;
            this.cameraOrbit.phi -= deltaY * 0.01;
            this.updateCameraPosition();

            this.previousMousePosition = { x: e.clientX, y: e.clientY };
        });

        window.addEventListener('pointerup', () => {
            this.isDragging = false;
        });

        this.container.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.cameraOrbit.radius = Math.max(3.0, Math.min(12.0, this.cameraOrbit.radius + e.deltaY * 0.005));
            this.updateCameraPosition();
        }, { passive: false });

        this.container.addEventListener('dblclick', () => {
            this.cameraOrbit = { theta: 0, phi: 0.45, radius: 6.0 };
            this.updateCameraPosition();
        });
    }

    buildCanSatModel() {
        this.canSatMeshGroup = new THREE.Group();

        // 1. CanSat Main Cylindrical Body
        const bodyGeo = new THREE.CylinderGeometry(0.7, 0.7, 1.8, 32);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x1e293b,
            metalness: 0.85,
            roughness: 0.25
        });
        const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
        this.canSatMeshGroup.add(bodyMesh);

        // 2. Gold Foil / MLI Thermal Insulation Band
        const foilGeo = new THREE.CylinderGeometry(0.71, 0.71, 0.8, 32);
        const foilMat = new THREE.MeshStandardMaterial({
            color: 0xd4af37, // Gold
            metalness: 0.9,
            roughness: 0.15
        });
        const foilMesh = new THREE.Mesh(foilGeo, foilMat);
        this.canSatMeshGroup.add(foilMesh);

        // 3. Top & Bottom Aluminum Bulkhead Caps
        const capGeo = new THREE.CylinderGeometry(0.74, 0.74, 0.1, 32);
        const capMat = new THREE.MeshStandardMaterial({
            color: 0x00f0ff,
            metalness: 0.7,
            roughness: 0.3
        });
        const topCap = new THREE.Mesh(capGeo, capMat);
        topCap.position.y = 0.95;
        const btmCap = new THREE.Mesh(capGeo, capMat);
        btmCap.position.y = -0.95;
        this.canSatMeshGroup.add(topCap);
        this.canSatMeshGroup.add(btmCap);

        // 4. Solar Panels (Deployable Wing Arrays)
        const panelGeo = new THREE.BoxGeometry(1.6, 0.8, 0.04);
        const panelMat = new THREE.MeshStandardMaterial({
            color: 0x0d47a1,
            metalness: 0.9,
            roughness: 0.1
        });
        const leftPanel = new THREE.Mesh(panelGeo, panelMat);
        leftPanel.position.set(-1.4, 0, 0);
        const rightPanel = new THREE.Mesh(panelGeo, panelMat);
        rightPanel.position.set(1.4, 0, 0);
        this.canSatMeshGroup.add(leftPanel);
        this.canSatMeshGroup.add(rightPanel);

        // 5. Whip Antennas
        const antGeo = new THREE.CylinderGeometry(0.015, 0.015, 1.4, 8);
        const antMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1.0 });
        const ant1 = new THREE.Mesh(antGeo, antMat);
        ant1.position.set(0.4, 1.5, 0);
        ant1.rotation.z = -0.2;
        const ant2 = new THREE.Mesh(antGeo, antMat);
        ant2.position.set(-0.4, 1.5, 0);
        ant2.rotation.z = 0.2;
        this.canSatMeshGroup.add(ant1);
        this.canSatMeshGroup.add(ant2);

        // 6. Coordinate Axis
        const axesHelper = new THREE.AxesHelper(1.8);
        this.canSatMeshGroup.add(axesHelper);

        this.satelliteGroup.add(this.canSatMeshGroup);
    }

    buildCubeSatModel() {
        this.cubeSatMeshGroup = new THREE.Group();

        // 1U CubeSat Frame (10x10x10 cm scale: 1.4x1.4x1.4)
        const frameGeo = new THREE.BoxGeometry(1.4, 1.4, 1.4);
        const frameMat = new THREE.MeshStandardMaterial({
            color: 0x0f172a,
            metalness: 0.8,
            roughness: 0.2
        });
        const frameMesh = new THREE.Mesh(frameGeo, frameMat);
        this.cubeSatMeshGroup.add(frameMesh);

        // Solar Cell Facets on 4 sides
        const solarGeo = new THREE.BoxGeometry(1.25, 1.25, 0.02);
        const solarMat = new THREE.MeshStandardMaterial({
            color: 0x1e3a8a,
            metalness: 0.95,
            roughness: 0.1
        });

        const solarZp = new THREE.Mesh(solarGeo, solarMat);
        solarZp.position.set(0, 0, 0.71);
        const solarZm = new THREE.Mesh(solarGeo, solarMat);
        solarZm.position.set(0, 0, -0.71);
        const solarXp = new THREE.Mesh(solarGeo, solarMat);
        solarXp.position.set(0.71, 0, 0);
        solarXp.rotation.y = Math.PI / 2;
        const solarXm = new THREE.Mesh(solarGeo, solarMat);
        solarXm.position.set(-0.71, 0, 0);
        solarXm.rotation.y = Math.PI / 2;

        this.cubeSatMeshGroup.add(solarZp);
        this.cubeSatMeshGroup.add(solarZm);
        this.cubeSatMeshGroup.add(solarXp);
        this.cubeSatMeshGroup.add(solarXm);

        // Deployable Solar Panels
        const wingGeo = new THREE.BoxGeometry(1.4, 1.2, 0.04);
        const wingMat = new THREE.MeshStandardMaterial({
            color: 0x0284c7,
            metalness: 0.9,
            roughness: 0.1
        });
        const leftWing = new THREE.Mesh(wingGeo, wingMat);
        leftWing.position.set(-1.45, 0, 0);
        const rightWing = new THREE.Mesh(wingGeo, wingMat);
        rightWing.position.set(1.45, 0, 0);
        this.cubeSatMeshGroup.add(leftWing);
        this.cubeSatMeshGroup.add(rightWing);

        // Camera lens port
        const lensGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 16);
        const lensMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, metalness: 0.9 });
        const lensMesh = new THREE.Mesh(lensGeo, lensMat);
        lensMesh.rotation.x = Math.PI / 2;
        lensMesh.position.set(0, 0, 0.74);
        this.cubeSatMeshGroup.add(lensMesh);

        // Magnetometer boom
        const boomGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.2, 8);
        const boomMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8 });
        const boom = new THREE.Mesh(boomGeo, boomMat);
        boom.position.set(0, 1.3, 0);
        this.cubeSatMeshGroup.add(boom);

        const axesHelper = new THREE.AxesHelper(1.8);
        this.cubeSatMeshGroup.add(axesHelper);

        this.satelliteGroup.add(this.cubeSatMeshGroup);
    }

    setModelType(type) {
        this.currentModelType = type;
        if (this.canSatMeshGroup) this.canSatMeshGroup.visible = (type === 'cansat');
        if (this.cubeSatMeshGroup) this.cubeSatMeshGroup.visible = (type === 'cubesat');
    }

    update(packet) {
        this.targetRoll = packet.gyroR || 0;
        this.targetPitch = packet.gyroP || 0;
        this.targetYaw = packet.gyroY || 0;

        const rollEl = document.getElementById('rpyRoll');
        const pitchEl = document.getElementById('rpyPitch');
        const yawEl = document.getElementById('rpyYaw');

        if (rollEl) rollEl.textContent = `${this.targetRoll.toFixed(1)}°`;
        if (pitchEl) pitchEl.textContent = `${this.targetPitch.toFixed(1)}°`;
        if (yawEl) yawEl.textContent = `${this.targetYaw.toFixed(1)}°`;

        this.updateADI(this.targetRoll, this.targetPitch);
    }

    updateADI(rollDeg, pitchDeg) {
        const horizonEl = document.getElementById('adiHorizon');
        if (!horizonEl) return;

        const pitchPixels = Math.max(-50, Math.min(50, pitchDeg * 1.5));
        horizonEl.style.transform = `translateY(${pitchPixels}px) rotate(${-rollDeg}deg)`;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Smooth LERP Euler angle rotation
        const lerpFactor = 0.12;
        this.currentRoll += (this.targetRoll - this.currentRoll) * lerpFactor;
        this.currentPitch += (this.targetPitch - this.currentPitch) * lerpFactor;
        this.currentYaw += (this.targetYaw - this.currentYaw) * lerpFactor;

        if (this.satelliteGroup) {
            this.satelliteGroup.rotation.x = THREE.MathUtils.degToRad(this.currentPitch);
            this.satelliteGroup.rotation.y = THREE.MathUtils.degToRad(this.currentYaw);
            this.satelliteGroup.rotation.z = THREE.MathUtils.degToRad(this.currentRoll);
        }

        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    onWindowResize() {
        if (!this.container || !this.renderer || !this.camera) return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        if (width === 0 || height === 0) return;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
}

window.OrientationVisualizer = OrientationVisualizer;
