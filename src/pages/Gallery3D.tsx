import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

function Gallery3D() {
  const { subject = 'geometry' } = useParams()
  const canvasRef = useRef<HTMLDivElement>(null)
  
  // Состояния
  const [currentModel, setCurrentModel] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [autoRotate, setAutoRotate] = useState(true) // Новое: авто-вращение
  const [lowQuality, setLowQuality] = useState(false) // Новое: ручное переключение качества
  const [isMobile, setIsMobile] = useState(false)

  // Refs для Three.js
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const modelsRef = useRef<THREE.Object3D[]>([])

  const subjectData: Record<string, any> = {
    geometry: {
      name: 'Геометрия',
      emoji: '📐',
      color: '#667eea',
      models: [
        { name: '📦 Куб', description: 'Правильный шестигранник с равными гранями' },
        { name: '🔺 Пирамида', description: 'Четырёхгранная пирамида с квадратным основанием' },
        { name: '⚪ Сфера', description: 'Идеальная трёхмерная окружность' },
        { name: '🥫 Цилиндр', description: 'Фигура с круглым основанием и высотой' },
      ]
    },
    biology: {
      name: 'Биология',
      emoji: '🧬',
      color: '#22c55e',
      models: [
        { name: '🦠 Клетка', description: 'Основная единица жизни с ядром и органеллами' },
        { name: '🧬 ДНК', description: 'Двойная спираль генетической информации' },
        { name: '❤️ Сердце', description: 'Главный орган кровеносной системы' },
        { name: '🧠 Нейрон', description: 'Нервная клетка с дендритами и аксоном' },
      ]
    },
    chemistry: {
      name: 'Химия',
      emoji: '⚗️',
      color: '#f59e0b',
      models: [
        { name: '💧 H₂O', description: 'Молекула воды - 2 атома водорода и 1 кислорода' },
        { name: '🔥 CH₄', description: 'Молекула метана - простейший углеводород' },
        { name: '🌫️ CO₂', description: 'Углекислый газ - линейная молекула' },
        { name: '🧂 NaCl', description: 'Поваренная соль - ионная связь' },
      ]
    },
    physics: {
      name: 'Физика',
      emoji: '⚡',
      color: '#ec4899',
      models: [
        { name: '🔌 Цепь', description: 'Электрическая цепь с источником тока' },
        { name: '🧲 Магнит', description: 'Магнитное поле с силовыми линиями' },
        { name: '🌊 Волна', description: 'Поперечная волна и её распространение' },
        { name: '⚛️ Атом', description: 'Модель атома с электронными орбитами' },
      ]
    }
  }

  const currentSubject = subjectData[subject] || subjectData.geometry

  useEffect(() => {
    // 1. Определение устройства
    const ua = navigator.userAgent
    const mobile = /Mobi|Android|iPhone|iPad|iPod/.test(ua) || window.innerWidth < 768
    setIsMobile(mobile)
    
    // Автоматическое снижение качества на слабых сетях или мобилках
    const connection = (navigator as any).connection
    const saveData = connection?.saveData || connection?.effectiveType?.includes('2g')
    const preferLow = mobile || saveData
    setLowQuality(preferLow)

    if (!canvasRef.current) return

    // Адаптивные параметры детализации (чтобы не лагало)
    const DETAIL = {
      sphereSeg: preferLow ? 16 : mobile ? 32 : 64,
      cylRadial: preferLow ? 12 : mobile ? 24 : 64,
      dnaSeg: preferLow ? 40 : mobile ? 60 : 100,
      ribosomes: preferLow ? 10 : mobile ? 20 : 50,
      naclLattice: preferLow ? 1 : 2
    }

    // 2. Setup Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a1a)
    scene.fog = new THREE.FogExp2(0x0a0a1a, preferLow ? 0.04 : 0.02)
    sceneRef.current = scene

    // 3. Setup Camera
    const camera = new THREE.PerspectiveCamera(
      mobile ? 60 : 50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.set(0, mobile ? 1.5 : 1.2, mobile ? 4 : 6)
    cameraRef.current = camera

    // 4. Setup Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !preferLow && !mobile, // Выключаем сглаживание на мобилках для FPS
      alpha: true,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true
    })
    
    const maxDPR = preferLow ? 1 : mobile ? 1.5 : Math.min(window.devicePixelRatio, 2)
    renderer.setPixelRatio(maxDPR)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMap.enabled = !preferLow && !mobile // Тени только на ПК
    if (!preferLow && !mobile) {
        renderer.shadowMap.type = THREE.PCFSoftShadowMap
    }
    renderer.outputEncoding = THREE.sRGBEncoding
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0
    
    canvasRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // 5. Setup Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = mobile ? 0.1 : 0.05
    controls.minDistance = 2
    controls.maxDistance = mobile ? 10 : 20
    controls.enablePan = !mobile
    controls.autoRotate = autoRotate // Используем стейт
    controls.autoRotateSpeed = 2.0
    controlsRef.current = controls

    // 6. Setup Lighting
    const hemi = new THREE.HemisphereLight(0xffffff, 0x080820, mobile ? 0.6 : 0.6)
    scene.add(hemi)

    const dir = new THREE.DirectionalLight(0xffffff, mobile ? 0.8 : 1.0)
    dir.position.set(5, 8, 3)
    dir.castShadow = !preferLow && !mobile
    
    if (!preferLow && !mobile) {
      dir.shadow.mapSize.width = 1024
      dir.shadow.mapSize.height = 1024
      dir.shadow.bias = -0.0001
    }
    scene.add(dir)

    const p1 = new THREE.PointLight(0xff6b9d, mobile ? 0.4 : 0.6, 50)
    p1.position.set(4, 4, 5)
    scene.add(p1)

    const p2 = new THREE.PointLight(0x4ecdc4, mobile ? 0.4 : 0.6, 50)
    p2.position.set(-4, 2, 5)
    scene.add(p2)

    // Ground & Grid (только для ПК для красоты)
    if (!mobile && !preferLow) {
        const grid = new THREE.GridHelper(20, 40, 0x222233, 0x0f1724)
        grid.position.y = -2
        if (grid.material instanceof THREE.Material) {
            grid.material.transparent = true
            grid.material.opacity = 0.2
        }
        scene.add(grid)
    }

    // === ГЕНЕРАЦИЯ МОДЕЛЕЙ (Тот самый большой блок) ===
    modelsRef.current = []

    const enableShadowsRec = (obj: THREE.Object3D) => {
      obj.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const m = child as THREE.Mesh
          m.castShadow = !preferLow && !mobile
          m.receiveShadow = !preferLow && !mobile
        }
      })
    }

    // --- GEOMETRY ---
    const createGeometryModels = () => {
      // Box
      const boxGeo = new THREE.BoxGeometry(2, 2, 2)
      const boxMat = new THREE.MeshPhysicalMaterial({ color: 0x667eea, metalness: 0.1, roughness: 0.4, clearcoat: 0.2 })
      const box = new THREE.Mesh(boxGeo, boxMat)
      box.add(new THREE.LineSegments(new THREE.EdgesGeometry(boxGeo), new THREE.LineBasicMaterial({ color: 0xffffff })))
      modelsRef.current.push(box)

      // Pyramid
      const pyrGeo = new THREE.ConeGeometry(1.5, 2.5, 4)
      const pyrMat = new THREE.MeshPhysicalMaterial({ color: 0x22c55e, metalness: 0.1, roughness: 0.4 })
      const pyr = new THREE.Mesh(pyrGeo, pyrMat)
      pyr.add(new THREE.LineSegments(new THREE.EdgesGeometry(pyrGeo), new THREE.LineBasicMaterial({ color: 0xffffff })))
      modelsRef.current.push(pyr)

      // Sphere
      const sphGeo = new THREE.SphereGeometry(1.5, DETAIL.sphereSeg, DETAIL.sphereSeg)
      const sphMat = new THREE.MeshPhysicalMaterial({ color: 0xf59e0b, metalness: 0.3, roughness: 0.2, clearcoat: 0.4 })
      modelsRef.current.push(new THREE.Mesh(sphGeo, sphMat))

      // Cylinder
      const cylGeo = new THREE.CylinderGeometry(1, 1, 2.5, DETAIL.cylRadial)
      const cylMat = new THREE.MeshPhysicalMaterial({ color: 0xec4899, metalness: 0.2, roughness: 0.3 })
      modelsRef.current.push(new THREE.Mesh(cylGeo, cylMat))
    }

    // --- BIOLOGY ---
    const createBiologyModels = () => {
      // 1. Cell
      const cell = new THREE.Group()
      // Membrane
      const membrane = new THREE.Mesh(
        new THREE.SphereGeometry(1.5, DETAIL.sphereSeg, DETAIL.sphereSeg),
        new THREE.MeshPhysicalMaterial({ color: 0xffe0f0, transparent: true, opacity: 0.5, roughness: 0.2, transmission: 0.2 })
      )
      cell.add(membrane)
      // Nucleus
      const nucleus = new THREE.Mesh(
        new THREE.SphereGeometry(0.6, DETAIL.sphereSeg, DETAIL.sphereSeg),
        new THREE.MeshStandardMaterial({ color: 0xff6b9d, roughness: 0.7 })
      )
      cell.add(nucleus)
      // Mitochondria (randomly placed)
      for (let i = 0; i < 6; i++) {
        const mito = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.3, 4, 8), new THREE.MeshStandardMaterial({ color: 0x4ecdc4 }))
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 0.8 + Math.random() * 0.4;
        mito.position.set(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
        mito.lookAt(0,0,0);
        cell.add(mito)
      }
      modelsRef.current.push(cell)

      // 2. DNA (Double Helix)
      const dna = new THREE.Group()
      const points1: THREE.Vector3[] = []
      const points2: THREE.Vector3[] = []
      const segments = DETAIL.dnaSeg
      
      for (let i = 0; i <= segments; i++) {
        const t = (i / segments) * Math.PI * 4 // 2 turns
        const y = (i / segments) * 4 - 2
        const x1 = Math.cos(t) * 0.6; const z1 = Math.sin(t) * 0.6
        const x2 = Math.cos(t + Math.PI) * 0.6; const z2 = Math.sin(t + Math.PI) * 0.6
        points1.push(new THREE.Vector3(x1, y, z1))
        points2.push(new THREE.Vector3(x2, y, z2))
      }
      const curve1 = new THREE.CatmullRomCurve3(points1)
      const curve2 = new THREE.CatmullRomCurve3(points2)
      
      dna.add(new THREE.Mesh(new THREE.TubeGeometry(curve1, segments, 0.1, 8, false), new THREE.MeshStandardMaterial({ color: 0x4ecdc4 })))
      dna.add(new THREE.Mesh(new THREE.TubeGeometry(curve2, segments, 0.1, 8, false), new THREE.MeshStandardMaterial({ color: 0xff6b9d })))
      
      // Rungs
      for (let i = 0; i < points1.length; i += 3) {
        const p1 = points1[i]; const p2 = points2[i];
        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, p1.distanceTo(p2), 6), new THREE.MeshStandardMaterial({ color: 0xffffff }));
        rung.position.copy(mid);
        rung.lookAt(p2);
        rung.rotateX(Math.PI / 2);
        dna.add(rung);
      }
      modelsRef.current.push(dna)

      // 3. Heart (Procedural Shape)
      const heart = new THREE.Group()
      const x = 0, y = 0;
      const heartShape = new THREE.Shape();
      heartShape.moveTo(x + 0.5, y + 0.5);
      heartShape.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y);
      heartShape.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7);
      heartShape.bezierCurveTo(x - 0.6, y + 1.1, x - 0.3, y + 1.54, x + 0.5, y + 1.9);
      heartShape.bezierCurveTo(x + 1.2, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7);
      heartShape.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1, y);
      heartShape.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5);

      const geometry = new THREE.ExtrudeGeometry(heartShape, { depth: 0.4, bevelEnabled: true, bevelSegments: 3, steps: 2, bevelSize: 0.1, bevelThickness: 0.1 });
      const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0xff1744, roughness: 0.4 }));
      mesh.rotation.z = Math.PI; // Flip it
      mesh.position.y = 1;
      mesh.scale.set(1.5, 1.5, 1.5);
      heart.add(mesh);
      modelsRef.current.push(heart)

      // 4. Neuron
      const neuron = new THREE.Group()
      const soma = new THREE.Mesh(new THREE.SphereGeometry(0.5, DETAIL.sphereSeg, DETAIL.sphereSeg), new THREE.MeshStandardMaterial({ color: 0xffeb3b }));
      neuron.add(soma);
      // Dendrites
      for(let i=0; i<8; i++) {
        const d = new THREE.Mesh(new THREE.ConeGeometry(0.08, 1.2, 5), new THREE.MeshStandardMaterial({ color: 0xffc107 }));
        d.position.y = 0.5;
        d.rotation.x = Math.random() * Math.PI;
        d.rotation.z = Math.random() * Math.PI;
        neuron.add(d);
      }
      // Axon
      const axon = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.05, 3), new THREE.MeshStandardMaterial({ color: 0xff9800 }));
      axon.position.y = -1.5;
      neuron.add(axon);
      modelsRef.current.push(neuron)
    }

    // --- CHEMISTRY ---
    const createChemistryModels = () => {
      // 1. H2O
      const h2o = new THREE.Group()
      const o = new THREE.Mesh(new THREE.SphereGeometry(0.5, DETAIL.sphereSeg, DETAIL.sphereSeg), new THREE.MeshStandardMaterial({ color: 0xff0000 }));
      const h1 = new THREE.Mesh(new THREE.SphereGeometry(0.3, DETAIL.sphereSeg, DETAIL.sphereSeg), new THREE.MeshStandardMaterial({ color: 0xffffff }));
      const h2 = new THREE.Mesh(new THREE.SphereGeometry(0.3, DETAIL.sphereSeg, DETAIL.sphereSeg), new THREE.MeshStandardMaterial({ color: 0xffffff }));
      h1.position.set(0.6, 0.4, 0);
      h2.position.set(-0.6, 0.4, 0);
      
      const b1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.7), new THREE.MeshStandardMaterial({ color: 0xcccccc }));
      b1.position.set(0.3, 0.2, 0); b1.rotation.z = -0.9;
      const b2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.7), new THREE.MeshStandardMaterial({ color: 0xcccccc }));
      b2.position.set(-0.3, 0.2, 0); b2.rotation.z = 0.9;
      
      h2o.add(o, h1, h2, b1, b2);
      h2o.scale.set(1.5, 1.5, 1.5);
      modelsRef.current.push(h2o)

      // 2. CH4
      const ch4 = new THREE.Group()
      const c = new THREE.Mesh(new THREE.SphereGeometry(0.5, DETAIL.sphereSeg, DETAIL.sphereSeg), new THREE.MeshStandardMaterial({ color: 0x555555 }));
      ch4.add(c);
      // Tetrahedron positions
      const positions = [[0.8, 0.8, 0.8], [-0.8, -0.8, 0.8], [0.8, -0.8, -0.8], [-0.8, 0.8, -0.8]];
      positions.forEach(pos => {
        const h = new THREE.Mesh(new THREE.SphereGeometry(0.3, 20, 20), new THREE.MeshStandardMaterial({ color: 0xffffff }));
        h.position.set(pos[0], pos[1], pos[2]);
        ch4.add(h);
        
        const bond = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1), new THREE.MeshStandardMaterial({ color: 0xcccccc }));
        bond.position.set(pos[0]/2, pos[1]/2, pos[2]/2);
        bond.lookAt(pos[0], pos[1], pos[2]);
        bond.rotateX(Math.PI/2);
        ch4.add(bond);
      });
      modelsRef.current.push(ch4)

      // 3. CO2
      const co2 = new THREE.Group()
      const c_atom = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), new THREE.MeshStandardMaterial({ color: 0x555555 }));
      const o1 = new THREE.Mesh(new THREE.SphereGeometry(0.45, 32, 32), new THREE.MeshStandardMaterial({ color: 0xff0000 }));
      const o2 = new THREE.Mesh(new THREE.SphereGeometry(0.45, 32, 32), new THREE.MeshStandardMaterial({ color: 0xff0000 }));
      o1.position.x = 1.2; o2.position.x = -1.2;
      
      // Double bonds
      const db1 = new THREE.Group();
      db1.add(new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,1.2), new THREE.MeshStandardMaterial({color:0xccc})).translateY(0.1));
      db1.add(new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,1.2), new THREE.MeshStandardMaterial({color:0xccc})).translateY(-0.1));
      db1.rotation.z = Math.PI/2; db1.position.x = 0.6;
      
      const db2 = db1.clone(); db2.position.x = -0.6;
      
      co2.add(c_atom, o1, o2, db1, db2);
      modelsRef.current.push(co2);

      // 4. NaCl Lattice
      const nacl = new THREE.Group()
      const size = DETAIL.naclLattice;
      for (let x = -size; x <= size; x++) {
        for (let y = -size; y <= size; y++) {
          for (let z = -size; z <= size; z++) {
            const isNa = (x + y + z) % 2 === 0;
            const atom = new THREE.Mesh(
              new THREE.SphereGeometry(0.25, 16, 16),
              new THREE.MeshStandardMaterial({ color: isNa ? 0x9c27b0 : 0x4caf50 }) // Purple Na, Green Cl
            );
            atom.position.set(x * 0.7, y * 0.7, z * 0.7);
            nacl.add(atom);
            
            // Bonds (simplified)
            if (x < size) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.7), new THREE.MeshStandardMaterial({color: 0xddd})); b.position.set(x*0.7+0.35, y*0.7, z*0.7); b.rotation.z = Math.PI/2; nacl.add(b); }
            if (y < size) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.7), new THREE.MeshStandardMaterial({color: 0xddd})); b.position.set(x*0.7, y*0.7+0.35, z*0.7); nacl.add(b); }
            if (z < size) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.7), new THREE.MeshStandardMaterial({color: 0xddd})); b.position.set(x*0.7, y*0.7, z*0.7+0.35); b.rotation.x = Math.PI/2; nacl.add(b); }
          }
        }
      }
      modelsRef.current.push(nacl);
    }

    // --- PHYSICS ---
    const createPhysicsModels = () => {
      // 1. Circuit
      const circuit = new THREE.Group()
      const wireMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8 });
      // Wires
      const w1 = new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05, 2), wireMat); w1.position.y = 1; w1.rotation.z = Math.PI/2;
      const w2 = new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05, 2), wireMat); w2.position.y = -1; w2.rotation.z = Math.PI/2;
      const w3 = new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05, 2), wireMat); w3.position.x = -1; 
      const w4 = new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05, 2), wireMat); w4.position.x = 1; 
      // Bulb
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.4, 32, 32), new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffff00, emissiveIntensity: 0.8, transparent: true, opacity: 0.9 }));
      bulb.position.y = 1;
      // Battery
      const bat = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.4), new THREE.MeshStandardMaterial({ color: 0x222222 }));
      bat.position.y = -1;
      const posTerm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.2), new THREE.MeshStandardMaterial({color: 0xcccccc})); posTerm.position.set(0, -0.5, 0);
      
      circuit.add(w1, w2, w3, w4, bulb, bat, posTerm);
      modelsRef.current.push(circuit);

      // 2. Magnet
      const magnet = new THREE.Group();
      const bar = new THREE.Group();
      const red = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1, 0.5), new THREE.MeshStandardMaterial({ color: 0xff0000 })); red.position.y = 0.5;
      const blue = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1, 0.5), new THREE.MeshStandardMaterial({ color: 0x0000ff })); blue.position.y = -0.5;
      bar.add(red, blue);
      magnet.add(bar);
      // Field lines
      for(let i=0; i<8; i++) {
        const angle = (i/8)*Math.PI*2;
        const pts = [];
        for(let t=0; t<=Math.PI; t+=0.1) {
             const r = 1.5 * Math.sin(t);
             const y = 2.5 * Math.cos(t);
             pts.push(new THREE.Vector3(r*Math.cos(angle), y, r*Math.sin(angle)));
        }
        const line = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, 0.02, 4, false), new THREE.MeshBasicMaterial({color: 0x00ffff, transparent: true, opacity: 0.5}));
        magnet.add(line);
      }
      modelsRef.current.push(magnet);

      // 3. Wave
      const wave = new THREE.Group();
      const wavePoints: THREE.Vector3[] = [];
      for(let i=0; i<=50; i++) {
          wavePoints.push(new THREE.Vector3((i/25)-1, 0, 0)); // base line
      }
      const waveCurve = new THREE.CatmullRomCurve3(wavePoints);
      const tube = new THREE.Mesh(new THREE.TubeGeometry(waveCurve, 64, 0.05, 8, false), new THREE.MeshStandardMaterial({color: 0x00bfff}));
      (tube as any).userData = { isWave: true, originalY: 0 }; // Mark for animation
      wave.add(tube);
      
      // Floating particles
      for(let i=0; i<15; i++) {
          const p = new THREE.Mesh(new THREE.SphereGeometry(0.08), new THREE.MeshBasicMaterial({color:0xffffff}));
          p.position.set((i/7.5)-1, 0, 0);
          (p as any).userData = { isParticle: true, offset: i };
          wave.add(p);
      }
      modelsRef.current.push(wave);

      // 4. Atom
      const atom = new THREE.Group();
      const n = new THREE.Mesh(new THREE.SphereGeometry(0.4, 32, 32), new THREE.MeshStandardMaterial({color: 0xff0000}));
      atom.add(n);
      const orbits = [
          { r: 1.0, speed: 2, color: 0x00ff00 },
          { r: 1.5, speed: 1.5, color: 0x0000ff },
          { r: 2.0, speed: 1, color: 0xffff00 }
      ];
      orbits.forEach((o, idx) => {
          const ring = new THREE.Mesh(new THREE.TorusGeometry(o.r, 0.02, 16, 64), new THREE.MeshBasicMaterial({color: 0x444444, transparent: true, opacity: 0.3}));
          ring.rotation.x = Math.PI/2;
          ring.rotation.y = idx * Math.PI/4;
          
          const electron = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), new THREE.MeshBasicMaterial({color: o.color}));
          const orbitGroup = new THREE.Group(); // Pivot for rotation
          orbitGroup.rotation.x = Math.PI/2;
          orbitGroup.rotation.y = idx * Math.PI/4;
          
          electron.position.set(o.r, 0, 0);
          (orbitGroup as any).userData = { isElectron: true, speed: o.speed };
          
          orbitGroup.add(electron);
          atom.add(ring, orbitGroup);
      });
      modelsRef.current.push(atom);
    }

    // MAIN GENERATION SWITCH
    if (subject === 'geometry') createGeometryModels()
    else if (subject === 'biology') createBiologyModels()
    else if (subject === 'chemistry') createChemistryModels()
    else if (subject === 'physics') createPhysicsModels()

    // Apply shadows to all
    modelsRef.current.forEach(m => enableShadowsRec(m))
    
    // Add first model
    if(modelsRef.current[0]) scene.add(modelsRef.current[0])

    setTimeout(() => setIsLoading(false), 300)

    // === ANIMATION LOOP (Процедурные анимации) ===
    let frame = 0;
    const animate = () => {
      requestAnimationFrame(animate)
      frame += 0.01;

      // Update Controls (Auto-rotate)
      if (controlsRef.current) {
        controlsRef.current.autoRotate = autoRotate
        controlsRef.current.update()
      }

      // Physics Animations
      if (subject === 'physics') {
         // Wave
         const waveModel = modelsRef.current[2];
         if (waveModel && scene.children.includes(waveModel)) {
             waveModel.children.forEach(c => {
                 if ((c as any).userData.isParticle) {
                     c.position.y = Math.sin(frame * 3 + (c as any).userData.offset) * 0.5;
                 }
             });
         }
         // Atom electrons
         const atomModel = modelsRef.current[3];
         if (atomModel && scene.children.includes(atomModel)) {
             atomModel.children.forEach(c => {
                 if ((c as any).userData.isElectron) {
                     c.rotation.z += (c as any).userData.speed * 0.02;
                 }
             });
         }
      }

      // Biology Animations
      if (subject === 'biology') {
          // Heart beat
          const heartModel = modelsRef.current[2];
          if (heartModel && scene.children.includes(heartModel)) {
              const scale = 1.5 + Math.sin(frame * 10) * 0.1;
              heartModel.scale.set(scale, scale, scale);
          }
      }

      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (canvasRef.current && renderer.domElement) {
        canvasRef.current.removeChild(renderer.domElement)
      }
      // Очистка памяти
      modelsRef.current.forEach(m => {
          m.traverse(c => {
              if ((c as THREE.Mesh).geometry) (c as THREE.Mesh).geometry.dispose();
          })
      })
    }
  }, [subject, autoRotate, lowQuality])

  const switchModel = (index: number) => {
    if (!sceneRef.current) return
    modelsRef.current.forEach(m => sceneRef.current?.remove(m))
    const model = modelsRef.current[index]
    if (model) {
      sceneRef.current.add(model)
      setCurrentModel(index)
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      
      {/* Loading Screen */}
      {isLoading && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          background: currentSubject.color, zIndex: 100,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem', animation: 'bounce 1s infinite' }}>{currentSubject.emoji}</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>Генерация 3D моделей...</div>
          <style>{`@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }`}</style>
        </div>
      )}

      {/* Canvas */}
      <div ref={canvasRef} style={{ width: '100%', height: '100%' }} />

      {/* Верхний бар */}
      <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 50 }}>
        <Link to="/subjects" className="btn" style={{ 
            background: 'rgba(255,255,255,0.9)', color: '#333', textDecoration: 'none', 
            padding: '8px 16px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 600, 
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '5px' 
        }}>
            <span>←</span> Назад
        </Link>
      </div>
      
      {/* Кнопки качества (только если не на слабом устройстве по умолчанию) */}
      {!isMobile && (
          <div style={{ position: 'absolute', top: 16, left: 120, zIndex: 50 }}>
             <button onClick={() => setLowQuality(!lowQuality)} style={{
                 background: lowQuality ? '#ff9800' : 'rgba(255,255,255,0.5)', border: 'none', color: 'white',
                 padding: '8px 12px', borderRadius: '20px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem'
             }}>
                 {lowQuality ? '⚡ Low Perf' : '✨ High Perf'}
             </button>
          </div>
      )}

      {/* Инфо панель справа (плавающая) */}
      <div style={{
        position: 'absolute', top: 16, right: 16,
        background: 'rgba(15, 15, 20, 0.7)', backdropFilter: 'blur(16px)',
        padding: '20px', borderRadius: '24px', color: 'white', maxWidth: '300px',
        border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.5px' }}>
                {currentSubject.models[currentModel].name}
            </h2>
            <button 
                onClick={() => setAutoRotate(!autoRotate)}
                style={{ 
                    background: autoRotate ? '#22c55e' : 'rgba(255,255,255,0.1)', border: 'none', 
                    color: 'white', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                }}
                title={autoRotate ? "Остановить вращение" : "Включить вращение"}
            >
                {autoRotate ? '❚❚' : '▶'}
            </button>
        </div>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5' }}>
          {currentSubject.models[currentModel].description}
        </p>
      </div>

      {/* Нижняя панель навигации по моделям */}
      <div style={{
        position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: '10px', background: 'rgba(20, 20, 30, 0.85)', padding: '8px 8px', borderRadius: '30px', 
        backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', 
        overflowX: 'auto', maxWidth: '95%', scrollbarWidth: 'none',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
      }}>
        {currentSubject.models.map((m: any, i: number) => (
          <button key={i} onClick={() => switchModel(i)} style={{
            background: currentModel === i ? currentSubject.color : 'transparent',
            color: 'white', border: 'none', padding: '10px 20px', borderRadius: '24px',
            cursor: 'pointer', transition: 'all 0.3s', fontSize: '0.9rem', fontWeight: 600, whiteSpace: 'nowrap',
            boxShadow: currentModel === i ? `0 4px 15px ${currentSubject.color}66` : 'none'
          }}>
            {m.name}
          </button>
        ))}
      </div>
    </div>
  )
}

export default Gallery3D
