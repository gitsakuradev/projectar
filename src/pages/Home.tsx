import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

function Home() {
  const [isLoaded, setIsLoaded] = useState(false)
  const isMobile = window.innerWidth < 768

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100)
  }, [])

  return (
    <div className="home-container" style={{
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Декоративные элементы фона */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-20%',
        width: '60%',
        height: '60%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        animation: 'float 20s ease-in-out infinite',
        pointerEvents: 'none'
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: '-30%',
        left: '-10%',
        width: '50%',
        height: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(50px)',
        animation: 'float 25s ease-in-out infinite reverse',
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'relative',
        zIndex: 1,
        opacity: isLoaded ? 1 : 0,
        transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        maxWidth: '800px',
        padding: isMobile ? '1rem' : '2rem'
      }}>
        {/* Logo/Icon */}
        <div style={{
          fontSize: isMobile ? '4rem' : '5rem',
          marginBottom: isMobile ? '0.5rem' : '1rem',
          animation: 'bounce 2s ease-in-out infinite',
          filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))'
        }}>
          🚀
        </div>

        <h1 style={{
          marginBottom: isMobile ? '0.8rem' : '1rem',
          animation: 'fadeInUp 0.8s ease-out 0.2s both'
        }}>
          AR Блокнот
        </h1>
        
        <p style={{
          marginBottom: isMobile ? '2rem' : '3rem',
          animation: 'fadeInUp 0.8s ease-out 0.4s both',
          lineHeight: '1.6'
        }}>
          Интерактивное обучение через 3D-модели и дополненную реальность.<br />
          Изучай геометрию, биологию, химию и физику в новом формате!
        </p>
        
        <div className="button-group" style={{
          animation: 'fadeInUp 0.8s ease-out 0.6s both'
        }}>
          <Link to="/subjects" className="btn btn-primary" style={{
            position: 'relative',
            overflow: 'hidden'
          }}>
            <span style={{ position: 'relative', zIndex: 1 }}>
              📚 Выбрать предмет
            </span>
          </Link>
          
          <Link to="/markers" className="btn btn-secondary">
            🖼️ Скачать маркеры
          </Link>
        </div>

        {/* Feature highlights */}
        <div style={{
          marginTop: isMobile ? '3rem' : '4rem',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: isMobile ? '1rem' : '1.5rem',
          animation: 'fadeInUp 0.8s ease-out 0.8s both'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            padding: isMobile ? '1rem' : '1.5rem',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.2)',
            textAlign: 'center',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)'
            e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
          }}>
            <div style={{ fontSize: isMobile ? '2rem' : '2.5rem', marginBottom: '0.5rem' }}>🎨</div>
            <h3 style={{ fontSize: isMobile ? '1rem' : '1.1rem', marginBottom: '0.3rem', fontWeight: 600 }}>
              3D Галерея
            </h3>
            <p style={{ fontSize: isMobile ? '0.85rem' : '0.9rem', opacity: 0.9, margin: 0 }}>
              Интерактивный просмотр моделей
            </p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            padding: isMobile ? '1rem' : '1.5rem',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.2)',
            textAlign: 'center',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)'
            e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
          }}>
            <div style={{ fontSize: isMobile ? '2rem' : '2.5rem', marginBottom: '0.5rem' }}>📱</div>
            <h3 style={{ fontSize: isMobile ? '1rem' : '1.1rem', marginBottom: '0.3rem', fontWeight: 600 }}>
              AR-режим
            </h3>
            <p style={{ fontSize: isMobile ? '0.85rem' : '0.9rem', opacity: 0.9, margin: 0 }}>
              Модели в реальном мире
            </p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            padding: isMobile ? '1rem' : '1.5rem',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.2)',
            textAlign: 'center',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)'
            e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
          }}>
            <div style={{ fontSize: isMobile ? '2rem' : '2.5rem', marginBottom: '0.5rem' }}>🎓</div>
            <h3 style={{ fontSize: isMobile ? '1rem' : '1.1rem', marginBottom: '0.3rem', fontWeight: 600 }}>
              4 предмета
            </h3>
            <p style={{ fontSize: isMobile ? '0.85rem' : '0.9rem', opacity: 0.9, margin: 0 }}>
              16 интерактивных моделей
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div style={{
          marginTop: isMobile ? '2rem' : '3rem',
          padding: isMobile ? '1rem' : '1.5rem',
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.15)',
          animation: 'fadeInUp 0.8s ease-out 1s both'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: isMobile ? '1rem' : '1.5rem',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: isMobile ? '1.8rem' : '2rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                📐
              </div>
              <div style={{ fontSize: isMobile ? '0.8rem' : '0.85rem', opacity: 0.85 }}>Геометрия</div>
            </div>
            <div>
              <div style={{ fontSize: isMobile ? '1.8rem' : '2rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                🧬
              </div>
              <div style={{ fontSize: isMobile ? '0.8rem' : '0.85rem', opacity: 0.85 }}>Биология</div>
            </div>
            <div>
              <div style={{ fontSize: isMobile ? '1.8rem' : '2rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                ⚗️
              </div>
              <div style={{ fontSize: isMobile ? '0.8rem' : '0.85rem', opacity: 0.85 }}>Химия</div>
            </div>
            <div>
              <div style={{ fontSize: isMobile ? '1.8rem' : '2rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                ⚡
              </div>
              <div style={{ fontSize: isMobile ? '0.8rem' : '0.85rem', opacity: 0.85 }}>Физика</div>
            </div>
          </div>
        </div>

        {/* Browser compatibility hint */}
        <div style={{
          marginTop: isMobile ? '1.5rem' : '2rem',
          fontSize: isMobile ? '0.75rem' : '0.8rem',
          opacity: 0.7,
          textAlign: 'center',
          animation: 'fadeInUp 0.8s ease-out 1.2s both'
        }}>
          <p style={{ margin: 0 }}>
            💡 Для AR-режима используйте Chrome (Android) или Safari (iOS)
          </p>
        </div>
      </div>

      <style>
        {`
          @keyframes float {
            0%, 100% {
              transform: translate(0, 0) rotate(0deg);
            }
            33% {
              transform: translate(30px, -30px) rotate(120deg);
            }
            66% {
              transform: translate(-20px, 20px) rotate(240deg);
            }
          }

          @keyframes bounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-20px);
            }
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  )
}

export default Home
