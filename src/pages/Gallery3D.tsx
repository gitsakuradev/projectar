import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as THREE from 'three'

function Gallery3D() {
  const { subject = 'geometry' } = useParams()
  const canvasRef = useRef<HTMLDivElement>(null)
  const [currentModel, setCurrentModel] = useState(0)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
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
    if (!canvasRef.current) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a1a)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 5
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMap.enabled = true
    canvasRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const pointLight1 = new THREE.PointLight(0xff6b9d, 1.5, 100)
    pointLight1.position.set(5, 5, 5)
    scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0x4ecdc4, 1.5, 100)
    pointLight2.position.set(-5, -5, 5)
    scene.add(pointLight2)

    // Очищаем предыдущие модели
    modelsRef.current = []

    // Создание моделей в зависимости от предмета
    if (subject === 'geometry') {
      createGeometryModels(scene)
    } else if (subject === 'biology') {
      createBiologyModels(scene)
    } else if (subject === 'chemistry') {
      createChemistryModels(scene)
    } else if (subject === 'physics') {
      createPhysicsModels(scene)
    }

    scene.add(modelsRef.current[0])

    let frameId: number
    const animate = () => {
      frameId = requestAnimationFrame(animate)

      modelsRef.current.forEach((model, index) => {
        if (scene.children.includes(model)) {
          animateModel(model, index, subject)
        }
      })

      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(frameId)
      if (canvasRef.current && renderer.domElement) {
        canvasRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [subject])

  const createGeometryModels = (scene: THREE.Scene) => {
    // Куб
    const cubeGeometry = new THREE.BoxGeometry(2, 2, 2)
    const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x667eea, metalness: 0.3, roughness: 0.4 })
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
    const cubeEdges = new THREE.EdgesGeometry(cubeGeometry)
    const cubeLines = new THREE.LineSegments(cubeEdges, new THREE.LineBasicMaterial({ color: 0xffffff }))
    cube.add(cubeLines)
    modelsRef.current.push(cube)

    // Пирамида
    const pyramidGeometry = new THREE.ConeGeometry(1.5, 2.5, 4)
    const pyramidMaterial = new THREE.MeshStandardMaterial({ color: 0x22c55e, metalness: 0.3, roughness: 0.4 })
    const pyramid = new THREE.Mesh(pyramidGeometry, pyramidMaterial)
    const pyramidEdges = new THREE.EdgesGeometry(pyramidGeometry)
    const pyramidLines = new THREE.LineSegments(pyramidEdges, new THREE.LineBasicMaterial({ color: 0xffffff }))
    pyramid.add(pyramidLines)
    modelsRef.current.push(pyramid)

    // Сфера
    const sphereGeometry = new THREE.SphereGeometry(1.5, 32, 32)
    const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.6, roughness: 0.2 })
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    modelsRef.current.push(sphere)

    // Цилиндр
    const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 2.5, 32)
    const cylinderMaterial = new THREE.MeshStandardMaterial({ color: 0xec4899, metalness: 0.4, roughness: 0.3 })
    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial)
    modelsRef.current.push(cylinder)
  }

  const createBiologyModels = (scene: THREE.Scene) => {
    // Клетка
    const cellGroup = new THREE.Group()
    const cellBody = new THREE.Mesh(
      new THREE.SphereGeometry(1.5, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0x22c55e, transparent: true, opacity: 0.7 })
    )
    cellGroup.add(cellBody)
    const nucleus = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0x16a34a })
    )
    cellGroup.add(nucleus)
    for (let i = 0; i < 8; i++) {
      const organelle = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xfcd34d })
      )
      organelle.position.set(Math.cos(i) * 1.2, Math.sin(i) * 0.8, Math.sin(i * 2) * 0.8)
      cellGroup.add(organelle)
    }
    modelsRef.current.push(cellGroup)

    // ДНК
    const dnaGroup = new THREE.Group()
    for (let i = 0; i < 50; i++) {
      const t = i / 10
      const sphere1 = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x3b82f6 })
      )
      sphere1.position.set(Math.cos(t) * 0.5, t * 0.1 - 2.5, Math.sin(t) * 0.5)
      dnaGroup.add(sphere1)

      const sphere2 = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xef4444 })
      )
      sphere2.position.set(Math.cos(t + Math.PI) * 0.5, t * 0.1 - 2.5, Math.sin(t + Math.PI) * 0.5)
      dnaGroup.add(sphere2)
    }
    modelsRef.current.push(dnaGroup)

    // Сердце
    const heartGroup = new THREE.Group()
    const heartShape = new THREE.Shape()
    heartShape.moveTo(0, 0)
    heartShape.bezierCurveTo(0, -0.3, -0.6, -0.3, -0.6, 0)
    heartShape.bezierCurveTo(-0.6, 0.3, 0, 0.6, 0, 1)
    heartShape.bezierCurveTo(0, 0.6, 0.6, 0.3, 0.6, 0)
    heartShape.bezierCurveTo(0.6, -0.3, 0, -0.3, 0, 0)
    
    const extrudeSettings = { depth: 0.4, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1 }
    const heartGeometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings)
    const heart = new THREE.Mesh(
      heartGeometry,
      new THREE.MeshStandardMaterial({ color: 0xef4444 })
    )
    heart.scale.set(2, 2, 2)
    heartGroup.add(heart)
    modelsRef.current.push(heartGroup)

    // Нейрон
    const neuronGroup = new THREE.Group()
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0xa855f7 })
    )
    neuronGroup.add(body)
    
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2
      const dendrite = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.02, 1.5),
        new THREE.MeshStandardMaterial({ color: 0xc084fc })
      )
      dendrite.position.set(Math.cos(angle) * 0.8, 0, Math.sin(angle) * 0.8)
      dendrite.rotation.z = angle
      neuronGroup.add(dendrite)
    }
    
    const axon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 3),
      new THREE.MeshStandardMaterial({ color: 0x9333ea })
    )
    axon.position.y = -1.5
    neuronGroup.add(axon)
    modelsRef.current.push(neuronGroup)
  }

  const createChemistryModels = (scene: THREE.Scene) => {
    // H2O
    const h2oGroup = new THREE.Group()
    const oxygen = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0xef4444 })
    )
    h2oGroup.add(oxygen)
    
    const hydrogen1 = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0xf0f0f0 })
    )
    hydrogen1.position.set(0.7, 0.5, 0)
    h2oGroup.add(hydrogen1)
    
    const hydrogen2 = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0xf0f0f0 })
    )
    hydrogen2.position.set(-0.7, 0.5, 0)
    h2oGroup.add(hydrogen2)
    
    const bond1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.9),
      new THREE.MeshStandardMaterial({ color: 0xcccccc })
    )
    bond1.position.set(0.35, 0.25, 0)
    bond1.rotation.z = -Math.PI / 6
    h2oGroup.add(bond1)
    
    const bond2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.9),
      new THREE.MeshStandardMaterial({ color: 0xcccccc })
    )
    bond2.position.set(-0.35, 0.25, 0)
    bond2.rotation.z = Math.PI / 6
    h2oGroup.add(bond2)
    
    modelsRef.current.push(h2oGroup)

    // CH4
    const ch4Group = new THREE.Group()
    const carbon = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0x1f1f1f })
    )
    ch4Group.add(carbon)
    
    const positions = [
      [0, 1, 0],
      [0.94, -0.33, 0],
      [-0.47, -0.33, 0.82],
      [-0.47, -0.33, -0.82]
    ]
    
    positions.forEach(pos => {
      const h = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0xf0f0f0 })
      )
      h.position.set(pos[0], pos[1], pos[2])
      ch4Group.add(h)
      
      const bond = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 1),
        new THREE.MeshStandardMaterial({ color: 0xcccccc })
      )
      bond.position.set(pos[0] / 2, pos[1] / 2, pos[2] / 2)
      bond.lookAt(new THREE.Vector3(pos[0], pos[1], pos[2]))
      bond.rotateX(Math.PI / 2)
      ch4Group.add(bond)
    })
    
    modelsRef.current.push(ch4Group)

    // CO2
    const co2Group = new THREE.Group()
    const carbonCO2 = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0x1f1f1f })
    )
    co2Group.add(carbonCO2)
    
    const oxygen1 = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0xef4444 })
    )
    oxygen1.position.x = 1.2
    co2Group.add(oxygen1)
    
    const oxygen2 = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0xef4444 })
    )
    oxygen2.position.x = -1.2
    co2Group.add(oxygen2)
    
    modelsRef.current.push(co2Group)

    // NaCl
    const naclGroup = new THREE.Group()
    const size = 3
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const isNa = (x + y + z) % 2 === 0
          const atom = new THREE.Mesh(
            new THREE.SphereGeometry(0.3, 32, 32),
            new THREE.MeshStandardMaterial({ 
              color: isNa ? 0x9333ea : 0x22c55e,
              metalness: 0.5
            })
          )
          atom.position.set(x * 0.8, y * 0.8, z * 0.8)
          naclGroup.add(atom)
        }
      }
    }
    modelsRef.current.push(naclGroup)
  }

  const createPhysicsModels = (scene: THREE.Scene) => {
    // Электрическая цепь
    const circuitGroup = new THREE.Group()
    
    const battery = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 1, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x1f1f1f })
    )
    battery.position.set(-1.5, 0, 0)
    circuitGroup.add(battery)
    
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 32, 32),
      new THREE.MeshStandardMaterial({ 
        color: 0xfbbf24,
        emissive: 0xfbbf24,
        emissiveIntensity: 0.5
      })
    )
    bulb.position.set(1.5, 0, 0)
    circuitGroup.add(bulb)
    
    const wire1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 3),
      new THREE.MeshStandardMaterial({ color: 0x3b82f6 })
    )
    wire1.rotation.z = Math.PI / 2
    wire1.position.y = 1
    circuitGroup.add(wire1)
    
    const wire2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 3),
      new THREE.MeshStandardMaterial({ color: 0xef4444 })
    )
    wire2.rotation.z = Math.PI / 2
    wire2.position.y = -1
    circuitGroup.add(wire2)
    
    modelsRef.current.push(circuitGroup)

    // Магнит
    const magnetGroup = new THREE.Group()
    const magnetN = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1.5, 0.5),
      new THREE.MeshStandardMaterial({ color: 0xef4444 })
    )
    magnetN.position.x = 0.5
    magnetGroup.add(magnetN)
    
    const magnetS = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1.5, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x3b82f6 })
    )
    magnetS.position.x = -0.5
    magnetGroup.add(magnetS)
    
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2
      const radius = 2
      const line = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.5),
        new THREE.MeshBasicMaterial({ color: 0x4ade80 })
      )
      line.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius)
      line.lookAt(new THREE.Vector3(0, 0, 0))
      magnetGroup.add(line)
    }
    
    modelsRef.current.push(magnetGroup)

    // Волна
    const waveGroup = new THREE.Group()
    const waveGeometry = new THREE.BufferGeometry()
    const wavePositions = []
    for (let i = 0; i <= 100; i++) {
      const x = (i / 100) * 4 - 2
      const y = Math.sin(i / 10) * 0.5
      wavePositions.push(x, y, 0)
    }
    waveGeometry.setAttribute('position', new THREE.Float32BufferAttribute(wavePositions, 3))
    const waveLine = new THREE.Line(
      waveGeometry,
      new THREE.LineBasicMaterial({ color: 0x3b82f6, linewidth: 3 })
    )
    waveGroup.add(waveLine)
    
    for (let i = 0; i <= 100; i += 10) {
      const x = (i / 100) * 4 - 2
      const y = Math.sin(i / 10) * 0.5
      const point = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xef4444 })
      )
      point.position.set(x, y, 0)
      waveGroup.add(point)
    }
    
    modelsRef.current.push(waveGroup)

    // Атом
    const atomGroup = new THREE.Group()
    const nucleus = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24 })
    )
    atomGroup.add(nucleus)
    
    const orbits = [
      { radius: 1, color: 0x3b82f6, electrons: 2 },
      { radius: 1.5, color: 0xef4444, electrons: 4 },
      { radius: 2, color: 0x22c55e, electrons: 6 }
    ]
    
    orbits.forEach((orbit, orbitIndex) => {
      const orbitGeometry = new THREE.TorusGeometry(orbit.radius, 0.02, 16, 100)
      const orbitMesh = new THREE.Mesh(
        orbitGeometry,
        new THREE.MeshBasicMaterial({ color: 0x666666, transparent: true, opacity: 0.3 })
      )
      orbitMesh.rotation.x = Math.PI / 2 + orbitIndex * 0.3
      orbitMesh.rotation.y = orbitIndex * 0.5
      atomGroup.add(orbitMesh)
      
      for (let i = 0; i < orbit.electrons; i++) {
        const angle = (i / orbit.electrons) * Math.PI * 2
        const electron = new THREE.Mesh(
          new THREE.SphereGeometry(0.1, 16, 16),
          new THREE.MeshStandardMaterial({ color: orbit.color })
        )
        electron.position.set(
          Math.cos(angle) * orbit.radius,
          0,
          Math.sin(angle) * orbit.radius
        )
        electron.userData = { orbit: orbit.radius, angle: angle, speed: 0.02 * (orbitIndex + 1) }
        atomGroup.add(electron)
      }
    })
    
    modelsRef.current.push(atomGroup)
  }

  const animateModel = (model: THREE.Object3D, index: number, subj: string) => {
    model.rotation.y += 0.005

    if (subj === 'biology') {
      if (index === 1) { // ДНК
        model.rotation.y += 0.01
      } else if (index === 2) { // Сердце
        const scale = 1 + Math.sin(Date.now() * 0.003) * 0.05
        model.scale.set(scale, scale, scale)
      }
    } else if (subj === 'physics') {
      if (index === 2) { // Волна
        const time = Date.now() * 0.001
        model.children.forEach((child, i) => {
          if (child instanceof THREE.Mesh && child.geometry.type === 'SphereGeometry') {
            const originalY = Math.sin(i / 10) * 0.5
            child.position.y = originalY + Math.sin(time * 2 + i / 10) * 0.2
          }
        })
      } else if (index === 3) { // Атом
        model.children.forEach(child => {
          if (child.userData.orbit) {
            child.userData.angle += child.userData.speed
            child.position.x = Math.cos(child.userData.angle) * child.userData.orbit
            child.position.z = Math.sin(child.userData.angle) * child.userData.orbit
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

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <div ref={canvasRef} style={{ width: '100%', height: '100%' }} />

      <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 100 }}>
        <Link 
          to="/subjects" 
          className="btn btn-secondary"
          style={{
            background: 'rgba(255,255,255,0.95)',
            color: currentSubject.color,
            fontSize: '0.9rem',
            padding: '0.7rem 1.2rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
          }}
        >
          ← К предметам
        </Link>
      </div>

      <div style={{
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
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{currentSubject.emoji}</div>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: currentSubject.color }}>
          {currentSubject.models[currentModel].name}
        </h3>
        <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>
          {currentSubject.models[currentModel].description}
        </p>
      </div>

      <div style={{
        position: 'absolute',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '1rem',
        background: 'rgba(0,0,0,0.85)',
        padding: '1rem',
        borderRadius: '16px',
        zIndex: 100,
        boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: '90%'
      }}>
        {currentSubject.models.map((model: any, index: number) => (
          <button
            key={index}
            onClick={() => switchModel(index)}
            className="btn"
            style={{
              background: currentModel === index ? currentSubject.color : 'rgba(255,255,255,0.2)',
              color: 'white',
              border: currentModel === index ? '2px solid #fff' : '2px solid transparent',
              padding: '0.8rem 1rem',
              fontSize: '0.85rem',
              minWidth: '100px'
            }}
          >
            {model.name.split(' ')[0]}
          </button>
        ))}
      </div>

      <div style={{
        position: 'absolute',
        bottom: '120px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'rgba(255,255,255,0.6)',
        fontSize: '0.9rem',
        textAlign: 'center',
        zIndex: 100
      }}>
        🖱️ Модели вращаются автоматически
      </div>
    </div>
  )
}

export default Gallery3D
