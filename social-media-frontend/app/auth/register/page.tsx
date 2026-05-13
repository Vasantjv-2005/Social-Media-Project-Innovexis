'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Check } from 'lucide-react'
import { authApi } from '@/lib/api'
import { useAuthStore, useToastStore } from '@/lib/store'

export default function RegisterPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const { addToast } = useToastStore()

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (name === 'password') {
      const strength = value.length >= 8 ? 2 : value.length >= 5 ? 1 : 0
      setPasswordStrength(strength)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)
    try {
      const user = await authApi.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      })
      setAuth(user)
      addToast({ type: 'success', title: 'Account created!', message: `Welcome to SocialHub, ${user.username}!` })
      router.push('/home')
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Registration failed. Please try again.'
      setError(message)
      addToast({ type: 'error', title: 'Registration failed', message })
    } finally {
      setIsLoading(false)
    }
  }

  const passwordsMatch = formData.password && formData.password === formData.confirmPassword
  const canSubmit = agreeToTerms && !!passwordsMatch && !!formData.username && !!formData.email && !isLoading

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 mb-6">
            <span className="text-2xl font-bold text-white">S</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-300">Join SocialHub and connect with the world</p>
        </div>

        {/* Form Card */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Banner */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-purple-400 pointer-events-none" />
                <Input
                  type="text"
                  name="username"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={handleChange}
                  className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-purple-400 pointer-events-none" />
                <Input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
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
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
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

              {/* Password Strength */}
              {formData.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded transition-colors ${
                          i < passwordStrength ? 'bg-green-500' : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    {passwordStrength === 0
                      ? 'Weak password'
                      : passwordStrength === 1
                      ? 'Medium strength'
                      : 'Strong password'}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-purple-400 pointer-events-none" />
                <Input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10 pr-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-3 text-purple-400 hover:text-cyan-400 transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {passwordsMatch && (
                <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Passwords match
                </p>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2 text-sm text-gray-300 hover:text-white cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="rounded mt-0.5 w-4 h-4"
                required
              />
              <span>
                I agree to the{' '}
                <Link href="#" className="text-purple-400 hover:text-cyan-400 transition-colors">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="#" className="text-purple-400 hover:text-cyan-400 transition-colors">
                  Privacy Policy
                </Link>
              </span>
            </label>

            {/* Submit */}
            <Button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold h-11 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : (
                <>
                  Sign Up
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
              <span className="px-2 text-gray-400 bg-transparent">Or sign up with</span>
            </div>
          </div>

          {/* Social Register (UI only) */}
          <div className="grid grid-cols-2 gap-4">
            <Button type="button" variant="outline" className="border-white/20 hover:bg-white/5 text-white hover:text-white">
              Google
            </Button>
            <Button type="button" variant="outline" className="border-white/20 hover:bg-white/5 text-white hover:text-white">
              GitHub
            </Button>
          </div>
        </div>

        {/* Sign In Link */}
        <p className="text-center mt-6 text-gray-300">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-purple-400 hover:text-cyan-400 font-semibold transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
