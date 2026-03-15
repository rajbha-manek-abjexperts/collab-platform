'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Send, Paperclip, MoreVertical, Phone, Video, Loader2 } from 'lucide-react'
import { useRealTimeChat } from '@/hooks/useRealTimeChat'

// Demo user - in production, get from auth context
const DEMO_USER = {
  id: 'b150774c-4f37-436f-bd17-0b9f28de036e', // admin@test.com UUID
  name: 'You',
  avatar: 'Y'
}

const DEMO_CONTACTS = [
  { id: 'user-2', name: 'Alice Johnson', avatar: 'A', color: 'from-blue-500 to-indigo-600' },
  { id: 'user-3', name: 'Bob Smith', avatar: 'B', color: 'from-green-500 to-emerald-600' },
  { id: 'user-4', name: 'Charlie Davis', avatar: 'C', color: 'from-purple-500 to-pink-600' },
  { id: 'user-5', name: 'Diana Wilson', avatar: 'D', color: 'from-amber-500 to-orange-600' },
  { id: 'user-6', name: 'Eve Martinez', avatar: 'E', color: 'from-cyan-500 to-sky-600' },
]

interface Message {
  id: string
  sender_id: string
  content: string
  created_at: string
  status?: 'sending' | 'sent' | 'delivered' | 'read'
}

export default function MessagesPage() {
  const [selectedContact, setSelectedContact] = useState(DEMO_CONTACTS[0])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isTypingLocal, setIsTypingLocal] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Use real-time chat hook
  const { 
    connected, 
    messages, 
    typingUsers, 
    sendMessage, 
    sendTyping, 
    loadMessages 
  } = useRealTimeChat({ 
    userId: DEMO_USER.id,
    serverUrl: 'http://localhost:3002'
  })

  // Load messages when contact changes
  useEffect(() => {
    if (selectedContact) {
      loadMessages(selectedContact.id)
    }
  }, [selectedContact, loadMessages])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle typing indicator
  const handleTyping = (value: string) => {
    setNewMessage(value)
    
    // Send typing indicator
    if (value.length > 0 && !isTypingLocal) {
      setIsTypingLocal(true)
      sendTyping(true)
    }
    
    // Clear typing after 1 second of no typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTypingLocal(false)
      sendTyping(false)
    }, 1000)
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    sendMessage(newMessage)
    setNewMessage('')
    sendTyping(false)
    setIsTypingLocal(false)
  }

  const filteredContacts = DEMO_CONTACTS.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Filter messages for current conversation
  const currentMessages = messages.filter(m => 
    m.conversation_id === selectedContact.id
  )

  // If no messages from WebSocket, use demo data
  const displayMessages = currentMessages.length > 0 ? currentMessages : [
    { id: '1', sender_id: 'user-2', content: 'Hey! Did you get a chance to look at the latest designs?', created_at: '10:30 AM', status: 'read' as const },
    { id: '2', sender_id: DEMO_USER.id, content: 'Yes! They look amazing. I love the new color scheme.', created_at: '10:32 AM', status: 'read' as const },
    { id: '3', sender_id: 'user-2', content: "Great! I've made some more updates. Let me know what you think.", created_at: '10:35 AM', status: 'read' as const },
  ]

  // Check if someone is typing
  const isOtherTyping = Array.from(typingUsers.values()).some(v => v)

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Conversations List */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Connection status */}
        <div className="px-4 py-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-500">{connected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left ${
                selectedContact?.id === contact.id ? 'bg-blue-50 hover:bg-blue-50' : ''
              }`}
            >
              <div className="relative">
                <div className={`w-12 h-12 bg-gradient-to-br ${contact.color} rounded-full flex items-center justify-center text-white font-medium`}>
                  {contact.avatar}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900 truncate">{contact.name}</p>
                  <span className="text-xs text-gray-400">2m</span>
                </div>
                <p className="text-sm text-gray-500 truncate">Click to start chatting</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${selectedContact.color} rounded-full flex items-center justify-center text-white font-medium`}>
                  {selectedContact.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedContact.name}</p>
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <Phone className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <Video className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {displayMessages.map((msg) => {
                const isOwn = msg.sender_id === DEMO_USER.id || msg.sender_id === DEMO_USER.id.replace(/-/g, '')
                const contact = DEMO_CONTACTS.find(c => c.id === msg.sender_id)
                
                return (
                  <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-end gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                        isOwn 
                          ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
                          : `bg-gradient-to-br ${contact?.color || 'from-gray-500 to-gray-600'}`
                      }`}>
                        {isOwn ? 'Y' : contact?.avatar}
                      </div>
                      <div className={`p-3 rounded-2xl ${
                        isOwn 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-md' 
                          : 'bg-gray-100 text-gray-900 rounded-bl-md'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
                          <span>{msg.created_at}</span>
                          {isOwn && msg.status && (
                            <span>
                              {msg.status === 'sending' && '○'}
                              {msg.status === 'sent' && '✓'}
                              {msg.status === 'delivered' && '✓✓'}
                              {msg.status === 'read' && <span className="text-blue-200">✓✓</span>}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              
              {isOtherTyping && (
                <div className="flex justify-start">
                  <div className="flex items-end gap-2">
                    <div className={`w-8 h-8 bg-gradient-to-br ${selectedContact.color} rounded-full flex items-center justify-center text-white text-sm font-medium`}>
                      {selectedContact.avatar}
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-bl-md p-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <Paperclip className="w-5 h-5 text-gray-600" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => handleTyping(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.189 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h2>
              <p className="text-gray-500">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
