'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
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
  conversationId?: string
}

export function useChat({ userId, conversationId }: UseChatOptions) {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [typingUsers, setTypingUsers] = useState<Map<string, boolean>>(new Map())
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const reconnectTimeout = useRef<NodeJS.Timeout>()

  // Connect to WebSocket
  useEffect(() => {
    if (!userId) return

    const wsUrl = `ws://localhost:3002/ws/messages`
    
    // For demo, we'll simulate WebSocket with polling
    // In production, use real WebSocket
    setConnected(true)
    setMessages([
      {
        id: 'msg-1',
        conversation_id: 'conv-1',
        sender_id: 'user-2',
        content: 'Hey! Did you get a chance to look at the latest designs?',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        status: 'read'
      },
      {
        id: 'msg-2',
        conversation_id: 'conv-1',
        sender_id: userId,
        content: 'Yes! They look amazing. I love the new color scheme.',
        created_at: new Date(Date.now() - 3500000).toISOString(),
        status: 'read'
      },
      {
        id: 'msg-3',
        conversation_id: 'conv-1',
        sender_id: 'user-2',
        content: "Great! I've made some more updates. Let me know what you think.",
        created_at: new Date(Date.now() - 3400000).toISOString(),
        status: 'read'
      },
    ])

    setConversations([
      { id: 'conv-1', participants: [userId, 'user-2'], last_message: 'Great! I\'ve just added them', last_message_at: new Date().toISOString() },
      { id: 'conv-2', participants: [userId, 'user-3'], last_message: 'The document is ready', last_message_at: new Date(Date.now() - 3600000).toISOString() },
      { id: 'conv-3', participants: [userId, 'user-4'], last_message: 'Thanks for the update!', last_message_at: new Date(Date.now() - 7200000).toISOString() },
    ])

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current)
      }
    }
  }, [userId])

  // Send a message
  const sendMessage = useCallback((content: string) => {
    if (!conversationId || !userId) return

    const newMessage: Message = {
      id: 'msg-' + Date.now(),
      conversation_id: conversationId,
      sender_id: userId,
      content,
      created_at: new Date().toISOString(),
      status: 'sending'
    }

    // Add to messages immediately (optimistic update)
    setMessages(prev => [...prev, newMessage])

    // Simulate sending (in production, send via WebSocket/API)
    setTimeout(() => {
      setMessages(prev => 
        prev.map(m => 
          m.id === newMessage.id 
            ? { ...m, status: 'sent' as const }
            : m
        )
      )
    }, 500)

    return newMessage
  }, [conversationId, userId])

  // Set typing status
  const setTyping = useCallback((isTyping: boolean) => {
    // In production, send via WebSocket
    // socket?.send(JSON.stringify({ type: 'typing', isTyping }))
  }, [])

  // Mark messages as read
  const markAsRead = useCallback((messageIds: string[]) => {
    // In production, send via WebSocket/API
  }, [])

  return {
    connected,
    messages,
    conversations,
    typingUsers,
    onlineUsers,
    sendMessage,
    setTyping,
    markAsRead,
  }
}
