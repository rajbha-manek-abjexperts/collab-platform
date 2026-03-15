'use client'

import { useState } from 'react'
import { Search, Filter, Download, Eye, Edit, Trash2, UserPlus, LogIn } from 'lucide-react'

interface AuditLog {
  id: string
  action: string
  resource: string
  user: string
  timestamp: string
  ip: string
}

const mockLogs: AuditLog[] = [
  { id: '1', action: 'CREATE', resource: 'Document', user: 'John Doe', timestamp: '2026-03-15 14:30:00', ip: '192.168.1.1' },
  { id: '2', action: 'EDIT', resource: 'Document', user: 'Jane Smith', timestamp: '2026-03-15 14:25:00', ip: '192.168.1.2' },
  { id: '3', action: 'DELETE', resource: 'Workspace', user: 'Admin', timestamp: '2026-03-15 14:20:00', ip: '192.168.1.1' },
  { id: '4', action: 'LOGIN', resource: 'Auth', user: 'John Doe', timestamp: '2026-03-15 14:15:00', ip: '192.168.1.1' },
  { id: '5', action: 'INVITE', resource: 'Member', user: 'Jane Smith', timestamp: '2026-03-15 14:10:00', ip: '192.168.1.2' },
]

const getActionIcon = (action: string) => {
  switch (action) {
    case 'CREATE': return <Eye className="w-4 h-4 text-green-500" />
    case 'EDIT': return <Edit className="w-4 h-4 text-blue-500" />
    case 'DELETE': return <Trash2 className="w-4 h-4 text-red-500" />
    case 'LOGIN': return <LogIn className="w-4 h-4 text-purple-500" />
    case 'INVITE': return <UserPlus className="w-4 h-4 text-orange-500" />
    default: return <Eye className="w-4 h-4 text-gray-500" />
  }
}

const getActionColor = (action: string) => {
  switch (action) {
    case 'CREATE': return 'bg-green-50 text-green-700'
    case 'EDIT': return 'bg-blue-50 text-blue-700'
    case 'DELETE': return 'bg-red-50 text-red-700'
    case 'LOGIN': return 'bg-purple-50 text-purple-700'
    case 'INVITE': return 'bg-orange-50 text-orange-700'
    default: return 'bg-gray-50 text-gray-700'
  }
}

export default function AuditLogs() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  const filtered = mockLogs.filter(log => {
    const matchSearch = log.user.toLowerCase().includes(search.toLowerCase()) ||
                       log.resource.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' || log.action === filter
    return matchSearch && matchFilter
  })

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Audit Logs</h2>
            <p className="text-gray-500 text-sm">Track all activity in your workspace</p>
          </div>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 transition-all flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search logs..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
            />
          </div>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
          >
            <option value="All">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="EDIT">Edit</option>
            <option value="DELETE">Delete</option>
            <option value="LOGIN">Login</option>
          </select>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {filtered.map(log => (
          <div key={log.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getActionColor(log.action)}`}>
              {getActionIcon(log.action)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{log.action}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">{log.resource}</span>
              </div>
              <p className="text-sm text-gray-500">{log.user} • {log.ip}</p>
            </div>
            <div className="text-sm text-gray-400">
              {log.timestamp}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
