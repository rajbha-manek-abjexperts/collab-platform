'use client'

import { useState } from 'react'
import { Search, Send, Paperclip, MoreVertical, Phone, Video, ArrowLeft } from 'lucide-react'

interface Message {
  id: string
  user: string
  avatar: string
  message: string
  time: string
  isOwn: boolean
}

interface Conversation {
  id: string
  user: string
  avatar: string
  lastMessage: string
  time: string
  unread: number
}

const conversations: Conversation[] = [
  { id: '1', user: 'Alice Johnson', avatar: 'A', lastMessage: 'Hey, did you see the latest designs?', time: '2m ago', unread: 2 },
  { id: '2', user: 'Bob Smith', avatar: 'B', lastMessage: 'The document is ready for review', time: '1h ago', unread: 0 },
  { id: '3', user: 'Charlie Davis', avatar: 'C', lastMessage: 'Thanks for the update!', time: '3h ago', unread: 0 },
  { id: '4', user: 'Diana Wilson', avatar: 'D', lastMessage: 'Let\'s schedule a call', time: 'Yesterday', unread: 1 },
  { id: '5', user: 'Eve Martinez', avatar: 'E', lastMessage: 'Great work on the project!', time: 'Yesterday', unread: 0 },
]

const messages: Message[] = [
  { id: '1', user: 'Alice Johnson', avatar: 'A', message: 'Hey! Did you get a chance to look at the latest designs I shared?', time: '10:30 AM', isOwn: false },
  { id: '2', user: 'You', avatar: 'Y', message: 'Yes! They look amazing. I love the new color scheme.', time: '10:32 AM', isOwn: true },
  { id: '3', user: 'Alice Johnson', avatar: 'A', message: 'Great! I\'ve made some more updates. Let me know what you think.', time: '10:35 AM', isOwn: false },
  { id: '4', user: 'You', avatar: 'Y', message: 'Sure, send them over! I\'m in the workspace now.', time: '10:36 AM', isOwn: true },
  { id: '5', user: 'Alice Johnson', avatar: 'A', message: 'Perfect! I\'ve just added them to the shared folder.', time: '10:38 AM', isOwn: false },
]

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredConversations = conversations.filter(c => 
    c.user.toLowerCase().includes(searchQuery.toLowerCase())
  )

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

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left ${
                selectedConversation?.id === conv.id ? 'bg-blue-50 hover:bg-blue-50' : ''
              }`}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                  {conv.avatar}
                </div>
                {conv.unread > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    {conv.unread}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900 truncate">{conv.user}</p>
                  <span className="text-xs text-gray-400">{conv.time}</span>
                </div>
                <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                  {selectedConversation.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedConversation.user}</p>
                  <p className="text-sm text-gray-500">Online</p>
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
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-end gap-2 max-w-[70%] ${msg.isOwn ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                      msg.isOwn ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-green-500 to-emerald-600'
                    }`}>
                      {msg.avatar}
                    </div>
                    <div className={`p-3 rounded-2xl ${
                      msg.isOwn 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-md' 
                        : 'bg-gray-100 text-gray-900 rounded-bl-md'
                    }`}>
                      <p>{msg.message}</p>
                      <p className={`text-xs mt-1 ${msg.isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
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
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
                <button 
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
                <MessageCircle className="w-10 h-10 text-gray-400" />
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

function MessageCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.189 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  )
}
