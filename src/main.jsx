import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import CurriculumPage from './components/CurriculumPage'
import LessonPage from './components/LessonPage'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <header className="bg-white shadow-sm border-b border-green-200">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-green-800">
              🌱 Seekho AI - Solar Panel Technician Course
            </h1>
            <p className="text-green-600 mt-1">Learn green skills for a sustainable future</p>
          </div>
        </header>
        
        <main className="max-w-4xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<CurriculumPage />} />
            <Route path="/lesson/:moduleId" element={<LessonPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  </React.StrictMode>,
)