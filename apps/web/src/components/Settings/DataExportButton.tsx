'use client'

import { useState } from 'react'
import { Download, Loader2, Check, FileJson, FileText } from 'lucide-react'

interface ExportData {
  user?: any
  workspaces?: any[]
  documents?: any[]
  whiteboardSessions?: any[]
  comments?: any[]
  notifications?: any[]
}

export default function DataExportButton() {
  const [loading, setLoading] = useState(false)
  const [exportedData, setExportedData] = useState<ExportData | null>(null)
  const [format, setFormat] = useState<'json' | 'csv'>('json')

  async function handleExport() {
    setLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`http://localhost:3002/api/export/data?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setExportedData(data)
      }
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setLoading(false)
    }
  }

  function downloadData() {
    if (!exportedData) return

    const blob = new Blob([JSON.stringify(exportedData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `collab-platform-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (exportedData) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <Check className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-green-800">Export Ready!</h3>
            <p className="text-sm text-green-600">Your data is ready to download</p>
          </div>
        </div>
        
        <div className="text-sm text-gray-600 mb-4">
          <p>Included in export:</p>
          <ul className="mt-1 ml-4 list-disc">
            <li>{exportedData.workspaces?.length || 0} workspaces</li>
            <li>{exportedData.documents?.length || 0} documents</li>
            <li>{exportedData.whiteboardSessions?.length || 0} whiteboards</li>
            <li>{exportedData.comments?.length || 0} comments</li>
          </ul>
        </div>

        <button
          onClick={downloadData}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download Export
        </button>

        <button
          onClick={() => setExportedData(null)}
          className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700"
        >
          Export again
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
          <Download className="w-6 h-6 text-blue-600" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">Export Your Data</h3>
          <p className="text-sm text-gray-500 mb-4">
            Download all your data including workspaces, documents, and comments. 
            This is required for GDPR compliance.
          </p>

          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setFormat('json')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                format === 'json' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FileJson className="w-4 h-4" />
              JSON
            </button>
            <button
              onClick={() => setFormat('csv')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                format === 'csv' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              CSV
            </button>
          </div>

          <button
            onClick={handleExport}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Start Export
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
