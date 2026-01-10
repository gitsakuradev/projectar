import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const ARScanner: React.FC = () => {
  const [arOpen, setArOpen] = useState(false)

  const openAR = () => {
    setArOpen(true)
  }

  return (
    <div style={{ padding: 16, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Link to="/subjects" className="btn btn-secondary" style={{ padding: '8px 12px' }}>
          ← К предметам
        </Link>
        <h2 style={{ margin: 0 }}>AR Блокнот</h2>
      </div>

      <p style={{ marginBottom: 20 }}>
        Наведите камеру на один из распечатанных маркеров, чтобы увидеть 3D-модель.
      </p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <button onClick={openAR} className="btn btn-primary" style={{ padding: '12px 20px' }}>
          🚀 Запустить AR-сканер
        </button>
        <button
          onClick={() => window.open('/markers', '_blank')}
          className="btn btn-secondary"
          style={{ padding: '12px 20px' }}
        >
          🖼️ Посмотреть маркеры
        </button>
      </div>

      {arOpen && (
        <div style={{ flex: 1, position: 'relative', minHeight: 400 }}>
          <a-scene
            embedded
            arjs="trackingMethod: best; sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3_BCH_TYPE7;"
            renderer="antialias: true; alpha: true; logarithmicDepthBuffer: true;"
            vr-mode-ui="enabled: false"
            device-orientation-permission-ui="enabled: false"
            style={{ width: '100%', height: '100%' }}
          >
            {/* Маркер Hiro — куб */}
            <a-marker preset="hiro">
              <a-entity position="0 0.25 0" scale="0.8 0.8 0.8">
                <a-box
                  color="#667eea"
                  depth="1"
                  height="1"
                  width="1"
                  shadow="receive: false; cast: false"
                >
                  <a-animation
                    attribute="rotation"
                    dur="10000"
                    easing="linear"
                    repeat="indefinite"
                    to="0 360 0"
                  />
                </a-box>
              </a-entity>
            </a-marker>

            {/* Маркер Kanji — сфера */}
            <a-marker preset="kanji">
              <a-entity position="0 0.25 0" scale="0.8 0.8 0.8">
                <a-sphere radius="0.6" color="#764ba2" segments-width="32" segments-height="16">
                  <a-animation
                    attribute="rotation"
                    dur="12000"
                    easing="linear"
                    repeat="indefinite"
                    to="0 360 0"
                  />
                </a-sphere>
              </a-entity>
            </a-marker>

            {/* Пример добавления собственного маркера (положи файл .patt в public/patterns/custom.patt) */}
            {/* <a-marker type="pattern" url="/patterns/custom.patt">
              <a-entity position="0 0.25 0" scale="0.8 0.8 0.8">
                <a-cylinder radius="0.5" height="1.2" color="#22c55e">
                  <a-animation attribute="rotation" dur="10000" repeat="indefinite" to="0 360 0" />
                </a-cylinder>
              </a-entity>
            </a-marker> */}

            <a-entity camera></a-entity>
          </a-scene>

          <div
            style={{
              position: 'absolute',
              bottom: 10,
              left: 0,
              right: 0,
              textAlign: 'center',
              background: 'rgba(0,0,0,0.6)',
              color: 'white',
              padding: '8px',
              borderRadius: 8,
            }}
          >
            <small>
              Hiro (чёрная рамка) → Куб  Kanji → Сфера
              <br />
              Хорошее освещение и неподвижный маркер = лучшее распознавание
            </small>
          </div>
        </div>
      )}

      <div style={{ marginTop: 30 }}>
        <h3>Советы по использованию на мобильных</h3>
        <ul>
          <li>Запускайте AR только по нажатию кнопки (чтобы браузер запросил доступ к камере).</li>
          <li>Используйте Chrome (Android) или Safari (iOS).</li>
          <li>Держите телефон горизонтально, освещение равномерное.</li>
          <li>Если лагает — включите режим Low Quality в 3D-галерее (модели там те же).</li>
          <li>Для большего количества моделей/маркеров могу помочь добавить custom .patt или перейти на MindAR (гораздо стабильнее и быстрее на мобильных).</li>
        </ul>
      </div>
    </div>
  )
}

export default ARScanner
