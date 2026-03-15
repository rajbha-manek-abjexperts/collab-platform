import { PenTool } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="flex items-center gap-2 mb-8">
        <PenTool className="h-8 w-8 text-blue-600" />
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          Collab Platform
        </span>
      </div>
      {children}
    </div>
  )
}
