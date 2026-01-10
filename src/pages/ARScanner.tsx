import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

// NOTE: model-viewer not typed by default in TSX — allow usage
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any
    }
  }
}

const ARScanner: React.FC = () => {
  const [arOpen, setArOpen] = useState(false)
  const modelViewerRef = useRef<any>(null)

  useEffect(() => {
    // minimal setup or feature-detect could be added here later
  }, [])

  const openAR = () => {
    setArOpen(true)
    setTimeout(() => {
      try {
        const mv = modelViewerRef.current
        if (mv && typeof mv.showPoster === 'function') {
          mv.showPoster()
        }
      } catch (e) {
        // ignore
      }
    }, 300)
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link to="/subjects" className="btn btn-secondary" style={{ padding: '8px 12px' }}>← К предметам</Link>
        <h2>AR Блокнот</h2>
      </div>

      <p>Наведи камеру на маркер из набора, либо открой AR-режим.</p>

      <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
        <button onClick={openAR} className="btn" style={{ padding: '10px 16px' }}>Открыть AR-сканер</button>
        <button onClick={() => window.open('/markers', '_blank')} className="btn btn-outline" style={{ padding: '10px 16px' }}>Посмотреть маркеры</button>
      </div>

      {arOpen && (
        <div style={{ marginTop: 20 }}>
          <model-viewer
            ref={modelViewerRef}
            src="/models/cube.glb"
            alt="AR model"
            ar
            ar-modes="webxr scene-viewer quick-look"
            environment-image="neutral"
            camera-controls
            style={{ width: '100%', height: '70vh', background: '#000' }}
          />
          <div style={{ marginTop: 8 }}>
            <small style={{ color: '#888' }}>Если AR не запускается, попробуй открыть сайт в Chrome (Android) или Safari (iOS) и разрешить доступ к камере.</small>
          </div>
        </div>
      )}

      <div style={{ marginTop: 18 }}>
        <h3>Примечания по качеству на мобильных</h3>
        <ul>
          <li>Мы уменьшили детализацию моделей и ограничили DPR на мобильных для плавности.</li>
          <li>Если устройство слабое — включай «Low Quality» в галерее.</li>
          <li>Для устойчивого marker-based AR рекомендую настроить MindAR (я могу добавить полноценную реализацию на request).</li>
        </ul>
      </div>
    </div>
  )
}

export default ARScanner
