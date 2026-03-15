'use client'

import { useState } from 'react'
import { User, Building2, Bell } from 'lucide-react'
import ProfileSettings from '@/components/Settings/ProfileSettings'
import WorkspaceSettings from '@/components/Settings/WorkspaceSettings'
import NotificationSettings from '@/components/Settings/NotificationSettings'

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'workspace', label: 'Workspace', icon: Building2 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
] as const

type TabId = (typeof tabs)[number]['id']

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('profile')

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Manage your account, workspace, and notification preferences.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Tab Navigation */}
        <nav className="lg:w-56 flex-shrink-0">
          <ul className="flex lg:flex-col gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[var(--sidebar-active)] text-[var(--accent)] dark:text-[var(--accent-foreground)]'
                        : 'text-[var(--muted-foreground)] hover:bg-[var(--sidebar-hover)] hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Tab Content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'workspace' && <WorkspaceSettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
        </div>
      </div>
    </div>
  )
}
