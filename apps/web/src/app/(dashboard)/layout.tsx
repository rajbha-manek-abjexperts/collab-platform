'use client'

import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import CommandPalette from '@/components/CommandPalette'
import GlobalSearch from '@/components/GlobalSearch'
import ShortcutsHelpModal from '@/components/ShortcutsHelpModal'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { showHelp, setShowHelp } = useKeyboardShortcuts([])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8 max-w-7xl">{children}</div>
        </main>
      </div>
      <CommandPalette />
      <GlobalSearch />
      <ShortcutsHelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  )
}
