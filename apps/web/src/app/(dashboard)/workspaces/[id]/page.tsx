'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Settings, 
  Users, 
  FileText, 
  PenTool, 
  MoreHorizontal,
  Loader2,
  Calendar,
  Clock
} from 'lucide-react'
import { apiFetch } from '@/lib/api'

interface Workspace {
  id: string
  name: string
  slug: string
  description: string | null
  owner_id: string
  created_at: string
  updated_at: string
}

export default function WorkspaceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchWorkspace() {
      try {
        const token = localStorage.getItem('access_token')
        const res: any = await apiFetch(`/api/workspaces/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}`} : {}
        })
        
        if (res.id) {
          setWorkspace(res)
        } else {
          // Use demo data
          setWorkspace({
            id: id,
            name: 'Demo Workspace',
            slug: 'demo-workspace',
            description: 'This is a demo workspace',
            owner_id: 'user-1',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        }
      } catch (err) {
        setError('Failed to load workspace')
        // Demo data
        setWorkspace({
          id: id,
          name: 'Demo Workspace',
          slug: 'demo-workspace', 
          description: 'This is a demo workspace',
          owner_id: 'user-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      } finally {
        setLoading(false)
      }
    }

    if (id && id !== 'undefined') {
      fetchWorkspace()
    } else {
      setLoading(false)
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!workspace) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-500">Workspace not found</h1>
        <Link href="/workspaces" className="text-blue-500 hover:underline">
          Back to workspaces
        </Link>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/workspaces"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{workspace.name}</h1>
            <p className="text-gray-500 mt-1">/{workspace.slug}</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">3</p>
              <p className="text-sm text-gray-500">Members</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-gray-500">Documents</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <PenTool className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">5</p>
              <p className="text-sm text-gray-500">Whiteboards</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">2</p>
              <p className="text-sm text-gray-500">Active Now</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link
          href={`/documents?workspace=${workspace.id}`}
          className="flex items-center gap-4 p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group"
        >
          <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileText className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Documents</h3>
            <p className="text-sm text-gray-500">Create and manage documents</p>
          </div>
        </Link>
        
        <Link
          href={`/whiteboard/new?workspace=${workspace.id}`}
          className="flex items-center gap-4 p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-purple-300 hover:shadow-md transition-all group"
        >
          <div className="w-14 h-14 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <PenTool className="w-7 h-7 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Whiteboards</h3>
            <p className="text-sm text-gray-500">Collaborate on visual content</p>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              { user: 'Alice', action: 'created', target: 'Project Plan', time: '2 hours ago' },
              { user: 'Bob', action: 'edited', target: 'Marketing Brief', time: '5 hours ago' },
              { user: 'Charlie', action: 'commented on', target: 'Design Mockup', time: 'Yesterday' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                  {activity.user[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span>{' '}
                    <span className="text-gray-500">{activity.action}</span>{' '}
                    <span className="font-medium">{activity.target}</span>
                  </p>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
