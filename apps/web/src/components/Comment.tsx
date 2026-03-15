'use client'

export function Comment({ comment }: { comment: any }) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <p className="text-sm text-gray-700">{comment.content}</p>
    </div>
  )
}
