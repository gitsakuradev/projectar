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
      createGeometryModels()
    } else if (subject === 'biology') {
      createBiologyModels()
    } else if (subject === 'chemistry') {
      createChemistryModels()
    } else if (subject === 'physics') {
      createPhysicsModels()
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

  const createGeometryModels = () => {
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

  const createBiologyModels = () => {
    // Модель 1: Детализированная клетка
    const cellGroup = new THREE.Group()
    
    // Клеточная мембрана (двойной слой)
    const cellBody = new THREE.Mesh(
      new THREE.SphereGeometry(1.5, 64, 64),
      new THREE.MeshStandardMaterial({ 
        color: 0x90ee90,
        transparent: true,
        opacity: 0.4,
        roughness: 0.3,
        metalness: 0.1
      })
    )
    cellGroup.add(cellBody)

    // Внутренняя мембрана
    const innerMembrane = new THREE.Mesh(
      new THREE.SphereGeometry(1.45, 64, 64),
      new THREE.MeshStandardMaterial({ 
        color: 0x7cfc00,
        transparent: true,
        opacity: 0.2,
        roughness: 0.4
      })
    )
    cellGroup.add(innerMembrane)

    // Ядро с двойной оболочкой
    const nucleus = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 32, 32),
      new THREE.MeshStandardMaterial({ 
        color: 0x8b4789,
        roughness: 0.2,
        metalness: 0.3
      })
    )
    nucleus.position.set(0, 0, 0)
    cellGroup.add(nucleus)

    // Ядрышко
    const nucleolus = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 16, 16),
      new THREE.MeshStandardMaterial({ 
        color: 0x4b0082,
        roughness: 0.1,
        metalness: 0.5
      })
    )
    nucleolus.position.set(0.2, 0.1, 0)
    cellGroup.add(nucleolus)

    // Митохондрии (энергетические станции) - 8 штук
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const radius = 1
      const mitoGroup = new THREE.Group()
      
      const mitoBody = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.12, 0.35, 8, 16),
        new THREE.MeshStandardMaterial({ 
          color: 0xff6b6b,
          roughness: 0.3,
          metalness: 0.4
        })
      )
      mitoGroup.add(mitoBody)

      // Внутренние складки митохондрий
      for (let j = 0; j < 4; j++) {
        const fold = new THREE.Mesh(
          new THREE.PlaneGeometry(0.15, 0.08),
          new THREE.MeshStandardMaterial({ 
            color: 0xcc5555,
            side: THREE.DoubleSide,
            roughness: 0.4
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

    // Эндоплазматический ретикулум (складки)
    for (let i = 0; i < 15; i++) {
      const erSegment = new THREE.Mesh(
        new THREE.TorusGeometry(0.15 + i * 0.05, 0.02, 8, 16),
        new THREE.MeshStandardMaterial({ 
          color: 0x87ceeb,
          roughness: 0.5,
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

    // Рибосомы (маленькие точки)
    for (let i = 0; i < 40; i++) {
      const ribosome = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 8, 8),
        new THREE.MeshStandardMaterial({ 
          color: 0xffd700,
          roughness: 0.3,
          metalness: 0.6
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

    // Аппарат Гольджи (стопка дисков)
    const golgiGroup = new THREE.Group()
    for (let i = 0; i < 6; i++) {
      const disc = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.25, 0.03, 32),
        new THREE.MeshStandardMaterial({ 
          color: 0xffa500,
          roughness: 0.4,
          metalness: 0.3
        })
      )
      disc.position.y = i * 0.08 - 0.24
      golgiGroup.add(disc)
    }
    golgiGroup.position.set(0.7, -0.3, 0.5)
    cellGroup.add(golgiGroup)

    modelsRef.current.push(cellGroup)

    // Модель 2: Детализированная ДНК
    const dnaGroup = new THREE.Group()
    const segments = 80
    const helixRadius = 0.6
    const helixHeight = 5
    
    for (let i = 0; i < segments; i++) {
      const t = (i / segments) * Math.PI * 4
      const y = (i / segments) * helixHeight - helixHeight / 2

      // Первая нить (синяя)
      const sphere1 = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 16, 16),
        new THREE.MeshStandardMaterial({ 
          color: 0x4169e1,
          roughness: 0.2,
          metalness: 0.6,
          emissive: 0x4169e1,
          emissiveIntensity: 0.2
        })
      )
      sphere1.position.set(
        Math.cos(t) * helixRadius,
        y,
        Math.sin(t) * helixRadius
      )
      dnaGroup.add(sphere1)

      // Вторая нить (красная)
      const sphere2 = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 16, 16),
        new THREE.MeshStandardMaterial({ 
          color: 0xff4444,
          roughness: 0.2,
          metalness: 0.6,
          emissive: 0xff4444,
          emissiveIntensity: 0.2
        })
      )
      sphere2.position.set(
        Math.cos(t + Math.PI) * helixRadius,
        y,
        Math.sin(t + Math.PI) * helixRadius
      )
      dnaGroup.add(sphere2)

      // Связи между нитями (водородные мостики)
      if (i % 2 === 0) {
        const bondGeometry = new THREE.CylinderGeometry(0.04, 0.04, helixRadius * 2, 8)
        const bondMaterial = new THREE.MeshStandardMaterial({ 
          color: 0xcccccc,
          roughness: 0.5,
          transparent: true,
          opacity: 0.8
        })
        const bond = new THREE.Mesh(bondGeometry, bondMaterial)
        bond.position.set(0, y, 0)
        bond.rotation.z = Math.PI / 2
        bond.rotation.y = t
        dnaGroup.add(bond)

        // Азотистые основания (разноцветные)
        const baseColors = [0xffff00, 0x00ff00, 0xff00ff, 0x00ffff]
        const base1 = new THREE.Mesh(
          new THREE.BoxGeometry(0.15, 0.08, 0.08),
          new THREE.MeshStandardMaterial({ 
            color: baseColors[i % 4],
            roughness: 0.3,
            metalness: 0.5
          })
        )
        base1.position.set(
          Math.cos(t) * helixRadius * 0.5,
          y,
          Math.sin(t) * helixRadius * 0.5
        )
        base1.rotation.y = t
        dnaGroup.add(base1)
      }

      // Соединения в нити
      if (i > 0) {
        const prevT = ((i - 1) / segments) * Math.PI * 4
        const prevY = ((i - 1) / segments) * helixHeight - helixHeight / 2
        
        const connector1Geometry = new THREE.CylinderGeometry(0.05, 0.05, 0.15, 8)
        const connector1 = new THREE.Mesh(
          connector1Geometry,
          new THREE.MeshStandardMaterial({ color: 0x4169e1, roughness: 0.3 })
        )
        connector1.position.set(
          (Math.cos(t) * helixRadius + Math.cos(prevT) * helixRadius) / 2,
          (y + prevY) / 2,
          (Math.sin(t) * helixRadius + Math.sin(prevT) * helixRadius) / 2
        )
        connector1.lookAt(new THREE.Vector3(
          Math.cos(t) * helixRadius,
          y,
          Math.sin(t) * helixRadius
        ))
        dnaGroup.add(connector1)
      }
    }

    modelsRef.current.push(dnaGroup)

    // Модель 3: Анатомическое сердце
    const heartGroup = new THREE.Group()
    
    // Левый желудочек (большая нижняя камера)
    const leftVentricle = new THREE.Mesh(
      new THREE.SphereGeometry(0.7, 32, 32),
      new THREE.MeshStandardMaterial({ 
        color: 0xdc143c,
        roughness: 0.4,
        metalness: 0.2
      })
    )
    leftVentricle.scale.set(1, 1.3, 1)
    leftVentricle.position.set(-0.3, -0.5, 0)
    heartGroup.add(leftVentricle)

    // Правый желудочек
    const rightVentricle = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 32, 32),
      new THREE.MeshStandardMaterial({ 
        color: 0xb22222,
        roughness: 0.4,
        metalness: 0.2
      })
    )
    rightVentricle.scale.set(1, 1.2, 1)
    rightVentricle.position.set(0.3, -0.4, 0.1)
    heartGroup.add(rightVentricle)

    // Левое предсердие
    const leftAtrium = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, 32, 32),
      new THREE.MeshStandardMaterial({ 
        color: 0xff6b6b,
        roughness: 0.3,
        metalness: 0.2
      })
    )
    leftAtrium.position.set(-0.4, 0.5, -0.2)
    heartGroup.add(leftAtrium)

    // Правое предсердие
    const rightAtrium = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, 32, 32),
      new THREE.MeshStandardMaterial({ 
        color: 0xcd5c5c,
        roughness: 0.3,
        metalness: 0.2
      })
    )
    rightAtrium.position.set(0.4, 0.5, 0)
    heartGroup.add(rightAtrium)

    // Аорта (главная артерия)
    const aorta = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.15, 1, 16),
      new THREE.MeshStandardMaterial({ 
        color: 0xff0000,
        roughness: 0.3,
        metalness: 0.3
      })
    )
    aorta.position.set(-0.2, 1.2, -0.1)
    aorta.rotation.z = 0.3
    heartGroup.add(aorta)

    // Лёгочная артерия
    const pulmonaryArtery = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.12, 0.8, 16),
      new THREE.MeshStandardMaterial({ 
        color: 0x4169e1,
        roughness: 0.3,
        metalness: 0.3
      })
    )
    pulmonaryArtery.position.set(0.3, 1.1, 0.1)
    pulmonaryArtery.rotation.z = -0.2
    heartGroup.add(pulmonaryArtery)

    // Вены (полые вены)
    const superiorVenaCava = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.15, 0.6, 16),
      new THREE.MeshStandardMaterial({ 
        color: 0x000080,
        roughness: 0.3,
        metalness: 0.3
      })
    )
    superiorVenaCava.position.set(0.5, 1, -0.1)
    heartGroup.add(superiorVenaCava)

    // Коронарные артерии (на поверхности)
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2
      const coronary = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 1.5, 8),
        new THREE.MeshStandardMaterial({ 
          color: 0xff6347,
          roughness: 0.2,
          metalness: 0.4
        })
      )
      coronary.position.set(
        Math.cos(angle) * 0.3,
        -0.2,
        Math.sin(angle) * 0.3
      )
      coronary.rotation.z = angle
      coronary.rotation.x = Math.PI / 4
      heartGroup.add(coronary)
    }

    // Клапаны (визуализация)
    const mitralValve = new THREE.Mesh(
      new THREE.TorusGeometry(0.15, 0.03, 16, 32),
      new THREE.MeshStandardMaterial({ 
        color: 0xffd700,
        roughness: 0.2,
        metalness: 0.6
      })
    )
    mitralValve.position.set(-0.3, 0, 0)
    mitralValve.rotation.x = Math.PI / 2
    heartGroup.add(mitralValve)

    heartGroup.scale.set(1.3, 1.3, 1.3)
    modelsRef.current.push(heartGroup)

    // Модель 4: Детальный нейрон
    const neuronGroup = new THREE.Group()
    
    // Тело клетки (сома)
    const soma = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 32, 32),
      new THREE.MeshStandardMaterial({ 
        color: 0xb19cd9,
        roughness: 0.3,
        metalness: 0.3
      })
    )
    neuronGroup.add(soma)

    // Ядро в соме
    const neuronNucleus = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 32, 32),
      new THREE.MeshStandardMaterial({ 
        color: 0x6a0dad,
        roughness: 0.2,
        metalness: 0.4
      })
    )
    neuronGroup.add(neuronNucleus)

    // Дендриты (входные отростки) - разветвлённые
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const dendriteGroup = new THREE.Group()
      
      // Главный дендрит
      const mainDendrite = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.05, 1.2, 8),
        new THREE.MeshStandardMaterial({ 
          color: 0xdda0dd,
          roughness: 0.4
        })
      )
      mainDendrite.position.y = 0.6
      dendriteGroup.add(mainDendrite)

      // Ветвления дендрита
      for (let j = 0; j < 3; j++) {
        const branch = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.02, 0.6, 8),
          new THREE.MeshStandardMaterial({ 
            color: 0xe6c9e6,
            roughness: 0.5
          })
        )
        branch.position.set(
          Math.cos(j) * 0.3,
          0.8 + j * 0.15,
          Math.sin(j) * 0.3
        )
        branch.rotation.z = (Math.random() - 0.5) * Math.PI / 3
        dendriteGroup.add(branch)

        // Мелкие шипики на ветвлениях
        for (let k = 0; k < 5; k++) {
          const spine = new THREE.Mesh(
            new THREE.SphereGeometry(0.025, 8, 8),
            new THREE.MeshStandardMaterial({ 
              color: 0xff69b4,
              roughness: 0.3,
              metalness: 0.5
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

      dendriteGroup.position.set(
        Math.cos(angle) * 0.4,
        0.1,
        Math.sin(angle) * 0.4
      )
      dendriteGroup.rotation.z = -angle
      dendriteGroup.rotation.x = Math.PI / 6
      neuronGroup.add(dendriteGroup)
    }

    // Аксон (длинный выходной отросток)
    const axonSegments = 15
    for (let i = 0; i < axonSegments; i++) {
      const segment = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 0.4, 12),
        new THREE.MeshStandardMaterial({ 
          color: 0x9370db,
          roughness: 0.3,
          metalness: 0.2
        })
      )
      segment.position.y = -0.7 - i * 0.38
      segment.position.x = Math.sin(i * 0.3) * 0.1
      segment.rotation.z = Math.sin(i * 0.3) * 0.1
      neuronGroup.add(segment)

      // Миелиновая оболочка (белая изоляция)
      if (i % 3 !== 0) {
        const myelin = new THREE.Mesh(
          new THREE.CylinderGeometry(0.15, 0.15, 0.35, 12),
          new THREE.MeshStandardMaterial({ 
            color: 0xfffafa,
            roughness: 0.2,
            metalness: 0.4
          })
        )
        myelin.position.copy(segment.position)
        myelin.rotation.copy(segment.rotation)
        neuronGroup.add(myelin)
      }
    }

    // Терминальные окончания (синапсы)
    const terminalY = -0.7 - axonSegments * 0.38
    for (let i = 0; i < 5; i++) {
      const terminal = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 16, 16),
        new THREE.MeshStandardMaterial({ 
          color: 0xff1493,
          roughness: 0.2,
          metalness: 0.5,
          emissive: 0xff1493,
          emissiveIntensity: 0.3
        })
      )
      const angle = (i / 5) * Math.PI * 2
      terminal.position.set(
        Math.cos(angle) * 0.3,
        terminalY - 0.2,
        Math.sin(angle) * 0.3
      )
      neuronGroup.add(terminal)

      // Нейромедиаторы (маленькие точки)
      for (let j = 0; j < 8; j++) {
        const neurotransmitter = new THREE.Mesh(
          new THREE.SphereGeometry(0.03, 8, 8),
          new THREE.MeshStandardMaterial({ 
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 0.5
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
    // Модель 1: Детальная молекула H2O
    const h2oGroup = new THREE.Group()
    
    // Кислород (большой красный)
    const oxygen = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 32, 32),
      new THREE.MeshStandardMaterial({ 
        color: 0xff0000,
        roughness: 0.2,
        metalness: 0.7,
        emissive: 0xff0000,
        emissiveIntensity: 0.1
      })
    )
    h2oGroup.add(oxygen)

    // Электронное облако кислорода
    const oxygenCloud = new THREE.Mesh(
      new THREE.SphereGeometry(0.65, 32, 32),
      new THREE.MeshStandardMaterial({ 
        color: 0xff6666,
        transparent: true,
        opacity: 0.15,
        roughness: 0.8
      })
    )
    h2oGroup.add(oxygenCloud)

    // Водород 1 (маленький белый)
    const hydrogen1 = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 32, 32),
      new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        roughness: 0.3,
        metalness: 0.6
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

    // Водород 2
    const hydrogen2 = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 32, 32),
      new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        roughness: 0.3,
        metalness: 0.6
      })
    )
    hydrogen2.position.set(-0.75, 0.55, 0)
    h2oGroup.add(hydrogen2)

    const h2Cloud = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 32, 32),
      new THREE.MeshStandardMaterial({ 
        color: 0xdddddd,
        transparent: true,
        opacity: 0.1
      })
    )
    h2Cloud.position.copy(hydrogen2.position)
    h2oGroup.add(h2Cloud)

    // Ковалентные связи (двойные цилиндры)
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

    const bond2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 1, 16),
      new THREE.MeshStandardMaterial({ 
        color: 0xaaaaaa,
        roughness: 0.4,
        metalness: 0.6
      })
    )
    bond2.position.set(-0.38, 0.28, 0)
    bond2.rotation.z = Math.PI / 5
    h2oGroup.add(bond2)

    // Метки атомов
    const createAtomLabel = (text: string, position: THREE.Vector3, color: number) => {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      if (context) {
        canvas.width = 128
        canvas.height = 128
        context.fillStyle = `#${color.toString(16).padStart(6, '0')}`
        context.font = 'Bold 60px Arial'
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        context.fillText(text, 64, 64)
      }
      const texture = new THREE.CanvasTexture(canvas)
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture })
      const sprite = new THREE.Sprite(spriteMaterial)
      sprite.position.copy(position)
      sprite.scale.set(0.5, 0.5, 1)
      return sprite
    }

    h2oGroup.add(createAtomLabel('O', new THREE.Vector3(0, -0.7, 0), 0xff0000))
    h2oGroup.add(createAtomLabel('H', new THREE.Vector3(0.75, 0.85, 0), 0xffffff))
    h2oGroup.add(createAtomLabel('H', new THREE.Vector3(-0.75, 0.85, 0), 0xffffff))

    // Диполь (стрелка)
    const arrowHelper = new THREE.ArrowHelper(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, -0.3, 0),
      0.8,
      0x00ffff,
      0.2,
      0.15
    )
    h2oGroup.add(arrowHelper)

    h2oGroup.scale.set(1.5, 1.5, 1.5)
    modelsRef.current.push(h2oGroup)

    // Модель 2: CH4 (метан) - тетраэдр
    const ch4Group = new THREE.Group()
    
    // Углерод (чёрный)
    const carbon = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, 32, 32),
      new THREE.MeshStandardMaterial({ 
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

    // 4 атома водорода в тетраэдрической геометрии
    const tetrahedralPositions = [
      new THREE.Vector3(0, 1.2, 0),
      new THREE.Vector3(1.13, -0.4, 0),
      new THREE.Vector3(-0.565, -0.4, 0.98),
      new THREE.Vector3(-0.565, -0.4, -0.98)
    ]

    tetrahedralPositions.forEach((pos, _index) => {
      // Водород
      const h = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 32, 32),
        new THREE.MeshStandardMaterial({ 
          color: 0xf5f5f5,
          roughness: 0.3,
          metalness: 0.6
        })
      )
      h.position.copy(pos)
      ch4Group.add(h)

      // Облако
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

      // Связь C-H
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
      bond.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        pos.clone().normalize()
      )
      ch4Group.add(bond)

      // Метка H
      ch4Group.add(createAtomLabel('H', pos.clone().add(pos.clone().normalize().multiplyScalar(0.3)), 0xffffff))
    })

    // Метка C
    ch4Group.add(createAtomLabel('C', new THREE.Vector3(0, -0.6, 0), 0x1a1a1a))

    ch4Group.scale.set(1.2, 1.2, 1.2)
    modelsRef.current.push(ch4Group)

    // Модель 3: CO2 (углекислый газ) - линейная
    const co2Group = new THREE.Group()
    
    // Углерод (центр)
    const carbonCO2 = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, 32, 32),
      new THREE.MeshStandardMaterial({ 
        color: 0x2a2a2a,
        roughness: 0.2,
        metalness: 0.8
      })
    )
    co2Group.add(carbonCO2)

    // Два атома кислорода
    const oxygen1 = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 32, 32),
      new THREE.MeshStandardMaterial({ 
        color: 0xff3333,
        roughness: 0.2,
        metalness: 0.7,
        emissive: 0xff0000,
        emissiveIntensity: 0.1
      })
    )
    oxygen1.position.x = 1.4
    co2Group.add(oxygen1)

    const oxygen2 = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 32, 32),
      new THREE.MeshStandardMaterial({ 
        color: 0xff3333,
        roughness: 0.2,
        metalness: 0.7,
        emissive: 0xff0000,
        emissiveIntensity: 0.1
      })
    )
    oxygen2.position.x = -1.4
    co2Group.add(oxygen2)

    // Двойные связи C=O (две линии)
    for (let i = 0; i < 2; i++) {
      const offset = i === 0 ? 0.08 : -0.08
      
      const bond1 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.045, 0.95, 16),
        new THREE.MeshStandardMaterial({ 
          color: 0x999999,
          roughness: 0.3,
          metalness: 0.7
        })
      )
      bond1.position.set(0.7, 0, offset)
      bond1.rotation.z = Math.PI / 2
      co2Group.add(bond1)

      const bond2 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.045, 0.95, 16),
        new THREE.MeshStandardMaterial({ 
          color: 0x999999,
          roughness: 0.3,
          metalness: 0.7
        })
      )
      bond2.position.set(-0.7, 0, offset)
      bond2.rotation.z = Math.PI / 2
      co2Group.add(bond2)
    }

    // Электронные облака
    [oxygen1, oxygen2].forEach(o => {
      const cloud = new THREE.Mesh(
        new THREE.SphereGeometry(0.6, 32, 32),
        new THREE.MeshStandardMaterial({ 
          color: 0xff6666,
          transparent: true,
          opacity: 0.1
        })
      )
      cloud.position.copy(o.position)
      co2Group.add(cloud)
    })

    // Метки
    co2Group.add(createAtomLabel('C', new THREE.Vector3(0, -0.6, 0), 0x2a2a2a))
    co2Group.add(createAtomLabel('O', new THREE.Vector3(1.4, -0.6, 0), 0xff0000))
    co2Group.add(createAtomLabel('O', new THREE.Vector3(-1.4, -0.6, 0), 0xff0000))

    co2Group.scale.set(1.3, 1.3, 1.3)
    modelsRef.current.push(co2Group)

    // Модель 4: NaCl (кристаллическая решётка)
    const naclGroup = new THREE.Group()
    
    const latticeSize = 3
    const spacing = 0.7

    for (let x = -latticeSize; x <= latticeSize; x++) {
      for (let y = -latticeSize; y <= latticeSize; y++) {
        for (let z = -latticeSize; z <= latticeSize; z++) {
          const isNa = (x + y + z) % 2 === 0
          
          // Атомы
          const atom = new THREE.Mesh(
            new THREE.SphereGeometry(isNa ? 0.25 : 0.22, 32, 32),
            new THREE.MeshStandardMaterial({ 
              color: isNa ? 0x9370db : 0x32cd32,
              roughness: 0.2,
              metalness: isNa ? 0.8 : 0.6,
              emissive: isNa ? 0x9370db : 0x32cd32,
              emissiveIntensity: 0.2
            })
          )
          atom.position.set(x * spacing, y * spacing, z * spacing)
          naclGroup.add(atom)

          // Ионное облако
          const ionCloud = new THREE.Mesh(
            new THREE.SphereGeometry(isNa ? 0.35 : 0.38, 32, 32),
            new THREE.MeshStandardMaterial({ 
              color: isNa ? 0xb19cd9 : 0x90ee90,
              transparent: true,
              opacity: 0.08
            })
          )
          ionCloud.position.copy(atom.position)
          naclGroup.add(ionCloud)

          // Связи (только для видимых соединений)
          if (x < latticeSize) {
            const bond = new THREE.Mesh(
              new THREE.CylinderGeometry(0.03, 0.03, spacing, 8),
              new THREE.MeshStandardMaterial({ 
                color: 0x666666,
                transparent: true,
                opacity: 0.4
              })
            )
            bond.position.set((x + 0.5) * spacing, y * spacing, z * spacing)
            bond.rotation.z = Math.PI / 2
            naclGroup.add(bond)
          }
        }
      }
    }

    // Рамка решётки
    const edgesGeometry = new THREE.BoxGeometry(
      latticeSize * 2 * spacing + 0.1,
      latticeSize * 2 * spacing + 0.1,
      latticeSize * 2 * spacing + 0.1
    )
    const edges = new THREE.EdgesGeometry(edgesGeometry)
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.3, transparent: true })
    )
    naclGroup.add(line)

    modelsRef.current.push(naclGroup)
  }

  const createPhysicsModels = () => {
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

  const animateModel = (model: THREE.Object3D, _index: number, subj: string) => {
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
