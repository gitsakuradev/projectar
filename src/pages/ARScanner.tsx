import { useEffect, useState } from 'react'
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
      'a-torus': any
      'a-cone': any
      'a-plane': any
      'a-text': any
      'a-light': any
    }
  }
}

function ARScanner() {
  const { subject = 'geometry' } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [markersFound, setMarkersFound] = useState<string[]>([])

  const subjectData: Record<string, any> = {
    geometry: { name: 'Геометрия', emoji: '📐', color: '#667eea' },
    biology: { name: 'Биология', emoji: '🧬', color: '#22c55e' },
    chemistry: { name: 'Химия', emoji: '⚗️', color: '#f59e0b' },
    physics: { name: 'Физика', emoji: '⚡', color: '#ec4899' }
  }

  const currentSubject = subjectData[subject] || subjectData.geometry

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1500)

    const handleMarkerFound = (e: any) => {
      const markerName = e.target.getAttribute('preset') || 'custom'
      setMarkersFound(prev => {
        if (!prev.includes(markerName)) {
          return [...prev, markerName]
        }
        return prev
      })
    }

    const scene = document.querySelector('a-scene')
    if (scene) {
      const markers = scene.querySelectorAll('a-marker')
      markers.forEach(marker => {
        marker.addEventListener('markerFound', handleMarkerFound)
      })
    }

    return () => {
      if (scene) {
        const markers = scene.querySelectorAll('a-marker')
        markers.forEach(marker => {
          marker.removeEventListener('markerFound', handleMarkerFound)
        })
      }
    }
  }, [isLoading])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `linear-gradient(135deg, ${currentSubject.color} 0%, #764ba2 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          color: 'white',
          fontSize: '1.5rem',
          flexDirection: 'column'
        }}>
          <div style={{fontSize: '4rem', marginBottom: '1rem'}}>{currentSubject.emoji}</div>
          <div>Загрузка AR: {currentSubject.name}</div>
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

      {markersFound.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(34, 197, 94, 0.9)',
          color: 'white',
          padding: '0.8rem 1.2rem',
          borderRadius: '12px',
          zIndex: 100,
          fontWeight: 'bold',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
        }}>
          ✓ Маркер распознан!
        </div>
      )}

      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.85)',
        color: 'white',
        padding: '1.2rem 2rem',
        borderRadius: '16px',
        zIndex: 100,
        textAlign: 'center',
        maxWidth: '90%',
        boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
      }}>
        <div style={{fontSize: '1.3rem', marginBottom: '0.5rem', fontWeight: 'bold'}}>
          {currentSubject.emoji} {currentSubject.name}
        </div>
        <div style={{fontSize: '0.9rem', opacity: 0.9}}>
          Наведите камеру на маркер из учебника
        </div>
      </div>

      <a-scene
        embedded
        arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;"
        vr-mode-ui="enabled: false"
        renderer="logarithmicDepthBuffer: true; precision: medium; antialias: true; alpha: true;"
      >
        <a-light type="ambient" color="#ffffff" intensity="0.8" />
        <a-light type="directional" color="#ffffff" intensity="0.6" position="2 4 2" />

        {subject === 'geometry' && (
          <>
            {/* Маркер Hiro - Куб */}
            <a-marker preset="hiro">
              <a-box
                position="0 0.5 0"
                width="1"
                height="1"
                depth="1"
                material="color: #667eea; metalness: 0.3; roughness: 0.4;"
                animation="property: rotation; to: 0 360 0; loop: true; dur: 5000; easing: linear"
              />
              {/* Рёбра куба */}
              <a-entity
                position="0 0.5 0"
                geometry="primitive: box; width: 1.02; height: 1.02; depth: 1.02"
                material="wireframe: true; color: #ffffff; opacity: 0.8"
              />
              <a-text
                value="Куб\na = b = c"
                position="0 1.8 0"
                align="center"
                color="#FFFFFF"
                scale="1.5 1.5 1.5"
                font="https://cdn.aframe.io/fonts/Roboto-msdf.json"
              />
            </a-marker>

            {/* Маркер Kanji - Пирамида */}
            <a-marker preset="kanji">
              <a-cone
                position="0 0.7 0"
                radius-bottom="0.8"
                radius-top="0"
                height="1.5"
                material="color: #22c55e; metalness: 0.3; roughness: 0.4;"
                animation="property: rotation; to: 0 360 0; loop: true; dur: 6000; easing: linear"
              />
              <a-text
                value="Пирамида\nV = 1/3 Sh"
                position="0 2 0"
                align="center"
                color="#FFFFFF"
                scale="1.3 1.3 1.3"
                font="https://cdn.aframe.io/fonts/Roboto-msdf.json"
              />
            </a-marker>
          </>
        )}

        {subject === 'biology' && (
          <>
            {/* Маркер Hiro - Клетка */}
            <a-marker preset="hiro">
              {/* Оболочка клетки */}
              <a-sphere
                position="0 0.8 0"
                radius="0.8"
                material="color: #22c55e; transparent: true; opacity: 0.6;"
                animation="property: scale; to: 1.1 1.1 1.1; loop: true; dur: 3000; dir: alternate; easing: easeInOutSine"
              />
              {/* Ядро */}
              <a-sphere
                position="0 0.8 0"
                radius="0.3"
                material="color: #16a34a; metalness: 0.5;"
              />
              {/* Органеллы */}
              <a-sphere position="0.4 0.8 0.3" radius="0.1" material="color: #fbbf24;" />
              <a-sphere position="-0.4 0.8 -0.2" radius="0.1" material="color: #fbbf24;" />
              <a-sphere position="0.2 1.2 0" radius="0.1" material="color: #fbbf24;" />
              <a-sphere position="-0.3 0.5 0.2" radius="0.1" material="color: #fbbf24;" />
              
              <a-text
                value="Клетка\nОснова жизни"
                position="0 2 0"
                align="center"
                color="#FFFFFF"
                scale="1.3 1.3 1.3"
                font="https://cdn.aframe.io/fonts/Roboto-msdf.json"
              />
            </a-marker>

            {/* Маркер Kanji - ДНК */}
            <a-marker preset="kanji">
              {/* Спираль ДНК (упрощённая) */}
              <a-entity position="0 0.8 0" rotation="0 0 0" animation="property: rotation; to: 0 360 0; loop: true; dur: 8000; easing: linear">
                <a-cylinder position="0.3 0" radius="0.08" height="2" material="color: #3b82f6;" rotation="0 0 30" />
                <a-cylinder position="-0.3 0" radius="0.08" height="2" material="color: #ef4444;" rotation="0 0 -30" />
                <a-cylinder position="0 0.5 0" radius="0.04" height="0.7" material="color: #fff;" rotation="0 0 90" />
                <a-cylinder position="0 0 0" radius="0.04" height="0.7" material="color: #fff;" rotation="0 0 90" />
                <a-cylinder position="0 -0.5 0" radius="0.04" height="0.7" material="color: #fff;" rotation="0 0 90" />
              </a-entity>
              
              <a-text
                value="ДНК\nГенетический код"
                position="0 2.2 0"
                align="center"
                color="#FFFFFF"
                scale="1.2 1.2 1.2"
                font="https://cdn.aframe.io/fonts/Roboto-msdf.json"
              />
            </a-marker>
          </>
        )}

        {subject === 'chemistry' && (
          <>
            {/* Маркер Hiro - H2O */}
            <a-marker preset="hiro">
              {/* Кислород */}
              <a-sphere
                position="0 0.8 0"
                radius="0.4"
                material="color: #ef4444; metalness: 0.6;"
              />
              {/* Водород 1 */}
              <a-sphere
                position="0.6 1.1 0"
                radius="0.25"
                material="color: #f0f0f0; metalness: 0.5;"
                animation="property: position; to: 0.7 1.2 0; loop: true; dur: 2000; dir: alternate; easing: easeInOutSine"
              />
              {/* Водород 2 */}
              <a-sphere
                position="-0.6 1.1 0"
                radius="0.25"
                material="color: #f0f0f0; metalness: 0.5;"
                animation="property: position; to: -0.7 1.2 0; loop: true; dur: 2000; dir: alternate; easing: easeInOutSine"
              />
              {/* Связи */}
              <a-cylinder position="0.3 0.95 0" radius="0.03" height="0.6" material="color: #999;" rotation="0 0 -40" />
              <a-cylinder position="-0.3 0.95 0" radius="0.03" height="0.6" material="color: #999;" rotation="0 0 40" />
              
              <a-entity rotation="0 0 0" animation="property: rotation; to: 0 360 0; loop: true; dur: 6000; easing: linear">
                <a-text
                  value="H2O\nМолекула воды"
                  position="0 2.2 0"
                  align="center"
                  color="#FFFFFF"
                  scale="1.3 1.3 1.3"
                  font="https://cdn.aframe.io/fonts/Roboto-msdf.json"
                />
              </a-entity>
            </a-marker>

            {/* Маркер Kanji - CH4 */}
            <a-marker preset="kanji">
              {/* Углерод */}
              <a-sphere
                position="0 0.8 0"
                radius="0.35"
                material="color: #1f1f1f; metalness: 0.7;"
              />
              {/* 4 атома водорода */}
              <a-sphere position="0 1.5 0" radius="0.22" material="color: #f0f0f0;" />
              <a-sphere position="0.7 0.5 0" radius="0.22" material="color: #f0f0f0;" />
              <a-sphere position="-0.4 0.5 0.6" radius="0.22" material="color: #f0f0f0;" />
              <a-sphere position="-0.4 0.5 -0.6" radius="0.22" material="color: #f0f0f0;" />
              
              <a-entity rotation="0 0 0" animation="property: rotation; to: 0 360 0; loop: true; dur: 5000; easing: linear">
                <a-text
                  value="CH4\nМетан"
                  position="0 2.3 0"
                  align="center"
                  color="#FFFFFF"
                  scale="1.4 1.4 1.4"
                  font="https://cdn.aframe.io/fonts/Roboto-msdf.json"
                />
              </a-entity>
            </a-marker>
          </>
        )}

        {subject === 'physics' && (
          <>
            {/* Маркер Hiro - Электрическая цепь */}
            <a-marker preset="hiro">
              {/* Батарея */}
              <a-box
                position="-0.8 0.8 0"
                width="0.3"
                height="0.6"
                depth="0.2"
                material="color: #1f1f1f;"
              />
              <a-text value="+" position="-0.8 1.2 0.15" align="center" color="#ef4444" scale="0.5 0.5 0.5" />
              <a-text value="-" position="-0.8 0.4 0.15" align="center" color="#3b82f6" scale="0.5 0.5 0.5" />
              
              {/* Лампочка */}
              <a-sphere
                position="0.8 0.8 0"
                radius="0.3"
                material="color: #fbbf24; emissive: #fbbf24; emissiveIntensity: 0.6;"
                animation="property: components.material.material.emissiveIntensity; from: 0.3; to: 0.9; loop: true; dur: 1000; dir: alternate; easing: easeInOutSine"
              />
              
              {/* Провода */}
              <a-box position="0 1.2 0" width="1.6" height="0.05" depth="0.05" material="color: #3b82f6;" />
              <a-box position="0 0.4 0" width="1.6" height="0.05" depth="0.05" material="color: #ef4444;" />
              <a-box position="-0.8 0.8 0" width="0.05" height="0.8" depth="0.05" material="color: #666;" />
              <a-box position="0.8 0.8 0" width="0.05" height="0.8" depth="0.05" material="color: #666;" />
              
              {/* Электроны (анимация) */}
              <a-sphere
                radius="0.08"
                material="color: #fbbf24; emissive: #fbbf24;"
                animation="property: position; from: -0.8 1.2 0.1; to: 0.8 1.2 0.1; loop: true; dur: 2000; easing: linear"
              />
              
              <a-text
                value="Цепь\nТок течёт"
                position="0 2 0"
                align="center"
                color="#FFFFFF"
                scale="1.2 1.2 1.2"
                font="https://cdn.aframe.io/fonts/Roboto-msdf.json"
              />
            </a-marker>

            {/* Маркер Kanji - Атом */}
            <a-marker preset="kanji">
              {/* Ядро */}
              <a-sphere
                position="0 0.8 0"
                radius="0.25"
                material="color: #fbbf24; emissive: #fbbf24; emissiveIntensity: 0.4;"
              />
              
              {/* Орбиты */}
              <a-torus
                position="0 0.8 0"
                radius="0.7"
                radius-tubular="0.02"
                material="color: #3b82f6; transparent: true; opacity: 0.5;"
                rotation="90 0 0"
              />
              <a-torus
                position="0 0.8 0"
                radius="1"
                radius-tubular="0.02"
                material="color: #ef4444; transparent: true; opacity: 0.5;"
                rotation="90 30 0"
              />
              
              {/* Электроны */}
              <a-sphere
                radius="0.1"
                material="color: #3b82f6;"
                animation="property: position; from: 0.7 0.8 0; to: -0.7 0.8 0; loop: true; dur: 2000; easing: linear; dir: alternate"
              />
              <a-sphere
                radius="0.1"
                material="color: #ef4444;"
                animation="property: position; from: 0 0.8 1; to: 0 0.8 -1; loop: true; dur: 3000; easing: linear; dir: alternate"
              />
              
              <a-entity rotation="0 0 0" animation="property: rotation; to: 0 360 0; loop: true; dur: 6000; easing: linear">
                <a-text
                  value="Атом\nБора"
                  position="0 2.2 0"
                  align="center"
                  color="#FFFFFF"
                  scale="1.4 1.4 1.4"
                  font="https://cdn.aframe.io/fonts/Roboto-msdf.json"
                />
              </a-entity>
            </a-marker>
          </>
        )}

        <a-entity camera look-controls="enabled: false" />
      </a-scene>
    </div>
  )
}

export default ARScanner
