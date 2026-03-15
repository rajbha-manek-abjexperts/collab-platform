'use client'

import { useState } from 'react'
import { Figma, Loader2, Image, Download, X } from 'lucide-react'

interface FigmaFrame {
  id: string
  name: string
  type: string
}

interface FigmaImportButtonProps {
  whiteboardId?: string
}

export default function FigmaImportButton({ whiteboardId }: FigmaImportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [figmaUrl, setFigmaUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const [frames, setFrames] = useState<FigmaFrame[]>([])
  const [selectedFrame, setSelectedFrame] = useState<FigmaFrame | null>(null)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')

  async function fetchFrames() {
    if (!figmaUrl) return

    setLoading(true)
    setError('')
    setFrames([])
    setSelectedFrame(null)

    try {
      // Extract file key from URL
      const fileKey = figmaUrl.match(/figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/)?.[1]
      
      if (!fileKey) {
        setError('Invalid Figma URL')
        return
      }

      const response = await fetch(`http://localhost:3002/api/integrations/figma/file/${fileKey}/frames`)
      
      if (!response.ok) {
        setError('Failed to fetch Figma file')
        return
      }

      const data = await response.json()
      setFileName(data.name || 'Figma File')
      setFrames(data.frames || [])
    } catch (err) {
      setError('Failed to connect to Figma')
    } finally {
      setLoading(false)
    }
  }

  async function handleImport() {
    if (!selectedFrame || !whiteboardId) return

    setImporting(true)
    try {
      await fetch('http://localhost:3002/api/integrations/figma/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whiteboardId,
          frameId: selectedFrame.id,
          fileKey: figmaUrl.match(/figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/)?.[1]
        })
      })
      
      setIsOpen(false)
      setFigmaUrl('')
      setFrames([])
      setSelectedFrame(null)
    } catch (err) {
      setError('Failed to import frame')
    } finally {
      setImporting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
      >
        <svg viewBox="0 0 38 57" className="w-4 h-4" fill="currentColor">
          <path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z"/>
          <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 0 1-19 0z"/>
          <path d="M19 0v19h9.5a9.5 9.5 0 0 0 0-19H19z"/>
          <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z"/>
          <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z"/>
        </svg>
        Import from Figma
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                  <Figma className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-gray-900">Import from Figma</h2>
                  <p className="text-sm text-gray-500">Import frames to your whiteboard</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Figma URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Figma File URL
                </label>
                <input
                  type="url"
                  value={figmaUrl}
                  onChange={e => setFigmaUrl(e.target.value)}
                  placeholder="https://www.figma.com/file/..."
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                />
              </div>

              <button
                onClick={fetchFrames}
                disabled={!figmaUrl || loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {loading ? 'Fetching...' : 'Fetch Frames'}
              </button>

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              {/* Frames Grid */}
              {frames.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {fileName} - Select a frame
                  </p>
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                    {frames.map(frame => (
                      <button
                        key={frame.id}
                        onClick={() => setSelectedFrame(frame)}
                        className={`p-3 rounded-xl border text-left transition-colors ${
                          selectedFrame?.id === frame.id
                            ? 'border-gray-900 bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Image className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm font-medium text-gray-900 truncate">{frame.name}</p>
                        <p className="text-xs text-gray-500">{frame.type}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 flex gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!selectedFrame || importing || !whiteboardId}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {importing ? 'Importing...' : 'Import'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
