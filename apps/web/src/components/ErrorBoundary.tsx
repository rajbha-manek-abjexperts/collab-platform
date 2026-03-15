'use client'

import React, { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp, Copy } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  showDetails: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo })
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, showDetails: false })
  }

  handleCopyError = () => {
    const { error, errorInfo } = this.state
    const text = `Error: ${error?.message}\n\nStack: ${error?.stack}\n\nComponent Stack: ${errorInfo?.componentStack}`
    navigator.clipboard.writeText(text)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { error, showDetails } = this.state

      return (
        <div className="flex items-center justify-center min-h-[400px] p-6">
          <div className="w-full max-w-lg bg-background border border-red-200 dark:border-red-900/50 rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-red-50 dark:bg-red-950/30 px-6 py-4 border-b border-red-200 dark:border-red-900/50">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-red-900 dark:text-red-100">
                    Something went wrong
                  </h2>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-0.5">
                    An unexpected error occurred in this section
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <p className="text-sm text-muted-foreground mb-4">
                {error?.message || 'An unknown error occurred. Please try again.'}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={this.handleRetry}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
                <a
                  href="/"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-background border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium rounded-lg transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </a>
              </div>

              {/* Error Details Toggle */}
              <button
                onClick={() => this.setState({ showDetails: !showDetails })}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {showDetails ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
                {showDetails ? 'Hide' : 'Show'} error details
              </button>

              {showDetails && (
                <div className="mt-3 relative">
                  <button
                    onClick={this.handleCopyError}
                    className="absolute top-2 right-2 p-1.5 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
                    title="Copy error details"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <pre className="bg-gray-900 text-gray-100 text-xs p-4 rounded-lg overflow-x-auto max-h-48 scrollbar-thin">
                    {error?.stack || 'No stack trace available'}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
