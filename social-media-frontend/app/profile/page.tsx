'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowLeft, MapPin, Calendar, Heart, MessageCircle, Share2, LogOut } from 'lucide-react'
import { postsApi } from '@/lib/api'
import { useAuthStore, useToastStore } from '@/lib/store'
import type { Post } from '@/lib/types'
import { ProfileHeaderSkeleton, FeedSkeleton } from '@/components/LoadingSkeleton'
import Link from 'next/link'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { addToast } = useToastStore()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [likedPosts, setLikedPosts] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('Posts')

  const fetchUserPosts = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const allPosts = await postsApi.getAll()
      // Filter posts by current user
      const userPosts = allPosts.filter((p) => p.author?._id === user._id)
      setPosts(userPosts)
    } catch {
      addToast({ type: 'error', title: 'Failed to load posts' })
    } finally {
      setIsLoading(false)
    }
  }, [user, addToast])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    fetchUserPosts()
  }, [isAuthenticated, router, fetchUserPosts])

  const handleLogout = () => {
    logout()
    addToast({ type: 'info', title: 'Logged out', message: 'See you next time!' })
    router.push('/')
  }

  const toggleLike = (postId: string) => {
    setLikedPosts((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    )
  }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  if (!isAuthenticated || !user) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Header Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-xl"
      >
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/home">
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-bold text-white">{user.username}</h1>
            <p className="text-sm text-gray-400">{posts.length} post{posts.length !== 1 ? 's' : ''}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-red-500/30 hover:bg-red-500/10 text-red-400 text-xs h-8 px-3 flex items-center gap-1"
          >
            <LogOut className="w-3 h-3" />
            Logout
          </Button>
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto">
        {isLoading ? (
          <>
            <ProfileHeaderSkeleton />
            <FeedSkeleton />
          </>
        ) : (
          <>
            {/* Banner */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-48 bg-gradient-to-r from-purple-600/20 to-blue-600/20 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/50" />
            </motion.div>

            {/* Profile Section */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="px-6 pb-6"
            >
              {/* Avatar */}
              <motion.div
                variants={itemVariants}
                className="flex justify-between items-start -mt-16 relative z-10 mb-6"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-5xl font-bold text-white border-4 border-background shadow-2xl"
                >
                  {user.username[0].toUpperCase()}
                </motion.div>
                <Button
                  onClick={handleLogout}
                  className="mt-4 border border-red-500/50 bg-transparent hover:bg-red-500/10 text-red-400 font-semibold"
                >
                  Sign Out
                </Button>
              </motion.div>

              {/* Info */}
              <motion.div variants={itemVariants} className="mb-6">
                <h1 className="text-3xl font-bold text-white mb-1">{user.username}</h1>
                <p className="text-gray-400 mb-3">{user.email}</p>
                {user.bio && <p className="text-white mb-4">{user.bio}</p>}

                <div className="flex flex-wrap gap-4 text-gray-400 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                  {user.role === 'admin' && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-400" />
                      <span className="text-purple-400 font-semibold">Admin</span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Tabs */}
              <motion.div variants={itemVariants} className="border-b border-white/10 mb-6 flex gap-8">
                {['Posts', 'Replies', 'Likes'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-2 font-semibold border-b-2 transition-colors ${
                      activeTab === tab
                        ? 'border-purple-500 text-white'
                        : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </motion.div>
            </motion.div>

            {/* Posts */}
            {activeTab === 'Posts' && (
              <motion.div variants={containerVariants} initial="hidden" animate="visible">
                {posts.length === 0 ? (
                  <div className="text-center py-16 text-gray-500">
                    <p className="text-lg">No posts yet.</p>
                    <Link href="/home">
                      <Button className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                        Create your first post
                      </Button>
                    </Link>
                  </div>
                ) : (
                  posts.map((post) => (
                    <motion.div
                      key={post._id}
                      variants={itemVariants}
                      className="border-b border-white/10 p-6 hover:bg-white/5 transition-all duration-300 group cursor-pointer"
                    >
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold shrink-0">
                          {user.username[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-white">{user.username}</span>
                            <span className="text-gray-500 text-sm">·</span>
                            <span className="text-gray-500 text-sm">{timeAgo(post.createdAt)}</span>
                            {post.community?.name && (
                              <>
                                <span className="text-gray-600">·</span>
                                <span className="text-purple-400 text-sm">r/{post.community.name}</span>
                              </>
                            )}
                          </div>
                          <h3 className="font-semibold text-white mb-1">{post.title}</h3>
                          {post.content && (
                            <p className="text-gray-300 text-sm mb-3 leading-relaxed">{post.content}</p>
                          )}
                          <div className="flex items-center gap-1 text-gray-500 text-sm">
                            <button
                              onClick={() => toggleLike(post._id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-red-500/10 transition-all ${
                                likedPosts.includes(post._id) ? 'text-red-500' : 'hover:text-red-500'
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${likedPosts.includes(post._id) ? 'fill-current' : ''}`} />
                              <span className="text-xs">{post.upvotes + (likedPosts.includes(post._id) ? 1 : 0)}</span>
                            </button>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-blue-500/10 hover:text-blue-400 transition-all">
                              <MessageCircle className="w-4 h-4" />
                            </button>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-purple-500/10 hover:text-purple-400 transition-all">
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab !== 'Posts' && (
              <div className="text-center py-16 text-gray-500">
                <p>No {activeTab.toLowerCase()} yet.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
