import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls';

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
        { name: '❤️ Сердце', description: 'Главн��й орган кровеносной системы' },
        { name: '🧠 Нейрон', description: 'Нервная клетка с дендритами и аксоном' },
      ]
    },
    chemistry: {
      name: 'Химия',
      emoji: '⚗️',
      color: '#f59e0b',
      models: [
        { name: '💧 H₂O', description: 'Молекула вод�� - 2 атома водорода и 1 кислорода' },
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
        { name: '🔌 Цепь', description: 'Электрическа�� цепь с источником тока' },
        { name: '🧲 Магнит', description: 'Магнитное поле с силовыми линиями' },
        { name: '🌊 Волна', description: 'Поперечная волна и её распространение' },
        { name: '⚛️ Атом', description: 'Модель атома с электронными орбитами' },
      ]
    }
  }

  const currentSubject = subjectData[subject] || subjectData.geometry

  useEffect(() => {
    if (!canvasRef.current) return

    // адаптивные флаги
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/.test(ua) || window.innerWidth < 768
    const connection = (navigator as any).connection || {}
    const saveData = !!connection.saveData || (typeof navigator !== 'undefined' && (navigator as any).connection?.effectiveType === '2g')

    // detail-параметры, уменьшенные на мобильных / при save-data
    const DETAIL = {
      sphereSegments: isMobile ? 16 : 64,
      cylinderRadial: isMobile ? 12 : 64,
      dnaSegments: isMobile ? 40 : 80,
      ribosomes: isMobile ? 12 : 40,
      mitochondria: isMobile ? 4 : 8,
      erSegments: isMobile ? 8 : 15,
      neuronSpines: isMobile ? 2 : 5,
      neurotransmitters: isMobile ? 4 : 8,
      axonSegments: isMobile ? 8 : 15,
      naclLattice: isMobile ? 1 : 2 // smaller lattice on phones
    }

    //	Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a1a)
    scene.fog = new THREE.FogExp2(0x0a0a1a, isMobile ? 0.04 : 0.02)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(0, isMobile ? 1.0 : 1.2, isMobile ? 5 : 6)
    cameraRef.current = camera

    // Renderer: ограничиваем DPR и выключаем antialias на слабых устройствах
    const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true })
    const maxDPR = isMobile ? 1.25 : Math.min(window.devicePixelRatio || 1, 2)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDPR))
    renderer.setSize(window.innerWidth, window.innerHeight)
    // тени отключены на мобильных и при saveData
    const enableShadows = !isMobile && !saveData
    renderer.shadowMap.enabled = enableShadows
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    ;(renderer as any).physicallyCorrectLights = true
    renderer.outputEncoding = THREE.sRGBEncoding
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    canvasRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Controls: на мобилах отключаем pan (чтобы не конфликтовать со скроллом)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = isMobile ? 0.12 : 0.08
    controls.minDistance = isMobile ? 2 : 2
    controls.maxDistance = isMobile ? 12 : 20
    controls.enablePan = !isMobile
    controls.enableZoom = true
    controls.target.set(0, 0.6, 0)
    controlsRef.current = controls

    // Lighting (упрощаем на мобильных)
    const hemi = new THREE.HemisphereLight(0xffffff, 0x080820, 0.6)
    scene.add(hemi)

    const dir = new THREE.DirectionalLight(0xffffff, isMobile ? 0.8 : 1.0)
    dir.position.set(5, 8, 3)
    dir.castShadow = enableShadows
    if (enableShadows) {
      dir.shadow.camera.left = -6
      dir.shadow.camera.right = 6
      dir.shadow.camera.top = 6
      dir.shadow.camera.bottom = -6
      dir.shadow.mapSize.width = isMobile ? 1024 : 2048
      dir.shadow.mapSize.height = isMobile ? 1024 : 2048
      dir.shadow.radius = isMobile ? 2 : 4
    }
    scene.add(dir)

    const pointLight1 = new THREE.PointLight(0xff6b9d, isMobile ? 0.4 : 0.6, 50)
    pointLight1.position.set(4, 4, 5)
    scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0x4ecdc4, isMobile ? 0.4 : 0.6, 50)
    pointLight2.position.set(-4, 2, 5)
    scene.add(pointLight2)

    // Ground / grid: делаем менее заметным на мобилах
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.ShadowMaterial({ opacity: enableShadows ? 0.14 : 0.06 })
    )
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -2
    ground.receiveShadow = enableShadows
    scene.add(ground)

    const grid = new THREE.GridHelper(10, 40, 0x222233, 0x0f1724)
    grid.position.y = -1.99
    if (grid.material) {
      ;(grid.material as any).opacity = isMobile ? 0.06 : 0.12
      ;(grid.material as any).transparent = true
    }
    scene.add(grid)

    // Reset models
    modelsRef.current = []

    // helper to set shadows & tweak materials
    const enableShadowsRec = (obj: THREE.Object3D) => {
      obj.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const m = child as THREE.Mesh
          m.castShadow = enableShadows
          m.receiveShadow = enableShadows
          // tweak standard materials a touch
          const mat = m.material as any
          if (mat && mat.isMeshStandardMaterial) {
            mat.roughness = Math.max(0, (mat.roughness ?? 0.4) - 0.05)
            mat.metalness = Math.min(1, (mat.metalness ?? 0) + 0.03)
            mat.needsUpdate = true
          }
        }
      })
    }

    // Model builders using DETAIL constants (reduced complexity for mobile)
    const createGeometryModels = () => {
      const cubeGeometry = new THREE.BoxGeometry(2, 2, 2)
      const cubeMaterial = new THREE.MeshPhysicalMaterial({ color: 0x667eea, metalness: 0.2, roughness: 0.35, clearcoat: 0.2 })
      const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
      const cubeEdges = new THREE.EdgesGeometry(cubeGeometry)
      const cubeLines = new THREE.LineSegments(cubeEdges, new THREE.LineBasicMaterial({ color: 0xffffff }))
      cube.add(cubeLines)
      modelsRef.current.push(cube)

      const pyramidGeometry = new THREE.ConeGeometry(1.5, 2.5, 4)
      const pyramidMaterial = new THREE.MeshPhysicalMaterial({ color: 0x22c55e, metalness: 0.1, roughness: 0.4 })
      const pyramid = new THREE.Mesh(pyramidGeometry, pyramidMaterial)
      const pyramidEdges = new THREE.EdgesGeometry(pyramidGeometry)
      pyramid.add(new THREE.LineSegments(pyramidEdges, new THREE.LineBasicMaterial({ color: 0xffffff })))
      modelsRef.current.push(pyramid)

      const sphereGeometry = new THREE.SphereGeometry(1.5, DETAIL.sphereSegments, DETAIL.sphereSegments)
      const sphereMaterial = new THREE.MeshPhysicalMaterial({ color: 0xf59e0b, metalness: 0.5, roughness: 0.25 })
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
      modelsRef.current.push(sphere)

      const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 2.5, DETAIL.cylinderRadial)
      const cylinderMaterial = new THREE.MeshPhysicalMaterial({ color: 0xec4899, metalness: 0.15, roughness: 0.35 })
      const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial)
      modelsRef.current.push(cylinder)
    }

    const createBiologyModels = () => {
      const cellGroup = new THREE.Group()
      const cellBody = new THREE.Mesh(
        new THREE.SphereGeometry(1.5, DETAIL.sphereSegments, DETAIL.sphereSegments),
        new THREE.MeshPhysicalMaterial({
          color: 0x90ee90,
          transparent: true,
          opacity: 0.45,
          roughness: 0.35,
          transmission: 0.4
        })
      )
      cellGroup.add(cellBody)

      const innerMembrane = new THREE.Mesh(
        new THREE.SphereGeometry(1.45, DETAIL.sphereSegments, DETAIL.sphereSegments),
        new THREE.MeshStandardMaterial({
          color: 0x7cfc00,
          transparent: true,
          opacity: 0.22,
          roughness: 0.45
        })
      )
      cellGroup.add(innerMembrane)

      const nucleus = new THREE.Mesh(
        new THREE.SphereGeometry(0.6, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x8b4789, roughness: 0.22 })
      )
      nucleus.position.set(0, 0, 0)
      cellGroup.add(nucleus)

      // fewer mitochondria & simplified geometry on mobile
      for (let i = 0; i < DETAIL.mitochondria; i++) {
        const angle = (i / DETAIL.mitochondria) * Math.PI * 2
        const mito = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.12, 0.35, 8),
          new THREE.MeshStandardMaterial({ color: 0xff6b6b, roughness: 0.3 })
        )
        mito.rotation.x = Math.PI / 2
        mito.position.set(Math.cos(angle) * 1, Math.sin(angle * 1.5) * 0.4, Math.sin(angle) * 1)
        mito.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
        cellGroup.add(mito)
      }

      // less ribosomes
      for (let i = 0; i < DETAIL.ribosomes; i++) {
        const ribosome = new THREE.Mesh(
          new THREE.SphereGeometry(0.04, 8, 8),
          new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.28 })
        )
        const angle = Math.random() * Math.PI * 2
        const height = Math.random() * Math.PI
        const radius = 1.1 + Math.random() * 0.15
        ribosome.position.set(Math.sin(height) * Math.cos(angle) * radius, Math.cos(height) * radius, Math.sin(height) * Math.sin(angle) * radius)
        cellGroup.add(ribosome)
      }

      modelsRef.current.push(cellGroup)

      // DNA - fewer segments on mobile
      const dnaGroup = new THREE.Group()
      for (let i = 0; i < DETAIL.dnaSegments; i++) {
        const t = (i / DETAIL.dnaSegments) * Math.PI * 4
        const y = (i / DETAIL.dnaSegments) * 5 - 2.5
        const s1 = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshStandardMaterial({ color: 0x4169e1 }))
        s1.position.set(Math.cos(t) * 0.6, y, Math.sin(t) * 0.6)
        dnaGroup.add(s1)
        const s2 = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshStandardMaterial({ color: 0xff4444 }))
        s2.position.set(Math.cos(t + Math.PI) * 0.6, y, Math.sin(t + Math.PI) * 0.6)
        dnaGroup.add(s2)
      }
      modelsRef.current.push(dnaGroup)

      // Heart & neuron remain but simplified counts for dynamic children
      const heartGroup = new THREE.Group()
      const left = new THREE.Mesh(new THREE.SphereGeometry(0.7, 16, 16), new THREE.MeshStandardMaterial({ color: 0xdc143c }))
      left.scale.set(1, 1.3, 1)
      left.position.set(-0.3, -0.5, 0)
      heartGroup.add(left)
      const right = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 16), new THREE.MeshStandardMaterial({ color: 0xb22222 }))
      right.scale.set(1, 1.2, 1)
      right.position.set(0.3, -0.4, 0.1)
      heartGroup.add(right)
      heartGroup.scale.set(1.2, 1.2, 1.2)
      modelsRef.current.push(heartGroup)

      const neuronGroup = new THREE.Group()
      const soma = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), new THREE.MeshStandardMaterial({ color: 0xb19cd9 }))
      neuronGroup.add(soma)
      // fewer dendrite spines on mobile (neuronSpines)
      for (let i = 0; i < 6; i++) {
        const dend = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.9, 8), new THREE.MeshStandardMaterial({ color: 0xdda0dd }))
        dend.position.set(Math.cos((i / 6) * Math.PI * 2) * 0.4, 0.1, Math.sin((i / 6) * Math.PI * 2) * 0.4)
        dend.rotation.x = Math.PI / 6
        neuronGroup.add(dend)
      }
      neuronGroup.scale.set(0.7, 0.7, 0.7)
      modelsRef.current.push(neuronGroup)
    }

    const createChemistryModels = () => {
      const createAtomLabel = (text: string, position: THREE.Vector3, color: number) => {
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        if (context) {
          canvas.width = 128
          canvas.height = 128
          context.clearRect(0, 0, canvas.width, canvas.height)
          context.fillStyle = `#${color.toString(16).padStart(6, '0')}`
          context.font = 'Bold 60px Arial'
          context.textAlign = 'center'
          context.textBaseline = 'middle'
          context.fillText(text, 64, 64)
        }
        const texture = new THREE.CanvasTexture(canvas)
        texture.encoding = THREE.sRGBEncoding
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture, depthTest: false, depthWrite: false })
        const sprite = new THREE.Sprite(spriteMaterial)
        sprite.position.copy(position)
        sprite.scale.set(isMobile ? 0.45 : 0.6, isMobile ? 0.45 : 0.6, 1)
        return sprite
      }

      const h2oGroup = new THREE.Group()
      const oxygen = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 12), new THREE.MeshStandardMaterial({ color: 0xff0000 }))
      h2oGroup.add(oxygen)
      const hydrogen1 = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), new THREE.MeshStandardMaterial({ color: 0xffffff }))
      hydrogen1.position.set(0.75, 0.55, 0)
      h2oGroup.add(hydrogen1)
      const hydrogen2 = hydrogen1.clone()
      hydrogen2.position.set(-0.75, 0.55, 0)
      h2oGroup.add(hydrogen2)
      h2oGroup.add(createAtomLabel('O', new THREE.Vector3(0, -0.7, 0), 0xff0000))
      h2oGroup.scale.set(1.2, 1.2, 1.2)
      modelsRef.current.push(h2oGroup)

      // CH4 simplified
      const ch4Group = new THREE.Group()
      const carbon = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 12), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }))
      ch4Group.add(carbon)
      const tetrahedralPositions = [
        new THREE.Vector3(0, 1.0, 0),
        new THREE.Vector3(1.0, -0.35, 0),
        new THREE.Vector3(-0.5, -0.35, 0.85),
        new THREE.Vector3(-0.5, -0.35, -0.85)
      ]
      tetrahedralPositions.forEach((pos) => {
        const h = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), new THREE.MeshStandardMaterial({ color: 0xf5f5f5 }))
        h.position.copy(pos)
        ch4Group.add(h)
      })
      ch4Group.scale.set(1.0, 1.0, 1.0)
      modelsRef.current.push(ch4Group)

      // CO2 simplified
      const co2Group = new THREE.Group()
      const carbonCO2 = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 12), new THREE.MeshStandardMaterial({ color: 0x2a2a2a }))
      co2Group.add(carbonCO2)
      const oxygen1 = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 12), new THREE.MeshStandardMaterial({ color: 0xff3333 }))
      oxygen1.position.x = 1.2
      co2Group.add(oxygen1)
      const oxygen2 = oxygen1.clone()
      oxygen2.position.x = -1.2
      co2Group.add(oxygen2)
      co2Group.scale.set(1.1, 1.1, 1.1)
      modelsRef.current.push(co2Group)

      // NaCl small lattice on mobile to avoid heavy meshes
      const naclGroup = new THREE.Group()
      const latticeSize = DETAIL.naclLattice
      const spacing = 0.7
      for (let x = -latticeSize; x <= latticeSize; x++) {
        for (let y = -latticeSize; y <= latticeSize; y++) {
          for (let z = -latticeSize; z <= latticeSize; z++) {
            const isNa = (x + y + z) % 2 === 0
            const atom = new THREE.Mesh(new THREE.SphereGeometry(isNa ? 0.25 : 0.22, 8, 8), new THREE.MeshStandardMaterial({ color: isNa ? 0x9370db : 0x32cd32 }))
            atom.position.set(x * spacing, y * spacing, z * spacing)
            naclGroup.add(atom)
          }
        }
      }
      modelsRef.current.push(naclGroup)
    }

    const createPhysicsModels = () => {
      const circuitGroup = new THREE.Group()
      const battery = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1, 0.3), new THREE.MeshStandardMaterial({ color: 0x1f1f1f }))
      battery.position.set(-1.5, 0, 0)
      circuitGroup.add(battery)
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 12), new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xffe39f, emissiveIntensity: 0.6 }))
      bulb.position.set(1.5, 0, 0)
      circuitGroup.add(bulb)
      modelsRef.current.push(circuitGroup)

      const magnetGroup = new THREE.Group()
      const magnetN = new THREE.Mesh(new THREE.BoxGeometry(1, 1.5, 0.5), new THREE.MeshStandardMaterial({ color: 0xef4444 }))
      magnetN.position.x = 0.5
      magnetGroup.add(magnetN)
      const magnetS = new THREE.Mesh(new THREE.BoxGeometry(1, 1.5, 0.5), new THREE.MeshStandardMaterial({ color: 0x3b82f6 }))
      magnetS.position.x = -0.5
      magnetGroup.add(magnetS)
      modelsRef.current.push(magnetGroup)

      const waveGroup = new THREE.Group()
      const waveGeometry = new THREE.BufferGeometry()
      const wavePositions: number[] = []
      for (let i = 0; i <= 80; i++) {
        const x = (i / 80) * 4 - 2
        const y = Math.sin(i / 10) * 0.5
        wavePositions.push(x, y, 0)
      }
      waveGeometry.setAttribute('position', new THREE.Float32BufferAttribute(wavePositions, 3))
      const waveLine = new THREE.Line(waveGeometry, new THREE.LineBasicMaterial({ color: 0x3b82f6 }))
      waveGroup.add(waveLine)
      modelsRef.current.push(waveGroup)

      const atomGroup = new THREE.Group()
      const nucleus = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), new THREE.MeshStandardMaterial({ color: 0xfbbf24 }))
      atomGroup.add(nucleus)
      const orbits = [{ radius: 1, color: 0x3b82f6, electrons: 2 }, { radius: 1.5, color: 0xef4444, electrons: 3 }]
      orbits.forEach((orbit, orbitIndex) => {
        const orbitGeometry = new THREE.TorusGeometry(orbit.radius, 0.02, 8, 50)
        const orbitMesh = new THREE.Mesh(orbitGeometry, new THREE.MeshBasicMaterial({ color: 0x666666, transparent: true, opacity: 0.25 }))
        orbitMesh.rotation.x = Math.PI / 2 + orbitIndex * 0.3
        atomGroup.add(orbitMesh)
        for (let i = 0; i < orbit.electrons; i++) {
          const angle = (i / orbit.electrons) * Math.PI * 2
          const electron = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), new THREE.MeshStandardMaterial({ color: orbit.color }))
          electron.position.set(Math.cos(angle) * orbit.radius, 0, Math.sin(angle) * orbit.radius)
          ;(electron as any).userData = { orbit: orbit.radius, angle: angle, speed: 0.02 * (orbitIndex + 1) }
          atomGroup.add(electron)
        }
      })
      modelsRef.current.push(atomGroup)
    }

    // Create depending on subject
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
    setTimeout(() => setIsLoading(false), 400)

    // Render loop with throttling for mobile and pause when tab hidden
    let frameId = 0
    let lastRender = performance.now()
    const targetFPS = isMobile ? 30 : 60
    const minFrameInterval = 1000 / targetFPS

    const onVisibilityChange = () => {
      // When tab hidden we still cancel animation; when visible -> re-animate
      if (document.hidden) {
        if (frameId) cancelAnimationFrame(frameId)
        frameId = 0
      } else {
        lastRender = performance.now()
        animate()
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const now = performance.now()
      const delta = now - lastRender
      if (delta < minFrameInterval) return
      lastRender = now

      modelsRef.current.forEach((model, index) => {
        if (scene.children.includes(model)) {
          animateModel(model, index, subject, isMobile)
        }
      })

      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      if (!camera || !renderer) return
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      const newDPR = isMobile ? Math.min(window.devicePixelRatio || 1, 1.25) : Math.min(window.devicePixelRatio || 1, 2)
      renderer.setPixelRatio(newDPR)
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    // cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', onVisibilityChange)
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
  }, [subject])

  // animateModel: accepts isMobile to tweak animations
  const animateModel = (model: THREE.Object3D, index: number, subj: string, isMobile: boolean) => {
    model.rotation.y += isMobile ? 0.004 : 0.006

    if (subj === 'biology') {
      if (index === 1) {
        model.rotation.y += isMobile ? 0.01 : 0.012
        model.position.y = Math.sin(Date.now() * 0.001) * (isMobile ? 0.02 : 0.03)
      } else if (index === 2) {
        const scale = 1 + Math.sin(Date.now() * 0.004) * (isMobile ? 0.04 : 0.055)
        model.scale.set(scale, scale, scale)
      }
    } else if (subj === 'physics') {
      if (index === 2) {
        const time = Date.now() * 0.0012
        model.children.forEach((child, i) => {
          if ((child as THREE.Mesh).geometry?.type === 'SphereGeometry') {
            const originalY = Math.sin(i / 10) * 0.5
            ;(child as THREE.Mesh).position.y = originalY + Math.sin(time * 2 + i / 10) * (isMobile ? 0.12 : 0.18)
          }
        })
      } else if (index === 3) {
        model.children.forEach(child => {
          if ((child as any).userData && (child as any).userData.orbit) {
            ;(child as any).userData.angle += (child as any).userData.speed
            const a = (child as any).userData.angle
            const r = (child as any).userData.orbit
            child.position.x = Math.cos(a) * r
            child.position.z = Math.sin(a) * r
          }
        })
      }
    }
  }

  const switchModel = (index: number) => {
    if (!sceneRef.current) return
    modelsRef.current.forEach(model => sceneRef.current?.remove(model))
    sceneRef.current.add(modelsRef.current[index])
    setCurrentModel(index)
  }

  // Responsive UI styling: adjust on small screens via inline styles
  const isSmallScreen = typeof window !== 'undefined' ? window.innerWidth < 640 : false
  const bottomBarStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: isSmallScreen ? '12px' : '30px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '0.6rem',
    background: 'rgba(0,0,0,0.85)',
    padding: isSmallScreen ? '0.6rem' : '1rem',
    borderRadius: '12px',
    zIndex: 100,
    boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: '96%'
  }

  const infoPanelStyle: React.CSSProperties = isSmallScreen ? {
    position: 'absolute',
    bottom: '72px',
    left: '8px',
    right: '8px',
    background: 'rgba(0,0,0,0.78)',
    padding: '0.8rem',
    borderRadius: '10px',
    zIndex: 100,
    color: 'white'
  } : {
    position: 'absolute',
    top: '20px',
    right: '20px',
    background: 'rgba(0,0,0,0.85)',
    color: 'white',
    padding: '1.2rem',
    borderRadius: '12px',
    zIndex: 100,
    maxWidth: '300px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: currentSubject.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          color: 'white',
          fontSize: '1.5rem',
          flexDirection: 'column'
        }}>
          <div style={{fontSize: '4rem', marginBottom: '1rem'}}>{currentSubject.emoji}</div>
          <div>Загрузка 3D моделей...</div>
        </div>
      )}

      <div ref={canvasRef} style={{ width: '100%', height: '100%' }} />

      <div style={{ position: 'absolute', top: '16px', left: '12px', zIndex: 100 }}>
        <Link 
          to="/subjects" 
          className="btn btn-secondary"
          style={{
            background: 'rgba(255,255,255,0.95)',
            color: currentSubject.color,
            fontSize: isSmallScreen ? '0.85rem' : '0.9rem',
            padding: isSmallScreen ? '0.5rem 0.9rem' : '0.7rem 1.2rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
          }}
        >
          ← К предметам
        </Link>
      </div>

      <div style={infoPanelStyle}>
        <div style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>{currentSubject.emoji}</div>
        <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.05rem', color: currentSubject.color }}>
          {currentSubject.models[currentModel].name}
        </h3>
        <p style={{ margin: 0, fontSize: isSmallScreen ? '0.85rem' : '0.9rem', opacity: 0.9 }}>
          {currentSubject.models[currentModel].description}
        </p>
      </div>

      <div style={bottomBarStyle}>
        {currentSubject.models.map((model: any, index: number) => (
          <button
            key={index}
            onClick={() => switchModel(index)}
            className="btn"
            style={{
              background: currentModel === index ? currentSubject.color : 'rgba(255,255,255,0.08)',
              color: 'white',
              border: currentModel === index ? '2px solid #fff' : '2px solid transparent',
              padding: isSmallScreen ? '0.6rem 0.8rem' : '0.8rem 1rem',
              fontSize: isSmallScreen ? '0.82rem' : '0.85rem',
              minWidth: isSmallScreen ? '80px' : '100px',
              borderRadius: '10px'
            }}
          >
            {model.name.split(' ')[0]}
          </button>
        ))}
      </div>
    </div>
  )
}

export default Gallery3D
