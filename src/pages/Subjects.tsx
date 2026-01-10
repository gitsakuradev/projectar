import { Link } from 'react-router-dom'

function Subjects() {
  const subjects = [
    {
      id: 'geometry',
      name: 'Геометрия',
      emoji: '📐',
      color: '#667eea',
      models: ['Куб', 'Пирамида', 'Сфера', 'Цилиндр'],
      description: 'Изучай объёмные фигуры в 3D'
    },
    {
      id: 'biology',
      name: 'Биология',
      emoji: '🧬',
      color: '#22c55e',
      models: ['Клетка', 'ДНК', 'Сердце', 'Нейрон'],
      description: 'Увидь строение живых организмов'
    },
    {
      id: 'chemistry',
      name: 'Химия',
      emoji: '⚗️',
      color: '#f59e0b',
      models: ['H₂O', 'CH₄', 'CO₂', 'NaCl'],
      description: 'Молекулы и их структура'
    },
    {
      id: 'physics',
      name: 'Физика',
      emoji: '⚡',
      color: '#ec4899',
      models: ['Цепь', 'Магнит', 'Волна', 'Атом'],
      description: 'Физические процессы и явления'
    }
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      <Link to="/" className="btn btn-secondary" style={{
        background: 'rgba(255,255,255,0.2)',
        color: 'white',
        marginBottom: '2rem',
        display: 'inline-block'
      }}>
        ← Назад
      </Link>

      <h1 style={{
        textAlign: 'center',
        color: 'white',
        fontSize: '2.5rem',
        marginBottom: '1rem'
      }}>
        Выберите предмет
      </h1>
      
      <p style={{
        textAlign: 'center',
        color: 'rgba(255,255,255,0.9)',
        marginBottom: '3rem',
        fontSize: '1.1rem'
      }}>
        Каждый предмет содержит интерактивные 3D-модели
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {subjects.map(subject => (
          <div
            key={subject.id}
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
              transition: 'transform 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <div style={{
              fontSize: '4rem',
              textAlign: 'center',
              marginBottom: '1rem'
            }}>
              {subject.emoji}
            </div>
            
            <h2 style={{
              textAlign: 'center',
              color: subject.color,
              marginBottom: '1rem',
              fontSize: '1.8rem'
            }}>
              {subject.name}
            </h2>

            <p style={{
              textAlign: 'center',
              color: '#666',
              marginBottom: '1.5rem',
              fontSize: '0.95rem'
            }}>
              {subject.description}
            </p>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              justifyContent: 'center',
              marginBottom: '1.5rem'
            }}>
              {subject.models.map((model, i) => (
                <span
                  key={i}
                  style={{
                    background: `${subject.color}20`,
                    color: subject.color,
                    padding: '0.4rem 0.8rem',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: '500'
                  }}
                >
                  {model}
                </span>
              ))}
            </div>

            <div style={{
              display: 'flex',
              gap: '0.5rem',
              flexDirection: 'column'
            }}>
              <Link
                to={`/gallery/${subject.id}`}
                className="btn"
                style={{
                  background: subject.color,
                  color: 'white',
                  width: '100%',
                  textAlign: 'center',
                  padding: '0.8rem'
                }}
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
                  padding: '0.8rem'
                }}
              >
                📱 AR-режим
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Subjects
