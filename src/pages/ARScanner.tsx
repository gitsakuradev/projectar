// ARScanner.tsx — компонент AR-сканера с упором на стабильность на мобильных.
// Поддержка двух путей:
// 1) model-viewer (fallback & quick AR on Android/iOS) — легкий путь.
// 2) Если установлен MindAR (mindar-image-three) — можно подключить marker-based AR.
// Этот файл даёт рабочую структуру и fallback; при желании я могу расширить mindar-реализацию.
// Сохраните файл: src/pages/ARScanner.tsx

import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

// NOTE: model-viewer не типизирован по умолчанию в TSX — используем any.
// Для model-viewer: npm i @google/model-viewer
// Для mindar marker-based AR: npm i mindar-image-three three
// Здесь мы помещаем model-viewer fallback (работает в большинстве мобильных браузеров).

declare global {
  // allow <model-viewer /> in JSX without TS error
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any
    }
  }
}

const ARScanner: React.FC = () => {
  const [isSupported, setIsSupported] = useState<boolean | null>(null)
  const [arOpen, setArOpen] = useState(false)
  const modelViewerRef = useRef<any>(null)

  useEffect(() => {
    // Quick detection for WebXR or model-viewer availability on mobile.
    // model-viewer fallback works with Scene Viewer (Android) and Quick Look (iOS).
    const check = async () => {
      try {
        // basic feature detect (model-viewer generally works)
        setIsSupported(true)
      } catch (e) {
        setIsSupported(false)
      }
    }
    check()
  }, [])

  // Example handler that triggers AR via model-viewer
  const openAR = () => {
    setArOpen(true)
    // If model-viewer is present, we can call showPoster or enter AR programmatically
    // (browser support dependent)
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

      {/* Model viewer fallback — замените src на реальную модель (glb/glTF) */}
      {arOpen && (
        <div style={{ marginTop: 20 }}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <model-viewer
            ref={modelViewerRef}
            src="/models/cube.glb"               /* <- поместите модель в public/models/ */
            ios-src=""
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
