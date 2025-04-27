"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import "../css/Notification.css"

export default function Notifications() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Get user from localStorage safely
    let currentUser
    try {
      currentUser = JSON.parse(localStorage.getItem("user") || "{}")
    } catch (e) {
      console.error("Failed to parse user from localStorage", e)
      currentUser = {}
      setLoading(false)
      setError("User data not found")
      return
    }

    if (!currentUser?.id) {
      setLoading(false)
      return
    }

    const fetchMessages = async () => {
      try {
        setLoading(true)
        const res = await axios.get(`/api/messages/${currentUser.id}`)

        // Check if response data is valid
        if (!res.data || !Array.isArray(res.data)) {
          throw new Error("Invalid response format")
        }

        const sorted = res.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        const limited = sorted.slice(0, 30)
        setMessages(limited)
        setLoading(false)
      } catch (err) {
        console.error("Failed to load notifications", err)
        setError("Failed to load notifications")
        setLoading(false)
      }
    }

    fetchMessages()

    // Set up a refresh interval (every 60 seconds)
    const intervalId = setInterval(fetchMessages, 60000)

    // Clean up interval on component unmount
    return () => clearInterval(intervalId)
  }, [])

  const handleClick = (msg) => {
    if (!msg?.sender) return

    try {
      localStorage.setItem("chatReceiverId", msg.sender._id)
      localStorage.setItem("chatReceiverName", msg.sender.name)
      localStorage.setItem("chatReceiverEmail", msg.sender.email)
      navigate("/chat")
    } catch (err) {
      console.error("Failed to set chat data", err)
    }
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Unknown time"

    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diffMs = now - date
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (diffDays === 0) {
        // Today - show time
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      } else if (diffDays === 1) {
        // Yesterday
        return "Yesterday"
      } else if (diffDays < 7) {
        // Within a week - show day name
        return date.toLocaleDateString([], { weekday: "long" })
      } else {
        // Older - show date
        return date.toLocaleDateString([], { month: "short", day: "numeric" })
      }
    } catch (e) {
      console.error("Error formatting timestamp", e)
      return "Invalid date"
    }
  }

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h1 className="notifications-title">
          <span className="notifications-icon">🔔</span>
          <span>Notifications</span>
        </h1>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading notifications...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          <button className="retry-button" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      ) : messages.length === 0 ? (
        <div className="empty-notifications">
          <div className="empty-icon">📭</div>
          <p>You have no notifications</p>
          <p className="empty-subtitle">Messages from hosts and guests will appear here</p>
        </div>
      ) : (
        <div className="notifications-list">
          {messages.map((msg) => (
            <div key={msg._id || `msg-${Math.random()}`} onClick={() => handleClick(msg)} className="notification-card">
              <div className="notification-avatar">
                {msg.sender?.name ? msg.sender.name.charAt(0).toUpperCase() : "?"}
              </div>
              <div className="notification-content">
                <div className="notification-header">
                  <div className="notification-sender">{msg.sender?.name || "Unknown Sender"}</div>
                  <div className="notification-time">{formatTimestamp(msg.timestamp)}</div>
                </div>
                <div className="notification-message">{msg.message || "No message content"}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
