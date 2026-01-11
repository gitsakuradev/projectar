import React, { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

// Расширяем JSX для A-Frame элементов
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'a-scene': any
      'a-marker': any
      'a-entity': any
      'a-box': any
      'a-sphere': any
      'a-cylinder': any
      'a-cone': any
      'a-torus': any
      'a-dodecahedron': any
    }
  }
}

interface MarkerConfig {
  id: string | number
  type: 'hiro' | 'kanji' | 'pattern'
  patternUrl?: string // Для кастомных маркеров
  model: string
  color: string
  name: string
  isCustom?: boolean
}

const ARScanner: React.FC = () => {
  const { subject = 'geometry' } = useParams()
  const [arReady, setArReady] = useState(false)
  const [error, setError] = useState('')
  const [showCustomModal, setShowCustomModal] = useState(false)
  
  // Состояние для списка маркеров (стандартные + пользовательские)
  const [activeMarkers, setActiveMarkers] = useState<MarkerConfig[]>([])

  // Refs
  const sceneRef = useRef<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedCustomModel, setSelectedCustomModel] = useState('box')

  // База данных предметов
  const subjectData: Record<string, any> = {
    geometry: {
      name: 'Геометрия',
      emoji: '📐',
      color: '#667eea',
      markers: [
        { id: 'geo1', type: 'hiro', model: 'box', color: '#667eea', name: 'Куб' },
        { id: 'geo2', type: 'kanji', model: 'cone', color: '#22c55e', name: 'Пирамида' },
      ]
    },
    biology: {
      name: 'Биология',
      emoji: '🧬',
      color: '#22c55e',
      markers: [
        { id: 'bio1', type: 'hiro', model: 'sphere', color: '#ff6b9d', name: 'Клетка' },
        { id: 'bio2', type: 'kanji', model: 'torus', color: '#4ecdc4', name: 'ДНК' },
      ]
    },
    chemistry: {
      name: 'Химия',
      emoji: '⚗️',
      color: '#f59e0b',
      markers: [
        { id: 'chem1', type: 'hiro', model: 'sphere', color: '#00bfff', name: 'H₂O' },
        { id: 'chem2', type: 'kanji', model: 'box', color: '#ff6347', name: 'CH₄' },
      ]
    },
    physics: {
      name: 'Физика',
      emoji: '⚡',
      color: '#ec4899',
      markers: [
        { id: 'phys1', type: 'hiro', model: 'torus', color: '#ffd700', name: 'Цепь' },
        { id: 'phys2', type: 'kanji', model: 'cylinder', color: '#ff1493', name: 'Магнит' },
      ]
    }
  }

  const currentSubject = subjectData[subject] || subjectData.geometry

  // 1. Инициализация A-Frame компонентов для жестов (Вращение/Зум)
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).AFRAME) {
      const AFRAME = (window as any).AFRAME

      // Компонент детектора жестов (основа)
      if (!AFRAME.components['gesture-detector']) {
        AFRAME.registerComponent('gesture-detector', {
          schema: { element: { default: '' } },
          init: function() {
            this.targetElement = this.data.element && document.querySelector(this.data.element)
            if (!this.targetElement) this.targetElement = this.el
            this.internalState = { previousState: null }
            this.emitGestureEvent = this.emitGestureEvent.bind(this)
            this.targetElement.addEventListener('touchstart', this.emitGestureEvent)
            this.targetElement.addEventListener('touchend', this.emitGestureEvent)
            this.targetElement.addEventListener('touchmove', this.emitGestureEvent)
          },
          remove: function() {
            this.targetElement.removeEventListener('touchstart', this.emitGestureEvent)
            this.targetElement.removeEventListener('touchend', this.emitGestureEvent)
            this.targetElement.removeEventListener('touchmove', this.emitGestureEvent)
          },
          emitGestureEvent: function(event: any) {
            const currentState = this.getTouchState(event)
            const previousState = this.internalState.previousState
            const gestureContinues = previousState && currentState && currentState.touchCount == previousState.touchCount
            const gestureEnded = previousState && !gestureContinues
            const gestureStarted = currentState && !gestureContinues

            if (gestureEnded) this.el.emit('gesture-end')
            if (gestureStarted) {
              this.internalState.startTime = Date.now()
              this.internalState.startPosition = currentState.position
              this.internalState.startSpread = currentState.spread
              this.el.emit('gesture-start')
            }
            if (gestureContinues) {
              const stateDelta = {
                position: {
                  x: currentState.position.x - previousState.position.x,
                  y: currentState.position.y - previousState.position.y
                },
                spread: currentState.spread - previousState.spread,
                diff: currentState.spread / previousState.spread
              }
              this.el.emit('gesture-move', stateDelta)
            }
            this.internalState.previousState = currentState
          },
          getTouchState: function(event: any) {
            if (event.touches.length === 0) return null
            if (event.touches.length === 1) {
              return { touchCount: 1, position: { x: event.touches[0].pageX, y: event.touches[0].pageY }, spread: 1 }
            }
            const one = event.touches[0]
            const two = event.touches[1]
            const spread = Math.sqrt(Math.pow(one.pageX - two.pageX, 2) + Math.pow(one.pageY - two.pageY, 2))
            return {
              touchCount: 2,
              position: { x: (one.pageX + two.pageX) / 2, y: (one.pageY + two.pageY) / 2 },
              spread: spread
            }
          }
        })
      }

      // Компонент обработчика жестов (применяет вращение/зум к модели)
      if (!AFRAME.components['gesture-handler']) {
        AFRAME.registerComponent('gesture-handler', {
          schema: { enabled: { default: true }, rotationFactor: { default: 5 }, minScale: { default: 0.3 }, maxScale: { default: 8 } },
          init: function() {
            this.handleScale = this.handleScale.bind(this)
            this.handleRotation = this.handleRotation.bind(this)
            this.isVisible = false
            this.initialScale = this.el.object3D.scale.clone()
            this.scaleFactor = 1
            this.el.sceneEl.addEventListener('gesture-move', this.handleRotation)
            this.el.sceneEl.addEventListener('gesture-move', this.handleScale)
            this.el.addEventListener('markerFound', () => { this.isVisible = true })
            this.el.addEventListener('markerLost', () => { this.isVisible = false })
          },
          remove: function() {
            this.el.sceneEl.removeEventListener('gesture-move', this.handleRotation)
            this.el.sceneEl.removeEventListener('gesture-move', this.handleScale)
          },
          handleRotation: function(event: any) {
            if (this.isVisible) {
              this.el.object3D.rotation.y += event.detail.position.x * this.data.rotationFactor / 1000
              this.el.object3D.rotation.x += event.detail.position.y * this.data.rotationFactor / 1000
            }
          },
          handleScale: function(event: any) {
            if (this.isVisible && event.detail.spread) {
              this.scaleFactor *= 1 + event.detail.spread / 1000
              this.scaleFactor = Math.min(Math.max(this.scaleFactor, this.data.minScale), this.data.maxScale)
              this.el.object3D.scale.x = this.scaleFactor * this.initialScale.x
              this.el.object3D.scale.y = this.scaleFactor * this.initialScale.y
              this.el.object3D.scale.z = this.scaleFactor * this.initialScale.z
            }
          }
        })
      }
    }
  }, [])

  // 2. Инициализация камеры и списка маркеров
  useEffect(() => {
    setActiveMarkers([...currentSubject.markers])

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Ваш браузер не поддерживает доступ к камере')
      return
    }

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(() => {
        setArReady(true)
        setError('')
      })
      .catch((err) => {
        console.error('Camera error:', err)
        setError('Не удалось получить доступ к камере. Убедитесь, что сайт открыт через HTTPS (или localhost).')
      })

    return () => {
      // Очистка при выходе: удаляем видео-тег, созданный AR.js
      const arVideo = document.getElementById('arjs-video')
      if (arVideo) arVideo.remove()
      
      // Сброс стилей body
      document.body.style.overflow = ''
      document.body.style.width = ''
      document.body.style.height = ''
    }
  }, [subject])

  // 3. Логика добавления кастомного маркера
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Проверяем расширение (должно быть .patt)
    if (!file.name.endsWith('.patt')) {
      alert('Пожалуйста, выберите файл с расширением .patt')
      return
    }

    // Создаем URL для файла
    const fileUrl = URL.createObjectURL(file)
    
    const newMarker: MarkerConfig = {
      id: `custom-${Date.now()}`,
      type: 'pattern',
      patternUrl: fileUrl,
      model: selectedCustomModel,
      color: '#ffffff', // Белый цвет для кастомных по умолчанию, чтобы не конфликтовал
      name: `Мой ${selectedCustomModel}`,
      isCustom: true
    }

    setActiveMarkers(prev => [...prev, newMarker])
    setShowCustomModal(false)
  }

  const renderModel = (markerData: MarkerConfig) => {
    const { model, color } = markerData
    // gesture-handler подключает возможность крутить модель
    const commonProps = {
      position: "0 0.5 0",
      color: color,
      "gesture-handler": "minScale: 0.2; maxScale: 5",
      shadow: "cast: true; receive: false",
      // Красивая анимация появления
      animation: "property: scale; from: 0 0 0; to: 1 1 1; dur: 500; easing: easeOutElastic"
    }

    switch (model) {
      case 'box': return <a-box {...commonProps} />
      case 'sphere': return <a-sphere {...commonProps} radius="0.5" />
      case 'cylinder': return <a-cylinder {...commonProps} radius="0.4" height="1" />
      case 'cone': return <a-cone {...commonProps} radius-bottom="0.5" height="1" />
      case 'torus': return <a-torus {...commonProps} radius="0.4" radius-tubular="0.1" />
      case 'dodecahedron': return <a-dodecahedron {...commonProps} radius="0.5" />
      default: return <a-box {...commonProps} />
    }
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#05050a',
        padding: '2rem',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white'
      }}>
        <h2 style={{ color: '#ff6b6b' }}>Ошибка доступа к камере</h2>
        <p>{error}</p>
        <Link to="/subjects" className="btn btn-primary" style={{ marginTop: '1rem' }}>Вернуться назад</Link>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', background: 'black' }}>
      
      {/* AR Scene с улучшенными настройками */}
      {arReady && (
        <a-scene
          ref={sceneRef}
          embedded
          arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3; trackingMethod: best; maxDetectionRate: 60;"
          renderer="logarithmicDepthBuffer: true; precision: medium; antialias: true; alpha: true;"
          vr-mode-ui="enabled: false"
          gesture-detector
          style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
        >
          {/* Свет */}
          <a-entity light="type: ambient; color: #FFF; intensity: 0.7" />
          <a-entity light="type: directional; color: #FFF; intensity: 1" position="-1 1 0" />

          {/* Маркеры */}
          {activeMarkers.map((marker) => (
            <a-marker
              key={marker.id}
              type={marker.type}
              preset={marker.type !== 'pattern' ? marker.type : undefined}
              url={marker.type === 'pattern' ? marker.patternUrl : undefined}
              emitevents="true"
              smooth="true"
              smoothCount="10"
              smoothTolerance="0.01"
              smoothThreshold="5"
            >
              {renderModel(marker)}
            </a-marker>
          ))}

          <a-entity camera />
        </a-scene>
      )}

      {/* Верхняя панель */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: '1rem',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
        zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        pointerEvents: 'none'
      }}>
        <Link to="/subjects" className="btn" style={{
          pointerEvents: 'auto', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)',
          padding: '0.5rem 1rem', fontSize: '0.9rem', color: 'white'
        }}>
          ← Выход
        </Link>
        
        <div style={{ textAlign: 'right', pointerEvents: 'auto' }}>
           <div style={{
             background: 'rgba(0,0,0,0.6)', padding: '0.5rem 1rem', borderRadius: '12px',
             display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'white', backdropFilter: 'blur(5px)'
           }}>
             <span>{currentSubject.emoji}</span>
             <span style={{ fontWeight: 600 }}>{currentSubject.name}</span>
           </div>
           
           <button 
            onClick={() => setShowCustomModal(true)}
            style={{
              display: 'block', marginTop: '10px', marginLeft: 'auto',
              background: '#667eea', color: 'white', border: 'none',
              padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem',
              cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
            }}
           >
             ➕ Свой маркер
           </button>
        </div>
      </div>

      {/* Нижняя панель с подсказкой */}
      <div style={{
        position: 'absolute', bottom: 20, left: 0, right: 0,
        textAlign: 'center', pointerEvents: 'none', zIndex: 10
      }}>
        <div style={{
          display: 'inline-block', background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(10px)', padding: '10px 20px', borderRadius: '30px',
          color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', border: '1px solid rgba(255,255,255,0.2)'
        }}>
          👆 Можно вращать и увеличивать двумя пальцами
        </div>
      </div>

      {/* Модальное окно добавления маркера */}
      {showCustomModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{
            background: '#1a1a2e', padding: '2rem', borderRadius: '20px',
            width: '100%', maxWidth: '400px', color: 'white', border: '1px solid #333'
          }}>
            <h3 style={{ marginTop: 0 }}>Добавить свой маркер</h3>
            <p style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '1.5rem' }}>
              Загрузите файл <code>.patt</code> и выберите 3D модель для него.
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>1. Файл маркера (.patt)</label>
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".patt"
                onChange={handleFileUpload}
                style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>2. Выберите модель</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {['box', 'sphere', 'cylinder', 'cone', 'torus', 'dodecahedron'].map(m => (
                  <button
                    key={m}
                    onClick={() => setSelectedCustomModel(m)}
                    style={{
                      background: selectedCustomModel === m ? '#667eea' : 'rgba(255,255,255,0.1)',
                      border: selectedCustomModel === m ? '2px solid white' : 'none',
                      padding: '10px', borderRadius: '8px', color: 'white', cursor: 'pointer'
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => setShowCustomModal(false)}
                style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid #555', color: 'white', borderRadius: '10px', cursor: 'pointer' }}
              >
                Отмена
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()} // Триггерим инпут программно при клике, если файл не выбран, иначе логика в onChange
                style={{ flex: 1, padding: '12px', background: '#22c55e', border: 'none', color: 'white', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
              >
                Загрузить
              </button>
            </div>
            
            <div style={{ marginTop: '1rem', fontSize: '0.8rem', textAlign: 'center' }}>
              <a href="https://jeromeetienne.github.io/AR.js/three.js/examples/marker-training/examples/generator.html" target="_blank" style={{ color: '#667eea' }}>
                🔗 Создать .patt файл онлайн
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {!arReady && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          background: '#05050a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white'
        }}>
          <div className="loading-spinner" style={{ 
            width: '50px', height: '50px', border: '4px solid #333', borderTop: '4px solid #667eea', borderRadius: '50%', marginBottom: '1rem'
          }} />
          <div>Запуск камеры...</div>
        </div>
      )}
    </div>
  )
}

export default ARScanner
