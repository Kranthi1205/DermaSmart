import React from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import CameraPage from './pages/CameraPage'
import FormPage from './pages/FormPage'
import ReportPage from './pages/ReportPage'
import Nav from './components/Nav'
import Footer from './components/Footer'

export default function App(){
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <div className="flex-grow">
        <Routes>
          <Route path='/' element={<HomePage/>} />
          <Route path='/camera' element={<CameraPage/>} />
          <Route path='/form' element={<FormPage/>} />
          <Route path='/report' element={<ReportPage/>} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}
