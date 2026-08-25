import { useState } from 'react'
import Avatar from './components/Avatar'
import './App.css'

function App() {
  return (
    <div className="App min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-8">Virtual Streaming AI Bot</h1>
      <Avatar />
    </div>
  )
}

export default App
