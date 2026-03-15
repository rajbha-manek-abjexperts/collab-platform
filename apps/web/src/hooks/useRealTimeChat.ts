'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
  timestamp?: string
  status?: 'sending' | 'sent' | 'delivered' | 'read'
}

interface Conversation {
  id: string
  participants: string[]
  last_message: string
  last_message_at: string
}

interface UseChatOptions {
  userId: string
  serverUrl?: string
}

export function useRealTimeChat({ userId, serverUrl = 'http://localhost:3002' }: UseChatOptions) {
  const socketRef = useRef<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [typingUsers, setTypingUsers] = useState<Map<string, boolean>>(new Map())
  const [currentConversation, setCurrentConversation] = useState<string | null>(null)

  // Initialize socket connection
  useEffect(() => {
    if (!userId) return

    // Connect to WebSocket server
    const socket = io(serverUrl, {
      transports: ['websocket'],
      autoConnect: true,
    })

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id)
      setConnected(true)
      
      // Register user
      socket.emit('register', { userId })
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected')
      setConnected(false)
    })

    socket.on('new_message', (data: Message) => {
      console.log('New message received:', data)
      setMessages(prev => [...prev, {
        ...data,
        created_at: data.timestamp || new Date().toISOString()
      }])
    })

    socket.on('user_typing', (data: { userId: string; isTyping: boolean }) => {
      setTypingUsers(prev => {
        const newMap = new Map(prev)
        if (data.isTyping) {
          newMap.set(data.userId, true)
        } else {
          newMap.delete(data.userId)
        }
        return newMap
      })
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
    }
  }, [userId, serverUrl])

  // Join a conversation room
  const joinConversation = useCallback((conversationId: string) => {
    if (socketRef.current && connected) {
      socketRef.current.emit('join_conversation', { conversationId })
      setCurrentConversation(conversationId)
    }
  }, [connected])

  // Leave a conversation room
  const leaveConversation = useCallback((conversationId: string) => {
    if (socketRef.current && connected) {
      socketRef.current.emit('leave_conversation', { conversationId })
      setCurrentConversation(null)
    }
  }, [connected])

  // Send a message
  const sendMessage = useCallback((content: string, conversationId?: string) => {
    const convId = conversationId || currentConversation
    if (!socketRef.current || !connected || !convId) return

    const messageId = `msg-${Date.now()}`
    
    // Optimistic update
    const newMessage: Message = {
      id: messageId,
      conversation_id: convId,
      sender_id: userId,
      content,
      created_at: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      status: 'sending'
    }
    
    setMessages(prev => [...prev, newMessage])

    // Send via WebSocket
    socketRef.current.emit('send_message', {
      conversationId: convId,
      content,
      messageId,
    })

    // Update status to sent
    setTimeout(() => {
      setMessages(prev => 
        prev.map(m => 
          m.id === messageId 
            ? { ...m, status: 'sent' as const }
            : m
        )
      )
    }, 300)

    return messageId
  }, [connected, currentConversation, userId])

  // Send typing indicator
  const sendTyping = useCallback((isTyping: boolean, conversationId?: string) => {
    const convId = conversationId || currentConversation
    if (!socketRef.current || !connected || !convId) return

    socketRef.current.emit('typing', {
      conversationId: convId,
      isTyping,
    })
  }, [connected, currentConversation])

  // Mark message as read
  const markAsRead = useCallback((messageId: string, conversationId?: string) => {
    const convId = conversationId || currentConversation
    if (!socketRef.current || !connected || !convId) return

    socketRef.current.emit('mark_read', {
      conversationId: convId,
      messageId,
    })
  }, [connected, currentConversation])

  // Load messages for a conversation (demo for now)
  const loadMessages = useCallback((conversationId: string) => {
    const demoMessages: Message[] = [
      { id: '1', conversation_id: conversationId, sender_id: 'user-2', content: 'Hey! Did you get a chance to look at the latest designs?', created_at: '10:30 AM', status: 'read' },
      { id: '2', conversation_id: conversationId, sender_id: userId, content: 'Yes! They look amazing. I love the new color scheme.', created_at: '10:32 AM', status: 'read' },
      { id: '3', conversation_id: conversationId, sender_id: 'user-2', content: "Great! I've made some more updates. Let me know what you think.", created_at: '10:35 AM', status: 'read' },
    ]
    setMessages(demoMessages)
    joinConversation(conversationId)
  }, [userId, joinConversation])

  return {
    connected,
    messages,
    conversations,
    typingUsers,
    sendMessage,
    sendTyping,
    markAsRead,
    loadMessages,
    joinConversation,
    leaveConversation,
  }
}
