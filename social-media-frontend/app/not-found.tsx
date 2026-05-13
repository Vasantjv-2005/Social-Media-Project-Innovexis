'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 opacity-20 -z-10">
        <motion.div
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.3) 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 8, ease: "linear", repeat: Infinity }}
          className="absolute inset-0"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-md"
      >
        {/* Animated 404 */}
        <motion.div
          animate={{ rotate: [0, -5, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-9xl font-bold text-glow">404</h1>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-white mb-4">Page Not Found</h2>
          <p className="text-gray-300 text-lg">
            Oops! The page you&apos;re looking for seems to have disappeared into the digital void.
          </p>
        </motion.div>

        {/* Floating elements */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="mb-12"
        >
          <div className="text-6xl">🚀</div>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hover-glow-purple font-semibold">
              <Home className="mr-2 w-4 h-4" />
              Go Home
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline" className="border-purple-500/50 hover:bg-purple-500/10 hover-glow-purple font-semibold">
              Sign In
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </motion.div>

        {/* Decorative elements */}
        <motion.div
          className="absolute inset-0 -z-10 overflow-hidden"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute inset-0 border border-purple-500/20 rounded-full" />
        </motion.div>
      </motion.div>
    </div>
  )
}
