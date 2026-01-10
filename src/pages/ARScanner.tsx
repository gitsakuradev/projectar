import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'a-scene': any
      'a-marker': any
      'a-entity': any
      'a-box': any
      'a-sphere': any
      'a-cylinder': any
      'a-plane': any
      'a-text': any
    }
  }
}

function ARScanner() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1500)
  }, [])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: '#667eea',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          color: 'white',
          fontSize: '1.5rem',
          flexDirection: 'column'
        }}>
          <div>⏳ Загрузка AR...</div>
          <div style={{fontSize: '1rem', marginTop: '1rem', opacity: 0.8}}>
            Разрешите доступ к камере
          </div>
        </div>
      )}

      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 100,
      }}>
        <Link 
          to="/" 
          className="btn btn-secondary"
          style={{
            background: 'rgba(255,255,255,0.9)',
            color: '#667eea',
            fontSize: '0.9rem',
            padding: '0.7rem 1.2rem'
          }}
        >
          ← Выход
        </Link>
      </div>

      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '1rem 2rem',
        borderRadius: '12px',
        zIndex: 100,
        textAlign: 'center',
        maxWidth: '90%'
      }}>
        <div style={{fontSize: '1.1rem', marginBottom: '0.5rem'}}>
          📸 Наведите камеру на маркер
        </div>
        <div style={{fontSize: '0.9rem', opacity: 0.8}}>
          Используйте маркеры Hiro или Kanji
        </div>
      </div>

      <a-scene
        embedded
        arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;"
        vr-mode-ui="enabled: false"
        renderer="logarithmicDepthBuffer: true; precision: medium;"
      >
        {/* Маркер 1 - Hiro - Вращающийся куб */}
        <a-marker preset="hiro">
          <a-box
            position="0 0.5 0"
            material="color: #FF0000; metalness: 0.5; roughness: 0.3;"
            animation="property: rotation; to: 0 360 0; loop: true; dur: 3000; easing: linear"
            shadow
          />
          <a-text
            value="Куб"
            position="0 1.5 0"
            align="center"
            color="#FFFFFF"
            scale="2 2 2"
          />
        </a-marker>

        {/* Маркер 2 - Kanji - Золотая сфера */}
        <a-marker preset="kanji">
          <a-sphere
            position="0 0.5 0"
            radius="0.5"
            material="color: #FFD700; metalness: 0.8; roughness: 0.2;"
            animation="property: position; to: 0 1 0; dur: 2000; easing: easeInOutSine; loop: true; dir: alternate"
            shadow
          />
          <a-text
            value="Сфера"
            position="0 1.8 0"
            align="center"
            color="#FFFFFF"
            scale="2 2 2"
          />
        </a-marker>

        {/* Камера */}
        <a-entity camera />
      </a-scene>
    </div>
  )
}

export default ARScanner
