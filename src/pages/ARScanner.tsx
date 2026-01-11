import React, { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

// Расширяем JSX для A-Frame
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
  patternUrl?: string
  model: string
  color: string
  name: string
  description: string
  isCustom?: boolean
}

const ARScanner: React.FC = () => {
  const { subject = 'geometry' } = useParams()
  const [arReady, setArReady] = useState(false)
  const [error, setError] = useState('')
  const [showCustomModal, setShowCustomModal] = useState(false)
  
  // Состояния для Premium фич
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [flash, setFlash] = useState(false)
  const [activeMarkerId, setActiveMarkerId] = useState<string | number | null>(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  
  // Custom marker state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedCustomModel, setSelectedCustomModel] = useState('box')

  const sceneRef = useRef<any>(null)

  // База данных предметов с описаниями
  const subjectData: Record<string, any> = {
    geometry: {
      name: 'Геометрия',
      emoji: '📐',
      color: '#667eea',
      markers: [
        { id: 'geo1', type: 'hiro', model: 'box', color: '#667eea', name: 'Куб', description: 'Правильный гексаэдр. Имеет 6 граней, 12 ребер и 8 вершин.' },
        { id: 'geo2', type: 'kanji', model: 'cone', color: '#22c55e', name: 'Пирамида', description: 'Четырехугольная пирамида. Геометрическое тело с многоугольным основанием.' },
      ]
    },
    biology: {
      name: 'Биология',
      emoji: '🧬',
      color: '#22c55e',
      markers: [
        { id: 'bio1', type: 'hiro', model: 'sphere', color: '#ff6b9d', name: 'Клетка', description: 'Животная клетка. Элементарная единица строения и жизнедеятельности всех организмов.' },
        { id: 'bio2', type: 'kanji', model: 'torus', color: '#4ecdc4', name: 'ДНК', description: 'Дезоксирибонуклеиновая кислота. Макромолекула, хранящая генетическую информацию.' },
      ]
    },
    chemistry: {
      name: 'Химия',
      emoji: '⚗️',
      color: '#f59e0b',
      markers: [
        { id: 'chem1', type: 'hiro', model: 'sphere', color: '#00bfff', name: 'Молекула', description: 'Электронное облако атома. Демонстрирует вероятность нахождения электрона.' },
        { id: 'chem2', type: 'kanji', model: 'box', color: '#ff6347', name: 'Кристалл', description: 'Кристаллическая решетка. Упорядоченное расположение атомов в веществе.' },
      ]
    },
    physics: {
      name: 'Физика',
      emoji: '⚡',
      color: '#ec4899',
      markers: [
        { id: 'phys1', type: 'hiro', model: 'torus', color: '#ffd700', name: 'Поле', description: 'Магнитное поле тороидальной катушки с током.' },
        { id: 'phys2', type: 'kanji', model: 'cylinder', color: '#ff1493', name: 'Сопротивление', description: 'Резистор. Элемент электрической цепи, оказывающий сопротивление току.' },
      ]
    }
  }

  const currentSubject = subjectData[subject] || subjectData.geometry
  const [activeMarkers, setActiveMarkers] = useState<MarkerConfig[]>([])

  // === 1. Инициализация A-Frame компонентов (Жесты, События) ===
  useEffect(() => {
    setActiveMarkers([...currentSubject.markers])

    if (typeof window !== 'undefined' && (window as any).AFRAME) {
      const AFRAME = (window as any).AFRAME

      // Gesture Detector (Определяет касания: один палец или два)
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

      // Gesture Handler (Применяет вращение и масштаб к модели)
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

      // Marker Events (Связывает AR события с React State)
      if (!AFRAME.components['marker-events']) {
        AFRAME.registerComponent('marker-events', {
          init: function() {
            this.el.addEventListener('markerFound', () => {
              const id = this.el.getAttribute('id')
              window.dispatchEvent(new CustomEvent('ar-marker-found', { detail: { id } }))
            })
            this.el.addEventListener('markerLost', () => {
              window.dispatchEvent(new CustomEvent('ar-marker-lost'))
            })
          }
        })
      }
    }

    // Слушатели событий
    const onMarkerFound = (e: any) => {
      const id = e.detail.id
      setActiveMarkerId(id)
      // Haptic Feedback (Вибрация)
      if (navigator.vibrate) navigator.vibrate(50)
    }

    const onMarkerLost = () => {
      setActiveMarkerId(null)
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }

    window.addEventListener('ar-marker-found', onMarkerFound)
    window.addEventListener('ar-marker-lost', onMarkerLost)

    // Запуск камеры
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(() => { setArReady(true); setError('') })
      .catch((err) => {
        console.error('Camera error:', err)
        setError('Не удалось получить доступ к камере. Убедитесь, что используете HTTPS.')
      })

    return () => {
      window.removeEventListener('ar-marker-found', onMarkerFound)
      window.removeEventListener('ar-marker-lost', onMarkerLost)
      window.speechSynthesis.cancel()
      
      const arVideo = document.getElementById('arjs-video')
      if (arVideo) arVideo.remove()
      document.body.style.overflow = ''
      document.body.style.width = ''
      document.body.style.height = ''
    }
  }, [subject])

  // === Функционал ===

  // 1. Text-to-Speech
  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    } else {
      const marker = activeMarkers.find(m => m.id === activeMarkerId)
      if (marker) {
        const text = `${marker.name}. ${marker.description}`
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'ru-RU'
        utterance.onend = () => setIsSpeaking(false)
        window.speechSynthesis.speak(utterance)
        setIsSpeaking(true)
      }
    }
  }

  // 2. Скриншот
  const takeScreenshot = () => {
    const sceneEl = sceneRef.current
    if (sceneEl) {
      setFlash(true)
      setTimeout(() => setFlash(false), 300)
      
      // Требует preserveDrawingBuffer: true в настройках рендерера
      const canvas = sceneEl.components.screenshot.getCanvas('perspective')
      setCapturedImage(canvas.toDataURL('image/png'))
    }
  }

  // 3. Загрузка своего маркера
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !file.name.endsWith('.patt')) {
      alert('Пожалуйста, выберите файл .patt')
      return
    }

    const newMarker: MarkerConfig = {
      id: `custom-${Date.now()}`,
      type: 'pattern',
      patternUrl: URL.createObjectURL(file),
      model: selectedCustomModel,
      color: '#ffffff',
      name: `Мой ${selectedCustomModel}`,
      description: 'Пользовательская модель',
      isCustom: true
    }
    setActiveMarkers(prev => [...prev, newMarker])
    setShowCustomModal(false)
  }

  // Рендер 3D моделей
  const renderModel = (markerData: MarkerConfig) => {
    const { model, color } = markerData
    const commonProps = {
      position: "0 0.5 0",
      color: color,
      "gesture-handler": "minScale: 0.2; maxScale: 5", // Подключаем жесты к модели
      shadow: "cast: true; receive: false",
      animation: "property: scale; from: 0 0 0; to: 1 1 1; dur: 800; easing: easeOutElastic"
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

  const activeMarkerData = activeMarkers.find(m => m.id === activeMarkerId)

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#05050a', padding: '2rem', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2>🚫 Ошибка камеры</h2>
        <p>{error}</p>
        <Link to="/subjects" className="btn btn-primary" style={{marginTop: 20}}>Вернуться назад</Link>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', background: 'black' }}>
      
      {flash && <div className="flash-overlay" />}

      {/* AR SCENE */}
      {arReady && (
        <a-scene
          ref={sceneRef}
          embedded
          arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3; trackingMethod: best; maxDetectionRate: 60;"
          // Важно: preserveDrawingBuffer нужен для скриншотов
          renderer="logarithmicDepthBuffer: true; precision: medium; antialias: true; alpha: true; preserveDrawingBuffer: true;"
          vr-mode-ui="enabled: false"
          gesture-detector
          style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
        >
          <a-entity light="type: ambient; color: #FFF; intensity: 0.7" />
          <a-entity light="type: directional; color: #FFF; intensity: 1" position="-1 1 0" />

          {activeMarkers.map((marker) => (
            <a-marker
              key={marker.id}
              id={marker.id}
              type={marker.type}
              preset={marker.type !== 'pattern' ? marker.type : undefined}
              url={marker.type === 'pattern' ? marker.patternUrl : undefined}
              emitevents="true"
              smooth="true"
              smoothCount="10"
              smoothTolerance="0.01"
              smoothThreshold="5"
              marker-events
            >
              {renderModel(marker)}
            </a-marker>
          ))}
          <a-entity camera />
        </a-scene>
      )}

      {/* Верхняя панель */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, padding: '16px',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
        display: 'flex', justifyContent: 'space-between', zIndex: 20, pointerEvents: 'none'
      }}>
        <Link to="/subjects" style={{ pointerEvents: 'auto', background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '20px', color: 'white', textDecoration: 'none', backdropFilter: 'blur(5px)', fontSize: '0.9rem' }}>
          ← Выход
        </Link>
        <button onClick={() => setShowCustomModal(true)} style={{ pointerEvents: 'auto', background: '#667eea', border: 'none', padding: '8px 16px', borderRadius: '20px', color: 'white', fontWeight: 'bold', fontSize: '0.9rem', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
          ➕ Свой маркер
        </button>
      </div>

      {/* Кнопка скриншота (справа) */}
      <div style={{
        position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
        display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 20
      }}>
        <button onClick={takeScreenshot} style={{
          width: '50px', height: '50px', borderRadius: '50%', border: 'none',
          background: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', cursor: 'pointer'
        }}>
          📸
        </button>
      </div>

      {/* Умная карточка информации (снизу) */}
      <div style={{
        position: 'absolute', bottom: '24px', left: '16px', right: '16px',
        background: activeMarkerId ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px', padding: '16px',
        transform: activeMarkerId ? 'translateY(0)' : 'translateY(20px)',
        opacity: activeMarkerId ? 1 : 0.8,
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        zIndex: 20,
        boxShadow: activeMarkerId ? '0 10px 30px rgba(0,0,0,0.2)' : 'none'
      }}>
        {activeMarkerId && activeMarkerData ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: '0 0 4px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {activeMarkerData.name}
                <span style={{ fontSize: '11px', background: activeMarkerData.color, color: 'white', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>AR</span>
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#666', maxWidth: '240px', lineHeight: '1.4' }}>
                {activeMarkerData.description}
              </p>
            </div>
            <button 
              onClick={toggleSpeech}
              style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: isSpeaking ? '#ff4757' : '#667eea',
                border: 'none', color: 'white', fontSize: '20px',
                cursor: 'pointer', flexShrink: 0, marginLeft: '10px',
                transition: 'background 0.3s',
                boxShadow: '0 4px 10px rgba(102, 126, 234, 0.3)'
              }}
            >
              {isSpeaking ? '🔇' : '🔊'}
            </button>
          </div>
        ) : (
          <div style={{ color: 'white', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <div className="spinner" style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <span style={{ fontSize: '0.9rem' }}>Поиск маркера...</span>
          </div>
        )}
      </div>

      {/* Модальное окно скриншота */}
      {capturedImage && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)',
          zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <h3 style={{ color: 'white', marginBottom: '10px' }}>Снимок готов!</h3>
          <img src={capturedImage} alt="AR Capture" style={{ maxWidth: '100%', maxHeight: '60vh', borderRadius: '12px', border: '2px solid white', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }} />
          <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '20px', marginTop: '10px' }}>Нажмите и удерживайте фото, чтобы сохранить</p>
          <button onClick={() => setCapturedImage(null)} style={{ padding: '12px 24px', background: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
            Закрыть
          </button>
        </div>
      )}

      {/* Модальное окно загрузки маркера */}
      {showCustomModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#1a1a2e', padding: '24px', borderRadius: '24px', width: '100%', maxWidth: '400px', color: 'white', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            <h3 style={{ marginTop: 0 }}>Добавить свой маркер</h3>
            <p style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '1.5rem' }}>
              Загрузите файл <code>.patt</code> и выберите 3D модель.
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <input ref={fileInputRef} type="file" accept=".patt" onChange={handleFileUpload} style={{ display: 'none' }} />
              <button onClick={() => fileInputRef.current?.click()} style={{ width: '100%', padding: '14px', background: '#22c55e', border: 'none', color: 'white', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                📁 Выбрать .patt файл
              </button>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.9rem', color: '#ccc' }}>Выберите модель:</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {['box', 'sphere', 'cylinder', 'cone', 'torus', 'dodecahedron'].map(m => (
                  <button key={m} onClick={() => setSelectedCustomModel(m)} style={{ 
                    background: selectedCustomModel === m ? '#667eea' : 'rgba(255,255,255,0.1)', 
                    border: selectedCustomModel === m ? '2px solid white' : 'none', 
                    color: 'white', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' 
                  }}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => setShowCustomModal(false)} style={{ width: '100%', padding: '14px', background: 'transparent', border: '1px solid #555', color: 'white', borderRadius: '12px', cursor: 'pointer' }}>
              Отмена
            </button>
            
            <div style={{ marginTop: '1rem', fontSize: '0.8rem', textAlign: 'center' }}>
               <a href="https://jeromeetienne.github.io/AR.js/three.js/examples/marker-training/examples/generator.html" target="_blank" style={{ color: '#667eea' }}>
                🔗 Генератор маркеров
               </a>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default ARScanner
