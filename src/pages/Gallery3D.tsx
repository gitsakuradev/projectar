// Вот исправленный файл Gallery3D.tsx — в нём заменено присваивание
// renderer.physicallyCorrectLights = true на (renderer as any).physicallyCorrectLights = true
// остальная логика оставлена без изменений (как в вашем последнем варианте).

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

    // Сцена
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a1a)
    scene.fog = new THREE.FogExp2(0x0a0a1a, 0.02) // лёгкая атмосфера
    sceneRef.current = scene

    // Камера
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(0, 1.2, 6)
    cameraRef.current = camera

    // Рендерер
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    // Если в вашей версии three нет типизации для physicallyCorrectLights, используем any
    ;(renderer as any).physicallyCorrectLights = true
    renderer.outputEncoding = THREE.sRGBEncoding
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0
    canvasRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Контролы
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.minDistance = 2
    controls.maxDistance = 20
    controls.target.set(0, 0.6, 0)
    controlsRef.current = controls

    // Освещение: Hemisphere + Directional (тени) + subtle colored points
    const hemi = new THREE.HemisphereLight(0xffffff, 0x080820, 0.6)
    scene.add(hemi)

    const dir = new THREE.DirectionalLight(0xffffff, 1.0)
    dir.position.set(5, 8, 3)
    dir.castShadow = true
    dir.shadow.camera.left = -6
    dir.shadow.camera.right = 6
    dir.shadow.camera.top = 6
    dir.shadow.camera.bottom = -6
    dir.shadow.mapSize.width = 2048
    dir.shadow.mapSize.height = 2048
    dir.shadow.radius = 4
    scene.add(dir)

    const pointLight1 = new THREE.PointLight(0xff6b9d, 0.6, 50)
    pointLight1.position.set(4, 4, 5)
    scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0x4ecdc4, 0.6, 50)
    pointLight2.position.set(-4, 2, 5)
    scene.add(pointLight2)

    // Земля (плоскость для теней) + Grid
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.ShadowMaterial({ opacity: 0.14 })
    )
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -2
    ground.receiveShadow = true
    scene.add(ground)

    const grid = new THREE.GridHelper(10, 40, 0x222233, 0x0f1724)
    grid.position.y = -1.99
    grid.material.opacity = 0.12
    // @ts-ignore tweak
    grid.material.transparent = true
    scene.add(grid)

    // Очистка моделей
    modelsRef.current = []

    // Функция включения теней для модели (рекурсивно)
    const enableShadows = (obj: THREE.Object3D) => {
      obj.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const m = child as THREE.Mesh
          m.castShadow = true
          m.receiveShadow = true
          // улучшаем материал там, где возможно: если Standard -> Physical-ish tweaks
          if ((m.material as any)?.isMeshStandardMaterial) {
            const mat = m.material as THREE.MeshStandardMaterial
            // небольшие общие настройки для блеска
            mat.roughness = Math.max(0, (mat.roughness ?? 0.4) - 0.05)
            mat.metalness = Math.min(1, (mat.metalness ?? 0.0) + 0.05)
            mat.needsUpdate = true
          }
        }
      })
    }

    // Создаём модели для нужного предмета
    const createAll = () => {
      modelsRef.current = []
      if (subject === 'geometry') {
        createGeometryModels()
      } else if (subject === 'biology') {
        createBiologyModels()
      } else if (subject === 'chemistry') {
        createChemistryModels()
      } else if (subject === 'physics') {
        createPhysicsModels()
      }
      // Включаем тени у всех моделей
      modelsRef.current.forEach(m => enableShadows(m))
    }

    // Вызов создания
    createAll()

    // Добавляем первую модель в сцену
    if (modelsRef.current[0]) {
      scene.add(modelsRef.current[0])
    }

    // Снимаем загрузку через небольшой таймаут (плавность)
    setTimeout(() => setIsLoading(false), 500)

    // Анимация
    let frameId: number
    const animate = () => {
      frameId = requestAnimationFrame(animate)

      // Обновляем вращения/анимацию моделей
      modelsRef.current.forEach((model, index) => {
        if (scene.children.includes(model)) {
          animateModel(model, index, subject)
        }
      })

      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Resize
    const handleResize = () => {
      if (!camera || !renderer) return
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(frameId)

      // удаляем все модели из сцены и освобождаем память
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
              // @ts-ignore
              if ((mat as any).map) (mat as any).map.dispose()
              mat.dispose()
            }
          }
        })
      })

      // контролы
      if (controls) controls.dispose()

      // remove canvas
      if (canvasRef.current && renderer.domElement && canvasRef.current.contains(renderer.domElement)) {
        canvasRef.current.removeChild(renderer.domElement)
      }

      // renderer cleanup
      renderer.dispose()
      // очистим ссылки
      sceneRef.current = null
      cameraRef.current = null
      rendererRef.current = null
      controlsRef.current = null
    }
  }, [subject])

  // -------------------------
  // Модели: слегка отредактированы материалы и включены тени
  // -------------------------
  const createGeometryModels = () => {
    // Куб
    const cubeGeometry = new THREE.BoxGeometry(2, 2, 2)
    const cubeMaterial = new THREE.MeshPhysicalMaterial({ color: 0x667eea, metalness: 0.2, roughness: 0.35, clearcoat: 0.2 })
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
    const cubeEdges = new THREE.EdgesGeometry(cubeGeometry)
    const cubeLines = new THREE.LineSegments(cubeEdges, new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 1 }))
    cube.add(cubeLines)
    cube.castShadow = true
    modelsRef.current.push(cube)

    // Пирамида
    const pyramidGeometry = new THREE.ConeGeometry(1.5, 2.5, 4)
    const pyramidMaterial = new THREE.MeshPhysicalMaterial({ color: 0x22c55e, metalness: 0.1, roughness: 0.4, clearcoat: 0.1 })
    const pyramid = new THREE.Mesh(pyramidGeometry, pyramidMaterial)
    const pyramidEdges = new THREE.EdgesGeometry(pyramidGeometry)
    const pyramidLines = new THREE.LineSegments(pyramidEdges, new THREE.LineBasicMaterial({ color: 0xffffff }))
    pyramid.add(pyramidLines)
    pyramid.castShadow = true
    modelsRef.current.push(pyramid)

    // Сфера
    const sphereGeometry = new THREE.SphereGeometry(1.5, 64, 64)
    const sphereMaterial = new THREE.MeshPhysicalMaterial({ color: 0xf59e0b, metalness: 0.5, roughness: 0.25, reflectivity: 0.5 })
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    sphere.castShadow = true
    modelsRef.current.push(sphere)

    // Цилиндр
    const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 2.5, 64)
    const cylinderMaterial = new THREE.MeshPhysicalMaterial({ color: 0xec4899, metalness: 0.15, roughness: 0.35 })
    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial)
    cylinder.castShadow = true
    modelsRef.current.push(cylinder)
  }

  const createBiologyModels = () => {
    // Модель 1: Клетка (улучшены материалы и сглаживание)
    const cellGroup = new THREE.Group()

    // Клеточная мембрана (полупрозрачная)
    const cellBody = new THREE.Mesh(
      new THREE.SphereGeometry(1.5, 64, 64),
      new THREE.MeshPhysicalMaterial({
        color: 0x90ee90,
        transparent: true,
        opacity: 0.45,
        roughness: 0.35,
        transmission: 0.4,
        clearcoat: 0.15
      })
    )
    cellGroup.add(cellBody)

    // Внутренняя мем��рана
    const innerMembrane = new THREE.Mesh(
      new THREE.SphereGeometry(1.45, 64, 64),
      new THREE.MeshStandardMaterial({
        color: 0x7cfc00,
        transparent: true,
        opacity: 0.22,
        roughness: 0.45
      })
    )
    cellGroup.add(innerMembrane)

    // Ядро
    const nucleus = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 32, 32),
      new THREE.MeshPhysicalMaterial({
        color: 0x8b4789,
        roughness: 0.22,
        metalness: 0.25,
        clearcoat: 0.1
      })
    )
    nucleus.position.set(0, 0, 0)
    cellGroup.add(nucleus)

    const nucleolus = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0x4b0082,
        roughness: 0.12,
        metalness: 0.5,
        emissive: 0x220033,
        emissiveIntensity: 0.2
      })
    )
    nucleolus.position.set(0.2, 0.1, 0)
    cellGroup.add(nucleolus)

    // Митохондрии
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const radius = 1
      const mitoGroup = new THREE.Group()

      const mitoBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.35, 12, 4),
        new THREE.MeshPhysicalMaterial({
          color: 0xff6b6b,
          roughness: 0.28,
          metalness: 0.22,
          clearcoat: 0.05
        })
      )
      mitoBody.rotation.x = Math.PI / 2
      mitoGroup.add(mitoBody)

      for (let j = 0; j < 4; j++) {
        const fold = new THREE.Mesh(
          new THREE.PlaneGeometry(0.15, 0.08),
          new THREE.MeshStandardMaterial({
            color: 0xcc5555,
            side: THREE.DoubleSide,
            roughness: 0.45
          })
        )
        fold.position.y = (j - 1.5) * 0.08
        fold.rotation.y = Math.PI / 2
        mitoGroup.add(fold)
      }

      mitoGroup.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle * 1.5) * 0.4,
        Math.sin(angle) * radius
      )
      mitoGroup.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      )
      cellGroup.add(mitoGroup)
    }

    // РЭР (endoplasmic reticulum)
    for (let i = 0; i < 15; i++) {
      const erSegment = new THREE.Mesh(
        new THREE.TorusGeometry(0.15 + i * 0.05, 0.02, 8, 16),
        new THREE.MeshStandardMaterial({
          color: 0x87ceeb,
          roughness: 0.45,
          transparent: true,
          opacity: 0.7
        })
      )
      erSegment.position.set(
        Math.cos(i * 0.4) * 0.8,
        (i - 7) * 0.08,
        Math.sin(i * 0.4) * 0.8
      )
      erSegment.rotation.x = Math.PI / 2 + i * 0.2
      cellGroup.add(erSegment)
    }

    // Рибосомы
    for (let i = 0; i < 40; i++) {
      const ribosome = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 8, 8),
        new THREE.MeshStandardMaterial({
          color: 0xffd700,
          roughness: 0.28,
          metalness: 0.6,
          emissive: 0x332200,
          emissiveIntensity: 0.05
        })
      )
      const angle = Math.random() * Math.PI * 2
      const height = Math.random() * Math.PI
      const radius = 1.1 + Math.random() * 0.2
      ribosome.position.set(
        Math.sin(height) * Math.cos(angle) * radius,
        Math.cos(height) * radius,
        Math.sin(height) * Math.sin(angle) * radius
      )
      cellGroup.add(ribosome)
    }

    // Гольджи
    const golgiGroup = new THREE.Group()
    for (let i = 0; i < 6; i++) {
      const disc = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.25, 0.03, 32),
        new THREE.MeshStandardMaterial({
          color: 0xffa500,
          roughness: 0.4,
          metalness: 0.25
        })
      )
      disc.position.y = i * 0.08 - 0.24
      golgiGroup.add(disc)
    }
    golgiGroup.position.set(0.7, -0.3, 0.5)
    cellGroup.add(golgiGroup)

    modelsRef.current.push(cellGroup)

    // ДНК
    const dnaGroup = new THREE.Group()
    const segments = 80
    const helixRadius = 0.6
    const helixHeight = 5

    for (let i = 0; i < segments; i++) {
      const t = (i / segments) * Math.PI * 4
      const y = (i / segments) * helixHeight - helixHeight / 2

      const sphere1 = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 12, 12),
        new THREE.MeshPhysicalMaterial({
          color: 0x4169e1,
          roughness: 0.22,
          metalness: 0.45,
          emissive: 0x112244,
          emissiveIntensity: 0.08
        })
      )
      sphere1.position.set(Math.cos(t) * helixRadius, y, Math.sin(t) * helixRadius)
      dnaGroup.add(sphere1)

      const sphere2 = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 12, 12),
        new THREE.MeshPhysicalMaterial({
          color: 0xff4444,
          roughness: 0.22,
          metalness: 0.45,
          emissive: 0x220000,
          emissiveIntensity: 0.08
        })
      )
      sphere2.position.set(Math.cos(t + Math.PI) * helixRadius, y, Math.sin(t + Math.PI) * helixRadius)
      dnaGroup.add(sphere2)

      if (i % 2 === 0) {
        const bondGeometry = new THREE.CylinderGeometry(0.04, 0.04, helixRadius * 2, 8)
        const bondMaterial = new THREE.MeshStandardMaterial({
          color: 0xcccccc,
          roughness: 0.45,
          transparent: true,
          opacity: 0.85
        })
        const bond = new THREE.Mesh(bondGeometry, bondMaterial)
        bond.position.set(0, y, 0)
        bond.rotation.z = Math.PI / 2
        bond.rotation.y = t
        dnaGroup.add(bond)

        const baseColors = [0xffff00, 0x00ff00, 0xff00ff, 0x00ffff]
        const base1 = new THREE.Mesh(
          new THREE.BoxGeometry(0.15, 0.08, 0.08),
          new THREE.MeshStandardMaterial({
            color: baseColors[i % 4],
            roughness: 0.32,
            metalness: 0.45
          })
        )
        base1.position.set(Math.cos(t) * helixRadius * 0.5, y, Math.sin(t) * helixRadius * 0.5)
        base1.rotation.y = t
        dnaGroup.add(base1)
      }

      if (i > 0) {
        const prevT = ((i - 1) / segments) * Math.PI * 4
        const prevY = ((i - 1) / segments) * helixHeight - helixHeight / 2

        const connector1Geometry = new THREE.CylinderGeometry(0.05, 0.05, 0.15, 8)
        const connector1 = new THREE.Mesh(
          connector1Geometry,
          new THREE.MeshStandardMaterial({ color: 0x4169e1, roughness: 0.32 })
        )
        connector1.position.set(
          (Math.cos(t) * helixRadius + Math.cos(prevT) * helixRadius) / 2,
          (y + prevY) / 2,
          (Math.sin(t) * helixRadius + Math.sin(prevT) * helixRadius) / 2
        )
        connector1.lookAt(new THREE.Vector3(Math.cos(t) * helixRadius, y, Math.sin(t) * helixRadius))
        dnaGroup.add(connector1)
      }
    }

    modelsRef.current.push(dnaGroup)

    // Сердце
    const heartGroup = new THREE.Group()

    const leftVentricle = new THREE.Mesh(
      new THREE.SphereGeometry(0.7, 32, 32),
      new THREE.MeshPhysicalMaterial({
        color: 0xdc143c,
        roughness: 0.36,
        metalness: 0.15,
        clearcoat: 0.15
      })
    )
    leftVentricle.scale.set(1, 1.3, 1)
    leftVentricle.position.set(-0.3, -0.5, 0)
    heartGroup.add(leftVentricle)

    const rightVentricle = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 32, 32),
      new THREE.MeshPhysicalMaterial({
        color: 0xb22222,
        roughness: 0.36,
        metalness: 0.12
      })
    )
    rightVentricle.scale.set(1, 1.2, 1)
    rightVentricle.position.set(0.3, -0.4, 0.1)
    heartGroup.add(rightVentricle)

    const leftAtrium = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, 32, 32),
      new THREE.MeshStandardMaterial({
        color: 0xff6b6b,
        roughness: 0.3,
        metalness: 0.12
      })
    )
    leftAtrium.position.set(-0.4, 0.5, -0.2)
    heartGroup.add(leftAtrium)

    const rightAtrium = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, 32, 32),
      new THREE.MeshStandardMaterial({
        color: 0xcd5c5c,
        roughness: 0.3,
        metalness: 0.12
      })
    )
    rightAtrium.position.set(0.4, 0.5, 0)
    heartGroup.add(rightAtrium)

    const aorta = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.15, 1, 16),
      new THREE.MeshPhysicalMaterial({
        color: 0xff0000,
        roughness: 0.28,
        metalness: 0.25
      })
    )
    aorta.position.set(-0.2, 1.2, -0.1)
    aorta.rotation.z = 0.3
    heartGroup.add(aorta)

    const pulmonaryArtery = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.12, 0.8, 16),
      new THREE.MeshPhysicalMaterial({
        color: 0x4169e1,
        roughness: 0.3,
        metalness: 0.25
      })
    )
    pulmonaryArtery.position.set(0.3, 1.1, 0.1)
    pulmonaryArtery.rotation.z = -0.2
    heartGroup.add(pulmonaryArtery)

    const superiorVenaCava = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.15, 0.6, 16),
      new THREE.MeshStandardMaterial({
        color: 0x000080,
        roughness: 0.3,
        metalness: 0.25
      })
    )
    superiorVenaCava.position.set(0.5, 1, -0.1)
    heartGroup.add(superiorVenaCava)

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2
      const coronary = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 1.5, 8),
        new THREE.MeshPhysicalMaterial({
          color: 0xff6347,
          roughness: 0.22,
          metalness: 0.35
        })
      )
      coronary.position.set(Math.cos(angle) * 0.3, -0.2, Math.sin(angle) * 0.3)
      coronary.rotation.z = angle
      coronary.rotation.x = Math.PI / 4
      heartGroup.add(coronary)
    }

    const mitralValve = new THREE.Mesh(
      new THREE.TorusGeometry(0.15, 0.03, 16, 32),
      new THREE.MeshStandardMaterial({
        color: 0xffd700,
        roughness: 0.18,
        metalness: 0.6
      })
    )
    mitralValve.position.set(-0.3, 0, 0)
    mitralValve.rotation.x = Math.PI / 2
    heartGroup.add(mitralValve)

    heartGroup.scale.set(1.3, 1.3, 1.3)
    modelsRef.current.push(heartGroup)

    // Нейрон
    const neuronGroup = new THREE.Group()

    const soma = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 32, 32),
      new THREE.MeshStandardMaterial({
        color: 0xb19cd9,
        roughness: 0.3,
        metalness: 0.25
      })
    )
    neuronGroup.add(soma)

    const neuronNucleus = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 32, 32),
      new THREE.MeshStandardMaterial({
        color: 0x6a0dad,
        roughness: 0.2,
        metalness: 0.3
      })
    )
    neuronGroup.add(neuronNucleus)

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const dendriteGroup = new THREE.Group()

      const mainDendrite = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.05, 1.2, 8),
        new THREE.MeshStandardMaterial({
          color: 0xdda0dd,
          roughness: 0.36
        })
      )
      mainDendrite.position.y = 0.6
      dendriteGroup.add(mainDendrite)

      for (let j = 0; j < 3; j++) {
        const branch = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.02, 0.6, 8),
          new THREE.MeshStandardMaterial({
            color: 0xe6c9e6,
            roughness: 0.45
          })
        )
        branch.position.set(Math.cos(j) * 0.3, 0.8 + j * 0.15, Math.sin(j) * 0.3)
        branch.rotation.z = (Math.random() - 0.5) * Math.PI / 3
        dendriteGroup.add(branch)

        for (let k = 0; k < 5; k++) {
          const spine = new THREE.Mesh(
            new THREE.SphereGeometry(0.025, 8, 8),
            new THREE.MeshStandardMaterial({
              color: 0xff69b4,
              roughness: 0.32,
              metalness: 0.25
            })
          )
          spine.position.set(
            Math.cos(j) * 0.3 + (Math.random() - 0.5) * 0.1,
            0.8 + j * 0.15 + k * 0.08,
            Math.sin(j) * 0.3 + (Math.random() - 0.5) * 0.1
          )
          dendriteGroup.add(spine)
        }
      }

      dendriteGroup.position.set(Math.cos(angle) * 0.4, 0.1, Math.sin(angle) * 0.4)
      dendriteGroup.rotation.z = -angle
      dendriteGroup.rotation.x = Math.PI / 6
      neuronGroup.add(dendriteGroup)
    }

    const axonSegments = 15
    for (let i = 0; i < axonSegments; i++) {
      const segment = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 0.4, 12),
        new THREE.MeshStandardMaterial({
          color: 0x9370db,
          roughness: 0.3,
          metalness: 0.18
        })
      )
      segment.position.y = -0.7 - i * 0.38
      segment.position.x = Math.sin(i * 0.3) * 0.1
      segment.rotation.z = Math.sin(i * 0.3) * 0.1
      neuronGroup.add(segment)

      if (i % 3 !== 0) {
        const myelin = new THREE.Mesh(
          new THREE.CylinderGeometry(0.15, 0.15, 0.35, 12),
          new THREE.MeshStandardMaterial({
            color: 0xfffafa,
            roughness: 0.22,
            metalness: 0.3
          })
        )
        myelin.position.copy(segment.position)
        myelin.rotation.copy(segment.rotation)
        neuronGroup.add(myelin)
      }
    }

    const terminalY = -0.7 - axonSegments * 0.38
    for (let i = 0; i < 5; i++) {
      const terminal = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 16, 16),
        new THREE.MeshStandardMaterial({
          color: 0xff1493,
          roughness: 0.22,
          metalness: 0.28,
          emissive: 0xff1493,
          emissiveIntensity: 0.15
        })
      )
      const angle = (i / 5) * Math.PI * 2
      terminal.position.set(Math.cos(angle) * 0.3, terminalY - 0.2, Math.sin(angle) * 0.3)
      neuronGroup.add(terminal)

      for (let j = 0; j < 8; j++) {
        const neurotransmitter = new THREE.Mesh(
          new THREE.SphereGeometry(0.03, 8, 8),
          new THREE.MeshStandardMaterial({
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 0.35
          })
        )
        neurotransmitter.position.set(
          Math.cos(angle) * 0.3 + (Math.random() - 0.5) * 0.15,
          terminalY - 0.25 + (Math.random() - 0.5) * 0.1,
          Math.sin(angle) * 0.3 + (Math.random() - 0.5) * 0.15
        )
        neuronGroup.add(neurotransmitter)
      }
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
      sprite.scale.set(0.6, 0.6, 1)
      return sprite
    }

    // H2O
    const h2oGroup = new THREE.Group()

    const oxygen = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 32, 32),
      new THREE.MeshPhysicalMaterial({
        color: 0xff0000,
        roughness: 0.2,
        metalness: 0.6,
        emissive: 0x220000,
        emissiveIntensity: 0.05
      })
    )
    h2oGroup.add(oxygen)

    const oxygenCloud = new THREE.Mesh(
      new THREE.SphereGeometry(0.65, 32, 32),
      new THREE.MeshStandardMaterial({
        color: 0xff6666,
        transparent: true,
        opacity: 0.15,
        roughness: 0.75
      })
    )
    h2oGroup.add(oxygenCloud)

    const hydrogen1 = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 32, 32),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.28,
        metalness: 0.5
      })
    )
    hydrogen1.position.set(0.75, 0.55, 0)
    h2oGroup.add(hydrogen1)

    const h1Cloud = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 32, 32),
      new THREE.MeshStandardMaterial({
        color: 0xdddddd,
        transparent: true,
        opacity: 0.1
      })
    )
    h1Cloud.position.copy(hydrogen1.position)
    h2oGroup.add(h1Cloud)

    const hydrogen2 = hydrogen1.clone()
    hydrogen2.position.set(-0.75, 0.55, 0)
    h2oGroup.add(hydrogen2)

    const h2Cloud = h1Cloud.clone()
    h2Cloud.position.copy(hydrogen2.position)
    h2oGroup.add(h2Cloud)

    const bond1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 1, 16),
      new THREE.MeshStandardMaterial({
        color: 0xaaaaaa,
        roughness: 0.4,
        metalness: 0.6
      })
    )
    bond1.position.set(0.38, 0.28, 0)
    bond1.rotation.z = -Math.PI / 5
    h2oGroup.add(bond1)

    const bond2 = bond1.clone()
    bond2.position.set(-0.38, 0.28, 0)
    bond2.rotation.z = Math.PI / 5
    h2oGroup.add(bond2)

    h2oGroup.add(createAtomLabel('O', new THREE.Vector3(0, -0.7, 0), 0xff0000))
    h2oGroup.add(createAtomLabel('H', new THREE.Vector3(0.75, 0.85, 0), 0xffffff))
    h2oGroup.add(createAtomLabel('H', new THREE.Vector3(-0.75, 0.85, 0), 0xffffff))

    const arrowHelper = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -0.3, 0), 0.8, 0x00ffff, 0.2, 0.15)
    h2oGroup.add(arrowHelper)

    h2oGroup.scale.set(1.5, 1.5, 1.5)
    modelsRef.current.push(h2oGroup)

    // CH4
    const ch4Group = new THREE.Group()
    const carbon = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, 32, 32),
      new THREE.MeshPhysicalMaterial({
        color: 0x1a1a1a,
        roughness: 0.2,
        metalness: 0.8
      })
    )
    ch4Group.add(carbon)

    const carbonCloud = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 32, 32),
      new THREE.MeshStandardMaterial({
        color: 0x444444,
        transparent: true,
        opacity: 0.1
      })
    )
    ch4Group.add(carbonCloud)

    const tetrahedralPositions = [
      new THREE.Vector3(0, 1.2, 0),
      new THREE.Vector3(1.13, -0.4, 0),
      new THREE.Vector3(-0.565, -0.4, 0.98),
      new THREE.Vector3(-0.565, -0.4, -0.98)
    ]

    tetrahedralPositions.forEach((pos) => {
      const h = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 32, 32),
        new THREE.MeshStandardMaterial({
          color: 0xf5f5f5,
          roughness: 0.3,
          metalness: 0.5
        })
      )
      h.position.copy(pos)
      ch4Group.add(h)

      const hCloud = new THREE.Mesh(
        new THREE.SphereGeometry(0.38, 32, 32),
        new THREE.MeshStandardMaterial({
          color: 0xeeeeee,
          transparent: true,
          opacity: 0.1
        })
      )
      hCloud.position.copy(pos)
      ch4Group.add(hCloud)

      const bondLength = pos.length()
      const bond = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, bondLength - 0.7, 16),
        new THREE.MeshStandardMaterial({
          color: 0x888888,
          roughness: 0.4,
          metalness: 0.6
        })
      )
      bond.position.copy(pos.clone().multiplyScalar(0.5))
      bond.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize())
      ch4Group.add(bond)

      ch4Group.add(createAtomLabel('H', pos.clone().add(pos.clone().normalize().multiplyScalar(0.3)), 0xffffff))
    })

    ch4Group.add(createAtomLabel('C', new THREE.Vector3(0, -0.6, 0), 0x1a1a1a))
    ch4Group.scale.set(1.2, 1.2, 1.2)
    modelsRef.current.push(ch4Group)

    // CO2
    const co2Group = new THREE.Group()
    const carbonCO2 = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, 32, 32),
      new THREE.MeshPhysicalMaterial({ color: 0x2a2a2a, roughness: 0.2, metalness: 0.8 })
    )
    co2Group.add(carbonCO2)

    const oxygen1 = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 32, 32),
      new THREE.MeshPhysicalMaterial({ color: 0xff3333, roughness: 0.22, metalness: 0.7, emissive: 0x220000, emissiveIntensity: 0.05 })
    )
    oxygen1.position.x = 1.4
    co2Group.add(oxygen1)

    const oxygen2 = oxygen1.clone()
    oxygen2.position.x = -1.4
    co2Group.add(oxygen2)

    for (let i = 0; i < 2; i++) {
      const offset = i === 0 ? 0.08 : -0.08
      const bond1 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.045, 0.95, 16),
        new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.3, metalness: 0.7 })
      )
      bond1.position.set(0.7, 0, offset)
      bond1.rotation.z = Math.PI / 2
      co2Group.add(bond1)

      const bond2 = bond1.clone()
      bond2.position.set(-0.7, 0, offset)
      bond2.rotation.z = Math.PI / 2
      co2Group.add(bond2)
    }

    ;[oxygen1, oxygen2].forEach(o => {
      const cloud = new THREE.Mesh(
        new THREE.SphereGeometry(0.6, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0xff6666, transparent: true, opacity: 0.1 })
      )
      cloud.position.copy(o.position)
      co2Group.add(cloud)
    })

    co2Group.add(createAtomLabel('C', new THREE.Vector3(0, -0.6, 0), 0x2a2a2a))
    co2Group.add(createAtomLabel('O', new THREE.Vector3(1.4, -0.6, 0), 0xff0000))
    co2Group.add(createAtomLabel('O', new THREE.Vector3(-1.4, -0.6, 0), 0xff0000))
    co2Group.scale.set(1.3, 1.3, 1.3)
    modelsRef.current.push(co2Group)

    // NaCl lattice
    const naclGroup = new THREE.Group()
    const latticeSize = 2
    const spacing = 0.7

    for (let x = -latticeSize; x <= latticeSize; x++) {
      for (let y = -latticeSize; y <= latticeSize; y++) {
        for (let z = -latticeSize; z <= latticeSize; z++) {
          const isNa = (x + y + z) % 2 === 0
          const atom = new THREE.Mesh(
            new THREE.SphereGeometry(isNa ? 0.25 : 0.22, 16, 16),
            new THREE.MeshStandardMaterial({
              color: isNa ? 0x9370db : 0x32cd32,
              roughness: 0.2,
              metalness: isNa ? 0.6 : 0.3,
              emissive: isNa ? 0x402040 : 0x103010,
              emissiveIntensity: 0.08
            })
          )
          atom.position.set(x * spacing, y * spacing, z * spacing)
          naclGroup.add(atom)

          const ionCloud = new THREE.Mesh(
            new THREE.SphereGeometry(isNa ? 0.35 : 0.38, 16, 16),
            new THREE.MeshStandardMaterial({ color: isNa ? 0xb19cd9 : 0x90ee90, transparent: true, opacity: 0.08 })
          )
          ionCloud.position.copy(atom.position)
          naclGroup.add(ionCloud)

          if (x < latticeSize) {
            const bond = new THREE.Mesh(
              new THREE.CylinderGeometry(0.03, 0.03, spacing, 8),
              new THREE.MeshStandardMaterial({ color: 0x666666, transparent: true, opacity: 0.4 })
            )
            bond.position.set((x + 0.5) * spacing, y * spacing, z * spacing)
            bond.rotation.z = Math.PI / 2
            naclGroup.add(bond)
          }
        }
      }
    }

    const edgesGeometry = new THREE.BoxGeometry(
      latticeSize * 2 * spacing + 0.1,
      latticeSize * 2 * spacing + 0.1,
      latticeSize * 2 * spacing + 0.1
    )
    const edges = new THREE.EdgesGeometry(edgesGeometry)
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.3, transparent: true }))
    naclGroup.add(line)

    modelsRef.current.push(naclGroup)
  }

  const createPhysicsModels = () => {
    const circuitGroup = new THREE.Group()

    const battery = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 1, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x1f1f1f, roughness: 0.25 })
    )
    battery.position.set(-1.5, 0, 0)
    circuitGroup.add(battery)

    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xffe39f, emissiveIntensity: 0.6 })
    )
    bulb.position.set(1.5, 0, 0)
    circuitGroup.add(bulb)

    const wire1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 3),
      new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.2 })
    )
    wire1.rotation.z = Math.PI / 2
    wire1.position.y = 1
    circuitGroup.add(wire1)

    const wire2 = wire1.clone()
    wire2.material = wire1.material.clone()
    ;(wire2.material as THREE.Material).needsUpdate = true
    wire2.rotation.z = Math.PI / 2
    wire2.position.y = -1
    wire2.material = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2 })
    circuitGroup.add(wire2)

    modelsRef.current.push(circuitGroup)

    // Магнит
    const magnetGroup = new THREE.Group()
    const magnetN = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1.5, 0.5),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.25 })
    )
    magnetN.position.x = 0.5
    magnetGroup.add(magnetN)

    const magnetS = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1.5, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.25 })
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

    // Волна (линия + точки)
    const waveGroup = new THREE.Group()
    const waveGeometry = new THREE.BufferGeometry()
    const wavePositions: number[] = []
    for (let i = 0; i <= 100; i++) {
      const x = (i / 100) * 4 - 2
      const y = Math.sin(i / 10) * 0.5
      wavePositions.push(x, y, 0)
    }
    waveGeometry.setAttribute('position', new THREE.Float32BufferAttribute(wavePositions, 3))
    const waveLine = new THREE.Line(waveGeometry, new THREE.LineBasicMaterial({ color: 0x3b82f6, linewidth: 3 }))
    waveGroup.add(waveLine)

    for (let i = 0; i <= 100; i += 10) {
      const x = (i / 100) * 4 - 2
      const y = Math.sin(i / 10) * 0.5
      const point = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 })
      )
      point.position.set(x, y, 0)
      waveGroup.add(point)
    }

    modelsRef.current.push(waveGroup)

    // Атом
    const atomGroup = new THREE.Group()
    const nucleus = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.25 })
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
        new THREE.MeshBasicMaterial({ color: 0x666666, transparent: true, opacity: 0.25 })
      )
      orbitMesh.rotation.x = Math.PI / 2 + orbitIndex * 0.3
      orbitMesh.rotation.y = orbitIndex * 0.5
      atomGroup.add(orbitMesh)

      for (let i = 0; i < orbit.electrons; i++) {
        const angle = (i / orbit.electrons) * Math.PI * 2
        const electron = new THREE.Mesh(
          new THREE.SphereGeometry(0.1, 16, 16),
          new THREE.MeshStandardMaterial({ color: orbit.color, roughness: 0.2 })
        )
        electron.position.set(Math.cos(angle) * orbit.radius, 0, Math.sin(angle) * orbit.radius)
        ;(electron as any).userData = { orbit: orbit.radius, angle: angle, speed: 0.02 * (orbitIndex + 1) }
        atomGroup.add(electron)
      }
    })

    modelsRef.current.push(atomGroup)
  }

  const animateModel = (model: THREE.Object3D, index: number, subj: string) => {
    // базовое вращение
    model.rotation.y += 0.006

    if (subj === 'biology') {
      if (index === 1) { // ДНК — плавный скручиватель
        model.rotation.y += 0.012
        model.position.y = Math.sin(Date.now() * 0.001) * 0.03
      } else if (index === 2) { // Сердце — биение
        const scale = 1 + Math.sin(Date.now() * 0.004) * 0.055
        model.scale.set(scale, scale, scale)
      }
    } else if (subj === 'physics') {
      if (index === 2) { // Волна — точки подпрыгивают
        const time = Date.now() * 0.0012
        model.children.forEach((child, i) => {
          if ((child as THREE.Mesh).geometry?.type === 'SphereGeometry') {
            const originalY = Math.sin(i / 10) * 0.5
            ;(child as THREE.Mesh).position.y = originalY + Math.sin(time * 2 + i / 10) * 0.18
          }
        })
      } else if (index === 3) { // Атом — электроны вращаются
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
    </div>
  )
}

export default Gallery3D
