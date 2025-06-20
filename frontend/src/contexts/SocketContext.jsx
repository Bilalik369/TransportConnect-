"use client"

import { createContext, useContext, useEffect, useState } from "react"
import io from "socket.io-client"
import { useAuth } from "./AuthContext"
import { API_BASE_URL } from "../config/constants"

const SocketContext = createContext()

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState([])
  const { token, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated && token) {
      initializeSocket()
    } else {
      disconnectSocket()
    }

    return () => {
      disconnectSocket()
    }
  }, [isAuthenticated, token])

  const initializeSocket = () => {
    const newSocket = io(API_BASE_URL.replace("/api", ""), {
      auth: {
        token: token,
      },
      transports: ["websocket"],
    })

    newSocket.on("connect", () => {
      console.log("Socket connected")
      setIsConnected(true)
      newSocket.emit("join_chats")
    })

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected")
      setIsConnected(false)
    })

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error)
      setIsConnected(false)
    })

    newSocket.on("online_users", (users) => {
      setOnlineUsers(users)
    })

    setSocket(newSocket)
  }

  const disconnectSocket = () => {
    if (socket) {
      socket.disconnect()
      setSocket(null)
      setIsConnected(false)
    }
  }

  const joinChat = (requestId) => {
    if (socket) {
      socket.emit("join_chat", { requestId })
    }
  }

  const sendMessage = (requestId, content) => {
    if (socket) {
      socket.emit("send_message", { requestId, content })
    }
  }

  const markAsRead = (chatId) => {
    if (socket) {
      socket.emit("mark_as_read", { chatId })
    }
  }

  const startTyping = (chatId) => {
    if (socket) {
      socket.emit("typing", { chatId })
    }
  }

  const stopTyping = (chatId) => {
    if (socket) {
      socket.emit("stop_typing", { chatId })
    }
  }

  const value = {
    socket,
    isConnected,
    onlineUsers,
    joinChat,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider")
  }
  return context
}
