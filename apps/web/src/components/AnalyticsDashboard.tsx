'use client'

import { useState } from 'react'
import { TrendingUp, Users, FileText, Eye, Clock, ArrowUp, ArrowDown } from 'lucide-react'

interface StatCard {
  label: string
  value: string
  change: number
  icon: React.ReactNode
}

const stats: StatCard[] = [
  { label: 'Total Users', value: '1,234', change: 12.5, icon: <Users className="w-5 h-5" /> },
  { label: 'Active Documents', value: '567', change: 8.2, icon: <FileText className="w-5 h-5" /> },
  { label: 'Page Views', value: '45.2K', change: 23.1, icon: <Eye className="w-5 h-5" /> },
  { label: 'Avg. Session', value: '4m 32s', change: -2.4, icon: <Clock className="w-5 h-5" /> },
]

const chartData = [
  { name: 'Mon', users: 120, documents: 45 },
  { name: 'Tue', users: 180, documents: 65 },
  { name: 'Wed', users: 150, documents: 55 },
  { name: 'Thu', users: 220, documents: 80 },
  { name: 'Fri', users: 280, documents: 95 },
  { name: 'Sat', users: 160, documents: 60 },
  { name: 'Sun', users: 140, documents: 50 },
]

export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState('7d')

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center text-blue-600">
                {stat.icon}
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                stat.change >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {stat.change >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                {Math.abs(stat.change)}%
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Activity Overview</h3>
            <p className="text-sm text-gray-500">User and document activity</p>
          </div>
          <div className="flex items-center gap-2">
            {['24h', '7d', '30d', '90d'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  period === p
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="h-64 flex items-end gap-2">
          {chartData.map((day, i) => (
            <div key={day.name} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col gap-1">
                <div
                  className="w-full bg-gradient-to-t from-blue-600 to-blue-500 rounded-t-lg"
                  style={{ height: `${(day.users / 300) * 100}%` }}
                />
                <div
                  className="w-full bg-gradient-to-t from-indigo-400 to-indigo-300 rounded-t-lg"
                  style={{ height: `${(day.documents / 100) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-400">{day.name}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className="text-sm text-gray-600">Users</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-indigo-400 rounded-full" />
            <span className="text-sm text-gray-600">Documents</span>
          </div>
        </div>
      </div>
    </div>
  )
}
