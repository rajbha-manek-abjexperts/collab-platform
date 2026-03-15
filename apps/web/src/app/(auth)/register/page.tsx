import type { Metadata } from 'next'
import AuthForm from '@/components/AuthForm'

export const metadata: Metadata = {
  title: 'Create Account - Collab Platform',
}

export default function RegisterPage() {
  return <AuthForm mode="register" />
}
