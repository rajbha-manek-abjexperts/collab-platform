'use client'

import { useState } from 'react'
import { Loader2, Check } from 'lucide-react'

interface NotificationPreference {
  key: string
  label: string
  description: string
  email: boolean
  push: boolean
  inApp: boolean
}

const defaultPreferences: NotificationPreference[] = [
  {
    key: 'document_updates',
    label: 'Document Updates',
    description: 'When a document you follow is edited or commented on.',
    email: true,
    push: true,
    inApp: true,
  },
  {
    key: 'mentions',
    label: 'Mentions',
    description: 'When someone mentions you in a comment or document.',
    email: true,
    push: true,
    inApp: true,
  },
  {
    key: 'workspace_invites',
    label: 'Workspace Invitations',
    description: 'When you are invited to join a workspace.',
    email: true,
    push: false,
    inApp: true,
  },
  {
    key: 'member_activity',
    label: 'Member Activity',
    description: 'When members join, leave, or change roles in your workspace.',
    email: false,
    push: false,
    inApp: true,
  },
  {
    key: 'whiteboard_sessions',
    label: 'Whiteboard Sessions',
    description: 'When a collaborative whiteboard session is started.',
    email: false,
    push: true,
    inApp: true,
  },
]

export default function NotificationSettings() {
  const [preferences, setPreferences] = useState(defaultPreferences)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false)
  const [quietFrom, setQuietFrom] = useState('22:00')
  const [quietTo, setQuietTo] = useState('08:00')

  const toggleChannel = (key: string, channel: 'email' | 'push' | 'inApp') => {
    setPreferences((prev) =>
      prev.map((p) => (p.key === key ? { ...p, [channel]: !p[channel] } : p))
    )
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 600))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-8">
      {/* Notification Channels */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Notification Preferences</h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-6">
          Choose how you want to be notified for each activity type.
        </p>

        {/* Header */}
        <div className="grid grid-cols-[1fr_80px_80px_80px] gap-2 mb-3 px-1">
          <div />
          <span className="text-xs font-medium text-[var(--muted-foreground)] text-center">
            Email
          </span>
          <span className="text-xs font-medium text-[var(--muted-foreground)] text-center">
            Push
          </span>
          <span className="text-xs font-medium text-[var(--muted-foreground)] text-center">
            In-App
          </span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {preferences.map((pref) => (
            <div
              key={pref.key}
              className="grid grid-cols-[1fr_80px_80px_80px] gap-2 items-center py-4 px-1"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{pref.label}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{pref.description}</p>
              </div>
              {(['email', 'push', 'inApp'] as const).map((channel) => (
                <div key={channel} className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => toggleChannel(pref.key, channel)}
                    className={`relative w-10 h-[22px] rounded-full transition-colors ${
                      pref[channel]
                        ? 'bg-[var(--accent)]'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                        pref[channel] ? 'translate-x-[18px]' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-foreground">Quiet Hours</h2>
          <button
            type="button"
            onClick={() => {
              setQuietHoursEnabled(!quietHoursEnabled)
              setSaved(false)
            }}
            className={`relative w-10 h-[22px] rounded-full transition-colors ${
              quietHoursEnabled
                ? 'bg-[var(--accent)]'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span
              className={`absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                quietHoursEnabled ? 'translate-x-[18px]' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        <p className="text-sm text-[var(--muted-foreground)] mb-5">
          Pause push and email notifications during specified hours.
        </p>

        {quietHoursEnabled && (
          <div className="flex items-center gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
                From
              </label>
              <input
                type="time"
                value={quietFrom}
                onChange={(e) => {
                  setQuietFrom(e.target.value)
                  setSaved(false)
                }}
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
              />
            </div>
            <span className="text-[var(--muted-foreground)] mt-5">to</span>
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
                Until
              </label>
              <input
                type="time"
                value={quietTo}
                onChange={(e) => {
                  setQuietTo(e.target.value)
                  setSaved(false)
                }}
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Save */}
      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
            <Check className="w-4 h-4" />
            Preferences saved
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  )
}
