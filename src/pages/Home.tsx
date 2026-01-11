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
      {/* Фоновые элементы */}
      <div style={{
        position: 'absolute', top: '-50%', right: '-20%', width: '60%', height: '60%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(60px)', animation: 'float 20s ease-in-out infinite', pointerEvents: 'none'
      }} />
      
      <div style={{
        position: 'relative', zIndex: 1, opacity: isLoaded ? 1 : 0,
        transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        maxWidth: '800px', padding: isMobile ? '1rem' : '2rem'
      }}>
        {/* Logo */}
        <div style={{
          fontSize: isMobile ? '4rem' : '5rem', marginBottom: isMobile ? '0.5rem' : '1rem',
          animation: 'bounce 2s ease-in-out infinite', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))'
        }}>
          🚀
        </div>

        <h1 style={{ marginBottom: isMobile ? '0.8rem' : '1rem', animation: 'fadeInUp 0.8s ease-out 0.2s both' }}>
          AR Блокнот
        </h1>
        
        <p style={{
          marginBottom: isMobile ? '2rem' : '3rem', animation: 'fadeInUp 0.8s ease-out 0.4s both', lineHeight: '1.6'
        }}>
          Интерактивное обучение будущего.<br />
          AR-модели, 3D-галерея и персональный ИИ-учитель.
        </p>
        
        {/* BUTTONS GROUP */}
        <div className="button-group" style={{ animation: 'fadeInUp 0.8s ease-out 0.6s both', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          
          {/* Main Action */}
          <Link to="/subjects" className="btn btn-primary" style={{ width: '100%', maxWidth: '300px' }}>
             📚 Выбрать предмет
          </Link>

          {/* NEW AI BUTTON - Highlighted */}
          <Link to="/chat" className="btn" style={{
            background: 'linear-gradient(90deg, #ff00cc 0%, #333399 100%)',
            color: 'white', width: '100%', maxWidth: '300px',
            boxShadow: '0 0 20px rgba(255, 0, 204, 0.4)',
            border: '1px solid rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
          }}>
            🤖 AI Репетитор
            <span style={{ fontSize: '0.7rem', background: '#fff', color: '#333', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>NEW</span>
          </Link>
          
          <Link to="/markers" className="btn btn-secondary" style={{ width: '100%', maxWidth: '300px' }}>
            🖼️ Скачать маркеры
          </Link>
        </div>

        {/* Feature highlights */}
        <div style={{
          marginTop: isMobile ? '3rem' : '4rem',
          display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? '1rem' : '1.5rem',
          animation: 'fadeInUp 0.8s ease-out 0.8s both'
        }}>
          {['🎨 3D Галерея', '📱 AR-режим', '🧠 ИИ-Помощник'].map((text, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
              padding: isMobile ? '1rem' : '1.5rem', borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.2)', textAlign: 'center'
            }}>
              <h3 style={{ fontSize: isMobile ? '1rem' : '1.1rem', margin: 0 }}>{text}</h3>
            </div>
          ))}
        </div>
      </div>

      <style>
        {`
          @keyframes float { 0%, 100% { transform: translate(0, 0) rotate(0deg); } 33% { transform: translate(30px, -30px) rotate(120deg); } 66% { transform: translate(-20px, 20px) rotate(240deg); } }
          @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        `}
      </style>
    </div>
  )
}

export default Home
