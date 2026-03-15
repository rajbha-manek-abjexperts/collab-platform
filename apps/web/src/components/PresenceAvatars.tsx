'use client'

import { useState, useCallback } from 'react'
import { Users, Eye, MousePointer2, UserCheck, UserX } from 'lucide-react'
import type { PresenceUser } from '@/hooks/usePresence'

// ─── Types ────────────────────────────────────────────────────────

interface PresenceAvatarsProps {
  users: PresenceUser[]
  currentUserId?: string
  maxVisible?: number
  typingUsers?: { userId: string; userName?: string }[]
  viewingUsers?: Map<string, { entityId: string; entityType: string }>
  followingUserId?: string | null
  followers?: string[]
  onFollowUser?: (userId: string) => void
  onUnfollowUser?: () => void
}

// ─── Helpers ──────────────────────────────────────────────────────

const statusColors: Record<PresenceUser['status'], string> = {
  online: 'bg-green-500',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
}

const statusLabels: Record<PresenceUser['status'], string> = {
  online: 'Online',
  away: 'Away',
  busy: 'Busy',
}

const avatarColors = [
  'bg-blue-600',
  'bg-purple-600',
  'bg-pink-600',
  'bg-indigo-600',
  'bg-teal-600',
  'bg-orange-600',
  'bg-cyan-600',
  'bg-emerald-600',
]

function getAvatarColor(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash + userId.charCodeAt(i)) | 0
  }
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

function getInitials(user: PresenceUser): string {
  if (user.name) {
    return user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  if (user.email) {
    return user.email[0].toUpperCase()
  }
  return '?'
}

function getDisplayName(user: PresenceUser): string {
  return user.name || user.email || 'Unknown'
}

// ─── Sub-components ───────────────────────────────────────────────

function UserTooltip({
  user,
  isTyping,
  viewingInfo,
  isFollowing,
  isFollowedByMe,
  onFollow,
  onUnfollow,
}: {
  user: PresenceUser
  isTyping: boolean
  viewingInfo?: { entityId: string; entityType: string }
  isFollowing: boolean
  isFollowedByMe: boolean
  onFollow?: () => void
  onUnfollow?: () => void
}) {
  return (
    <div className="absolute bottom-full left-1/2 z-50 mb-3 hidden -translate-x-1/2 group-hover:block">
      <div className="rounded-lg bg-gray-900 px-3 py-2 shadow-lg dark:bg-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">{getDisplayName(user)}</span>
          <span className={`inline-block h-2 w-2 rounded-full ${statusColors[user.status]}`} />
        </div>

        <div className="mt-1 text-xs text-gray-400">
          {statusLabels[user.status]}
        </div>

        {isTyping && (
          <div className="mt-1 flex items-center gap-1 text-xs text-blue-400">
            <span className="inline-flex gap-0.5">
              <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
              <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
              <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
            </span>
            typing
          </div>
        )}

        {viewingInfo && (
          <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
            <Eye size={10} />
            Viewing {viewingInfo.entityType}
          </div>
        )}

        {isFollowing && (
          <div className="mt-1 text-xs text-purple-400">
            Following you
          </div>
        )}

        {(onFollow || onUnfollow) && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              isFollowedByMe ? onUnfollow?.() : onFollow?.()
            }}
            className="mt-2 flex w-full items-center justify-center gap-1 rounded bg-gray-800 px-2 py-1 text-xs text-gray-300 transition-colors hover:bg-gray-700 hover:text-white dark:bg-gray-600 dark:hover:bg-gray-500"
          >
            {isFollowedByMe ? (
              <>
                <UserX size={10} />
                Unfollow
              </>
            ) : (
              <>
                <UserCheck size={10} />
                Follow
              </>
            )}
          </button>
        )}

        <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
      </div>
    </div>
  )
}

function TypingIndicator({ typingUsers }: { typingUsers: { userId: string; userName?: string }[] }) {
  if (typingUsers.length === 0) return null

  const names = typingUsers
    .map((u) => u.userName || 'Someone')
    .slice(0, 3)

  let label: string
  if (names.length === 1) {
    label = `${names[0]} is typing`
  } else if (names.length === 2) {
    label = `${names[0]} and ${names[1]} are typing`
  } else {
    label = `${names[0]} and ${names.length - 1} others are typing`
  }

  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
      <span className="inline-flex gap-0.5">
        <span className="h-1 w-1 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0ms' }} />
        <span className="h-1 w-1 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '150ms' }} />
        <span className="h-1 w-1 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '300ms' }} />
      </span>
      {label}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────

export default function PresenceAvatars({
  users,
  currentUserId,
  maxVisible = 5,
  typingUsers = [],
  viewingUsers,
  followingUserId,
  followers = [],
  onFollowUser,
  onUnfollowUser,
}: PresenceAvatarsProps) {
  const [expandedView, setExpandedView] = useState(false)

  const otherUsers = users.filter((u) => u.user_id !== currentUserId)
  const visible = otherUsers.slice(0, maxVisible)
  const overflow = otherUsers.length - maxVisible

  const handleFollowClick = useCallback(
    (userId: string) => {
      if (followingUserId === userId) {
        onUnfollowUser?.()
      } else {
        onFollowUser?.(userId)
      }
    },
    [followingUserId, onFollowUser, onUnfollowUser],
  )

  if (otherUsers.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Users size={16} />
        <span>No one else online</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        {/* Avatar stack */}
        <div className="flex -space-x-2">
          {visible.map((user) => {
            const isTyping = typingUsers.some((t) => t.userId === user.user_id)
            const viewing = viewingUsers?.get(user.user_id)
            const isFollowingMe = followers.includes(user.user_id)
            const isFollowedByMe = followingUserId === user.user_id

            return (
              <div
                key={user.user_id}
                className="relative group cursor-pointer"
                onClick={() => handleFollowClick(user.user_id)}
              >
                {/* Avatar */}
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={getDisplayName(user)}
                    className={`h-8 w-8 rounded-full border-2 object-cover transition-all ${
                      isFollowedByMe
                        ? 'border-purple-500 ring-2 ring-purple-500/30'
                        : 'border-white dark:border-gray-800'
                    }`}
                  />
                ) : (
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium text-white transition-all ${getAvatarColor(user.user_id)} ${
                      isFollowedByMe
                        ? 'border-purple-500 ring-2 ring-purple-500/30'
                        : 'border-white dark:border-gray-800'
                    }`}
                  >
                    {getInitials(user)}
                  </div>
                )}

                {/* Status dot */}
                <span
                  className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-gray-800 ${statusColors[user.status]}`}
                />

                {/* Typing ring animation */}
                {isTyping && (
                  <span className="absolute inset-0 animate-ping rounded-full border-2 border-blue-400 opacity-40" />
                )}

                {/* Viewing indicator */}
                {viewing && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-white">
                    <Eye size={8} />
                  </span>
                )}

                {/* Following indicator */}
                {isFollowedByMe && (
                  <span className="absolute -top-1 -left-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-500 text-white">
                    <MousePointer2 size={8} />
                  </span>
                )}

                {/* Tooltip */}
                <UserTooltip
                  user={user}
                  isTyping={isTyping}
                  viewingInfo={viewing}
                  isFollowing={isFollowingMe}
                  isFollowedByMe={isFollowedByMe}
                  onFollow={onFollowUser ? () => onFollowUser(user.user_id) : undefined}
                  onUnfollow={onUnfollowUser}
                />
              </div>
            )
          })}

          {/* Overflow indicator */}
          {overflow > 0 && (
            <button
              onClick={() => setExpandedView(!expandedView)}
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-300 dark:border-gray-800 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              +{overflow}
            </button>
          )}
        </div>

        {/* Online count */}
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {otherUsers.length} online
        </span>
      </div>

      {/* Typing indicator */}
      <TypingIndicator typingUsers={typingUsers} />

      {/* Expanded user list */}
      {expandedView && overflow > 0 && (
        <div className="mt-1 rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="max-h-48 space-y-1 overflow-y-auto">
            {otherUsers.map((user) => {
              const isTyping = typingUsers.some((t) => t.userId === user.user_id)
              const viewing = viewingUsers?.get(user.user_id)
              const isFollowedByMe = followingUserId === user.user_id

              return (
                <div
                  key={user.user_id}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {/* Mini avatar */}
                  <div className="relative flex-shrink-0">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={getDisplayName(user)}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium text-white ${getAvatarColor(user.user_id)}`}
                      >
                        {getInitials(user)}
                      </div>
                    )}
                    <span
                      className={`absolute bottom-0 right-0 h-1.5 w-1.5 rounded-full border border-white dark:border-gray-800 ${statusColors[user.status]}`}
                    />
                  </div>

                  {/* Name and status */}
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm text-gray-900 dark:text-gray-100">
                      {getDisplayName(user)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      {isTyping && <span className="text-blue-400">typing...</span>}
                      {viewing && (
                        <span className="flex items-center gap-0.5">
                          <Eye size={8} />
                          {viewing.entityType}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Follow button */}
                  {onFollowUser && (
                    <button
                      onClick={() => handleFollowClick(user.user_id)}
                      className={`flex-shrink-0 rounded px-2 py-0.5 text-xs transition-colors ${
                        isFollowedByMe
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                      }`}
                    >
                      {isFollowedByMe ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
