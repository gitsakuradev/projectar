import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="home-container">
      <div>
        <h1>🚀 AR Блокнот</h1>
        <p>Наведите камеру на маркеры и увидите 3D-модели!</p>
        
        <div className="button-group">
          <Link to="/ar" className="btn btn-primary">
            📱 Открыть AR-сканер
          </Link>
          <Link to="/markers" className="btn btn-secondary">
            🖼️ Посмотреть маркеры
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home
