import React, { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

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
    }
  }
}

const ARScanner: React.FC = () => {
  const { subject = 'geometry' } = useParams()
  const [arReady, setArReady] = useState(false)
  const [error, setError] = useState('')
  const sceneRef = useRef<any>(null)

  const subjectData: Record<string, any> = {
    geometry: {
      name: 'Геометрия',
      emoji: '📐',
      color: '#667eea',
      markers: [
        { type: 'hiro', model: 'box', color: '#667eea', name: 'Куб' },
        { type: 'kanji', model: 'cone', color: '#22c55e', name: 'Пирамида' },
      ]
    },
    biology: {
      name: 'Биология',
      emoji: '🧬',
      color: '#22c55e',
      markers: [
        { type: 'hiro', model: 'sphere', color: '#ff6b9d', name: 'Клетка' },
        { type: 'kanji', model: 'torus', color: '#4ecdc4', name: 'ДНК' },
      ]
    },
    chemistry: {
      name: 'Химия',
      emoji: '⚗️',
      color: '#f59e0b',
      markers: [
        { type: 'hiro', model: 'sphere', color: '#00bfff', name: 'H₂O' },
        { type: 'kanji', model: 'box', color: '#ff6347', name: 'CH₄' },
      ]
    },
    physics: {
      name: 'Физика',
      emoji: '⚡',
      color: '#ec4899',
      markers: [
        { type: 'hiro', model: 'torus', color: '#ffd700', name: 'Цепь' },
        { type: 'kanji', model: 'cylinder', color: '#ff1493', name: 'Магнит' },
      ]
    }
  }

  const currentSubject = subjectData[subject] || subjectData.geometry

  useEffect(() => {
    // Проверка поддержки камеры
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Ваш браузер не поддерживает доступ к камере')
      return
    }

    // Запрос доступа к камере
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(() => {
        setArReady(true)
        setError('')
      })
      .catch((err) => {
        console.error('Camera error:', err)
        setError('Не удалось получить доступ к камере. Разрешите доступ в настройках браузера.')
      })

    // Cleanup
    return () => {
      if (sceneRef.current) {
        const video = sceneRef.current.querySelector('video')
        if (video && video.srcObject) {
          const tracks = (video.srcObject as MediaStream).getTracks()
          tracks.forEach(track => track.stop())
        }
      }
    }
  }, [])

  const renderModel = (markerData: any, index: number) => {
    const { model, color } = markerData
    const position = '0 0.5 0'
    const scale = '1 1 1'

    switch (model) {
      case 'box':
        return (
          <a-box
            key={index}
            position={position}
            scale={scale}
            color={color}
            shadow="cast: true; receive: false"
            animation="property: rotation; to: 0 360 0; loop: true; dur: 4000; easing: linear"
          />
        )
      case 'sphere':
        return (
          <a-sphere
            key={index}
            position={position}
            radius="0.6"
            color={color}
            shadow="cast: true; receive: false"
            animation="property: position; to: 0 0.8 0; dir: alternate; loop: true; dur: 2000; easing: easeInOutSine"
          />
        )
      case 'cylinder':
        return (
          <a-cylinder
            key={index}
            position={position}
            radius="0.4"
            height="1.2"
            color={color}
            shadow="cast: true; receive: false"
            animation="property: rotation; to: 0 360 0; loop: true; dur: 3000; easing: linear"
          />
        )
      case 'cone':
        return (
          <a-cone
            key={index}
            position={position}
            radius-bottom="0.6"
            radius-top="0"
            height="1.2"
            color={color}
            shadow="cast: true; receive: false"
            animation="property: rotation; to: 0 360 0; loop: true; dur: 3500; easing: linear"
          />
        )
      case 'torus':
        return (
          <a-torus
            key={index}
            position={position}
            radius="0.5"
            radius-tubular="0.1"
            color={color}
            shadow="cast: true; receive: false"
            animation="property: rotation; to: 360 0 360; loop: true; dur: 5000; easing: linear"
          />
        )
      default:
        return null
    }
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '2rem',
          borderRadius: '20px',
          maxWidth: '500px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ marginBottom: '1rem' }}>Ошибка доступа к камере</h2>
          <p style={{ marginBottom: '2rem', opacity: 0.9 }}>{error}</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/subjects" className="btn" style={{
              background: 'white',
              color: '#667eea',
              padding: '0.8rem 1.5rem'
            }}>
              ← Назад к предметам
            </Link>
            <Link to="/markers" className="btn" style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '2px solid white',
              padding: '0.8rem 1.5rem'
            }}>
              Посмотреть маркеры
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* AR Scene */}
      {arReady && (
        <a-scene
          ref={sceneRef}
          embedded
          arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3; trackingMethod: best;"
          vr-mode-ui="enabled: false"
          renderer="logarithmicDepthBuffer: true; precision: medium; antialias: true; alpha: true;"
          style={{ width: '100%', height: '100%' }}
        >
          {/* Ambient light */}
          <a-entity light="type: ambient; color: #FFF; intensity: 0.6" />
          <a-entity light="type: directional; color: #FFF; intensity: 0.8" position="1 1 1" />

          {/* Markers */}
          {currentSubject.markers.map((marker: any, index: number) => (
            <a-marker
              key={index}
              preset={marker.type}
              smooth="true"
              smoothCount="5"
              smoothTolerance="0.01"
              smoothThreshold="2"
            >
              {renderModel(marker, index)}
            </a-marker>
          ))}

          {/* Camera */}
          <a-entity camera />
        </a-scene>
      )}

      {/* UI Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '1rem',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
        zIndex: 1000,
        pointerEvents: 'none'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'auto'
        }}>
          <Link
            to="/subjects"
            className="btn"
            style={{
              background: 'rgba(255,255,255,0.9)',
              color: currentSubject.color,
              padding: '0.6rem 1rem',
              fontSize: '0.9rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}
          >
            ← Назад
          </Link>
          <div style={{
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '0.6rem 1rem',
            borderRadius: '10px',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ fontSize: '1.2rem' }}>{currentSubject.emoji}</span>
            <span>{currentSubject.name}</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '1rem',
        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
        zIndex: 1000,
        pointerEvents: 'none'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          padding: '1rem',
          borderRadius: '15px',
          maxWidth: '500px',
          margin: '0 auto',
          pointerEvents: 'auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '0.8rem'
          }}>
            <div style={{ fontSize: '2rem' }}>🎯</div>
            <div>
              <h3 style={{ margin: 0, color: currentSubject.color, fontSize: '1.1rem' }}>
                Как использовать AR
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
                Наведите камеру на маркер
              </p>
            </div>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '0.8rem',
            marginBottom: '0.8rem'
          }}>
            {currentSubject.markers.map((marker: any, index: number) => (
              <div
                key={index}
                style={{
                  background: `${currentSubject.color}15`,
                  padding: '0.6rem',
                  borderRadius: '10px',
                  textAlign: 'center',
                  border: `2px solid ${currentSubject.color}30`
                }}
              >
                <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '0.2rem' }}>
                  {marker.type === 'hiro' ? 'Hiro' : 'Kanji'}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: currentSubject.color }}>
                  {marker.name}
                </div>
              </div>
            ))}
          </div>

          <Link
            to="/markers"
            className="btn"
            style={{
              background: currentSubject.color,
              color: 'white',
              width: '100%',
              textAlign: 'center',
              padding: '0.7rem',
              fontSize: '0.9rem',
              display: 'block'
            }}
          >
            📄 Открыть маркеры для печати
          </Link>
        </div>
      </div>

      {/* Loading indicator */}
      {!arReady && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: currentSubject.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          zIndex: 2000,
          flexDirection: 'column'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📷</div>
          <h2>Инициализация камеры...</h2>
          <p style={{ opacity: 0.8, marginTop: '0.5rem' }}>
            Пожалуйста, разрешите доступ к камере
          </p>
        </div>
      )}
    </div>
  )
}

export default ARScanner
