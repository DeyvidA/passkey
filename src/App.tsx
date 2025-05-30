"use client"

import { useState, useEffect } from "react"
import Auth from "./components/Auth"
import Dashboard from "./components/Dashboard"
import "./App.css"

interface User {
  id: string
  username: string
  displayName: string
  createdAt: string
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem("currentUser")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const handleLogin = (userData: User) => {
    setUser(userData)
    localStorage.setItem("currentUser", JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem("currentUser")
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="app">
      {user ? <Dashboard user={user} onLogout={handleLogout} /> : <Auth onLogin={handleLogin} />}
    </div>
  )
}

export default App
