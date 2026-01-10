import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Markers from './pages/Markers'
import ARScanner from './pages/ARScanner'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/markers" element={<Markers />} />
        <Route path="/ar" element={<ARScanner />} />
      </Routes>
    </Router>
  )
}

export default App
