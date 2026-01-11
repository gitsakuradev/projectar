import { Link } from 'react-router-dom'
import { useState } from 'react'

function Markers() {
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null)

  const markers = [
    {
      id: 0,
      name: 'Маркер Hiro',
      description: 'Классический AR-маркер для геометрии и биологии',
      patternUrl: 'https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/data/patt.hiro',
      imageUrl: 'https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/hiro.png',
      subjects: ['Геометрия 📐', 'Биология 🧬'],
      tip: 'Печатайте на белой бумаге A4, размер не менее 10x10 см'
    },
    {
      id: 1,
      name: 'Маркер Kanji',
      description: 'Японский иероглиф для химии и физики',
      patternUrl: 'https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/data/patt.kanji',
      imageUrl: 'https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/kanji.png',
      subjects: ['Химия ⚗️', 'Физика ⚡'],
      tip: 'Держите маркер ровно и хорошо освещенным'
    }
  ]

  const downloadMarker = (marker: typeof markers[0]) => {
    const link = document.createElement('a')
    link.href = marker.imageUrl
    link.download = `${marker.name.replace(/\s/g, '_')}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '1.5rem 1rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Link to="/subjects" className="btn btn-secondary" style={{
          background: 'rgba(255,255,255,0.2)',
          color: 'white',
          marginBottom: '2rem',
          display: 'inline-block',
          border: '2px solid white'
        }}>
          ← Назад к предметам
        </Link>
        
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          padding: '2rem',
          borderRadius: '20px',
          marginBottom: '2rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }}>
          <h1 style={{
            textAlign: 'center',
            marginBottom: '1rem',
            color: '#667eea',
            fontSize: window.innerWidth < 768 ? '1.8rem' : '2.5rem'
          }}>
            🎯 AR Маркеры
          </h1>

          <div style={{
            background: '#f0f4ff',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '2px solid #667eea',
            marginBottom: '2rem'
          }}>
            <h3 style={{ color: '#667eea', marginBottom: '1rem', fontSize: '1.2rem' }}>
              📋 Инструкция
            </h3>
            <ol style={{ color: '#555', lineHeight: '1.8', paddingLeft: '1.5rem' }}>
              <li><strong>Распечатайте</strong> один из маркеров ниже.</li>
              <li><strong>Наведите камеру</strong> в режиме AR Scanner.</li>
              <li>Для <strong>своих маркеров</strong>: используйте <a href="https://jeromeetienne.github.io/AR.js/three.js/examples/marker-training/examples/generator.html" target="_blank" rel="noopener noreferrer" style={{color: '#667eea'}}>онлайн-генератор</a>. Сохраните файл <code>.patt</code> и загрузите его прямо в AR режиме.</li>
            </ol>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(2, 1fr)',
            gap: '2rem'
          }}>
            {markers.map(marker => (
              <div
                key={marker.id}
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '2rem',
                  boxShadow: selectedMarker === marker.id
                    ? '0 15px 50px rgba(102, 126, 234, 0.4)'
                    : '0 5px 20px rgba(0,0,0,0.15)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  transform: selectedMarker === marker.id ? 'scale(1.02)' : 'scale(1)',
                  border: selectedMarker === marker.id ? '3px solid #667eea' : '3px solid transparent'
                }}
                onClick={() => setSelectedMarker(marker.id)}
              >
                <h3 style={{
                  marginBottom: '1rem',
                  color: '#667eea',
                  fontSize: '1.5rem',
                  textAlign: 'center'
                }}>
                  {marker.name}
                </h3>

                <div style={{
                  width: '100%',
                  maxWidth: '300px',
                  margin: '0 auto 1.5rem',
                  padding: '1rem',
                  background: '#f9f9f9',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img 
                    src={marker.imageUrl}
                    alt={marker.name}
                    style={{
                      width: '100%',
                      height: 'auto',
                      border: '4px solid #333',
                      borderRadius: '8px'
                    }}
                  />
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.8rem'
                }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      downloadMarker(marker)
                    }}
                    className="btn"
                    style={{
                      background: '#667eea',
                      color: 'white',
                      width: '100%',
                      padding: '0.9rem',
                      fontSize: '1rem',
                      fontWeight: '600',
                      borderRadius: '10px',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    📥 Скачать маркер
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Стили для печати */}
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            .marker-image, .marker-image * { visibility: visible; }
            .marker-image { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); }
          }
        `}
      </style>
    </div>
  )
}

export default Markers
