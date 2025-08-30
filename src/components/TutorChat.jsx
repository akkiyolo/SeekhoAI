import React, { useState, useRef } from 'react'
import axios from 'axios'

const TutorChat = () => {
  const [messages, setMessages] = useState([
    {
      type: 'ai',
      content: 'Hello! I\'m your AI tutor. Ask me anything about solar panels, or share a photo if you need help with something specific! 🌞'
    }
  ])
  const [inputText, setInputText] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef(null)

  const handleImageSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!inputText.trim() && !selectedImage) return

    // Add user message to chat
    const userMessage = {
      type: 'user',
      content: inputText,
      image: imagePreview
    }
    setMessages(prev => [...prev, userMessage])

    // Clear input
    const questionText = inputText
    setInputText('')
    setIsLoading(true)

    try {
      // Prepare form data
      const formData = new FormData()
      formData.append('question', questionText)
      if (selectedImage) {
        formData.append('image', selectedImage)
      }

      // Send to API
      const response = await axios.post('http://localhost:8002/tutor', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      // Add AI response to chat
      const aiMessage = {
        type: 'ai',
        content: response.data.response
      }
      setMessages(prev => [...prev, aiMessage])

    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = {
        type: 'ai',
        content: 'Sorry, I encountered an error. Please try again.'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      removeImage()
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          🤖 AI Tutor Chat
          <span className="ml-2 text-sm font-normal text-gray-600">Ask questions or share photos!</span>
        </h3>

        {/* Chat Messages */}
        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.image && (
                  <img
                    src={message.image}
                    alt="User uploaded"
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                  <span className="text-sm">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-4 relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border-2 border-green-300"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
            >
              ×
            </button>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask a question about solar panels..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              rows="2"
              disabled={isLoading}
            />
          </div>
          
          <div className="flex space-x-2">
            {/* Image Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-lg transition-colors disabled:opacity-50"
              disabled={isLoading}
              title="Upload image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={(!inputText.trim() && !selectedImage) || isLoading}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </form>

        <p className="text-xs text-gray-500 mt-2">
          💡 Tip: You can upload photos of solar panels, wiring, or tools for specific help!
        </p>
      </div>
    </div>
  )
}

export default TutorChat