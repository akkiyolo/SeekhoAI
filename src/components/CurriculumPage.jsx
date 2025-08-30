import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const CurriculumPage = () => {
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [completedModules, setCompletedModules] = useState(new Set())

  useEffect(() => {
    const fetchCurriculum = async () => {
      try {
        setLoading(true)
        const response = await axios.get('http://localhost:8002/curriculum/solar-technician')
        setModules(response.data)
      } catch (err) {
        setError('Failed to load curriculum. Please try again.')
        console.error('Error fetching curriculum:', err)
      } finally {
        setLoading(false)
      }
    }

    // Load completed modules from localStorage
    const savedProgress = localStorage.getItem('seekho-completed-modules')
    if (savedProgress) {
      setCompletedModules(new Set(JSON.parse(savedProgress)))
    }

    fetchCurriculum()
  }, [])

  const toggleModuleCompletion = (moduleId) => {
    const newCompleted = new Set(completedModules)
    if (newCompleted.has(moduleId)) {
      newCompleted.delete(moduleId)
    } else {
      newCompleted.add(moduleId)
    }
    setCompletedModules(newCompleted)
    localStorage.setItem('seekho-completed-modules', JSON.stringify([...newCompleted]))
  }

  const progressPercentage = modules.length > 0 ? (completedModules.size / modules.length) * 100 : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-green-700">Loading your personalized curriculum...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Your Learning Journey</h2>
        <p className="text-gray-600 text-lg mb-6">
          Master solar panel installation and maintenance with our AI-powered curriculum designed for rural India.
        </p>
        
        {/* Progress Bar */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Progress</h3>
            <span className="text-sm font-medium text-green-600">
              {completedModules.size} of {modules.length} modules completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {progressPercentage === 100 ? '🎉 Congratulations! You\'ve completed all modules!' : 
             progressPercentage > 0 ? `Keep going! You're ${Math.round(progressPercentage)}% done.` : 
             'Start your journey by completing the first module!'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
        {modules.map((module, index) => {
          const isCompleted = completedModules.has(module.module_id)
          return (
            <div
              key={module.module_id}
              className={`bg-white rounded-xl shadow-md border transition-all duration-300 ${
                isCompleted ? 'border-green-300 bg-green-50' : 'border-gray-200'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                      isCompleted ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700'
                    }`}>
                      {isCompleted ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="font-bold text-lg">{index + 1}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`text-xl font-semibold mb-2 transition-colors ${
                          isCompleted ? 'text-green-800' : 'text-gray-800'
                        }`}>
                          {module.title}
                        </h3>
                        <p className={`leading-relaxed ${
                          isCompleted ? 'text-green-700' : 'text-gray-600'
                        }`}>
                          {module.description}
                        </p>
                      </div>
                      
                      {/* Completion Checkbox */}
                      <div className="ml-4 flex flex-col items-center space-y-2">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isCompleted}
                            onChange={() => toggleModuleCompletion(module.module_id)}
                            className="sr-only"
                          />
                          <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                            isCompleted 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'border-gray-300 hover:border-green-400'
                          }`}>
                            {isCompleted && (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </label>
                        <span className="text-xs text-gray-500 text-center">
                          {isCompleted ? 'Done' : 'Mark\nDone'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <Link
                        to={`/lesson/${module.module_id}`}
                        className={`flex items-center transition-colors ${
                          isCompleted 
                            ? 'text-green-700 hover:text-green-800' 
                            : 'text-green-600 hover:text-green-700'
                        }`}
                      >
                        <span className="text-sm font-medium">
                          {isCompleted ? 'Review Module' : 'Start Learning'}
                        </span>
                        <svg className="w-4 h-4 ml-2 hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                      
                      {isCompleted && (
                        <span className="text-sm text-green-600 font-medium">✓ Completed</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-12 bg-green-50 border border-green-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-green-800 mb-2">🎯 What You'll Achieve</h3>
        <ul className="text-green-700 space-y-2">
          <li>• Install and maintain solar panel systems safely</li>
          <li>• Understand electrical basics and safety protocols</li>
          <li>• Start your own solar installation business</li>
          <li>• Contribute to clean energy in your community</li>
        </ul>
      </div>
    </div>
  )
}

export default CurriculumPage