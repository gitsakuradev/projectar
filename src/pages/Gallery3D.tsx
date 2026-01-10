import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

function Gallery3D() {
  const { subject = 'geometry' } = useParams()
  const canvasRef = useRef<HTMLDivElement>(null)
  const [currentModel, setCurrentModel] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const modelsRef = useRef<THREE.Object3D[]>([])
  const [lowQuality, setLowQuality] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

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
    const ua = navigator.userAgent
    const mobile = /Mobi|Android|iPhone|iPad|iPod/.test(ua) || window.innerWidth < 768
    setIsMobile(mobile)
    
    const connection = (navigator as any).connection
    const saveData = connection?.saveData || connection?.effectiveType?.includes('2g')
    const preferLow = mobile || saveData
    setLowQuality(preferLow)

    if (!canvasRef.current) return

    // Адаптивные параметры детализации
    const DETAIL = {
      sphereSeg: preferLow ? 12 : mobile ? 24 : 64,
      cylRadial: preferLow ? 8 : mobile ? 16 : 64,
      dnaSeg: preferLow ? 30 : mobile ? 50 : 80,
      ribosomes: preferLow ? 8 : mobile ? 20 : 40,
      mitochondria: preferLow ? 3 : mobile ? 5 : 8,
      erSegments: preferLow ? 6 : mobile ? 10 : 15,
      neuronSpines: preferLow ? 1 : mobile ? 3 : 5,
      neurotransmitters: preferLow ? 3 : mobile ? 6 : 8,
      axonSegments: preferLow ? 6 : mobile ? 10 : 15,
      naclLattice: preferLow ? 1 : 2
    }

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a1a)
    scene.fog = new THREE.FogExp2(0x0a0a1a, preferLow ? 0.05 : 0.02)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(
      mobile ? 60 : 50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.set(0, mobile ? 1.5 : 1.2, mobile ? 4 : 6)
    cameraRef.current = camera

    // Renderer с оптимизацией для мобильных
    const renderer = new THREE.WebGLRenderer({
      antialias: !preferLow && !mobile,
      alpha: true,
      powerPreference: mobile ? 'low-power' : 'high-performance',
      stencil: false,
      depth: true
    })
    
    const maxDPR = preferLow ? 1 : mobile ? 1.5 : Math.min(window.devicePixelRatio, 2)
    renderer.setPixelRatio(maxDPR)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMap.enabled = !preferLow && !mobile
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputEncoding = THREE.sRGBEncoding
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0
    
    canvasRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Controls с улучшенной настройкой для тач-устройств
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = mobile ? 0.15 : 0.08
    controls.minDistance = 2
    controls.maxDistance = mobile ? 10 : 20
    controls.enablePan = !mobile
    controls.enableZoom = true
    controls.zoomSpeed = mobile ? 0.8 : 1.0
    controls.rotateSpeed = mobile ? 0.6 : 1.0
    controls.target.set(0, 0.6, 0)
    controls.maxPolarAngle = Math.PI * 0.9
    controls.minPolarAngle = Math.PI * 0.1
    
    // Улучшенная поддержка тач-жестов
    if (mobile) {
      controls.touches = {
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN
      }
    }
    
    controlsRef.current = controls

    // Lighting с адаптацией
    const hemi = new THREE.HemisphereLight(0xffffff, 0x080820, mobile ? 0.5 : 0.6)
    scene.add(hemi)

    const dir = new THREE.DirectionalLight(0xffffff, mobile ? 0.7 : 1.0)
    dir.position.set(5, 8, 3)
    dir.castShadow = !preferLow && !mobile
    
    if (!preferLow && !mobile) {
      dir.shadow.camera.left = -6
      dir.shadow.camera.right = 6
      dir.shadow.camera.top = 6
      dir.shadow.camera.bottom = -6
      dir.shadow.mapSize.width = 1024
      dir.shadow.mapSize.height = 1024
      dir.shadow.radius = 3
      dir.shadow.bias = -0.0001
    }
    scene.add(dir)

    const p1 = new THREE.PointLight(0xff6b9d, mobile ? 0.3 : 0.6, 50)
    p1.position.set(4, 4, 5)
    scene.add(p1)

    const p2 = new THREE.PointLight(0x4ecdc4, mobile ? 0.3 : 0.6, 50)
    p2.position.set(-4, 2, 5)
    scene.add(p2)

    // Ground + Grid
    if (!mobile) {
      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100),
        new THREE.ShadowMaterial({ opacity: preferLow ? 0.04 : 0.14 })
      )
      ground.rotation.x = -Math.PI / 2
      ground.position.y = -2
      ground.receiveShadow = !preferLow
      scene.add(ground)

      const grid = new THREE.GridHelper(10, 40, 0x222233, 0x0f1724)
      grid.position.y = -1.99
      if (grid.material) {
        ;(grid.material as any).opacity = preferLow ? 0.04 : 0.12
        ;(grid.material as any).transparent = true
      }
      scene.add(grid)
    }

    modelsRef.current = []

    const enableShadowsRec = (obj: THREE.Object3D) => {
      obj.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const m = child as THREE.Mesh
          m.castShadow = !preferLow && !mobile
          m.receiveShadow = !preferLow && !mobile
          const mat = m.material as any
          if (mat?.isMeshStandardMaterial || mat?.isMeshPhysicalMaterial) {
            mat.roughness = Math.max(0, (mat.roughness ?? 0.4) - (mobile ? 0.1 : 0.05))
            mat.metalness = Math.min(1, (mat.metalness ?? 0) + (mobile ? 0.05 : 0.03))
            mat.needsUpdate = true
          }
        }
      })
    }

    // Создание моделей с оптимизацией
    const createGeometryModels = () => {
      const boxGeo = new THREE.BoxGeometry(2, 2, 2)
      const boxMat = new THREE.MeshPhysicalMaterial({
        color: 0x667eea,
        metalness: 0.2,
        roughness: 0.35,
        clearcoat: mobile ? 0 : 0.15
      })
      const box = new THREE.Mesh(boxGeo, boxMat)
      const edges = new THREE.EdgesGeometry(boxGeo)
      const lines = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: mobile ? 1 : 2 }))
      box.add(lines)
      modelsRef.current.push(box)

      const pyrGeo = new THREE.ConeGeometry(1.5, 2.5, 4)
      const pyrMat = new THREE.MeshPhysicalMaterial({ color: 0x22c55e, metalness: 0.1, roughness: 0.4 })
      const pyr = new THREE.Mesh(pyrGeo, pyrMat)
      pyr.add(new THREE.LineSegments(new THREE.EdgesGeometry(pyrGeo), new THREE.LineBasicMaterial({ color: 0xffffff })))
      modelsRef.current.push(pyr)

      const sphGeo = new THREE.SphereGeometry(1.5, DETAIL.sphereSeg, DETAIL.sphereSeg)
      const sphMat = new THREE.MeshPhysicalMaterial({ color: 0xf59e0b, metalness: 0.5, roughness: 0.25 })
      const sph = new THREE.Mesh(sphGeo, sphMat)
      modelsRef.current.push(sph)

      const cylGeo = new THREE.CylinderGeometry(1, 1, 2.5, DETAIL.cylRadial)
      const cylMat = new THREE.MeshPhysicalMaterial({ color: 0xec4899, metalness: 0.15, roughness: 0.35 })
      const cyl = new THREE.Mesh(cylGeo, cylMat)
      modelsRef.current.push(cyl)
    }

    const createBiologyModels = () => {
      // Cell
      const cell = new THREE.Group()
      const membrane = new THREE.Mesh(
        new THREE.SphereGeometry(1.5, DETAIL.sphereSeg, DETAIL.sphereSeg),
        new THREE.MeshPhysicalMaterial({ color: 0xffe0f0, transparent: true, opacity: 0.6, roughness: 0.3 })
      )
      cell.add(membrane)
      
      const nucleus = new THREE.Mesh(
        new THREE.SphereGeometry(0.6, DETAIL.sphereSeg * 0.75, DETAIL.sphereSeg * 0.75),
        new THREE.MeshStandardMaterial({ color: 0xff6b9d })
      )
      cell.add(nucleus)
      
      for (let i = 0; i < DETAIL.mitochondria; i++) {
        const mito = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.08, 0.3, 4, 8),
          new THREE.MeshStandardMaterial({ color: 0x4ecdc4 })
        )
        const angle = (i / DETAIL.mitochondria) * Math.PI * 2
        mito.position.set(Math.cos(angle) * 0.9, Math.sin(angle * 0.5) * 0.4, Math.sin(angle) * 0.9)
        mito.rotation.set(angle, angle * 0.5, 0)
        cell.add(mito)
      }
      
      modelsRef.current.push(cell)

      // DNA
      const dna = new THREE.Group()
      const points1: THREE.Vector3[] = []
      const points2: THREE.Vector3[] = []
      
      for (let i = 0; i < DETAIL.dnaSeg; i++) {
        const t = (i / DETAIL.dnaSeg) * Math.PI * 4
        const y = (i / DETAIL.dnaSeg) * 3 - 1.5
        const x1 = Math.cos(t) * 0.5
        const z1 = Math.sin(t) * 0.5
        const x2 = Math.cos(t + Math.PI) * 0.5
        const z2 = Math.sin(t + Math.PI) * 0.5
        points1.push(new THREE.Vector3(x1, y, z1))
        points2.push(new THREE.Vector3(x2, y, z2))
      }
      
      const curve1 = new THREE.CatmullRomCurve3(points1)
      const curve2 = new THREE.CatmullRomCurve3(points2)
      
      const tubeGeo1 = new THREE.TubeGeometry(curve1, DETAIL.dnaSeg, 0.08, 8, false)
      const tubeGeo2 = new THREE.TubeGeometry(curve2, DETAIL.dnaSeg, 0.08, 8, false)
      
      const tube1 = new THREE.Mesh(tubeGeo1, new THREE.MeshStandardMaterial({ color: 0x4ecdc4 }))
      const tube2 = new THREE.Mesh(tubeGeo2, new THREE.MeshStandardMaterial({ color: 0xff6b9d }))
      
      dna.add(tube1, tube2)
      
      for (let i = 0; i < points1.length; i += Math.floor(DETAIL.dnaSeg / 10)) {
        const rung = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 1, 6),
          new THREE.MeshStandardMaterial({ color: 0xffffff })
        )
        const mid = new THREE.Vector3().addVectors(points1[i], points2[i]).multiplyScalar(0.5)
        rung.position.copy(mid)
        rung.lookAt(points2[i])
        rung.rotateX(Math.PI / 2)
        dna.add(rung)
      }
      
      modelsRef.current.push(dna)

      // Heart
      const heart = new THREE.Group()
      const shape = new THREE.Shape()
      shape.moveTo(0, 0)
      shape.bezierCurveTo(0, -0.3, -0.6, -0.3, -0.6, 0)
      shape.bezierCurveTo(-0.6, 0.3, 0, 0.6, 0, 1)
      shape.bezierCurveTo(0, 0.6, 0.6, 0.3, 0.6, 0)
      shape.bezierCurveTo(0.6, -0.3, 0, -0.3, 0, 0)
      
      const extrudeSettings = { depth: 0.4, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelSegments: mobile ? 2 : 3 }
      const heartGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings)
      const heartMesh = new THREE.Mesh(heartGeo, new THREE.MeshStandardMaterial({ color: 0xff1744 }))
      heartMesh.scale.set(1.5, 1.5, 1.5)
      heart.add(heartMesh)
      
      modelsRef.current.push(heart)

      // Neuron
      const neuron = new THREE.Group()
      const soma = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, DETAIL.sphereSeg, DETAIL.sphereSeg),
        new THREE.MeshStandardMaterial({ color: 0xffeb3b })
      )
      neuron.add(soma)
      
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2
        const dendrite = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.02, 0.8, 6),
          new THREE.MeshStandardMaterial({ color: 0xffc107 })
        )
        dendrite.position.set(Math.cos(angle) * 0.3, 0, Math.sin(angle) * 0.3)
        dendrite.rotation.z = angle
        dendrite.rotation.x = Math.PI / 3
        neuron.add(dendrite)
      }
      
      const axon = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 2, 8),
        new THREE.MeshStandardMaterial({ color: 0xff9800 })
      )
      axon.position.y = -1.2
      neuron.add(axon)
      
      modelsRef.current.push(neuron)
    }

    const createChemistryModels = () => {
      // H2O
      const h2o = new THREE.Group()
      const oxygen = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, DETAIL.sphereSeg, DETAIL.sphereSeg),
        new THREE.MeshStandardMaterial({ color: 0xff0000 })
      )
      h2o.add(oxygen)
      
      const h1 = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, DETAIL.sphereSeg * 0.75, DETAIL.sphereSeg * 0.75),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      )
      h1.position.set(0.5, 0.3, 0)
      h2o.add(h1)
      
      const h2 = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, DETAIL.sphereSeg * 0.75, DETAIL.sphereSeg * 0.75),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      )
      h2.position.set(-0.5, 0.3, 0)
      h2o.add(h2)
      
      const bond1 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.6, 8),
        new THREE.MeshStandardMaterial({ color: 0xcccccc })
      )
      bond1.position.set(0.25, 0.15, 0)
      bond1.rotation.z = -Math.PI / 6
      h2o.add(bond1)
      
      const bond2 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.6, 8),
        new THREE.MeshStandardMaterial({ color: 0xcccccc })
      )
      bond2.position.set(-0.25, 0.15, 0)
      bond2.rotation.z = Math.PI / 6
      h2o.add(bond2)
      
      h2o.scale.set(2, 2, 2)
      modelsRef.current.push(h2o)

      // CH4
      const ch4 = new THREE.Group()
      const carbon = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, DETAIL.sphereSeg, DETAIL.sphereSeg),
        new THREE.MeshStandardMaterial({ color: 0x808080 })
      )
      ch4.add(carbon)
      
      const hPositions = [
        [0, 0.8, 0],
        [0.8, -0.3, 0],
        [-0.4, -0.3, 0.7],
        [-0.4, -0.3, -0.7]
      ]
      
      hPositions.forEach(pos => {
        const h = new THREE.Mesh(
          new THREE.SphereGeometry(0.25, DETAIL.sphereSeg * 0.75, DETAIL.sphereSeg * 0.75),
          new THREE.MeshStandardMaterial({ color: 0xffffff })
        )
        h.position.set(pos[0], pos[1], pos[2])
        ch4.add(h)
        
        const bond = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8),
          new THREE.MeshStandardMaterial({ color: 0xcccccc })
        )
        bond.position.set(pos[0] / 2, pos[1] / 2, pos[2] / 2)
        bond.lookAt(pos[0], pos[1], pos[2])
        bond.rotateX(Math.PI / 2)
        ch4.add(bond)
      })
      
      ch4.scale.set(1.5, 1.5, 1.5)
      modelsRef.current.push(ch4)

      // CO2
      const co2 = new THREE.Group()
      const carbonC = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, DETAIL.sphereSeg, DETAIL.sphereSeg),
        new THREE.MeshStandardMaterial({ color: 0x808080 })
      )
      co2.add(carbonC)
      
      const o1 = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, DETAIL.sphereSeg, DETAIL.sphereSeg),
        new THREE.MeshStandardMaterial({ color: 0xff0000 })
      )
      o1.position.x = 0.9
      co2.add(o1)
      
      const o2 = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, DETAIL.sphereSeg, DETAIL.sphereSeg),
        new THREE.MeshStandardMaterial({ color: 0xff0000 })
      )
      o2.position.x = -0.9
      co2.add(o2)
      
      const doubleBond1a = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8),
        new THREE.MeshStandardMaterial({ color: 0xcccccc })
      )
      doubleBond1a.position.set(0.45, 0.05, 0)
      doubleBond1a.rotation.z = Math.PI / 2
      co2.add(doubleBond1a)
      
      const doubleBond1b = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8),
        new THREE.MeshStandardMaterial({ color: 0xcccccc })
      )
      doubleBond1b.position.set(0.45, -0.05, 0)
      doubleBond1b.rotation.z = Math.PI / 2
      co2.add(doubleBond1b)
      
      const doubleBond2a = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8),
        new THREE.MeshStandardMaterial({ color: 0xcccccc })
      )
      doubleBond2a.position.set(-0.45, 0.05, 0)
      doubleBond2a.rotation.z = Math.PI / 2
      co2.add(doubleBond2a)
      
      const doubleBond2b = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8),
        new THREE.MeshStandardMaterial({ color: 0xcccccc })
      )
      doubleBond2b.position.set(-0.45, -0.05, 0)
      doubleBond2b.rotation.z = Math.PI / 2
      co2.add(doubleBond2b)
      
      co2.scale.set(2, 2, 2)
      modelsRef.current.push(co2)

      // NaCl
      const nacl = new THREE.Group()
      const latticeSize = DETAIL.naclLattice
      
      for (let x = -latticeSize; x <= latticeSize; x++) {
        for (let y = -latticeSize; y <= latticeSize; y++) {
          for (let z = -latticeSize; z <= latticeSize; z++) {
            const isNa = (x + y + z) % 2 === 0
            const atom = new THREE.Mesh(
              new THREE.SphereGeometry(0.25, DETAIL.sphereSeg * 0.75, DETAIL.sphereSeg * 0.75),
              new THREE.MeshStandardMaterial({ color: isNa ? 0x9c27b0 : 0x4caf50 })
            )
            atom.position.set(x * 0.6, y * 0.6, z * 0.6)
            nacl.add(atom)
          }
        }
      }
      
      nacl.scale.set(1.2, 1.2, 1.2)
      modelsRef.current.push(nacl)
    }

    const createPhysicsModels = () => {
      // Circuit
      const circuit = new THREE.Group()
      const wiremat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8 })
      
      const wire1 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2, 8), wiremat)
      wire1.position.set(-1, 0, 0)
      wire1.rotation.z = Math.PI / 2
      circuit.add(wire1)
      
      const wire2 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2, 8), wiremat)
      wire2.position.set(0, 1, 0)
      circuit.add(wire2)
      
      const wire3 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2, 8), wiremat)
      wire3.position.set(1, 0, 0)
      wire3.rotation.z = Math.PI / 2
      circuit.add(wire3)
      
      const wire4 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2, 8), wiremat)
      wire4.position.set(0, -1, 0)
      circuit.add(wire4)
      
      const battery = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.8, 0.3),
        new THREE.MeshStandardMaterial({ color: 0x212121 })
      )
      battery.position.set(0, -1, 0)
      circuit.add(battery)
      
      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, DETAIL.sphereSeg, DETAIL.sphereSeg),
        new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffff00, emissiveIntensity: 0.5 })
      )
      bulb.position.set(0, 1, 0)
      circuit.add(bulb)
      
      modelsRef.current.push(circuit)

      // Magnet
      const magnet = new THREE.Group()
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 1.5, 0.4),
        new THREE.MeshStandardMaterial({ color: 0xff0000 })
      )
      bar.position.y = 0.5
      magnet.add(bar)
      
      const bar2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 1.5, 0.4),
        new THREE.MeshStandardMaterial({ color: 0x0000ff })
      )
      bar2.position.y = -0.5
      magnet.add(bar2)
      
      const nLabel = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.2, 0.1),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      )
      nLabel.position.set(0, 1.1, 0.25)
      magnet.add(nLabel)
      
      const sLabel = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.2, 0.1),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      )
      sLabel.position.set(0, -1.1, 0.25)
      magnet.add(sLabel)
      
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2
        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(0, 1.2, 0),
          new THREE.Vector3(Math.cos(angle) * 1.5, 0, Math.sin(angle) * 1.5),
          new THREE.Vector3(0, -1.2, 0)
        )
        const fieldLine = new THREE.Mesh(
          new THREE.TubeGeometry(curve, 20, 0.02, 8, false),
          new THREE.MeshBasicMaterial({ color: 0x00ffff })
        )
        magnet.add(fieldLine)
      }
      
      modelsRef.current.push(magnet)

      // Wave
      const wave = new THREE.Group()
      const wavePoints: THREE.Vector3[] = []
      
      for (let i = 0; i < 100; i++) {
        const x = (i / 100) * 4 - 2
        const y = Math.sin(x * Math.PI * 2) * 0.5
        wavePoints.push(new THREE.Vector3(x, y, 0))
      }
      
      const waveCurve = new THREE.CatmullRomCurve3(wavePoints)
      const waveTube = new THREE.Mesh(
        new THREE.TubeGeometry(waveCurve, 100, 0.05, 8, false),
        new THREE.MeshStandardMaterial({ color: 0x00bfff })
      )
      wave.add(waveTube)
      
      for (let i = 0; i < 20; i++) {
        const t = i / 20
        const point = waveCurve.getPoint(t)
        const particle = new THREE.Mesh(
          new THREE.SphereGeometry(0.08, 8, 8),
          new THREE.MeshStandardMaterial({ color: 0xffffff })
        )
        particle.position.copy(point)
        ;(particle as any).userData = { waveOffset: t }
        wave.add(particle)
      }
      
      modelsRef.current.push(wave)

      // Atom
      const atom = new THREE.Group()
      const nucleus = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, DETAIL.sphereSeg, DETAIL.sphereSeg),
        new THREE.MeshStandardMaterial({ color: 0xff0000 })
      )
      atom.add(nucleus)
      
      const orbits = [
        { radius: 0.8, electrons: 2, color: 0x00ff00, speed: 0.02 },
        { radius: 1.3, electrons: 8, color: 0x0000ff, speed: 0.015 },
        { radius: 1.8, electrons: 8, color: 0xffff00, speed: 0.01 }
      ]
      
      orbits.forEach((orbit, idx) => {
        const orbitRing = new THREE.Mesh(
          new THREE.TorusGeometry(orbit.radius, 0.02, 8, 32),
          new THREE.MeshBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.3 })
        )
        orbitRing.rotation.x = Math.PI / 2
        orbitRing.rotation.z = idx * Math.PI / 6
        atom.add(orbitRing)
        
        for (let i = 0; i < orbit.electrons; i++) {
          const electron = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 8, 8),
            new THREE.MeshStandardMaterial({ color: orbit.color })
          )
          const angle = (i / orbit.electrons) * Math.PI * 2
          electron.position.set(
            Math.cos(angle) * orbit.radius,
            0,
            Math.sin(angle) * orbit.radius
          )
          ;(electron as any).userData = { orbit: orbit.radius, speed: orbit.speed, angle, orbitIdx: idx }
          atom.add(electron)
        }
      })
      
      modelsRef.current.push(atom)
    }

    const createAll = () => {
      modelsRef.current = []
      if (subject === 'geometry') createGeometryModels()
      else if (subject === 'biology') createBiologyModels()
      else if (subject === 'chemistry') createChemistryModels()
      else if (subject === 'physics') createPhysicsModels()
      modelsRef.current.forEach(m => enableShadowsRec(m))
    }

    createAll()
    if (modelsRef.current[0]) scene.add(modelsRef.current[0])
    setTimeout(() => setIsLoading(false), 300)

    // Render loop с оптимизацией
    let frameId = 0
    let last = performance.now()
    const targetFPS = preferLow ? 30 : mobile ? 45 : 60
    const minInterval = 1000 / targetFPS

    const onVisibility = () => {
      if (document.hidden) {
        if (frameId) cancelAnimationFrame(frameId)
        frameId = 0
      } else {
        last = performance.now()
        animate()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const now = performance.now()
      const dt = now - last
      if (dt < minInterval) return
      last = now

      modelsRef.current.forEach((model, idx) => {
        if (scene.children.includes(model)) {
          animateModel(model, idx, subject, preferLow || mobile)
        }
      })

      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      if (!camera || !renderer) return
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      const newDPR = preferLow ? 1 : mobile ? 1.5 : Math.min(window.devicePixelRatio, 2)
      renderer.setPixelRatio(newDPR)
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
      if (frameId) cancelAnimationFrame(frameId)

      modelsRef.current.forEach(m => {
        scene.remove(m)
        m.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh
            if (mesh.geometry) mesh.geometry.dispose()
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach(mat => {
                if ((mat as any).map) (mat as any).map.dispose()
                mat.dispose()
              })
            } else if (mesh.material) {
              const mat = mesh.material as THREE.Material
              if ((mat as any)?.map) (mat as any).map.dispose()
              mat.dispose()
            }
          }
        })
      })

      if (controls) controls.dispose()
      if (canvasRef.current && renderer.domElement && canvasRef.current.contains(renderer.domElement)) {
        canvasRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
      sceneRef.current = null
      cameraRef.current = null
      rendererRef.current = null
      controlsRef.current = null
    }
  }, [subject, lowQuality])

  const animateModel = (model: THREE.Object3D, index: number, subj: string, isLowPerf: boolean) => {
    const rotSpeed = isLowPerf ? 0.003 : 0.005
    model.rotation.y += rotSpeed

    if (subj === 'biology') {
      if (index === 1) {
        model.rotation.y += isLowPerf ? 0.008 : 0.01
        model.position.y = Math.sin(Date.now() * 0.001) * (isLowPerf ? 0.015 : 0.025)
      } else if (index === 2) {
        const s = 1 + Math.sin(Date.now() * 0.003) * (isLowPerf ? 0.03 : 0.05)
        model.scale.set(s, s, s)
      }
    } else if (subj === 'physics') {
      if (index === 2) {
        const t = Date.now() * 0.001
        model.children.forEach((child, i) => {
          if ((child as any).userData?.waveOffset !== undefined) {
            const offset = (child as any).userData.waveOffset
            const baseY = Math.sin((offset * 4 - 2) * Math.PI * 2) * 0.5
            child.position.y = baseY + Math.sin(t * 3 + offset * 10) * (isLowPerf ? 0.1 : 0.15)
          }
        })
      } else if (index === 3) {
        model.children.forEach(child => {
          if ((child as any).userData?.orbit) {
            const data = (child as any).userData
            data.angle += data.speed
            const rotMat = new THREE.Matrix4()
            rotMat.makeRotationZ(data.orbitIdx * Math.PI / 6)
            const pos = new THREE.Vector3(
              Math.cos(data.angle) * data.orbit,
              0,
              Math.sin(data.angle) * data.orbit
            )
            pos.applyMatrix4(rotMat)
            child.position.copy(pos)
          }
        })
      }
    }
  }

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
      {isLoading && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          background: currentSubject.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 400, color: 'white', fontSize: isMobile ? '1.1rem' : '1.3rem', flexDirection: 'column',
          padding: '1rem'
        }}>
          <div style={{ fontSize: isMobile ? '3rem' : '3.5rem', marginBottom: '0.8rem' }}>{currentSubject.emoji}</div>
          <div style={{ textAlign: 'center' }}>Загрузка 3D - подстраиваемся под устройство...</div>
          <div style={{ marginTop: 12, fontSize: '0.85rem', opacity: 0.85, textAlign: 'center' }}>
            {lowQuality ? 'Режим экономии ресурсов' : isMobile ? 'Мобильная оптимизация' : 'Высокое качество'}
          </div>
        </div>
      )}

      <div ref={canvasRef} style={{ width: '100%', height: '100%' }} />

      <div style={{ position: 'absolute', top: isMobile ? 10 : 14, left: isMobile ? 10 : 12, zIndex: 410 }}>
        <Link to="/subjects" className="btn btn-secondary" style={{
          background: 'rgba(255,255,255,0.95)', color: currentSubject.color,
          fontSize: isMobile ? '0.8rem' : '0.95rem',
          padding: isMobile ? '0.5rem 0.8rem' : '0.7rem 1.2rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.18)'
        }}>← К предметам</Link>
      </div>

      <div style={{
        position: 'absolute',
        top: isMobile ? 10 : 20,
        right: isMobile ? 10 : 20,
        background: 'rgba(0,0,0,0.85)',
        color: 'white',
        padding: isMobile ? '0.6rem' : '1rem',
        borderRadius: 10,
        zIndex: 410,
        maxWidth: isMobile ? '85%' : 320,
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ fontSize: isMobile ? '1.1rem' : '1.4rem', marginBottom: 6, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>{currentSubject.emoji}</span>
          <span>{currentSubject.name}</span>
        </div>
        <div style={{ fontSize: isMobile ? '0.8rem' : '0.95rem', opacity: 0.9, marginBottom: 8 }}>
          {currentSubject.models[currentModel].description}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button onClick={() => setLowQuality(q => !q)} style={{
            padding: isMobile ? '5px 8px' : '6px 10px',
            fontSize: isMobile ? '0.75rem' : '0.85rem',
            borderRadius: 8, border: 'none', cursor: 'pointer',
            background: lowQuality ? '#ff9800' : '#4caf50',
            color: 'white'
          }}>
            {lowQuality ? '⚡ Low' : '✨ High'}
          </button>
          <button onClick={() => {
            if (controlsRef.current) {
              const ctrl = controlsRef.current as any
              if (typeof ctrl.reset === 'function') ctrl.reset()
              ctrl.target.set(0, 0.6, 0)
            }
            if (cameraRef.current) cameraRef.current.position.set(0, isMobile ? 1.5 : 1.2, isMobile ? 4 : 6)
          }} style={{
            padding: isMobile ? '5px 8px' : '6px 10px',
            fontSize: isMobile ? '0.75rem' : '0.85rem',
            borderRadius: 8, border: 'none', cursor: 'pointer',
            background: '#2196f3', color: 'white'
          }}>
            🔄 Сброс
          </button>
        </div>
      </div>

      <div style={{
        position: 'absolute',
        bottom: isMobile ? 10 : 30,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: isMobile ? '0.4rem' : '0.6rem',
        background: 'rgba(0,0,0,0.85)',
        padding: isMobile ? '0.5rem' : '0.9rem',
        borderRadius: 12,
        zIndex: 410,
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: isMobile ? '96%' : 'auto',
        maxWidth: isMobile ? '100%' : '90%',
        backdropFilter: 'blur(10px)'
      }}>
        {currentSubject.models.map((m: any, i: number) => (
          <button key={i} onClick={() => switchModel(i)} className="btn" style={{
            background: currentModel === i ? currentSubject.color : 'rgba(255,255,255,0.1)',
            color: 'white',
            border: currentModel === i ? '2px solid #fff' : '2px solid transparent',
            padding: isMobile ? '0.4rem 0.6rem' : '0.7rem 1rem',
            fontSize: isMobile ? '0.75rem' : '0.86rem',
            minWidth: isMobile ? 70 : 84,
            borderRadius: 10,
            transition: 'all 0.2s'
          }}>
            {m.name.split(' ')[0]}
          </button>
        ))}
      </div>
    </div>
  )
}

export default Gallery3D
