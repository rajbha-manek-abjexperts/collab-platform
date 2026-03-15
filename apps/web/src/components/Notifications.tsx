'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { NotificationItem } from '@/components/NotificationItem'

interface NotificationsProps {
  userId: string
}

export function Notifications({ userId }: NotificationsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications({ userId })

  // Close panel on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={panelRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" />
          <div className="absolute right-0 top-full z-50 mt-2 w-96 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-xs text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <CheckCheck size={14} />
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-96 overflow-y-auto scrollbar-thin">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={20} className="animate-spin text-gray-400" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                  <Bell size={24} className="mb-2" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="p-1">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onRead={markAsRead}
                      onDelete={deleteNotification}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
