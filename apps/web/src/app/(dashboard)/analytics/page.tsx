'use client'

import { useState } from 'react'
import {
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Activity,
  Eye,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

// Mock data for demonstration
const dailyActivity = [
  { date: 'Mar 1', count: 24 },
  { date: 'Mar 2', count: 18 },
  { date: 'Mar 3', count: 32 },
  { date: 'Mar 4', count: 27 },
  { date: 'Mar 5', count: 45 },
  { date: 'Mar 6', count: 38 },
  { date: 'Mar 7', count: 52 },
  { date: 'Mar 8', count: 41 },
  { date: 'Mar 9', count: 36 },
  { date: 'Mar 10', count: 48 },
  { date: 'Mar 11', count: 55 },
  { date: 'Mar 12', count: 43 },
  { date: 'Mar 13', count: 61 },
  { date: 'Mar 14', count: 58 },
]

const eventBreakdown = [
  { name: 'Document Views', value: 420, color: '#3b82f6' },
  { name: 'Document Edits', value: 280, color: '#10b981' },
  { name: 'Comments', value: 150, color: '#f59e0b' },
  { name: 'Whiteboard Sessions', value: 90, color: '#8b5cf6' },
  { name: 'File Uploads', value: 60, color: '#ef4444' },
]

const popularDocuments = [
  { title: 'Q1 Product Roadmap', views: 156, trend: '+12%' },
  { title: 'Design System Guidelines', views: 134, trend: '+8%' },
  { title: 'Sprint Planning Notes', views: 98, trend: '+23%' },
  { title: 'API Documentation', views: 87, trend: '-3%' },
  { title: 'Meeting Minutes - March', views: 72, trend: '+15%' },
]

const activeUsers = [
  { name: 'Sarah Chen', events: 145, role: 'Designer', lastActive: '2 min ago' },
  { name: 'Alex Rivera', events: 128, role: 'Engineer', lastActive: '5 min ago' },
  { name: 'Jordan Lee', events: 112, role: 'PM', lastActive: '12 min ago' },
  { name: 'Morgan Davis', events: 98, role: 'Engineer', lastActive: '1 hr ago' },
  { name: 'Casey Wright', events: 76, role: 'Designer', lastActive: '2 hr ago' },
]

const weeklyComparison = [
  { day: 'Mon', thisWeek: 45, lastWeek: 38 },
  { day: 'Tue', thisWeek: 52, lastWeek: 42 },
  { day: 'Wed', thisWeek: 61, lastWeek: 55 },
  { day: 'Thu', thisWeek: 48, lastWeek: 49 },
  { day: 'Fri', thisWeek: 55, lastWeek: 44 },
  { day: 'Sat', thisWeek: 22, lastWeek: 18 },
  { day: 'Sun', thisWeek: 15, lastWeek: 12 },
]

type TimeRange = '7d' | '30d' | '90d'

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')

  const stats = [
    {
      label: 'Total Events',
      value: '1,248',
      change: '+18%',
      positive: true,
      icon: Activity,
    },
    {
      label: 'Active Users',
      value: '24',
      change: '+6%',
      positive: true,
      icon: Users,
    },
    {
      label: 'Documents Viewed',
      value: '420',
      change: '+12%',
      positive: true,
      icon: Eye,
    },
    {
      label: 'Avg. Daily Events',
      value: '42',
      change: '-3%',
      positive: false,
      icon: TrendingUp,
    },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Track usage and activity across your workspace.
          </p>
        </div>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {(['7d', '30d', '90d'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-white dark:bg-gray-700 text-foreground shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-foreground'
              }`}
            >
              {range === '7d' ? '7 days' : range === '30d' ? '30 days' : '90 days'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <span
                    className={`text-xs font-medium ${
                      stat.positive
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-500 dark:text-red-400'
                    }`}
                  >
                    {stat.change} vs last period
                  </span>
                </div>
                <Icon className="h-8 w-8 text-gray-300 dark:text-gray-600" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Daily Activity Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 className="text-base font-semibold mb-4">Daily Activity</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#f9fafb',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Event Breakdown Pie */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 className="text-base font-semibold mb-4">Event Breakdown</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={eventBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {eventBreakdown.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#f9fafb',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-2">
            {eventBreakdown.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                </div>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Comparison + Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weekly Comparison Chart */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 className="text-base font-semibold mb-4">Weekly Comparison</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#f9fafb',
                  }}
                />
                <Bar dataKey="thisWeek" fill="#3b82f6" radius={[4, 4, 0, 0]} name="This Week" />
                <Bar dataKey="lastWeek" fill="#e5e7eb" radius={[4, 4, 0, 0]} name="Last Week" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Documents */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Popular Documents
          </h3>
          <div className="space-y-3">
            {popularDocuments.map((doc, index) => (
              <div
                key={doc.title}
                className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-400 w-5">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium">{doc.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">{doc.views} views</span>
                  <span
                    className={`text-xs font-medium ${
                      doc.trend.startsWith('+')
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-500 dark:text-red-400'
                    }`}
                  >
                    {doc.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Users */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
          <Users className="h-4 w-4" />
          Most Active Users (Last 7 Days)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Events</th>
                <th className="pb-3 font-medium">Activity</th>
                <th className="pb-3 font-medium text-right">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {activeUsers.map((user) => (
                <tr
                  key={user.name}
                  className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                >
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-medium">
                        {user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <span className="text-sm font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="text-sm font-medium">{user.events}</span>
                  </td>
                  <td className="py-3">
                    <div className="w-24 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${(user.events / activeUsers[0].events) * 100}%`,
                        }}
                      />
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {user.lastActive}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
