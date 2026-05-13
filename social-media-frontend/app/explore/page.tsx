'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, TrendingUp, Clock, Heart, Users } from 'lucide-react'
import { postsApi, communitiesApi } from '@/lib/api'
import { useToastStore } from '@/lib/store'
import type { Post, Community } from '@/lib/types'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

const staticTrends = [
  { id: 1, category: 'Technology', title: 'AI Revolution 2025', posts: 523400, trending: 'trending worldwide', icon: '🤖' },
  { id: 2, category: 'Design', title: 'Glassmorphism UI', posts: 287300, trending: 'trending worldwide', icon: '🎨' },
  { id: 3, category: 'Web Development', title: 'Next.js 16 Release', posts: 156900, trending: 'trending in tech', icon: '⚡' },
  { id: 4, category: 'Business', title: 'Startup Funding News', posts: 98400, trending: 'trending in startup', icon: '📈' },
  { id: 5, category: 'Entertainment', title: 'New Movie Releases', posts: 543200, trending: 'trending worldwide', icon: '🎬' },
  { id: 6, category: 'Science', title: 'Space Exploration', posts: 234100, trending: 'trending in science', icon: '🚀' },
]

export default function ExplorePage() {
  const { addToast } = useToastStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'trending' | 'recent'>('trending')
  const [posts, setPosts] = useState<Post[]>([])
  const [communities, setCommunities] = useState<Community[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [postsData, communitiesData] = await Promise.all([
        postsApi.getAll(),
        communitiesApi.getAll(),
      ])
      setPosts(postsData)
      setCommunities(communitiesData)
    } catch {
      addToast({ type: 'error', title: 'Failed to load explore data' })
    } finally {
      setIsLoading(false)
    }
  }, [addToast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  // Filter posts and communities by search query
  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredCommunities = communities.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedPosts =
    activeTab === 'trending'
      ? [...posts].sort((a, b) => b.upvotes - a.upvotes)
      : [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-xl"
      >
        <div className="max-w-4xl mx-auto px-6 py-6">
          <h1 className="text-4xl font-bold text-white mb-6">Explore</h1>
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search posts, people, and communities…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-white/5 border-white/10 hover:bg-white/10 text-white placeholder:text-gray-500 rounded-full h-12"
            />
          </div>
        </div>
      </motion.div>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {searchQuery ? (
          // ── Search Results ──────────────────────────────────────────────────
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
            {/* Posts */}
            {filteredPosts.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4">
                  Posts matching &quot;{searchQuery}&quot;
                </h2>
                <div className="space-y-3">
                  {filteredPosts.map((post) => (
                    <motion.div
                      key={post._id}
                      variants={itemVariants}
                      className="glass-dark rounded-2xl p-5 border border-white/5 hover:border-purple-500/30 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold shrink-0">
                          {post.author?.username?.[0]?.toUpperCase() ?? 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-white text-sm">{post.author?.username}</span>
                            <span className="text-gray-500 text-xs">·</span>
                            <span className="text-gray-500 text-xs">{timeAgo(post.createdAt)}</span>
                            {post.community?.name && (
                              <span className="text-purple-400 text-xs">r/{post.community.name}</span>
                            )}
                          </div>
                          <h3 className="font-semibold text-white">{post.title}</h3>
                          {post.content && (
                            <p className="text-gray-400 text-sm mt-1 line-clamp-2">{post.content}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-gray-500 text-xs">
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" /> {post.upvotes}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Communities */}
            {filteredCommunities.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4">
                  Communities matching &quot;{searchQuery}&quot;
                </h2>
                <div className="space-y-3">
                  {filteredCommunities.map((community) => (
                    <motion.div
                      key={community._id}
                      variants={itemVariants}
                      className="glass-dark rounded-2xl p-5 flex items-center justify-between border border-white/5 hover:border-purple-500/30 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
                          {community.name[0].toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-white">{community.name}</h3>
                          <p className="text-gray-400 text-sm">{community.description || 'No description'}</p>
                          <p className="text-gray-500 text-xs mt-1">
                            <Users className="w-3 h-3 inline mr-1" />
                            {community.members.length} members
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {filteredPosts.length === 0 && filteredCommunities.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg">No results for &quot;{searchQuery}&quot;</p>
              </div>
            )}
          </motion.div>
        ) : (
          // ── Trending / Recent ───────────────────────────────────────────────
          <>
            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-8 border-b border-white/10 mb-8"
            >
              {[
                { id: 'trending', label: 'Trending', icon: TrendingUp },
                { id: 'recent', label: 'Recent', icon: Clock },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'trending' | 'recent')}
                  className={`py-4 px-2 font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-white'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </motion.div>

            {/* Real posts from backend */}
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="glass-dark rounded-2xl p-5 animate-pulse">
                    <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-white/10 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : sortedPosts.length > 0 ? (
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                {sortedPosts.map((post) => (
                  <motion.div
                    key={post._id}
                    variants={itemVariants}
                    className="glass-dark rounded-2xl p-5 border border-white/5 hover:border-purple-500/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold shrink-0">
                        {post.author?.username?.[0]?.toUpperCase() ?? 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-white text-sm">{post.author?.username}</span>
                          <span className="text-gray-500 text-xs">·</span>
                          <span className="text-gray-500 text-xs">{timeAgo(post.createdAt)}</span>
                          {post.community?.name && (
                            <span className="text-purple-400 text-xs">r/{post.community.name}</span>
                          )}
                        </div>
                        <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                          {post.title}
                        </h3>
                        {post.content && (
                          <p className="text-gray-400 text-sm mt-1 line-clamp-2">{post.content}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-gray-500 text-xs">
                          <span className="flex items-center gap-1 hover:text-green-400 transition-colors">
                            <Heart className="w-3 h-3" /> {post.upvotes}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              // Fallback to static trends when no posts
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                {staticTrends.map((trend) => (
                  <motion.div
                    key={trend.id}
                    variants={itemVariants}
                    className="glass-dark rounded-2xl p-6 border border-white/5 hover:border-purple-500/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{trend.icon}</div>
                        <div>
                          <p className="text-sm text-gray-400">{trend.category} · {trend.trending}</p>
                          <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                            {trend.title}
                          </h3>
                          <p className="text-sm text-gray-400 mt-1">{trend.posts.toLocaleString()} posts</p>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-pink-400 transition-colors">
                        <Heart className="w-6 h-6" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
