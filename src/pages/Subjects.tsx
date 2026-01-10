import { Link } from 'react-router-dom'
import { useState } from 'react'

function Subjects() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const isMobile = window.innerWidth < 768

  const subjects = [
    {
      id: 'geometry',
      name: 'Геометрия',
      emoji: '📐',
      color: '#667eea',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      models: ['Куб', 'Пирамида', 'Сфера', 'Цилиндр'],
      description: 'Изучай объёмные фигуры в 3D',
      features: ['4 модели', 'Интерактивные', 'AR готовы']
    },
    {
      id: 'biology',
      name: 'Биология',
      emoji: '🧬',
      color: '#22c55e',
      gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      models: ['Клетка', 'ДНК', 'Сердце', 'Нейрон'],
      description: 'Увидь строение живых организмов',
      features: ['Детальные модели', 'Анимации', 'Обучающие']
    },
    {
      id: 'chemistry',
      name: 'Химия',
      emoji: '⚗️',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      models: ['H₂O', 'CH₄', 'CO₂', 'NaCl'],
      description: 'Молекулы и их структура',
      features: ['Атомы', 'Связи', 'Кристаллы']
    },
    {
      id: 'physics',
      name: 'Физика',
      emoji: '⚡',
      color: '#ec4899',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
      models: ['Цепь', 'Магнит', 'Волна', 'Атом'],
      description: 'Физические процессы и явления',
      features: ['Симуляции', 'Динамика', 'Наглядно']
    }
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: isMobile ? '1.5rem 1rem' : '2.5rem 2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Декоративный фон */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
        background: `
          radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(255,255,255,0.2) 0%, transparent 50%)
        `,
        pointerEvents: 'none'
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1400px', margin: '0 auto' }}>
        <Link to="/" className="btn btn-secondary" style={{
          background: 'rgba(255,255,255,0.2)',
          color: 'white',
          marginBottom: isMobile ? '1.5rem' : '2.5rem',
          display: 'inline-block',
          border: '2px solid rgba(255,255,255,0.4)',
          backdropFilter: 'blur(10px)',
          fontSize: isMobile ? '0.9rem' : '1rem',
          padding: isMobile ? '0.7rem 1.2rem' : '0.9rem 1.5rem'
        }}>
          ← Назад на главную
        </Link>

        <div style={{ textAlign: 'center', marginBottom: isMobile ? '2rem' : '3rem' }}>
          <h1 style={{
            color: 'white',
            fontSize: isMobile ? '2rem' : 'clamp(2.5rem, 5vw, 3.5rem)',
            marginBottom: isMobile ? '0.8rem' : '1rem',
            fontWeight: 800,
            textShadow: '2px 4px 12px rgba(0,0,0,0.3)',
            letterSpacing: '-0.02em'
          }}>
            Выберите предмет
          </h1>
          
          <p style={{
            color: 'rgba(255,255,255,0.95)',
            marginBottom: 0,
            fontSize: isMobile ? '1rem' : 'clamp(1.1rem, 2vw, 1.3rem)',
            maxWidth: '700px',
            margin: '0 auto',
            textShadow: '1px 2px 8px rgba(0,0,0,0.2)'
          }}>
            Каждый предмет содержит интерактивные 3D-модели с AR-поддержкой
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile 
            ? '1fr' 
            : 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))',
          gap: isMobile ? '1.5rem' : '2rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {subjects.map(subject => (
            <div
              key={subject.id}
              style={{
                background: 'white',
                borderRadius: isMobile ? '18px' : '24px',
                padding: isMobile ? '1.5rem' : '2rem',
                boxShadow: hoveredCard === subject.id && !isMobile
                  ? '0 20px 60px rgba(0,0,0,0.3)'
                  : '0 10px 40px rgba(0,0,0,0.2)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transform: hoveredCard === subject.id && !isMobile ? 'translateY(-12px) scale(1.02)' : 'translateY(0) scale(1)'
              }}
              onMouseEnter={() => !isMobile && setHoveredCard(subject.id)}
              onMouseLeave={() => !isMobile && setHoveredCard(null)}
              onTouchStart={() => isMobile && setHoveredCard(subject.id)}
            >
              {/* Градиентный фон при ховере */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '6px',
                background: subject.gradient,
                opacity: hoveredCard === subject.id ? 1 : 0,
                transition: 'opacity 0.3s ease'
              }} />

              <div style={{
                fontSize: isMobile ? '3.5rem' : '4.5rem',
                textAlign: 'center',
                marginBottom: isMobile ? '0.8rem' : '1rem',
                filter: hoveredCard === subject.id ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' : 'none',
                transition: 'all 0.3s ease',
                transform: hoveredCard === subject.id ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)'
              }}>
                {subject.emoji}
              </div>
              
              <h2 style={{
                textAlign: 'center',
                color: subject.color,
                marginBottom: isMobile ? '0.8rem' : '1rem',
                fontSize: isMobile ? '1.6rem' : '2rem',
                fontWeight: 700,
                letterSpacing: '-0.01em'
              }}>
                {subject.name}
              </h2>

              <p style={{
                textAlign: 'center',
                color: '#666',
                marginBottom: isMobile ? '1rem' : '1.5rem',
                fontSize: isMobile ? '0.9rem' : '1rem',
                lineHeight: '1.6'
              }}>
                {subject.description}
              </p>

              {/* Features badges */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                justifyContent: 'center',
                marginBottom: isMobile ? '1rem' : '1.5rem'
              }}>
                {subject.features.map((feature, i) => (
                  <span
                    key={i}
                    style={{
                      background: `${subject.color}15`,
                      color: subject.color,
                      padding: '0.4rem 0.9rem',
                      borderRadius: '20px',
                      fontSize: isMobile ? '0.75rem' : '0.85rem',
                      fontWeight: 600,
                      border: `1px solid ${subject.color}30`,
                      transition: 'all 0.3s ease',
                      transform: hoveredCard === subject.id ? 'translateY(-2px)' : 'translateY(0)'
                    }}
                  >
                    {feature}
                  </span>
                ))}
              </div>

              {/* Models grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.5rem',
                marginBottom: isMobile ? '1.2rem' : '1.5rem'
              }}>
                {subject.models.map((model, i) => (
                  <div
                    key={i}
                    style={{
                      background: `${subject.color}08`,
                      color: subject.color,
                      padding: isMobile ? '0.5rem' : '0.6rem',
                      borderRadius: '10px',
                      fontSize: isMobile ? '0.8rem' : '0.9rem',
                      fontWeight: 500,
                      textAlign: 'center',
                      border: `1px solid ${subject.color}20`,
                      transition: 'all 0.3s ease',
                      transform: hoveredCard === subject.id ? 'scale(1.05)' : 'scale(1)'
                    }}
                  >
                    {model}
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div style={{
                display: 'flex',
                gap: isMobile ? '0.6rem' : '0.8rem',
                flexDirection: 'column'
              }}>
                <Link
                  to={`/gallery/${subject.id}`}
                  className="btn"
                  style={{
                    background: subject.gradient,
                    color: 'white',
                    width: '100%',
                    textAlign: 'center',
                    padding: isMobile ? '0.8rem' : '0.9rem',
                    fontSize: isMobile ? '0.95rem' : '1rem',
                    fontWeight: 700,
                    borderRadius: '12px',
                    boxShadow: hoveredCard === subject.id 
                      ? `0 8px 20px ${subject.color}40`
                      : '0 4px 12px rgba(0,0,0,0.15)',
                    transform: hoveredCard === subject.id ? 'scale(1.03)' : 'scale(1)',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  🎨 3D Галерея
                </Link>
                <Link
                  to={`/ar/${subject.id}`}
                  className="btn"
                  style={{
                    background: 'white',
                    color: subject.color,
                    border: `2px solid ${subject.color}`,
                    width: '100%',
                    textAlign: 'center',
                    padding: isMobile ? '0.8rem' : '0.9rem',
                    fontSize: isMobile ? '0.95rem' : '1rem',
                    fontWeight: 700,
                    borderRadius: '12px',
                    transform: hoveredCard === subject.id ? 'scale(1.03)' : 'scale(1)',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  📱 AR-режим
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Info section */}
        <div style={{
          marginTop: isMobile ? '2rem' : '3rem',
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(20px)',
          padding: isMobile ? '1.5rem' : '2rem',
          borderRadius: '20px',
          border: '2px solid rgba(255,255,255,0.3)',
          textAlign: 'center',
          color: 'white'
        }}>
          <h3 style={{
            fontSize: isMobile ? '1.3rem' : '1.6rem',
            marginBottom: isMobile ? '0.8rem' : '1rem',
            fontWeight: 700
          }}>
            💡 Как использовать
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: isMobile ? '1rem' : '1.5rem',
            marginTop: isMobile ? '1rem' : '1.5rem'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: isMobile ? '1rem' : '1.2rem',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: isMobile ? '2rem' : '2.5rem', marginBottom: '0.5rem' }}>🎨</div>
              <h4 style={{ marginBottom: '0.5rem', fontSize: isMobile ? '1rem' : '1.1rem' }}>3D Галерея</h4>
              <p style={{ fontSize: isMobile ? '0.85rem' : '0.9rem', opacity: 0.9, margin: 0, lineHeight: '1.5' }}>
                Рассматривай модели на экране с вращением и масштабированием
              </p>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: isMobile ? '1rem' : '1.2rem',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: isMobile ? '2rem' : '2.5rem', marginBottom: '0.5rem' }}>📱</div>
              <h4 style={{ marginBottom: '0.5rem', fontSize: isMobile ? '1rem' : '1.1rem' }}>AR-режим</h4>
              <p style={{ fontSize: isMobile ? '0.85rem' : '0.9rem', opacity: 0.9, margin: 0, lineHeight: '1.5' }}>
                Наведи камеру на маркер и увидь модели в реальном мире
              </p>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: isMobile ? '1rem' : '1.2rem',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: isMobile ? '2rem' : '2.5rem', marginBottom: '0.5rem' }}>🖨️</div>
              <h4 style={{ marginBottom: '0.5rem', fontSize: isMobile ? '1rem' : '1.1rem' }}>Маркеры</h4>
              <p style={{ fontSize: isMobile ? '0.85rem' : '0.9rem', opacity: 0.9, margin: 0, lineHeight: '1.5' }}>
                Распечатай специальные маркеры для AR-распознавания
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Subjects
