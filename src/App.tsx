import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Subjects from './pages/Subjects'
import Gallery3D from './pages/Gallery3D'
import ARScanner from './pages/ARScanner'
import Markers from './pages/Markers'
import AIChat from './pages/AIChat' // Импортируем новый компонент

import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/markers" element={<Markers />} />
          
          {/* Routes with parameters */}
          <Route path="/gallery/:subject" element={<Gallery3D />} />
          <Route path="/ar/:subject" element={<ARScanner />} />
          
          {/* General AR route if needed */}
          <Route path="/ar" element={<ARScanner />} />

          {/* New AI Chat Route */}
          <Route path="/chat" element={<AIChat />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
