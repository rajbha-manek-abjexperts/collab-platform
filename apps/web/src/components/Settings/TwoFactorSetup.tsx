'use client'

import { useState, useEffect } from 'react'
import { Shield, Loader2, Check, Copy, RefreshCw, Smartphone } from 'lucide-react'

interface TwoFactorSetupProps {
  isEnabled: boolean
  onToggle: (enabled: boolean, code?: string) => Promise<boolean>
}

export default function TwoFactorSetup({ isEnabled, onToggle }: TwoFactorSetupProps) {
  const [step, setStep] = useState<'setup' | 'verify' | 'done'>('setup')
  const [loading, setLoading] = useState(false)
  const [secret, setSecret] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!isEnabled && step === 'setup') {
      // Generate new 2FA setup
      generateSetup()
    }
  }, [isEnabled, step])

  async function generateSetup() {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:3002/api/auth/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await response.json()
      setSecret(data.secret)
      setQrCode(data.qrCode)
    } catch (err) {
      console.error('Failed to generate 2FA:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify() {
    if (code.length !== 6) {
      setError('Please enter a 6-digit code')
      return
    }

    setLoading(true)
    setError('')

    try {
      const success = await onToggle(true, code)
      if (success) {
        setStep('done')
      } else {
        setError('Invalid code. Please try again.')
      }
    } catch (err) {
      setError('Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDisable() {
    setLoading(true)
    try {
      await onToggle(false)
      setStep('setup')
      setCode('')
    } catch (err) {
      setError('Failed to disable 2FA')
    } finally {
      setLoading(false)
    }
  }

  function copySecret() {
    navigator.clipboard.writeText(secret)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isEnabled) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-green-800">Two-Factor Enabled</h3>
            <p className="text-sm text-green-600">Your account is protected with 2FA</p>
          </div>
          <button
            onClick={handleDisable}
            disabled={loading}
            className="px-4 py-2 text-sm text-red-600 hover:bg-red-100 rounded-lg transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Disable'}
          </button>
        </div>
      </div>
    )
  }

  if (step === 'done') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <Check className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-green-800">2FA Enabled Successfully!</h3>
            <p className="text-sm text-green-600">Save your backup codes in a safe place</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
          <Smartphone className="w-6 h-6 text-blue-600" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">Two-Factor Authentication</h3>
          <p className="text-sm text-gray-500 mb-4">
            Add an extra layer of security to your account by requiring a verification code.
          </p>

          {step === 'setup' && qrCode && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Scan this QR code with your authenticator app:
              </p>
              <div className="flex justify-center mb-4">
                <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-500 mb-1">Or enter this code manually:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 font-mono text-sm">{secret}</code>
                  <button
                    onClick={copySecret}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
                  </button>
                </div>
              </div>

              <button
                onClick={() => setStep('verify')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-colors"
              >
                <Shield className="w-4 h-4" />
                Next: Verify Code
              </button>
            </div>
          )}

          {step === 'verify' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter the 6-digit code from your authenticator app:
              </label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
                maxLength={6}
              />

              {error && (
                <p className="text-sm text-red-500 mb-4">{error}</p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setStep('setup')}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleVerify}
                  disabled={loading || code.length !== 6}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Verify & Enable
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
