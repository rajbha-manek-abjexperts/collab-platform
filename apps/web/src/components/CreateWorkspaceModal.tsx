'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, FolderOpen, Loader2 } from 'lucide-react'

const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be under 50 characters'),
  description: z
    .string()
    .max(200, 'Description must be under 200 characters')
    .optional()
    .or(z.literal('')),
})

type CreateWorkspaceFormData = z.infer<typeof createWorkspaceSchema>

interface CreateWorkspaceModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateWorkspaceFormData) => Promise<void> | void
}

export default function CreateWorkspaceModal({ isOpen, onClose, onSubmit }: CreateWorkspaceModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateWorkspaceFormData>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: { name: '', description: '' },
  })

  const nameValue = watch('name')
  const slug = nameValue
    ? nameValue
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 50)
    : ''

  const handleFormSubmit = async (data: CreateWorkspaceFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      reset()
      onClose()
    } catch {
      // Error handling delegated to parent
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <FolderOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Create Workspace</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label htmlFor="ws-name" className="block text-sm font-medium text-foreground mb-1.5">
              Workspace Name
            </label>
            <input
              id="ws-name"
              type="text"
              placeholder="e.g. Design Team"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white dark:bg-gray-800 text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                errors.name
                  ? 'border-red-300 dark:border-red-700 focus:ring-red-500/20'
                  : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500/20 focus:border-blue-500'
              }`}
              {...register('name')}
            />
            {errors.name && (
              <p className="mt-1.5 text-xs text-red-500">{errors.name.message}</p>
            )}
            {slug && (
              <p className="mt-1.5 text-xs text-gray-400">
                URL: /workspaces/<span className="text-gray-600 dark:text-gray-300">{slug}</span>
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="ws-desc" className="block text-sm font-medium text-foreground mb-1.5">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="ws-desc"
              rows={3}
              placeholder="What is this workspace for?"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white dark:bg-gray-800 text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 resize-none transition-colors ${
                errors.description
                  ? 'border-red-300 dark:border-red-700 focus:ring-red-500/20'
                  : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500/20 focus:border-blue-500'
              }`}
              {...register('description')}
            />
            {errors.description && (
              <p className="mt-1.5 text-xs text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Creating...' : 'Create Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
