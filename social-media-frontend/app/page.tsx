'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Users, MessageSquare, Heart } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
        <motion.div
          className="absolute top-1/2 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"
          animate={{ y: [0, 50, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"
          animate={{ y: [0, -50, 0] }}
          transition={{ duration: 8, repeat: Infinity, delay: 1 }}
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center font-bold">
              S
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              SocialHub
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <button className="px-6 py-2 rounded-lg border border-purple-500/50 hover:border-purple-400 text-purple-300 transition-all hover:shadow-lg"
                style={{ boxShadow: '0 0 0 rgba(0,0,0,0)' }}
              >
                Sign In
              </button>
            </Link>
            <Link href="/auth/register">
              <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold transition-all shadow-lg"
              >
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Connect. Share. Create.
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Experience the next generation of social networking with stunning design, smooth animations, and seamless interactions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/auth/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg flex items-center gap-2 justify-center shadow-lg hover:shadow-2xl transition-all"
              >
                Start Exploring <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link href="/auth/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="px-8 py-4 rounded-xl border-2 border-blue-500/50 text-blue-300 font-bold text-lg flex items-center gap-2 justify-center hover:border-blue-400 transition-all"
              >
                Sign In <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </div>

          {/* Preview Cards */}
          <div className="relative rounded-2xl overflow-hidden border border-purple-500/20 backdrop-blur-xl bg-gradient-to-br from-purple-900/10 to-blue-900/10 p-8">
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, delay: i * 0.2, repeat: Infinity }}
                  className="aspect-square rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center"
                >
                  <span className="text-purple-300 font-semibold">Feature {i}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Why Choose SocialHub?
            </span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Users, title: 'Connect', desc: 'Build meaningful connections' },
              { icon: MessageSquare, title: 'Communicate', desc: 'Real-time messaging' },
              { icon: Heart, title: 'Engage', desc: 'Like, comment, and share' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="p-6 rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-900/10 to-blue-900/10 backdrop-blur-xl transition-all hover:border-purple-400"
              >
                <feature.icon className="w-12 h-12 text-purple-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 border-t border-purple-500/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to join the community?
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Create your account and start connecting today.
          </p>
          <Link href="/auth/register">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg hover:shadow-2xl transition-all"
            >
              Create Account Now
            </motion.button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 py-8 px-6 text-center text-gray-400">
        <p>&copy; 2024 SocialHub. Crafted with passion.</p>
      </footer>
    </main>
  )
}
