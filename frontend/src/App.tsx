import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import CameraPage from './pages/CameraPage'
import FormPage from './pages/FormPage'
import ReportPage from './pages/ReportPage'
import { warmUpBackend } from './lib/api'

function App() {
  // Wake the backend the moment someone opens the site, so it is ready by the
  // time they reach the camera page.
  useEffect(() => {
    warmUpBackend()
  }, [])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/camera" element={<CameraPage />} />
        <Route path="/form" element={<FormPage />} />
        <Route path="/report" element={<ReportPage />} />
      </Routes>
    </Router>
  )
}

export default App
