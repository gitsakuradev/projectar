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
      padding: '1.5rem'
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
          <p style={{
            textAlign: 'center',
            color: '#666',
            marginBottom: '1.5rem',
            fontSize: window.innerWidth < 768 ? '0.95rem' : '1.1rem'
          }}>
            Распечатайте маркеры и наведите на них камеру в AR-режиме
          </p>

          <div style={{
            background: '#f0f4ff',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '2px solid #667eea'
          }}>
            <h3 style={{ color: '#667eea', marginBottom: '1rem', fontSize: '1.2rem' }}>
              📋 Инструкция по использованию
            </h3>
            <ol style={{ color: '#555', lineHeight: '1.8', paddingLeft: '1.5rem' }}>
              <li><strong>Распечатайте</strong> один или оба маркера на белой бумаге формата A4</li>
              <li><strong>Размер маркера:</strong> не менее 10x10 см для лучшего распознавания</li>
              <li><strong>Откройте AR-сканер</strong> на вашем устройстве</li>
              <li><strong>Разрешите доступ к камере</strong> при первом запуске</li>
              <li><strong>Наведите камеру</strong> на распечатанный маркер</li>
              <li><strong>Держите ровно</strong> - 3D-модель появится автоматически</li>
            </ol>
          </div>
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

              <p style={{
                color: '#666',
                marginBottom: '1rem',
                textAlign: 'center',
                fontSize: '0.95rem'
              }}>
                {marker.description}
              </p>

              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                {marker.subjects.map((subject, i) => (
                  <span
                    key={i}
                    style={{
                      background: '#667eea20',
                      color: '#667eea',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '600'
                    }}
                  >
                    {subject}
                  </span>
                ))}
              </div>

              <div style={{
                background: '#fff9e6',
                padding: '0.8rem',
                borderRadius: '10px',
                marginBottom: '1.5rem',
                border: '1px solid #ffd700'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>💡</span>
                  <p style={{
                    color: '#666',
                    fontSize: '0.85rem',
                    margin: 0,
                    lineHeight: '1.5'
                  }}>
                    {marker.tip}
                  </p>
                </div>
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
                    fontWeight: '600'
                  }}
                >
                  📥 Скачать маркер
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    window.print()
                  }}
                  className="btn"
                  style={{
                    background: 'white',
                    color: '#667eea',
                    border: '2px solid #667eea',
                    width: '100%',
                    padding: '0.9rem',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}
                >
                  🖨️ Печать
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: '3rem',
          background: 'rgba(255,255,255,0.95)',
          padding: '2rem',
          borderRadius: '20px',
          textAlign: 'center',
          boxShadow: '0 5px 20px rgba(0,0,0,0.15)'
        }}>
          <h3 style={{ color: '#667eea', marginBottom: '1rem' }}>
            ⚡ Советы для лучшего распознавания
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(3, 1fr)',
            gap: '1.5rem',
            marginTop: '1.5rem'
          }}>
            <div style={{
              background: '#f0f4ff',
              padding: '1.5rem',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💡</div>
              <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>Освещение</h4>
              <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
                Используйте хорошее яркое освещение без бликов
              </p>
            </div>
            <div style={{
              background: '#f0f4ff',
              padding: '1.5rem',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📏</div>
              <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>Расстояние</h4>
              <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
                Держите камеру на расстоянии 20-30 см от маркера
              </p>
            </div>
            <div style={{
              background: '#f0f4ff',
              padding: '1.5rem',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📐</div>
              <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>Угол</h4>
              <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
                Маркер должен быть параллелен камере
              </p>
            </div>
          </div>

          <Link
            to="/ar"
            className="btn"
            style={{
              background: '#22c55e',
              color: 'white',
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              marginTop: '2rem',
              display: 'inline-block'
            }}
          >
            🚀 Попробовать AR сейчас →
          </Link>
        </div>

        <div style={{
          marginTop: '2rem',
          background: 'rgba(255,255,255,0.1)',
          padding: '1.5rem',
          borderRadius: '15px',
          textAlign: 'center',
          color: 'white'
        }}>
          <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>
            <strong>Проблемы с распознаванием?</strong><br />
            Убедитесь, что вы разрешили доступ к камере в настройках браузера.<br />
            Лучше всего работает в Chrome (Android) и Safari (iOS).
          </p>
        </div>
      </div>

      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .marker-image, .marker-image * {
              visibility: visible;
            }
            .marker-image {
              position: absolute;
              left: 50%;
              top: 50%;
              transform: translate(-50%, -50%);
            }
          }
        `}
      </style>
    </div>
  )
}

export default Markers
