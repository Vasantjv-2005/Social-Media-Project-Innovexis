'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { useToastStore } from '@/lib/store'

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const { addToast } = useToastStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const user = await authApi.login({ email, password })
      setAuth(user)
      addToast({ type: 'success', title: 'Welcome back!', message: `Logged in as ${user.username}` })
      router.push('/home')
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Login failed. Please try again.'
      setError(message)
      addToast({ type: 'error', title: 'Login failed', message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 mb-6">
            <span className="text-2xl font-bold text-white">S</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-300">Sign in to your SocialHub account</p>
        </div>

        {/* Form Card */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Banner */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-purple-400 pointer-events-none" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-purple-400 pointer-events-none" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-purple-400 hover:text-cyan-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold h-11 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-gray-400 bg-transparent">Or continue with</span>
            </div>
          </div>

          {/* Social Login (UI only) */}
          <div className="grid grid-cols-2 gap-4">
            <Button type="button" variant="outline" className="border-white/20 hover:bg-white/5 text-white hover:text-white">
              Google
            </Button>
            <Button type="button" variant="outline" className="border-white/20 hover:bg-white/5 text-white hover:text-white">
              GitHub
            </Button>
          </div>
        </div>

        {/* Register Link */}
        <p className="text-center mt-6 text-gray-300">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-purple-400 hover:text-cyan-400 font-semibold transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
