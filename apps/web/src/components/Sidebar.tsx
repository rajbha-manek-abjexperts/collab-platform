'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  PenTool,
  Settings,
  LogOut,
  ChevronDown,
  Plus,
  Moon,
  Sun,
  Users,
  MessageSquare,
  Bell,
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/workspaces', label: 'Workspaces', icon: FolderOpen },
  { href: '/documents', label: 'Documents', icon: FileText },
]

const secondaryNavItems = [
  { href: '/team', label: 'Team', icon: Users },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/notifications', label: 'Notifications', icon: Bell },
]

const mockWorkspaces = [
  { id: '1', name: 'Design Team', color: 'bg-blue-500' },
  { id: '2', name: 'Engineering', color: 'bg-green-500' },
  { id: '3', name: 'Marketing', color: 'bg-purple-500' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [workspaceOpen, setWorkspaceOpen] = useState(false)
  const [selectedWorkspace, setSelectedWorkspace] = useState(mockWorkspaces[0])
  const [isDark, setIsDark] = useState(false)

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 border-r border-sidebar-border bg-sidebar flex flex-col shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <PenTool className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-semibold text-foreground tracking-tight">
            Collab
          </span>
        </div>
      </div>

      {/* Workspace Selector */}
      <div className="px-3 pt-4 pb-2">
        <div className="relative">
          <button
            onClick={() => setWorkspaceOpen(!workspaceOpen)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-sidebar-hover transition-colors"
          >
            <div className={`h-5 w-5 rounded ${selectedWorkspace.color} shrink-0`} />
            <span className="truncate flex-1 text-left">{selectedWorkspace.name}</span>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${workspaceOpen ? 'rotate-180' : ''}`} />
          </button>

          {workspaceOpen && (
            <div className="absolute left-0 right-0 mt-1 bg-dropdown border border-sidebar-border rounded-lg shadow-lg z-50 py-1">
              {mockWorkspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    setSelectedWorkspace(ws)
                    setWorkspaceOpen(false)
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                    selectedWorkspace.id === ws.id
                      ? 'bg-sidebar-active text-foreground'
                      : 'text-muted-foreground hover:bg-sidebar-hover hover:text-foreground'
                  }`}
                >
                  <div className={`h-4 w-4 rounded ${ws.color}`} />
                  <span>{ws.name}</span>
                </button>
              ))}
              <div className="border-t border-sidebar-border mt-1 pt-1">
                <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-hover hover:text-foreground transition-colors">
                  <Plus className="h-4 w-4" />
                  <span>Create Workspace</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 px-3 py-2">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sidebar-active text-accent-foreground'
                    : 'text-muted-foreground hover:bg-sidebar-hover hover:text-foreground'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* Secondary Navigation */}
        <div className="mt-6 pt-4 border-t border-sidebar-border">
          <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
            Collaborate
          </p>
          <div className="space-y-0.5">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sidebar-active text-accent-foreground'
                      : 'text-muted-foreground hover:bg-sidebar-hover hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="px-3 py-3 border-t border-sidebar-border space-y-0.5">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-sidebar-hover hover:text-foreground transition-colors w-full"
        >
          {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>

        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-sidebar-hover hover:text-foreground transition-colors"
        >
          <Settings className="h-4.5 w-4.5" />
          Settings
        </Link>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-sidebar-hover hover:text-foreground transition-colors w-full"
        >
          <LogOut className="h-4.5 w-4.5" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
