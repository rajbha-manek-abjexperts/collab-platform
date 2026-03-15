'use client'

import { useState } from 'react'
import { MessageSquare, Loader2, Check, X, Send, Settings } from 'lucide-react'

export default function SlackSettings() {
  const [webhookUrl, setWebhookUrl] = useState('')
  const [connected, setConnected] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)
  const [notifyDocument, setNotifyDocument] = useState(true)
  const [notifyComment, setNotifyComment] = useState(true)
  const [notifyInvite, setNotifyInvite] = useState(true)
  const [saving, setSaving] = useState(false)

  async function testConnection() {
    if (!webhookUrl) return
    
    setTesting(true)
    setTestResult(null)
    
    try {
      const response = await fetch('http://localhost:3002/api/notifications/slack/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl })
      })
      
      if (response.ok) {
        setTestResult('success')
        setConnected(true)
      } else {
        setTestResult('error')
      }
    } catch (err) {
      setTestResult('error')
    } finally {
      setTesting(false)
    }
  }

  async function saveSettings() {
    setSaving(true)
    try {
      // Save to localStorage for demo
      localStorage.setItem('slack_webhook', webhookUrl)
      localStorage.setItem('slack_notify_document', String(notifyDocument))
      localStorage.setItem('slack_notify_comment', String(notifyComment))
      localStorage.setItem('slack_notify_invite', String(notifyInvite))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-[#4A154B] to-[#611f69] rounded-xl flex items-center justify-center">
          <MessageSquare className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">Slack Integration</h3>
            {connected && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                <Check className="w-3 h-3" /> Connected
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Send notifications to your Slack workspace
          </p>

          {/* Webhook URL Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Webhook URL
            </label>
            <input
              type="url"
              value={webhookUrl}
              onChange={e => {
                setWebhookUrl(e.target.value)
                setConnected(false)
                setTestResult(null)
              }}
              placeholder="https://hooks.slack.com/services/..."
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {/* Test Connection */}
          <button
            onClick={testConnection}
            disabled={!webhookUrl || testing}
            className="flex items-center gap-2 px-4 py-2 bg-[#4A154B] text-white rounded-xl font-medium text-sm hover:bg-[#611f69] transition-colors disabled:opacity-50 mb-4"
          >
            {testing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {testing ? 'Testing...' : 'Test Connection'}
          </button>

          {testResult === 'success' && (
            <div className="flex items-center gap-2 text-green-600 text-sm mb-4">
              <Check className="w-4 h-4" /> Connected successfully!
            </div>
          )}

          {testResult === 'error' && (
            <div className="flex items-center gap-2 text-red-600 text-sm mb-4">
              <X className="w-4 h-4" /> Failed to connect. Check your webhook URL.
            </div>
          )}

          {/* Notification Settings */}
          {connected && (
            <div className="border-t border-gray-100 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Notification Preferences
              </h4>
              
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyDocument}
                    onChange={e => setNotifyDocument(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-600">New document notifications</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyComment}
                    onChange={e => setNotifyComment(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-600">New comment notifications</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyInvite}
                    onChange={e => setNotifyInvite(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-600">Workspace invite notifications</span>
                </label>
              </div>

              <button
                onClick={saveSettings}
                disabled={saving}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium text-sm hover:from-blue-700 hover:to-indigo-700 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
