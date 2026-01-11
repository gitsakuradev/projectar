import React, { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { GoogleGenerativeAI } from '@google/generative-ai'

// --- TYPE DEFINITIONS ---
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
      'a-capsule': any
      'a-triangle': any
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
  aiRole: string
  isCustom?: boolean
}

const ARScanner: React.FC = () => {
  const { subject = 'geometry' } = useParams()
  
  // --- STATE ---
  const [arReady, setArReady] = useState(false)
  const [error, setError] = useState('')
  
  // AI & Interaction State
  const [activeMarkerId, setActiveMarkerId] = useState<string | number | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [aiResponse, setAiResponse] = useState<string | null>(null)
  const [isThinking, setIsThinking] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  // UI State
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [flash, setFlash] = useState(false)
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [selectedCustomModel, setSelectedCustomModel] = useState('box')
  
  // Refs
  const sceneRef = useRef<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize Gemini AI
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '')

  // --- DATA ---
  const subjectData: Record<string, any> = {
    geometry: {
      name: 'Геометрия',
      emoji: '📐',
      color: '#667eea',
      markers: [
        { 
          id: 'geo1', type: 'hiro', model: 'box', color: '#667eea', name: 'Куб', description: 'Правильный гексаэдр.', 
          aiRole: 'Ты - веселый Куб. Ты очень гордишься своими прямыми углами и симметрией. Ты любишь математику.' 
        },
        { 
          id: 'geo2', type: 'kanji', model: 'cone', color: '#22c55e', name: 'Пирамида', description: 'Четырехугольная пирамида.', 
          aiRole: 'Ты - древняя Пирамида. Ты говоришь загадками и мудростью веков. Ты видела фараонов.' 
        },
      ]
    },
    biology: {
      name: 'Биология',
      emoji: '🧬',
      color: '#22c55e',
      markers: [
        { 
          id: 'bio1', type: 'hiro', model: 'custom-cell', color: '#ff6b9d', name: 'Клетка', description: 'Животная клетка с органеллами.', 
          aiRole: 'Ты - живая биологическая клетка. Ты немного суетливая, потому что внутри тебя постоянно работают митохондрии и рибосомы. Объясняй свои процессы просто.' 
        },
        { 
          id: 'bio2', type: 'kanji', model: 'custom-dna', color: '#4ecdc4', name: 'ДНК', description: 'Двойная спираль.', 
          aiRole: 'Ты - молекула ДНК. Ты хранитель всех секретов жизни, спокойная и мудрая. Ты знаешь всё о наследственности и генах.' 
        },
      ]
    },
    chemistry: {
      name: 'Химия',
      emoji: '⚗️',
      color: '#f59e0b',
      markers: [
        { 
          id: 'chem1', type: 'hiro', model: 'custom-atom', color: '#00bfff', name: 'Атом', description: 'Ядро и электроны.', 
          aiRole: 'Ты - Атом. Вокруг тебя с бешеной скоростью крутятся электроны. Ты фундамент всего сущего во Вселенной.' 
        },
        { 
          id: 'chem2', type: 'kanji', model: 'custom-h2o', color: '#ff6347', name: 'Вода (H2O)', description: 'Полярная молекула.', 
          aiRole: 'Ты - молекула Воды. Ты жидкая, текучая, любишь превращаться в лед или пар. Без тебя нет жизни.' 
        },
      ]
    },
    physics: {
      name: 'Физика',
      emoji: '⚡',
      color: '#ec4899',
      markers: [
        { 
          id: 'phys1', type: 'hiro', model: 'torus', color: '#ffd700', name: 'Магнитное поле', description: 'Силовые линии.', 
          aiRole: 'Ты - Магнитное поле. Ты невидимое, но сильное влияние. Ты любишь притягивать железо.' 
        },
        { 
          id: 'phys2', type: 'kanji', model: 'cylinder', color: '#ff1493', name: 'Резистор', description: 'Сопротивление току.', 
          aiRole: 'Ты - Резистор. Твоя работа - мешать току проходить, создавая сопротивление. Ты строгий контролер.' 
        },
      ]
    }
  }

  const currentSubject = subjectData[subject] || subjectData.biology
  const [activeMarkers, setActiveMarkers] = useState<MarkerConfig[]>([])

  // --- INITIALIZATION ---
  useEffect(() => {
    setActiveMarkers([...currentSubject.markers])

    // A-Frame Component Registration
    if (typeof window !== 'undefined' && (window as any).AFRAME) {
        const AFRAME = (window as any).AFRAME
        
        // Marker Events
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

        // Gesture Detector
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

        // Gesture Handler
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

    // Event Listeners
    const onMarkerFound = (e: any) => {
        setActiveMarkerId(e.detail.id)
        if (navigator.vibrate) navigator.vibrate(50)
        setAiResponse(null) // Reset AI chat on new marker
    }
    const onMarkerLost = () => {
        setActiveMarkerId(null)
        window.speechSynthesis.cancel()
        setIsSpeaking(false)
    }

    window.addEventListener('ar-marker-found', onMarkerFound)
    window.addEventListener('ar-marker-lost', onMarkerLost)

    // Camera Init
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(() => setArReady(true))
      .catch((err) => {
          console.error(err);
          setError('Ошибка доступа к камере. Убедитесь, что сайт открыт через HTTPS.');
      })

    return () => {
        window.removeEventListener('ar-marker-found', onMarkerFound)
        window.removeEventListener('ar-marker-lost', onMarkerLost)
        window.speechSynthesis.cancel()
        const arVideo = document.getElementById('arjs-video')
        if (arVideo) arVideo.remove()
        document.body.style.overflow = ''
    }
  }, [subject])

  // --- AI LOGIC (GEMINI) ---
  const startListening = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Голосовой ввод не поддерживается. Используйте Chrome.')
      return
    }
    
    const recognition = new SpeechRecognition()
    recognition.lang = 'ru-RU'
    recognition.start()
    setIsListening(true)

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript
      setIsListening(false)
      askGemini(text)
    }
    
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)
  }

  const askGemini = async (userQuestion: string) => {
    setIsThinking(true)
    
    try {
        const marker = activeMarkers.find(m => m.id === activeMarkerId)
        if (!marker) throw new Error("Маркер не найден")

        // Construct Prompt
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
        const prompt = `
          Твоя роль: ${marker.aiRole}
          Студент спрашивает: "${userQuestion}"
          Ответь кратко (2-3 предложения), интересно и от первого лица. 
          Отвечай на русском языке.
        `

        const result = await model.generateContent(prompt)
        const response = result.response
        const text = response.text()

        setAiResponse(text)
        speak(text)
    } catch (error) {
        console.error("AI Error:", error)
        const fallback = "Извини, связь с космосом прервалась. Повтори вопрос?"
        setAiResponse(fallback)
        speak(fallback)
    } finally {
        setIsThinking(false)
    }
  }

  const speak = (text: string) => {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'ru-RU'
    u.rate = 1.1
    u.onend = () => setIsSpeaking(false)
    window.speechSynthesis.speak(u)
    setIsSpeaking(true)
  }

  const stopSpeech = () => {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
  }

  // --- FEATURES ---
  const takeScreenshot = () => {
    if(sceneRef.current) {
        setFlash(true); setTimeout(() => setFlash(false), 300);
        // Requires preserveDrawingBuffer: true in renderer config
        const canvas = sceneRef.current.components.screenshot.getCanvas('perspective');
        setCapturedImage(canvas.toDataURL('image/png'));
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !file.name.endsWith('.patt')) {
        alert('Пожалуйста, выберите файл .patt'); return;
    }
    const newMarker: MarkerConfig = {
      id: `custom-${Date.now()}`,
      type: 'pattern',
      patternUrl: URL.createObjectURL(file),
      model: selectedCustomModel,
      color: '#ffffff',
      name: `Мой ${selectedCustomModel}`,
      description: 'Пользовательская модель',
      aiRole: 'Ты - неизвестный объект. Ты сам не знаешь, что ты такое, но ты очень загадочный.',
      isCustom: true
    }
    setActiveMarkers(prev => [...prev, newMarker])
    setShowCustomModal(false)
  }

  // --- RENDER 3D MODELS (Complex Geometry) ---
  const renderModel = (markerData: MarkerConfig) => {
    const { model, color } = markerData
    const common = {
      position: "0 0.5 0",
      "gesture-handler": "minScale: 0.2; maxScale: 5",
      shadow: "cast: true; receive: false",
      animation: "property: scale; from: 0 0 0; to: 1 1 1; dur: 800; easing: easeOutElastic"
    }

    switch (model) {
      // === BIOLOGY: CELL ===
      case 'custom-cell':
        return (
          <a-entity {...common}>
            <a-sphere radius="0.7" color="#ff9a9e" opacity="0.4" transparent="true" material="roughness: 0.1"
              animation="property: scale; to: 1.05 1.05 1.05; dir: alternate; loop: true; dur: 2000"></a-sphere>
            <a-sphere radius="0.25" color="#d946ef" position="0 0 0" material="roughness: 0.5" />
            <a-sphere radius="0.08" color="#4ade80" position="0.3 0.2 0.1" />
            <a-capsule length="0.2" radius="0.06" color="#fcd34d" position="-0.3 -0.1 0.2" rotation="45 45 0" />
            <a-sphere radius="0.1" color="#60a5fa" position="-0.1 0.3 -0.2" />
          </a-entity>
        )

      // === BIOLOGY: DNA ===
      case 'custom-dna':
        return (
          <a-entity {...common} animation__rotate="property: rotation; to: 0 360 0; loop: true; dur: 8000; easing: linear">
            {[...Array(6)].map((_, i) => (
              <a-entity key={i} position={`0 ${(i - 2.5) * 0.3} 0`} rotation={`0 ${i * 45} 0`}>
                <a-cylinder height="0.6" radius="0.03" color="white" rotation="0 0 90" />
                <a-sphere radius="0.1" color="#4ecdc4" position="0.3 0 0" />
                <a-sphere radius="0.1" color="#ff6b9d" position="-0.3 0 0" />
              </a-entity>
            ))}
          </a-entity>
        )

      // === CHEMISTRY: ATOM ===
      case 'custom-atom':
        return (
          <a-entity {...common}>
            <a-sphere radius="0.2" color="#ef4444" position="0 0 0" />
            <a-sphere radius="0.15" color="#3b82f6" position="0.15 0.1 0" />
            <a-entity rotation="0 0 0" animation="property: rotation; to: 0 360 0; loop: true; dur: 3000; easing: linear">
              <a-ring radius-inner="0.6" radius-outer="0.62" color="white" opacity="0.5" rotation="90 0 0" />
              <a-sphere radius="0.08" color="#eab308" position="0.6 0 0" />
            </a-entity>
            <a-entity rotation="45 0 0" animation="property: rotation; to: 45 360 0; loop: true; dur: 4000; easing: linear">
              <a-ring radius-inner="0.8" radius-outer="0.82" color="white" opacity="0.5" rotation="90 0 0" />
              <a-sphere radius="0.08" color="#eab308" position="-0.8 0 0" />
            </a-entity>
          </a-entity>
        )

      // === CHEMISTRY: H2O ===
      case 'custom-h2o':
        return (
          <a-entity {...common} animation__float="property: position; to: 0 0.7 0; dir: alternate; loop: true; dur: 2000; easing: easeInOutSine">
             <a-sphere radius="0.35" color="#ef4444" position="0 0 0" />
             <a-entity position="0.4 0.3 0" rotation="0 0 -45">
               <a-cylinder height="0.4" radius="0.05" color="#ddd" position="0 -0.2 0" />
               <a-sphere radius="0.2" color="white" position="0 0 0" />
             </a-entity>
             <a-entity position="-0.4 0.3 0" rotation="0 0 45">
               <a-cylinder height="0.4" radius="0.05" color="#ddd" position="0 -0.2 0" />
               <a-sphere radius="0.2" color="white" position="0 0 0" />
             </a-entity>
          </a-entity>
        )

      // === STANDARD PRIMITIVES ===
      case 'box': return <a-box {...common} material="roughness: 0.5; metalness: 0.1" />
      case 'sphere': return <a-sphere {...common} radius="0.5" material="roughness: 0.2; metalness: 0.5" />
      case 'cylinder': return <a-cylinder {...common} radius="0.4" height="1" />
      case 'cone': return <a-cone {...common} radius-bottom="0.5" height="1" />
      case 'torus': return <a-torus {...common} radius="0.4" radius-tubular="0.1" color={color} material="metalness: 0.5; roughness: 0.2" />
      default: return <a-box {...common} />
    }
  }

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
            arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3; trackingMethod: best;"
            renderer="logarithmicDepthBuffer: true; preserveDrawingBuffer: true; antialias: true; alpha: true;"
            vr-mode-ui="enabled: false"
            gesture-detector
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        >
            <a-entity light="type: ambient; color: #FFF; intensity: 0.8" />
            <a-entity light="type: directional; color: #FFF; intensity: 1.2" position="-1 2 1" />

            {activeMarkers.map(marker => (
                <a-marker key={marker.id} id={marker.id} preset={marker.type} url={marker.patternUrl} marker-events>
                    {renderModel(marker)}
                </a-marker>
            ))}
            <a-entity camera />
        </a-scene>
      )}

      {/* AI CHAT INTERFACE */}
      {activeMarkerId && (
          <div style={{
              position: 'absolute', bottom: '30px', left: '20px', right: '20px',
              display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', zIndex: 50
          }}>
              
              {/* AI Response Bubble */}
              {(aiResponse || isThinking) && (
                  <div style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      padding: '16px 22px', borderRadius: '24px 24px 24px 4px',
                      marginBottom: '10px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                      width: '100%', alignSelf: 'flex-start',
                      animation: 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                  }}>
                      {isThinking ? (
                          <div style={{display: 'flex', gap: 6, justifyContent: 'center'}}>
                              <span style={{width: 8, height: 8, background: '#667eea', borderRadius: '50%', animation: 'blink 1s infinite'}}></span>
                              <span style={{width: 8, height: 8, background: '#764ba2', borderRadius: '50%', animation: 'blink 1s infinite 0.2s'}}></span>
                              <span style={{width: 8, height: 8, background: '#ec4899', borderRadius: '50%', animation: 'blink 1s infinite 0.4s'}}></span>
                          </div>
                      ) : (
                          <div style={{color: '#1a1a2e', fontSize: '1rem', lineHeight: '1.5'}}>
                              <div style={{fontSize: '0.8rem', color: '#666', marginBottom: 4, textTransform: 'uppercase', fontWeight: 700}}>
                                {activeMarkers.find(m=>m.id===activeMarkerId)?.name}
                              </div>
                              {aiResponse}
                          </div>
                      )}
                  </div>
              )}

              {/* Control Buttons */}
              <div style={{display: 'flex', gap: 15, alignItems: 'center'}}>
                  {isSpeaking && (
                      <button onClick={stopSpeech} style={{
                          width: '50px', height: '50px', borderRadius: '50%', background: '#ef4444', border: 'none', color: 'white', fontSize: '20px', boxShadow: '0 5px 15px rgba(239, 68, 68, 0.4)'
                      }}>🔇</button>
                  )}
                  
                  <button 
                      onClick={startListening}
                      style={{
                          width: '72px', height: '72px', borderRadius: '50%',
                          background: isListening ? '#ff4757' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          border: '4px solid rgba(255,255,255,0.25)',
                          color: 'white', fontSize: '32px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: isListening ? '0 0 30px rgba(255, 71, 87, 0.6)' : '0 10px 30px rgba(118, 75, 162, 0.5)',
                          transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                          transform: isListening ? 'scale(1.1)' : 'scale(1)',
                          cursor: 'pointer'
                      }}
                  >
                      {isListening ? '👂' : '🎙️'}
                  </button>

                  <button onClick={takeScreenshot} style={{
                       width: '50px', height: '50px', borderRadius: '50%', background: 'white', border: 'none', color: 'black', fontSize: '20px', boxShadow: '0 5px 15px rgba(255, 255, 255, 0.3)'
                  }}>📸</button>
              </div>
          </div>
      )}

      {/* HEADER: EXIT & UPLOAD */}
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

      {/* SCREENSHOT MODAL */}
      {capturedImage && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <img src={capturedImage} style={{maxWidth: '100%', maxHeight: '60vh', borderRadius: 12, border: '2px solid white'}} alt="Screenshot" />
            <p style={{color: '#aaa', marginTop: 10, fontSize: '0.9rem'}}>Удерживайте фото, чтобы сохранить</p>
            <button onClick={() => setCapturedImage(null)} style={{marginTop: 20, padding: '12px 30px', borderRadius: 30, border: 'none', background: 'white', fontWeight: 'bold'}}>Закрыть</button>
        </div>
      )}

      {/* UPLOAD MODAL */}
      {showCustomModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#1a1a2e', padding: '24px', borderRadius: '24px', width: '100%', maxWidth: '400px', color: 'white', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            <h3 style={{ marginTop: 0 }}>Добавить свой маркер</h3>
            <p style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '1.5rem' }}>Загрузите файл <code>.patt</code> и выберите 3D модель.</p>
            <div style={{ marginBottom: '1.5rem' }}>
              <input ref={fileInputRef} type="file" accept=".patt" onChange={handleFileUpload} style={{ display: 'none' }} />
              <button onClick={() => fileInputRef.current?.click()} style={{ width: '100%', padding: '14px', background: '#22c55e', border: 'none', color: 'white', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                📁 Выбрать .patt файл
              </button>
            </div>
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.9rem', color: '#ccc' }}>Выберите модель:</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {['box', 'sphere', 'cylinder', 'custom-cell', 'custom-dna', 'custom-atom'].map(m => (
                  <button key={m} onClick={() => setSelectedCustomModel(m)} style={{ 
                    background: selectedCustomModel === m ? '#667eea' : 'rgba(255,255,255,0.1)', border: selectedCustomModel === m ? '2px solid white' : 'none', color: 'white', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.7rem' 
                  }}>{m.replace('custom-', '')}</button>
                ))}
              </div>
            </div>
            <button onClick={() => setShowCustomModal(false)} style={{ width: '100%', padding: '14px', background: 'transparent', border: '1px solid #555', color: 'white', borderRadius: '12px', cursor: 'pointer' }}>Отмена</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes popIn { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes blink { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
        .flash-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: white; pointer-events: none; z-index: 999; animation: flash 0.3s ease-out forwards; }
        @keyframes flash { 0% { opacity: 1; } 100% { opacity: 0; } }
      `}</style>
    </div>
  )
}

export default ARScanner
