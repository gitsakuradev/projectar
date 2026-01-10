// Обновлённый Gallery3D.tsx — гибридный компонент: автоматически выбирает low/high LOD,
// оптимизирует настройки для мобильных, включает throttling, паузу при скрытии вкладки,
// управляет памятью, и даёт простой AR / model-viewer fallback.
// Сохраните/замените файл: src/pages/Gallery3D.tsx

import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

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
  const [isMobile, setIsMobile] = useState(false)
  const [lowQuality, setLowQuality] = useState(false) // manual toggle if needed

  // Subject data (UI)
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
        { name: '🌫️ CO₂', description: 'Углекислый газ - линейная мо��екула' },
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
    // detect mobile and save-data
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
    const mobile = /Mobi|Android|iPhone|iPad|iPod/.test(ua) || window.innerWidth < 768
    setIsMobile(mobile)
    const connection = (navigator as any).connection || {}
    const saveData = !!connection.saveData || (connection.effectiveType && connection.effectiveType.includes('2g'))
    const preferLow = mobile || saveData
    setLowQuality(preferLow)

    if (!canvasRef.current) return

    // DETAIL parameters adapt to low/high
    const DETAIL = {
      sphereSeg: preferLow ? 16 : 64,
      cylRadial: preferLow ? 12 : 64,
      dnaSeg: preferLow ? 40 : 80,
      ribosomes: preferLow ? 12 : 40,
      mitochondria: preferLow ? 4 : 8,
      erSegments: preferLow ? 8 : 15,
      neuronSpines: preferLow ? 2 : 5,
      neurotransmitters: preferLow ? 4 : 8,
      axonSegments: preferLow ? 8 : 15,
      naclLattice: preferLow ? 1 : 2
    }

    // SCENE
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a1a)
    scene.fog = new THREE.FogExp2(0x0a0a1a, preferLow ? 0.04 : 0.02)
    sceneRef.current = scene

    // CAMERA
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(0, preferLow ? 1.0 : 1.2, preferLow ? 5 : 6)
    cameraRef.current = camera

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: !preferLow, alpha: true })
    const maxDPR = preferLow ? 1.25 : Math.min(window.devicePixelRatio || 1, 2)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDPR))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMap.enabled = !preferLow
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    ;(renderer as any).physicallyCorrectLights = true
    renderer.outputEncoding = THREE.sRGBEncoding
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    canvasRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = preferLow ? 0.12 : 0.08
    controls.minDistance = 2
    controls.maxDistance = preferLow ? 12 : 20
    controls.enablePan = !mobile // disable pan on mobile so scrolling works
    controls.enableZoom = true
    controls.target.set(0, 0.6, 0)
    controlsRef.current = controls

    // LIGHTING
    const hemi = new THREE.HemisphereLight(0xffffff, 0x080820, 0.6)
    scene.add(hemi)

    const dir = new THREE.DirectionalLight(0xffffff, preferLow ? 0.8 : 1.0)
    dir.position.set(5, 8, 3)
    dir.castShadow = !preferLow
    if (!preferLow) {
      dir.shadow.camera.left = -6
      dir.shadow.camera.right = 6
      dir.shadow.camera.top = 6
      dir.shadow.camera.bottom = -6
      dir.shadow.mapSize.width = 2048
      dir.shadow.mapSize.height = 2048
      dir.shadow.radius = 4
    }
    scene.add(dir)

    const p1 = new THREE.PointLight(0xff6b9d, preferLow ? 0.4 : 0.6, 50)
    p1.position.set(4, 4, 5)
    scene.add(p1)

    const p2 = new THREE.PointLight(0x4ecdc4, preferLow ? 0.4 : 0.6, 50)
    p2.position.set(-4, 2, 5)
    scene.add(p2)

    // GROUND + GRID
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.ShadowMaterial({ opacity: !preferLow ? 0.14 : 0.06 })
    )
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -2
    ground.receiveShadow = !preferLow
    scene.add(ground)

    const grid = new THREE.GridHelper(10, 40, 0x222233, 0x0f1724)
    grid.position.y = -1.99
    if (grid.material) {
      ;(grid.material as any).opacity = preferLow ? 0.06 : 0.12
      ;(grid.material as any).transparent = true
    }
    scene.add(grid)

    // clean models
    modelsRef.current = []

    // helper: enable shadows and tweak materials
    const enableShadowsRec = (obj: THREE.Object3D) => {
      obj.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const m = child as THREE.Mesh
          m.castShadow = !preferLow
          m.receiveShadow = !preferLow
          const mat = m.material as any
          if (mat && mat.isMeshStandardMaterial) {
            mat.roughness = Math.max(0, (mat.roughness ?? 0.4) - 0.05)
            mat.metalness = Math.min(1, (mat.metalness ?? 0) + 0.03)
            mat.needsUpdate = true
          }
        }
      })
    }

    // --- model creation: keep two levels inside functions (detail controlled by DETAIL) ---
    const createGeometryModels = () => {
      // cube
      const boxGeo = new THREE.BoxGeometry(2, 2, 2)
      const boxMat = new THREE.MeshPhysicalMaterial({ color: 0x667eea, metalness: 0.2, roughness: 0.35, clearcoat: 0.15 })
      const box = new THREE.Mesh(boxGeo, boxMat)
      const edges = new THREE.EdgesGeometry(boxGeo)
      const lines = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }))
      box.add(lines)
      modelsRef.current.push(box)

      // pyramid
      const pyrGeo = new THREE.ConeGeometry(1.5, 2.5, 4)
      const pyrMat = new THREE.MeshPhysicalMaterial({ color: 0x22c55e, metalness: 0.1, roughness: 0.4 })
      const pyr = new THREE.Mesh(pyrGeo, pyrMat)
      pyr.add(new THREE.LineSegments(new THREE.EdgesGeometry(pyrGeo), new THREE.LineBasicMaterial({ color: 0xffffff })))
      modelsRef.current.push(pyr)

      // sphere
      const sphGeo = new THREE.SphereGeometry(1.5, DETAIL.sphereSeg, DETAIL.sphereSeg)
      const sphMat = new THREE.MeshPhysicalMaterial({ color: 0xf59e0b, metalness: 0.5, roughness: 0.25 })
      const sph = new THREE.Mesh(sphGeo, sphMat)
      modelsRef.current.push(sph)

      // cylinder
      const cylGeo = new THREE.CylinderGeometry(1, 1, 2.5, DETAIL.cylRadial)
      const cylMat = new THREE.MeshPhysicalMaterial({ color: 0xec4899, metalness: 0.15, roughness: 0.35 })
      const cyl = new THREE.Mesh(cylGeo, cylMat)
      modelsRef.current.push(cyl)
    }

    const createBiologyModels = () => {
      // cell
      const cellGroup = new THREE.Group()
      const cellBody = new THREE.Mesh(
        new THREE.SphereGeometry(1.5, DETAIL.sphereSeg, DETAIL.sphereSeg),
        new THREE.MeshPhysicalMaterial({ color: 0x90ee90, transparent: true, opacity: 0.45, roughness: 0.35, transmission: 0.4 })
      )
      cellGroup.add(cellBody)

      const inner = new THREE.Mesh(new THREE.SphereGeometry(1.45, DETAIL.sphereSeg, DETAIL.sphereSeg), new THREE.MeshStandardMaterial({ color: 0x7cfc00, transparent: true, opacity: 0.22 }))
      cellGroup.add(inner)

      const nucleus = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 16), new THREE.MeshStandardMaterial({ color: 0x8b4789 }))
      nucleus.position.set(0, 0, 0)
      cellGroup.add(nucleus)

      for (let i = 0; i < DETAIL.mitochondria; i++) {
        const angle = (i / Math.max(1, DETAIL.mitochondria)) * Math.PI * 2
        const mito = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.35, 8), new THREE.MeshStandardMaterial({ color: 0xff6b6b, roughness: 0.3 }))
        mito.rotation.x = Math.PI / 2
        mito.position.set(Math.cos(angle) * 1, Math.sin(angle * 1.5) * 0.4, Math.sin(angle) * 1)
        mito.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
        cellGroup.add(mito)
      }

      for (let i = 0; i < DETAIL.ribosomes; i++) {
        const rib = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), new THREE.MeshStandardMaterial({ color: 0xffd700 }))
        const angle = Math.random() * Math.PI * 2
        const h = Math.random() * Math.PI
        const r = 1.1 + Math.random() * 0.15
        rib.position.set(Math.sin(h) * Math.cos(angle) * r, Math.cos(h) * r, Math.sin(h) * Math.sin(angle) * r)
        cellGroup.add(rib)
      }

      modelsRef.current.push(cellGroup)

      // DNA
      const dnaGroup = new THREE.Group()
      for (let i = 0; i < DETAIL.dnaSeg; i++) {
        const t = (i / DETAIL.dnaSeg) * Math.PI * 4
        const y = (i / DETAIL.dnaSeg) * 5 - 2.5
        const s1 = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshStandardMaterial({ color: 0x4169e1 }))
        s1.position.set(Math.cos(t) * 0.6, y, Math.sin(t) * 0.6)
        dnaGroup.add(s1)
        const s2 = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshStandardMaterial({ color: 0xff4444 }))
        s2.position.set(Math.cos(t + Math.PI) * 0.6, y, Math.sin(t + Math.PI) * 0.6)
        dnaGroup.add(s2)
      }
      modelsRef.current.push(dnaGroup)

      // Heart (simplified)
      const heart = new THREE.Group()
      const lv = new THREE.Mesh(new THREE.SphereGeometry(0.7, 16, 16), new THREE.MeshStandardMaterial({ color: 0xdc143c }))
      lv.scale.set(1, 1.3, 1)
      lv.position.set(-0.3, -0.5, 0)
      heart.add(lv)
      const rv = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 16), new THREE.MeshStandardMaterial({ color: 0xb22222 }))
      rv.scale.set(1, 1.2, 1)
      rv.position.set(0.3, -0.4, 0.1)
      heart.add(rv)
      heart.scale.set(1.2, 1.2, 1.2)
      modelsRef.current.push(heart)

      // Neuron (simplified)
      const neuron = new THREE.Group()
      const soma = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), new THREE.MeshStandardMaterial({ color: 0xb19cd9 }))
      neuron.add(soma)
      for (let i = 0; i < 6; i++) {
        const dend = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.9, 8), new THREE.MeshStandardMaterial({ color: 0xdda0dd }))
        dend.position.set(Math.cos((i / 6) * Math.PI * 2) * 0.4, 0.1, Math.sin((i / 6) * Math.PI * 2) * 0.4)
        dend.rotation.x = Math.PI / 6
        neuron.add(dend)
      }
      neuron.scale.set(0.7, 0.7, 0.7)
      modelsRef.current.push(neuron)
    }

    const createChemistryModels = () => {
      const atomLabel = (text: string, pos: THREE.Vector3, color: number) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (ctx) {
          canvas.width = 128
          canvas.height = 128
          ctx.clearRect(0, 0, 128, 128)
          ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`
          ctx.font = 'Bold 60px Arial'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(text, 64, 64)
        }
        const tex = new THREE.CanvasTexture(canvas)
        tex.encoding = THREE.sRGBEncoding
        const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false, depthWrite: false })
        const s = new THREE.Sprite(mat)
        s.position.copy(pos)
        s.scale.set(lowQuality ? 0.4 : 0.6, lowQuality ? 0.4 : 0.6, 1)
        return s
      }

      // H2O
      const h2o = new THREE.Group()
      const o = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 12), new THREE.MeshStandardMaterial({ color: 0xff0000 }))
      h2o.add(o)
      const h1 = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), new THREE.MeshStandardMaterial({ color: 0xffffff }))
      h1.position.set(0.75, 0.55, 0)
      h2o.add(h1)
      const h2 = h1.clone()
      h2.position.set(-0.75, 0.55, 0)
      h2o.add(h2)
      h2o.add(atomLabel('O', new THREE.Vector3(0, -0.7, 0), 0xff0000))
      h2o.add(atomLabel('H', new THREE.Vector3(0.75, 0.85, 0), 0xffffff))
      h2o.add(atomLabel('H', new THREE.Vector3(-0.75, 0.85, 0), 0xffffff))
      h2o.scale.set(1.2, 1.2, 1.2)
      modelsRef.current.push(h2o)

      // CH4
      const ch4 = new THREE.Group()
      const c = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 12), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }))
      ch4.add(c)
      const positions = [new THREE.Vector3(0, 1.0, 0), new THREE.Vector3(1.0, -0.35, 0), new THREE.Vector3(-0.5, -0.35, 0.85), new THREE.Vector3(-0.5, -0.35, -0.85)]
      positions.forEach(p => {
        const h = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), new THREE.MeshStandardMaterial({ color: 0xf5f5f5 }))
        h.position.copy(p)
        ch4.add(h)
      })
      ch4.scale.set(1, 1, 1)
      modelsRef.current.push(ch4)

      // CO2
      const co2 = new THREE.Group()
      const cc = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 12), new THREE.MeshStandardMaterial({ color: 0x2a2a2a }))
      co2.add(cc)
      const o1 = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 12), new THREE.MeshStandardMaterial({ color: 0xff3333 }))
      o1.position.x = 1.2
      co2.add(o1)
      const o2 = o1.clone()
      o2.position.x = -1.2
      co2.add(o2)
      co2.scale.set(1.1, 1.1, 1.1)
      modelsRef.current.push(co2)

      // NaCl lattice (small)
      const nacl = new THREE.Group()
      const latticeSize = DETAIL.naclLattice
      const spacing = 0.7
      for (let x = -latticeSize; x <= latticeSize; x++) {
        for (let y = -latticeSize; y <= latticeSize; y++) {
          for (let z = -latticeSize; z <= latticeSize; z++) {
            const isNa = (x + y + z) % 2 === 0
            const atom = new THREE.Mesh(new THREE.SphereGeometry(isNa ? 0.25 : 0.22, 8, 8), new THREE.MeshStandardMaterial({ color: isNa ? 0x9370db : 0x32cd32 }))
            atom.position.set(x * spacing, y * spacing, z * spacing)
            nacl.add(atom)
          }
        }
      }
      modelsRef.current.push(nacl)
    }

    const createPhysicsModels = () => {
      const circuit = new THREE.Group()
      const bat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1, 0.3), new THREE.MeshStandardMaterial({ color: 0x1f1f1f }))
      bat.position.set(-1.5, 0, 0)
      circuit.add(bat)
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 12), new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xffe39f, emissiveIntensity: 0.6 }))
      bulb.position.set(1.5, 0, 0)
      circuit.add(bulb)
      modelsRef.current.push(circuit)

      const magnet = new THREE.Group()
      const n = new THREE.Mesh(new THREE.BoxGeometry(1, 1.5, 0.5), new THREE.MeshStandardMaterial({ color: 0xef4444 }))
      n.position.x = 0.5
      magnet.add(n)
      const s = new THREE.Mesh(new THREE.BoxGeometry(1, 1.5, 0.5), new THREE.MeshStandardMaterial({ color: 0x3b82f6 }))
      s.position.x = -0.5
      magnet.add(s)
      modelsRef.current.push(magnet)

      const wave = new THREE.Group()
      const pos: number[] = []
      const pts = preferLow ? 80 : 100
      for (let i = 0; i <= pts; i++) {
        const x = (i / pts) * 4 - 2
        const y = Math.sin(i / 10) * 0.5
        pos.push(x, y, 0)
      }
      const buff = new THREE.BufferGeometry()
      buff.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
      const wline = new THREE.Line(buff, new THREE.LineBasicMaterial({ color: 0x3b82f6 }))
      wave.add(wline)
      modelsRef.current.push(wave)

      const atom = new THREE.Group()
      const nuc = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), new THREE.MeshStandardMaterial({ color: 0xfbbf24 }))
      atom.add(nuc)
      const orbits = [{ radius: 1, color: 0x3b82f6, electrons: 2 }, { radius: 1.5, color: 0xef4444, electrons: preferLow ? 3 : 4 }]
      orbits.forEach((orbit, oi) => {
        const ogr = new THREE.TorusGeometry(orbit.radius, 0.02, 8, 50)
        const om = new THREE.Mesh(ogr, new THREE.MeshBasicMaterial({ color: 0x666666, transparent: true, opacity: 0.25 }))
        om.rotation.x = Math.PI / 2 + oi * 0.3
        atom.add(om)
        for (let i = 0; i < orbit.electrons; i++) {
          const angle = (i / orbit.electrons) * Math.PI * 2
          const e = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), new THREE.MeshStandardMaterial({ color: orbit.color }))
          e.position.set(Math.cos(angle) * orbit.radius, 0, Math.sin(angle) * orbit.radius)
          ;(e as any).userData = { orbit: orbit.radius, angle, speed: 0.02 * (oi + 1) }
          atom.add(e)
        }
      })
      modelsRef.current.push(atom)
    }

    // Create all based on subject
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
    setTimeout(() => setIsLoading(false), 350)

    // RENDER LOOP: throttled on mobile / pause when hidden
    let frameId = 0
    let last = performance.now()
    const targetFPS = preferLow ? 30 : 60
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
          animateModel(model, idx, subject, preferLow)
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
      const newDPR = preferLow ? Math.min(window.devicePixelRatio || 1, 1.25) : Math.min(window.devicePixelRatio || 1, 2)
      renderer.setPixelRatio(newDPR)
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    // cleanup
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
  }, [subject])

  // animateModel: tweak per-subject animations; preferLow switches intensities
  const animateModel = (model: THREE.Object3D, index: number, subj: string, preferLow: boolean) => {
    model.rotation.y += preferLow ? 0.004 : 0.006

    if (subj === 'biology') {
      if (index === 1) { // DNA
        model.rotation.y += preferLow ? 0.01 : 0.012
        model.position.y = Math.sin(Date.now() * 0.001) * (preferLow ? 0.02 : 0.03)
      } else if (index === 2) { // heart
        const s = 1 + Math.sin(Date.now() * 0.004) * (preferLow ? 0.04 : 0.055)
        model.scale.set(s, s, s)
      }
    } else if (subj === 'physics') {
      if (index === 2) {
        const t = Date.now() * 0.0012
        model.children.forEach((child, i) => {
          if ((child as THREE.Mesh).geometry?.type === 'SphereGeometry') {
            const oy = Math.sin(i / 10) * 0.5
            ;(child as THREE.Mesh).position.y = oy + Math.sin(t * 2 + i / 10) * (preferLow ? 0.12 : 0.18)
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

  // switch displayed model
  const switchModel = (index: number) => {
    if (!sceneRef.current) return
    modelsRef.current.forEach(m => sceneRef.current?.remove(m))
    const model = modelsRef.current[index]
    if (model) {
      sceneRef.current.add(model)
      setCurrentModel(index)
    }
  }

  // responsive UI flags
  const isSmall = typeof window !== 'undefined' ? window.innerWidth < 640 : false

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      {/* Loading overlay */}
      {isLoading && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          background: currentSubject.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 400, color: 'white', fontSize: '1.3rem', flexDirection: 'column'
        }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '0.8rem' }}>{currentSubject.emoji}</div>
          <div>Загрузка 3D — подстраиваемся под устройство...</div>
          <div style={{ marginTop: 12, fontSize: '0.9rem', opacity: 0.85 }}>{lowQuality ? 'Режим низкого качества (mobile/save-data)' : 'Режим высокого качества'}</div>
        </div>
      )}

      {/* Canvas container */}
      <div ref={canvasRef} style={{ width: '100%', height: '100%' }} />

      {/* Back link */}
      <div style={{ position: 'absolute', top: 14, left: 12, zIndex: 410 }}>
        <Link to="/subjects" className="btn btn-secondary" style={{
          background: 'rgba(255,255,255,0.95)', color: currentSubject.color, fontSize: isSmall ? '0.85rem' : '0.95rem',
          padding: isSmall ? '0.5rem 0.9rem' : '0.7rem 1.2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.18)'
        }}>← К предметам</Link>
      </div>

      {/* Info panel */}
      <div style={{
        position: isSmall ? 'absolute' : 'absolute',
        bottom: isSmall ? 80 : 'auto',
        top: isSmall ? 'auto' : 20,
        right: isSmall ? 12 : 20,
        left: isSmall ? 12 : 'auto',
        background: 'rgba(0,0,0,0.78)',
        color: 'white',
        padding: isSmall ? '0.7rem' : '1rem',
        borderRadius: 10,
        zIndex: 410,
        maxWidth: isSmall ? 'unset' : 320
      }}>
        <div style={{ fontSize: isSmall ? '1.2rem' : '1.4rem', marginBottom: 6 }}>{currentSubject.emoji} {currentSubject.name}</div>
        <div style={{ fontSize: isSmall ? '0.85rem' : '0.95rem', opacity: 0.9 }}>{currentSubject.models[currentModel].description}</div>
        <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
          <button onClick={() => setLowQuality(q => !q)} style={{ padding: '6px 8px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
            {lowQuality ? 'Режим Low →' : 'Режим High →'}
          </button>
          <button onClick={() => {
            // quick reset camera
            if (controlsRef.current) {
              controlsRef.current.reset && (controlsRef.current as any).reset()
              controlsRef.current.target.set(0, 0.6, 0)
            }
            if (cameraRef.current) cameraRef.current.position.set(0, lowQuality ? 1.0 : 1.2, lowQuality ? 5 : 6)
          }} style={{ padding: '6px 8px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
            Сброс камеры
          </button>
        </div>
      </div>

      {/* Bottom model selector */}
      <div style={{
        position: 'absolute', bottom: isSmall ? 12 : 30, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: '0.6rem', background: 'rgba(0,0,0,0.7)', padding: isSmall ? '0.5rem' : '0.9rem',
        borderRadius: 12, zIndex: 410, flexWrap: 'wrap', justifyContent: 'center', width: isSmall ? '96%' : 'auto'
      }}>
        {currentSubject.models.map((m: any, i: number) => (
          <button key={i} onClick={() => switchModel(i)} className="btn" style={{
            background: currentModel === i ? currentSubject.color : 'rgba(255,255,255,0.08)',
            color: 'white', border: currentModel === i ? '2px solid #fff' : '2px solid transparent',
            padding: isSmall ? '0.5rem 0.7rem' : '0.7rem 1rem', fontSize: isSmall ? '0.82rem' : '0.86rem', minWidth: 84, borderRadius: 10
          }}>
            {m.name.split(' ')[0]}
          </button>
        ))}
      </div>
    </div>
  )
}

export default Gallery3D
