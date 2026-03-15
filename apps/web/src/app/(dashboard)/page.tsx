import Link from 'next/link'
import { FolderOpen, FileText, PenTool, Users } from 'lucide-react'

const quickActions = [
  {
    href: '/workspaces',
    label: 'Workspaces',
    description: 'Manage your team workspaces',
    icon: FolderOpen,
    color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  },
  {
    href: '/documents',
    label: 'Documents',
    description: 'Create and edit documents',
    icon: FileText,
    color:
      'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
  },
]

export default function DashboardPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Welcome back! Here&apos;s an overview of your workspace.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Workspaces', value: '—', icon: FolderOpen },
          { label: 'Documents', value: '—', icon: FileText },
          { label: 'Whiteboards', value: '—', icon: PenTool },
          { label: 'Team Members', value: '—', icon: Users },
        ].map((stat) => {
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
                </div>
                <Icon className="h-8 w-8 text-gray-300 dark:text-gray-600" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-4 p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
            >
              <div className={`p-3 rounded-lg ${action.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium">{action.label}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {action.description}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
