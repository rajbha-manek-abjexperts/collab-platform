'use client'

import { useState } from 'react'
import {
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  HelpCircle,
} from 'lucide-react'

export default function Header() {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)

  return (
    <header className="h-14 border-b border-header-border bg-header flex items-center justify-between px-6 shrink-0">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
            searchFocused
              ? 'border-accent bg-background'
              : 'border-transparent bg-header-search'
          }`}
        >
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search documents, workspaces..."
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none w-full"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/50 bg-background/50 rounded border border-sidebar-border">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-muted-foreground hover:bg-header-hover hover:text-foreground transition-colors">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-header" />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-header-border mx-2" />

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-header-hover transition-colors"
          >
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
              <span className="text-xs font-semibold text-white">JD</span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-foreground leading-tight">
                John Doe
              </p>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Pro Plan
              </p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {userMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setUserMenuOpen(false)}
              />
              <div className="absolute right-0 mt-1 w-56 bg-dropdown border border-sidebar-border rounded-lg shadow-lg z-50 py-1">
                <div className="px-3 py-2.5 border-b border-sidebar-border">
                  <p className="text-sm font-medium text-foreground">John Doe</p>
                  <p className="text-xs text-muted-foreground">john@example.com</p>
                </div>
                <div className="py-1">
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-hover hover:text-foreground transition-colors">
                    <User className="h-4 w-4" />
                    Profile
                  </button>
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-hover hover:text-foreground transition-colors">
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-hover hover:text-foreground transition-colors">
                    <HelpCircle className="h-4 w-4" />
                    Help & Support
                  </button>
                </div>
                <div className="border-t border-sidebar-border pt-1">
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
