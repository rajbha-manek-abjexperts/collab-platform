'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, UserPlus, Loader2, Mail, ChevronDown, Copy, Check } from 'lucide-react'
import type { MemberRole } from '@/types'

const inviteSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['admin', 'member', 'viewer'], {
    error: 'Please select a role',
  }),
})

type InviteFormData = z.infer<typeof inviteSchema>

interface InviteMemberModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: InviteFormData) => Promise<void> | void
  workspaceName: string
  inviteLink?: string
}

const roleDescriptions: Record<Exclude<MemberRole, 'owner'>, string> = {
  admin: 'Can manage members and workspace settings',
  member: 'Can create and edit documents',
  viewer: 'Can view documents only',
}

export default function InviteMemberModal({
  isOpen,
  onClose,
  onSubmit,
  workspaceName,
  inviteLink,
}: InviteMemberModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: '', role: 'member' },
  })

  const handleFormSubmit = async (data: InviteFormData) => {
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

  const handleCopyLink = async () => {
    if (!inviteLink) return
    await navigator.clipboard.writeText(inviteLink)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
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
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <UserPlus className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Invite Member</h2>
              <p className="text-xs text-gray-400">{workspaceName}</p>
            </div>
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
          {/* Email */}
          <div>
            <label htmlFor="invite-email" className="block text-sm font-medium text-foreground mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="invite-email"
                type="email"
                placeholder="colleague@company.com"
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-lg border text-sm bg-white dark:bg-gray-800 text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                  errors.email
                    ? 'border-red-300 dark:border-red-700 focus:ring-red-500/20'
                    : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500/20 focus:border-blue-500'
                }`}
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label htmlFor="invite-role" className="block text-sm font-medium text-foreground mb-1.5">
              Role
            </label>
            <div className="relative">
              <select
                id="invite-role"
                className={`w-full appearance-none px-3.5 py-2.5 rounded-lg border text-sm bg-white dark:bg-gray-800 text-foreground focus:outline-none focus:ring-2 transition-colors ${
                  errors.role
                    ? 'border-red-300 dark:border-red-700 focus:ring-red-500/20'
                    : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500/20 focus:border-blue-500'
                }`}
                {...register('role')}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            {errors.role && (
              <p className="mt-1.5 text-xs text-red-500">{errors.role.message}</p>
            )}

            {/* Role descriptions */}
            <div className="mt-3 space-y-2">
              {(Object.entries(roleDescriptions) as [Exclude<MemberRole, 'owner'>, string][]).map(
                ([role, desc]) => (
                  <div key={role} className="flex items-start gap-2 text-xs">
                    <span className="font-medium text-gray-600 dark:text-gray-400 capitalize min-w-[52px]">
                      {role}
                    </span>
                    <span className="text-gray-400 dark:text-gray-500">{desc}</span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Invite Link */}
          {inviteLink && (
            <div className="pt-2">
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Or share invite link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteLink}
                  className="flex-1 px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm bg-gray-50 dark:bg-gray-800 text-gray-500 truncate"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
                >
                  {linkCopied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-300">Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

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
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Sending...' : 'Send Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
