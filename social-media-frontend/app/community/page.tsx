'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Users, TrendingUp, Plus, X } from 'lucide-react'
import { communitiesApi } from '@/lib/api'
import { useCommunitiesStore, useAuthStore, useToastStore } from '@/lib/store'
import type { Community } from '@/lib/types'
import { CardSkeleton } from '@/components/LoadingSkeleton'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

// ─── Create Community Modal ───────────────────────────────────────────────────

function CreateCommunityModal({ onClose, onCreated }: { onClose: () => void; onCreated: (c: Community) => void }) {
  const { addToast } = useToastStore()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setIsSubmitting(true)
    try {
      const community = await communitiesApi.create({ name, description })
      onCreated(community)
      addToast({ type: 'success', title: 'Community created!', message: `r/${community.name} is live.` })
      onClose()
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create community.'
      addToast({ type: 'error', title: 'Error', message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-slate-900 border border-white/20 rounded-2xl p-8 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Create Community</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Community Name</label>
            <Input
              placeholder="e.g. Web Developers"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Description</label>
            <textarea
              placeholder="What is this community about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-gray-500 outline-none focus:border-purple-500/50 resize-none text-sm"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" onClick={onClose} variant="outline" className="flex-1 border-white/20 hover:bg-white/5 text-white">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold disabled:opacity-50"
            >
              {isSubmitting ? 'Creating…' : 'Create'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// ─── Community Card ───────────────────────────────────────────────────────────

function CommunityCard({ community }: { community: Community }) {
  return (
    <motion.div
      variants={itemVariants}
      className="glass-dark rounded-2xl p-6 hover:border-purple-500/30 border border-white/5 flex flex-col h-full group transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-2xl">
          {community.name[0].toUpperCase()}
        </div>
      </div>

      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
        {community.name}
      </h3>
      <p className="text-sm text-gray-400 mb-4 flex-1 line-clamp-2">
        {community.description || 'No description provided.'}
      </p>

      <div className="flex items-center gap-2 mb-4 text-gray-400 text-sm">
        <Users className="w-4 h-4 text-purple-400" />
        {community.members.length} member{community.members.length !== 1 ? 's' : ''}
      </div>

      <p className="text-xs text-gray-600">
        Created by <span className="text-gray-400">{community.creator?.username ?? 'Unknown'}</span>
      </p>
    </motion.div>
  )
}

// ─── Community Page ───────────────────────────────────────────────────────────

export default function CommunityPage() {
  const { isAuthenticated } = useAuthStore()
  const { communities, setCommunities, addCommunity, isLoading, setLoading } = useCommunitiesStore()
  const { addToast } = useToastStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const fetchCommunities = useCallback(async () => {
    setLoading(true)
    try {
      const data = await communitiesApi.getAll()
      setCommunities(data)
    } catch {
      addToast({ type: 'error', title: 'Failed to load communities' })
    } finally {
      setLoading(false)
    }
  }, [setCommunities, setLoading, addToast])

  useEffect(() => {
    fetchCommunities()
  }, [fetchCommunities])

  const filtered = communities.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Create Modal */}
      {showCreateModal && (
        <CreateCommunityModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(c) => addCommunity(c)}
        />
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-xl"
      >
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white">Discover Communities</h1>
              <p className="text-gray-400 mt-1">Find and join communities that match your interests</p>
            </div>
            {isAuthenticated && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Community
                </Button>
              </motion.div>
            )}
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search communities…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-white/5 border-white/10 hover:bg-white/10 text-white placeholder:text-gray-500"
            />
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <>
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 mb-8"
            >
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <span className="text-gray-400 text-sm">
                {filtered.length} communit{filtered.length !== 1 ? 'ies' : 'y'} found
              </span>
            </motion.div>

            {filtered.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">
                  {searchQuery ? `No communities matching "${searchQuery}"` : 'No communities yet.'}
                </p>
                {isAuthenticated && !searchQuery && (
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  >
                    Create the first one!
                  </Button>
                )}
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filtered.map((community) => (
                  <CommunityCard key={community._id} community={community} />
                ))}
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
