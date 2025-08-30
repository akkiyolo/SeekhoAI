import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import axios from 'axios'
import TutorChat from './TutorChat'

const LessonPage = () => {
  const { moduleId } = useParams()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [allModules, setAllModules] = useState([])
  const [completedModules, setCompletedModules] = useState(new Set())
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch lesson content
        const lessonResponse = await axios.get(`http://localhost:8002/lesson/${moduleId}`)
        setLesson(lessonResponse.data)
        
        // Fetch all modules for navigation
        const curriculumResponse = await axios.get('http://localhost:8002/curriculum/solar-technician')
        setAllModules(curriculumResponse.data)
        
      } catch (err) {
        setError('Failed to load lesson. Please try again.')
        console.error('Error fetching lesson:', err)
      } finally {
        setLoading(false)
      }
    }

    // Load completed modules from localStorage
    const savedProgress = localStorage.getItem('seekho-completed-modules')
    if (savedProgress) {
      const completed = new Set(JSON.parse(savedProgress))
      setCompletedModules(completed)
      setIsCompleted(completed.has(moduleId))
    }

    fetchData()
  }, [moduleId])

  const toggleCompletion = () => {
    const newCompleted = new Set(completedModules)
    if (newCompleted.has(moduleId)) {
      newCompleted.delete(moduleId)
      setIsCompleted(false)
    } else {
      newCompleted.add(moduleId)
      setIsCompleted(true)
    }
    setCompletedModules(newCompleted)
    localStorage.setItem('seekho-completed-modules', JSON.stringify([...newCompleted]))
  }

  const getCurrentModuleIndex = () => {
    return allModules.findIndex(module => module.module_id === moduleId)
  }

  const getNextModule = () => {
    const currentIndex = getCurrentModuleIndex()
    if (currentIndex >= 0 && currentIndex < allModules.length - 1) {
      return allModules[currentIndex + 1]
    }
    return null
  }

  const getPreviousModule = () => {
    const currentIndex = getCurrentModuleIndex()
    if (currentIndex > 0) {
      return allModules[currentIndex - 1]
    }
    return null
  }

  const handleNextModule = () => {
    const nextModule = getNextModule()
    if (nextModule) {
      navigate(`/lesson/${nextModule.module_id}`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-green-700">Loading your lesson...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700">{error}</p>
        <div className="mt-4 space-x-4">
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
          <Link 
            to="/" 
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors inline-block"
          >
            Back to Curriculum
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Navigation */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Link to="/" className="hover:text-green-600 transition-colors">
          Curriculum
        </Link>
        <span>›</span>
        <span className="text-gray-800">{lesson?.title}</span>
      </div>

      {/* Lesson Content */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">{lesson?.title}</h1>
          
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              components={{
                h1: ({children}) => <h1 className="text-2xl font-bold text-gray-800 mt-8 mb-4">{children}</h1>,
                h2: ({children}) => <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">{children}</h2>,
                h3: ({children}) => <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">{children}</h3>,
                p: ({children}) => <p className="text-gray-700 mb-4 leading-relaxed">{children}</p>,
                ul: ({children}) => <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700">{children}</ul>,
                ol: ({children}) => <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700">{children}</ol>,
                li: ({children}) => <li className="ml-4">{children}</li>,
                strong: ({children}) => <strong className="font-semibold text-gray-800">{children}</strong>,
                em: ({children}) => <em className="italic text-gray-700">{children}</em>,
                blockquote: ({children}) => (
                  <blockquote className="border-l-4 border-green-400 pl-4 py-2 bg-green-50 rounded-r-lg mb-4 italic text-gray-700">
                    {children}
                  </blockquote>
                ),
                code: ({children}) => (
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">
                    {children}
                  </code>
                ),
                pre: ({children}) => (
                  <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
                    {children}
                  </pre>
                ),
              }}
            >
              {lesson?.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {/* Module Completion Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isCompleted}
                onChange={toggleCompletion}
                className="sr-only"
              />
              <div className={`w-8 h-8 rounded border-2 flex items-center justify-center transition-colors ${
                isCompleted 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : 'border-gray-300 hover:border-green-400'
              }`}>
                {isCompleted && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </label>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {isCompleted ? '✅ Module Completed!' : 'Mark this module as complete'}
              </h3>
              <p className="text-sm text-gray-600">
                {isCompleted 
                  ? 'Great job! You can now move to the next module.' 
                  : 'Check this box when you\'ve finished studying this module.'}
              </p>
            </div>
          </div>
          
          {isCompleted && getNextModule() && (
            <button
              onClick={handleNextModule}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              Next Module
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <Link 
            to="/" 
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Curriculum
          </Link>
          
          {getPreviousModule() && (
            <Link
              to={`/lesson/${getPreviousModule().module_id}`}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous Module
            </Link>
          )}
        </div>
        
        <div className="text-sm text-gray-600">
          Need help? Use the AI tutor below! 👇
        </div>
        
        <div className="flex space-x-4">
          {!isCompleted && getNextModule() && (
            <Link
              to={`/lesson/${getNextModule().module_id}`}
              className="bg-gray-400 text-white px-6 py-3 rounded-lg hover:bg-gray-500 transition-colors flex items-center"
            >
              Skip to Next
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
          
          {isCompleted && !getNextModule() && (
            <div className="bg-green-100 text-green-800 px-6 py-3 rounded-lg flex items-center">
              🎉 Course Complete!
            </div>
          )}
        </div>
      </div>

      {/* AI Tutor Chat */}
      <TutorChat />
    </div>
  )
}

export default LessonPage