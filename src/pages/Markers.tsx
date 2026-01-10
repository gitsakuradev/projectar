import { Link } from 'react-router-dom'

function Markers() {
  const markers = [
    {
      id: 0,
      name: 'Маркер 1 - Куб',
      description: 'Красный вращающийся куб',
      patternUrl: 'https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/data/patt.hiro'
    },
    {
      id: 1,
      name: 'Маркер 2 - Сфера',
      description: 'Золотая сфера с анимацией',
      patternUrl: 'https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/data/patt.kanji'
    },
    {
      id: 2,
      name: 'Маркер 3 - Цилиндр',
      description: 'Синий цилиндр',
      patternUrl: 'custom'
    }
  ]

  return (
    <div className="markers-container">
      <Link to="/" className="btn btn-secondary back-btn">← Назад</Link>
      
      <h1>Маркеры для печати</h1>
      <p style={{textAlign: 'center', color: '#666', marginBottom: '2rem'}}>
        Распечатайте эти маркеры и наведите на них камеру в AR-режиме
      </p>

      <div className="markers-grid">
        {markers.map(marker => (
          <div key={marker.id} className="marker-card">
            <h3>{marker.name}</h3>
            <div className="marker-image">
              <div style={{
                width: '180px',
                height: '180px',
                border: '3px solid black',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                {marker.id === 0 && (
                  <img 
                    src="https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/hiro.png" 
                    alt="Hiro Marker"
                    style={{width: '100%', height: '100%'}}
                  />
                )}
                {marker.id === 1 && (
                  <img 
                    src="https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/kanji.png" 
                    alt="Kanji Marker"
                    style={{width: '100%', height: '100%'}}
                  />
                )}
                {marker.id === 2 && (
                  <div style={{fontSize: '48px'}}>🎯</div>
                )}
              </div>
            </div>
            <p>{marker.description}</p>
          </div>
        ))}
      </div>

      <div style={{marginTop: '3rem', textAlign: 'center'}}>
        <Link to="/ar" className="btn btn-primary">
          Попробовать AR →
        </Link>
      </div>
    </div>
  )
}

export default Markers
