'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Bookmark, Search } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'

export default function BookmarksPage() {
  return (
    <div className="min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-xl"
      >
        <div className="max-w-3xl mx-auto px-6 py-6 flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Link href="/home">
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                <ArrowLeft className="w-6 h-6" />
              </button>
            </Link>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Bookmark className="w-8 h-8 text-purple-400" />
              Bookmarks
            </h1>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search your bookmarks…"
              className="pl-12 bg-white/5 border-white/10 hover:bg-white/10 text-white placeholder:text-gray-500 rounded-full h-12"
            />
          </div>
        </div>
      </motion.div>

      <main className="max-w-3xl mx-auto px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center"
        >
          <div className="w-24 h-24 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
            <Bookmark className="w-10 h-10 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">No bookmarks yet</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            Save posts and articles you want to read later. They will appear here for easy access.
          </p>
          <Link href="/explore">
            <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-full transition-all">
              Discover Content
            </button>
          </Link>
        </motion.div>
      </main>
    </div>
  )
}
