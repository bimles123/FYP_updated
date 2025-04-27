"use client"

import { useEffect, useState, useRef } from "react"
import axios from "axios"

export default function ChatPage() {
  const [receiverId, setReceiverId] = useState("")
  const [receiverName, setReceiverName] = useState("")
  const [receiverEmail, setReceiverEmail] = useState("")
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [users, setUsers] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [chatDeletedMessage, setChatDeletedMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const storedId = localStorage.getItem("chatReceiverId")
    const storedName = localStorage.getItem("chatReceiverName")
    if (storedId && storedName) {
      setReceiverId(storedId)
      setReceiverName(storedName)
      localStorage.removeItem("chatReceiverId")
      localStorage.removeItem("chatReceiverName")
    }
  }, [])

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser))
    }
  }, [])

  const fetchUsers = async () => {
    try {
      if (currentUser) {
        setIsLoading(true)
        const res = await axios.get(`/api/chatted-users/${currentUser.id}`)
        setUsers(res.data)
        setIsLoading(false)
      }
    } catch (err) {
      console.error("Failed to fetch chatted users:", err)
      setIsLoading(false)
    }
  }

  const fetchMessages = async (userId = receiverId) => {
    if (!currentUser?.id || !userId) return
    try {
      // Don't set loading state for background refreshes to avoid UI flicker
      const res = await axios.get(`/api/messages/${currentUser.id}/${userId}`)
      setMessages(res.data)
    } catch (err) {
      console.error("Error fetching messages:", err)
    }
  }

  // Initial fetch with loading indicator
  const initialFetchMessages = async (userId = receiverId) => {
    if (!currentUser?.id || !userId) return
    try {
      setIsLoading(true)
      await fetchMessages(userId)
      setIsLoading(false)
    } catch (err) {
      console.error("Error in initial fetch:", err)
      setIsLoading(false)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!message.trim() || !currentUser?.id || !receiverId) return
    try {
      setIsLoading(true)
      await axios.post("/api/messages", {
        senderId: currentUser.id,
        receiverId,
        message,
      })
      setMessage("")
      await fetchMessages() // update messages
      await fetchUsers() // update user list if new user added
      setIsLoading(false)
      // Focus back on input after sending
      inputRef.current?.focus()
    } catch (err) {
      console.error("Error sending message:", err)
      setIsLoading(false)
    }
  }

  const handleUserSelect = (id, name, email) => {
    setReceiverId(id)
    setReceiverName(name)
    setReceiverEmail(email)
    initialFetchMessages(id)
  }

  const handleDeleteChat = async () => {
    if (!currentUser?.id || !receiverId) return
    if (!window.confirm(`Are you sure you want to delete the chat with ${receiverName}?`)) return
    try {
      setIsLoading(true)
      await axios.delete(`/api/messages/${currentUser.id}/${receiverId}`)
      setMessages([])
      setChatDeletedMessage(`Chat with ${receiverName} has been deleted.`)
      await fetchUsers() // update user list
      setTimeout(() => setChatDeletedMessage(""), 3000)
      setReceiverId("")
      setIsLoading(false)
    } catch (err) {
      console.error("Failed to delete chat:", err)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser) {
      fetchUsers()
    }
  }, [currentUser])

  useEffect(() => {
    let interval

    if (receiverId) {
      // Initial fetch
      initialFetchMessages()

      // Set up interval for background refreshes
      interval = setInterval(() => {
        // Check if input is focused before refreshing
        const isInputFocused = document.activeElement === inputRef.current

        // Store the selection/cursor position if input is focused
        const selectionStart = isInputFocused ? inputRef.current.selectionStart : null
        const selectionEnd = isInputFocused ? inputRef.current.selectionEnd : null

        // Fetch messages
        fetchMessages()

        // If input was focused, restore focus and selection after a small delay
        if (isInputFocused) {
          setTimeout(() => {
            inputRef.current?.focus()
            if (selectionStart !== null && selectionEnd !== null) {
              inputRef.current.setSelectionRange(selectionStart, selectionEnd)
            }
          }, 0)
        }
      }, 3000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [receiverId])

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Helper function to get initials
  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "?"
  }

  // Group messages by sender and consecutive messages
  const groupedMessages = () => {
    const groups = []
    let currentGroup = null

    messages.forEach((msg, index) => {
      // Start a new group if:
      // 1. This is the first message
      // 2. The sender changed from the previous message
      // 3. More than 5 minutes passed since the last message
      const prevMsg = index > 0 ? messages[index - 1] : null
      const timeDiff = prevMsg ? new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime() : 0
      const isNewTimeGroup = timeDiff > 5 * 60 * 1000 // 5 minutes

      if (!currentGroup || currentGroup.sender !== msg.sender || isNewTimeGroup) {
        currentGroup = {
          sender: msg.sender,
          messages: [msg],
          timestamp: msg.timestamp,
        }
        groups.push(currentGroup)
      } else {
        // Add to existing group
        currentGroup.messages.push(msg)
        // Update timestamp to the latest
        currentGroup.timestamp = msg.timestamp
      }
    })

    return groups
  }

  return (
    <div className="max-w-7xl mx-auto mt-16 p-4 h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-center mb-8">
        <h1 className="text-3xl font-bold text-center text-sky-600">ReachNp Chat</h1>
      </div>

      <div className="flex gap-6 h-[calc(100vh-16rem)] bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
        {/* User List */}
        <div className="w-1/3 md:w-1/4 border-r overflow-hidden flex flex-col">
          <div className="p-4 bg-sky-600 text-white">
            <h2 className="text-xl font-semibold">Contacts</h2>
          </div>

          <div className="overflow-y-auto flex-grow p-2">
            {isLoading && users.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <div className="text-sky-500">Loading...</div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-sm text-gray-400 p-4 text-center">
                <div className="flex justify-center mb-2">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                    ?
                  </div>
                </div>
                You haven't chatted with anyone yet.
              </div>
            ) : (
              users.map((u) => (
                <div
                  key={u._id}
                  onClick={() => handleUserSelect(u._id, u.name, u.email)}
                  className={`cursor-pointer p-3 rounded-lg mb-2 hover:bg-sky-50 transition-all duration-200 
                  ${receiverId === u._id ? "bg-sky-100 border-l-4 border-sky-500" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-medium">
                      {getInitials(u.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 truncate">{u.name}</div>
                      <div className="text-xs text-gray-500 truncate">{u.email}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Box */}
        <div className="w-2/3 md:w-3/4 flex flex-col">
          {receiverId ? (
            <>
              <div className="flex justify-between items-center border-b p-4 bg-gray-50">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-medium mr-3">
                    {getInitials(receiverName)}
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-800">
                      <a href={`/user/${receiverId}`} className="hover:text-sky-600 transition-colors">
                        {receiverName}
                      </a>
                    </div>
                    <div className="text-sm text-gray-500">{receiverEmail}</div>
                  </div>
                </div>
                <button
                  onClick={handleDeleteChat}
                  className="px-3 py-1.5 text-sm border border-red-200 text-red-500 rounded hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  Delete Chat
                </button>
              </div>

              {chatDeletedMessage && (
                <div className="bg-green-50 border-l-4 border-green-500 p-3 text-green-700">{chatDeletedMessage}</div>
              )}

              <div className="flex-grow overflow-y-auto p-4 bg-gray-50" style={{ scrollBehavior: "smooth" }}>
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 mb-4">
                      ?
                    </div>
                    <div className="text-center">
                      <p className="mb-2">No messages yet</p>
                      <p className="text-sm">Send a message to start the conversation</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {groupedMessages().map((group, groupIndex) => {
                      const isSender = group.sender === currentUser?.id

                      return (
                        <div key={groupIndex} className="space-y-1">
                          <div className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
                            <div className={`flex ${isSender ? "flex-row-reverse" : "flex-row"} items-start gap-2`}>
                              {!isSender && (
                                <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-medium mt-1">
                                  {getInitials(receiverName)}
                                </div>
                              )}

                              <div className={`flex flex-col ${isSender ? "items-end" : "items-start"} max-w-[80%]`}>
                                {!isSender && <span className="text-xs text-gray-600 mb-1 ml-1">{receiverName}</span>}

                                <div className="space-y-1">
                                  {group.messages.map((msg, msgIndex) => (
                                    <div
                                      key={msgIndex}
                                      className={`px-4 py-2 rounded-2xl text-sm shadow-sm
                                        ${
                                          isSender
                                            ? "bg-sky-600 text-white"
                                            : "bg-white border border-gray-200 text-gray-800"
                                        }
                                        ${msgIndex === 0 && isSender ? "rounded-tr-md" : ""}
                                        ${msgIndex === 0 && !isSender ? "rounded-tl-md" : ""}
                                        ${msgIndex === group.messages.length - 1 && isSender ? "rounded-br-md" : ""}
                                        ${msgIndex === group.messages.length - 1 && !isSender ? "rounded-bl-md" : ""}
                                      `}
                                    >
                                      {msg.message}
                                    </div>
                                  ))}
                                </div>

                                <div className="text-xs text-gray-400 mt-1 px-1">
                                  {new Date(group.timestamp).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              </div>

                              {isSender && (
                                <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-medium mt-1">
                                  {getInitials(currentUser?.name || "Me")}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <div className="h-px bg-gray-200"></div>

              <form onSubmit={sendMessage} className="flex items-center gap-2 p-4 bg-white">
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-grow p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  disabled={!message.trim() || isLoading}
                >
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 mb-6">
                ?
              </div>
              <h3 className="text-xl font-medium mb-2">No conversation selected</h3>
              <p className="text-gray-400">Select a contact to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

