'use client'

import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  label?: string
  fullScreen?: boolean
  variant?: 'spinner' | 'dots' | 'pulse'
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
}

const dotSizeMap = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
  xl: 'w-3 h-3',
}

const textSizeMap = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
}

function SpinnerVariant({ size }: { size: 'sm' | 'md' | 'lg' | 'xl' }) {
  return (
    <Loader2 className={`${sizeMap[size]} text-blue-600 dark:text-blue-400 animate-spin`} />
  )
}

function DotsVariant({ size }: { size: 'sm' | 'md' | 'lg' | 'xl' }) {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${dotSizeMap[size]} rounded-full bg-blue-600 dark:bg-blue-400`}
          style={{
            animation: 'bounce 1.4s infinite ease-in-out both',
            animationDelay: `${i * 0.16}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

function PulseVariant({ size }: { size: 'sm' | 'md' | 'lg' | 'xl' }) {
  return (
    <div className="relative flex items-center justify-center">
      <div
        className={`${sizeMap[size]} rounded-full bg-blue-600/20 dark:bg-blue-400/20 animate-ping absolute`}
      />
      <div
        className={`${dotSizeMap[size]} rounded-full bg-blue-600 dark:bg-blue-400`}
      />
    </div>
  )
}

export function LoadingSpinner({
  size = 'md',
  label,
  fullScreen = false,
  variant = 'spinner',
}: LoadingSpinnerProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3" role="status">
      {variant === 'spinner' && <SpinnerVariant size={size} />}
      {variant === 'dots' && <DotsVariant size={size} />}
      {variant === 'pulse' && <PulseVariant size={size} />}
      {label && (
        <p className={`${textSizeMap[size]} text-muted-foreground font-medium`}>
          {label}
        </p>
      )}
      <span className="sr-only">{label || 'Loading...'}</span>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[200px] p-6">
      {content}
    </div>
  )
}

export default LoadingSpinner
