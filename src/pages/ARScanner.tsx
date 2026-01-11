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
      'a-ring': any
    }
  }
}

interface MarkerConfig {
  id: string | number
  type: 'hiro' | 'kanji' | 'pattern'
  patternUrl?: string
  model: string // Теперь здесь могут быть сложные ключи: 'custom-cell', 'custom-molecule' и т.д.
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
  
  // Состояния UI
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [flash, setFlash] = useState(false)
  const [activeMarkerId, setActiveMarkerId] = useState<string | number | null>(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  
  // Custom marker state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedCustomModel, setSelectedCustomModel] = useState('box')

  const sceneRef = useRef<any>(null)

  // === ОБНОВЛЕННАЯ БАЗА ДАННЫХ ===
  // Мы заменили простые модели на ключи для сложных составных моделей
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
        // Изменено на 'custom-cell'
        { id: 'bio1', type: 'hiro', model: 'custom-cell', color: '#ff6b9d', name: 'Животная Клетка', description: 'Сложная структура с ядром, цитоплазмой и органеллами.' },
        // Изменено на 'custom-dna'
        { id: 'bio2', type: 'kanji', model: 'custom-dna', color: '#4ecdc4', name: 'ДНК', description: 'Двойная спираль, хранящая генетический код организма.' },
      ]
    },
    chemistry: {
      name: 'Химия',
      emoji: '⚗️',
      color: '#f59e0b',
      markers: [
        // Изменено на 'custom-atom'
        { id: 'chem1', type: 'hiro', model: 'custom-atom', color: '#00bfff', name: 'Атом Лития', description: 'Планетарная модель атома: ядро и электроны на орбитах.' },
        // Изменено на 'custom-h2o'
        { id: 'chem2', type: 'kanji', model: 'custom-h2o', color: '#ff6347', name: 'Молекула Воды', description: 'H₂O: Один атом кислорода и два атома водорода.' },
      ]
    },
    physics: {
      name: 'Физика',
      emoji: '⚡',
      color: '#ec4899',
      markers: [
        { id: 'phys1', type: 'hiro', model: 'torus', color: '#ffd700', name: 'Поле', description: 'Магнитное поле тороидальной катушки с током.' },
        { id: 'phys2', type: 'kanji', model: 'cylinder', color: '#ff1493', name: 'Сопротивление', description: 'Резистор. Элемент электрической цепи.' },
      ]
    }
  }

  const currentSubject = subjectData[subject] || subjectData.geometry
  const [activeMarkers, setActiveMarkers] = useState<MarkerConfig[]>([])

  // === INITIALIZATION ===
  useEffect(() => {
    setActiveMarkers([...currentSubject.markers])

    if (typeof window !== 'undefined' && (window as any).AFRAME) {
      const AFRAME = (window as any).AFRAME

      // Gesture Components (Те же самые, что и были)
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
                position: { x: currentState.position.x - previousState.position.x, y: currentState.position.y - previousState.position.y },
                spread: currentState.spread - previousState.spread,
                diff: currentState.spread / previousState.spread
              }
              this.el.emit('gesture-move', stateDelta)
            }
            this.internalState.previousState = currentState
          },
          getTouchState: function(event: any) {
            if (event.touches.length === 0) return null
            if (event.touches.length === 1) return { touchCount: 1, position: { x: event.touches[0].pageX, y: event.touches[0].pageY }, spread: 1 }
            const one = event.touches[0], two = event.touches[1]
            const spread = Math.sqrt(Math.pow(one.pageX - two.pageX, 2) + Math.pow(one.pageY - two.pageY, 2))
            return { touchCount: 2, position: { x: (one.pageX + two.pageX) / 2, y: (one.pageY + two.pageY) / 2 }, spread: spread }
          }
        })
      }

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

    const onMarkerFound = (e: any) => {
      setActiveMarkerId(e.detail.id)
      if (navigator.vibrate) navigator.vibrate(50)
    }
    const onMarkerLost = () => {
      setActiveMarkerId(null)
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }

    window.addEventListener('ar-marker-found', onMarkerFound)
    window.addEventListener('ar-marker-lost', onMarkerLost)

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(() => { setArReady(true); setError('') })
      .catch((err) => { console.error(err); setError('Ошибка доступа к камере. Используйте HTTPS.'); })

    return () => {
      window.removeEventListener('ar-marker-found', onMarkerFound)
      window.removeEventListener('ar-marker-lost', onMarkerLost)
      window.speechSynthesis.cancel()
      const arVideo = document.getElementById('arjs-video')
      if (arVideo) arVideo.remove()
      document.body.style.overflow = ''
    }
  }, [subject])

  // === ACTIONS ===
  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    } else {
      const marker = activeMarkers.find(m => m.id === activeMarkerId)
      if (marker) {
        const u = new SpeechSynthesisUtterance(`${marker.name}. ${marker.description}`)
        u.lang = 'ru-RU'
        u.onend = () => setIsSpeaking(false)
        window.speechSynthesis.speak(u)
        setIsSpeaking(true)
      }
    }
  }

  const takeScreenshot = () => {
    if (sceneRef.current) {
      setFlash(true)
      setTimeout(() => setFlash(false), 300)
      const canvas = sceneRef.current.components.screenshot.getCanvas('perspective')
      setCapturedImage(canvas.toDataURL('image/png'))
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !file.name.endsWith('.patt')) return
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

  // === RENDER MODELS (Самая важная часть!) ===
  const renderModel = (markerData: MarkerConfig) => {
    const { model, color } = markerData
    const commonProps = {
      position: "0 0.5 0",
      "gesture-handler": "minScale: 0.2; maxScale: 5",
      shadow: "cast: true; receive: false",
      animation: "property: scale; from: 0 0 0; to: 1 1 1; dur: 800; easing: easeOutElastic"
    }

    switch (model) {
      // === BIOLOGY: CELL (Сложная клетка) ===
      case 'custom-cell':
        return (
          <a-entity {...commonProps}>
            {/* Мембрана (полупрозрачная) */}
            <a-sphere radius="0.7" color="#ff9a9e" opacity="0.4" transparent="true" 
              material="roughness: 0.1; metalness: 0.1;"
              animation="property: scale; to: 1.05 1.05 1.05; dir: alternate; loop: true; dur: 2000; easing: easeInOutSine"
            >
            </a-sphere>
            {/* Ядро (твердое) */}
            <a-sphere radius="0.25" color="#d946ef" position="0 0 0" material="roughness: 0.5" />
            {/* Органеллы (разбросанные элементы) */}
            <a-sphere radius="0.08" color="#4ade80" position="0.3 0.2 0.1" />
            <a-capsule length="0.2" radius="0.06" color="#fcd34d" position="-0.3 -0.1 0.2" rotation="45 45 0" />
            <a-sphere radius="0.1" color="#60a5fa" position="-0.1 0.3 -0.2" />
            <a-torus radius="0.15" radius-tubular="0.02" color="#f87171" position="0.1 -0.3 0" rotation="90 0 0" />
          </a-entity>
        )

      // === BIOLOGY: DNA (Двойная спираль) ===
      case 'custom-dna':
        return (
          <a-entity {...commonProps} animation__rotate="property: rotation; to: 0 360 0; loop: true; dur: 8000; easing: linear">
            {/* Генерируем несколько звеньев спирали */}
            {[...Array(8)].map((_, i) => {
              const y = (i - 3.5) * 0.25;
              const rot = i * 45;
              return (
                <a-entity key={i} position={`0 ${y} 0`} rotation={`0 ${rot} 0`}>
                  {/* Связь */}
                  <a-cylinder height="0.6" radius="0.03" color="white" rotation="0 0 90" />
                  {/* Шарики на концах */}
                  <a-sphere radius="0.1" color="#4ecdc4" position="0.3 0 0" />
                  <a-sphere radius="0.1" color="#ff6b9d" position="-0.3 0 0" />
                </a-entity>
              )
            })}
          </a-entity>
        )

      // === CHEMISTRY: ATOM (Ядро и орбиты) ===
      case 'custom-atom':
        return (
          <a-entity {...commonProps}>
            {/* Ядро */}
            <a-sphere radius="0.2" color="#ef4444" position="0 0 0" />
            <a-sphere radius="0.15" color="#3b82f6" position="0.15 0.1 0" />
            {/* Орбита 1 */}
            <a-entity rotation="0 0 0" animation="property: rotation; to: 0 360 0; loop: true; dur: 3000; easing: linear">
              <a-ring radius-inner="0.6" radius-outer="0.62" color="#ffffff" opacity="0.5" rotation="90 0 0" />
              <a-sphere radius="0.08" color="#eab308" position="0.6 0 0" />
            </a-entity>
            {/* Орбита 2 (под углом) */}
            <a-entity rotation="45 0 0" animation="property: rotation; to: 45 360 0; loop: true; dur: 4000; easing: linear">
              <a-ring radius-inner="0.8" radius-outer="0.82" color="#ffffff" opacity="0.5" rotation="90 0 0" />
              <a-sphere radius="0.08" color="#eab308" position="-0.8 0 0" />
            </a-entity>
          </a-entity>
        )

      // === CHEMISTRY: H2O (Молекула воды) ===
      case 'custom-h2o':
        return (
          <a-entity {...commonProps} animation__float="property: position; to: 0 0.7 0; dir: alternate; loop: true; dur: 2000; easing: easeInOutSine">
             {/* Кислород (Красный) */}
             <a-sphere radius="0.35" color="#ef4444" position="0 0 0" material="roughness: 0.1; metalness: 0.1" />
             
             {/* Водород 1 */}
             <a-entity position="0.4 0.3 0" rotation="0 0 -45">
               <a-cylinder height="0.4" radius="0.05" color="#ddd" position="0 -0.2 0" />
               <a-sphere radius="0.2" color="white" position="0 0 0" />
             </a-entity>

             {/* Водород 2 */}
             <a-entity position="-0.4 0.3 0" rotation="0 0 45">
               <a-cylinder height="0.4" radius="0.05" color="#ddd" position="0 -0.2 0" />
               <a-sphere radius="0.2" color="white" position="0 0 0" />
             </a-entity>
          </a-entity>
        )

      // === СТАНДАРТНЫЕ ПРИМИТИВЫ (Для физики, геометрии и кастомных) ===
      case 'box': return <a-box {...commonProps} material="roughness: 0.5; metalness: 0.1" />
      case 'sphere': return <a-sphere {...commonProps} radius="0.5" material="roughness: 0.2; metalness: 0.5" />
      case 'cylinder': return <a-cylinder {...commonProps} radius="0.4" height="1" />
      case 'cone': return <a-cone {...commonProps} radius-bottom="0.5" height="1" />
      case 'torus': return <a-torus {...commonProps} radius="0.4" radius-tubular="0.1" color={color} material="metalness: 0.5; roughness: 0.2" />
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
          renderer="logarithmicDepthBuffer: true; precision: medium; antialias: true; alpha: true; preserveDrawingBuffer: true;"
          vr-mode-ui="enabled: false"
          gesture-detector
          style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
        >
          <a-entity light="type: ambient; color: #FFF; intensity: 0.8" />
          <a-entity light="type: directional; color: #FFF; intensity: 1.2" position="-1 2 1" />

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

      {/* HEADER */}
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

      {/* SCREENSHOT BUTTON */}
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

      {/* INFO CARD */}
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
            <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <span style={{ fontSize: '0.9rem' }}>Поиск маркера...</span>
          </div>
        )}
      </div>

      {/* SCREENSHOT MODAL */}
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

      {/* UPLOAD MODAL */}
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
            <button onClick={() => setShowCustomModal(false)} style={{ width: '100%', padding: '14px', background: 'transparent', border: '1px solid #555', color: 'white', borderRadius: '12px', cursor: 'pointer' }}>Отмена</button>
            <div style={{ marginTop: '1rem', fontSize: '0.8rem', textAlign: 'center' }}>
               <a href="https://jeromeetienne.github.io/AR.js/three.js/examples/marker-training/examples/generator.html" target="_blank" style={{ color: '#667eea' }}>🔗 Генератор маркеров</a>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default ARScanner
