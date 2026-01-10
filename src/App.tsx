import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Markers from './pages/Markers'
import ARScanner from './pages/ARScanner'
import Gallery3D from './pages/Gallery3D'
import Subjects from './pages/Subjects'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/markers" element={<Markers />} />
        <Route path="/ar/:subject?" element={<ARScanner />} />
        <Route path="/gallery/:subject?" element={<Gallery3D />} />
      </Routes>
    </Router>
  )
}

export default App
