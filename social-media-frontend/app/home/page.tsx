'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Heart, MessageCircle, Share2, Search, Home, Compass, Bell,
  Mail, Bookmark, MoreHorizontal, Image as ImageIcon, Flame,
  TrendingUp, Users, Sparkles, LogOut, ChevronDown, X,
} from 'lucide-react'
import { postsApi, commentsApi, communitiesApi, votesApi } from '@/lib/api'
import { useAuthStore, usePostsStore, useCommunitiesStore, useToastStore } from '@/lib/store'
import type { Post, Community } from '@/lib/types'
import { FeedSkeleton } from '@/components/LoadingSkeleton'
import Link from 'next/link'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

// ─── Create Post Modal ────────────────────────────────────────────────────────

function CreatePostForm({
  communities,
  onCreated,
}: {
  communities: Community[]
  onCreated: (post: Post) => void
}) {
  const { user } = useAuthStore()
  const { addToast } = useToastStore()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [communityId, setCommunityId] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Open the hidden file input when the image icon is clicked
  const handleImageIconClick = () => {
    fileInputRef.current?.click()
  }

  // When user picks a file, create a local preview URL
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate type client-side
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      addToast({ type: 'error', title: 'Invalid file type', message: 'Only JPG, PNG, and WebP images are allowed.' })
      return
    }

    // Validate size (max 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      addToast({ type: 'error', title: 'File too large', message: 'Image must be under 5 MB.' })
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImageFile(null)
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImagePreview(null)
    // Reset the file input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async () => {
    if (!title.trim() || !communityId) {
      addToast({ type: 'warning', title: 'Missing fields', message: 'Title and community are required.' })
      return
    }
    setIsSubmitting(true)
    try {
      const post = await postsApi.create({
        title,
        content,
        community: communityId,
        imageFile: imageFile ?? undefined,
      })
      onCreated(post)
      // Reset form
      setTitle('')
      setContent('')
      setCommunityId('')
      removeImage()
      addToast({ type: 'success', title: 'Post created!' })
    } catch {
      addToast({ type: 'error', title: 'Failed to create post', message: 'Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="border-b border-white/10 p-6"
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex gap-4">
        {/* User avatar */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-lg">
          {user?.username?.[0]?.toUpperCase() ?? 'U'}
        </div>

        <div className="flex-1 space-y-3">
          {/* Title */}
          <Input
            placeholder="Post title (required)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 text-base"
          />

          {/* Content */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full bg-transparent text-white placeholder:text-gray-600 outline-none resize-none text-base"
            rows={2}
          />

          {/* Image preview */}
          {imagePreview && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative rounded-xl overflow-hidden border border-white/10 group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-h-72 object-cover"
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white rounded-full p-1.5 transition-all opacity-0 group-hover:opacity-100"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                {imageFile?.name}
              </div>
            </motion.div>
          )}

          {/* Community selector */}
          <div className="relative">
            <select
              value={communityId}
              onChange={(e) => setCommunityId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm appearance-none cursor-pointer focus:outline-none focus:border-purple-500/50"
            >
              <option value="" className="bg-slate-900">Select a community…</option>
              {communities.map((c) => (
                <option key={c._id} value={c._id} className="bg-slate-900">
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div className="flex gap-1">
              {/* Image upload button */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleImageIconClick}
                title="Attach image"
                className={`p-2 rounded-full transition-all ${
                  imageFile
                    ? 'text-purple-300 bg-purple-500/20'
                    : 'text-purple-400 hover:bg-purple-500/20'
                }`}
              >
                <ImageIcon className="w-5 h-5" />
              </motion.button>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !title.trim() || !communityId}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 font-semibold px-6"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Posting…
                </span>
              ) : 'Post'}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Post Card ────────────────────────────────────────────────────────────────

function PostCard({
  post,
  initialUserVote,
  onVoteComplete,
}: {
  post: Post
  initialUserVote: 'upvote' | 'downvote' | null
  onVoteComplete: (postId: string, updatedPost: Post, newUserVote: 'upvote' | 'downvote' | null) => void
}) {
  const { isAuthenticated } = useAuthStore()
  const { addToast } = useToastStore()

  // Local vote state — optimistic UI
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(initialUserVote)
  const [localUpvotes, setLocalUpvotes] = useState(post.upvotes)
  const [localDownvotes, setLocalDownvotes] = useState(post.downvotes)
  const [voting, setVoting] = useState(false)

  // Keep local counts in sync when parent post changes (e.g. after refetch)
  useEffect(() => {
    setLocalUpvotes(post.upvotes)
    setLocalDownvotes(post.downvotes)
  }, [post.upvotes, post.downvotes])

  useEffect(() => {
    setUserVote(initialUserVote)
  }, [initialUserVote])

  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<{ _id: string; content: string; user: { username: string } }[]>([])
  const [commentText, setCommentText] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  const [submittingComment, setSubmittingComment] = useState(false)

  const handleVoteClick = async (type: 'upvote' | 'downvote') => {
    if (!isAuthenticated) {
      addToast({ type: 'warning', title: 'Login required', message: 'Please sign in to vote.' })
      return
    }
    if (voting) return
    setVoting(true)

    // ── Optimistic update ──────────────────────────────────────────────────
    const prevVote = userVote
    const prevUp = localUpvotes
    const prevDown = localDownvotes

    if (type === 'upvote') {
      if (userVote === 'upvote') {
        // Toggle off
        setUserVote(null)
        setLocalUpvotes((n) => Math.max(0, n - 1))
      } else {
        if (userVote === 'downvote') setLocalDownvotes((n) => Math.max(0, n - 1))
        setUserVote('upvote')
        setLocalUpvotes((n) => n + 1)
      }
    } else {
      if (userVote === 'downvote') {
        // Toggle off
        setUserVote(null)
        setLocalDownvotes((n) => Math.max(0, n - 1))
      } else {
        if (userVote === 'upvote') setLocalUpvotes((n) => Math.max(0, n - 1))
        setUserVote('downvote')
        setLocalDownvotes((n) => n + 1)
      }
    }

    try {
      const result = type === 'upvote'
        ? await votesApi.upvote(post._id)
        : await votesApi.downvote(post._id)

      // Sync with server truth — guard against undefined post in response
      if (result?.post) {
        setLocalUpvotes(result.post.upvotes)
        setLocalDownvotes(result.post.downvotes)
        setUserVote(result.userVote)
        onVoteComplete(post._id, result.post, result.userVote)
      } else {
        // Backend succeeded but returned unexpected shape — keep optimistic state
        setUserVote(result?.userVote ?? (type === 'upvote' ? (prevVote === 'upvote' ? null : 'upvote') : (prevVote === 'downvote' ? null : 'downvote')))
      }
    } catch (err: unknown) {
      // Rollback optimistic update on failure
      setUserVote(prevVote)
      setLocalUpvotes(prevUp)
      setLocalDownvotes(prevDown)
      const axiosErr = err as { response?: { data?: { message?: string }; status?: number } }
      const msg = axiosErr?.response?.data?.message || 'Please try again.'
      const status = axiosErr?.response?.status
      console.error('Vote error:', status, msg, err)
      addToast({ type: 'error', title: 'Vote failed', message: msg })
    } finally {
      setVoting(false)
    }
  }

  const loadComments = async () => {
    if (showComments) { setShowComments(false); return }
    setShowComments(true)
    setLoadingComments(true)
    try {
      const data = await commentsApi.getByPost(post._id)
      setComments(data)
    } catch {
      addToast({ type: 'error', title: 'Failed to load comments' })
    } finally {
      setLoadingComments(false)
    }
  }

  const submitComment = async () => {
    if (!commentText.trim()) return
    if (!isAuthenticated) {
      addToast({ type: 'warning', title: 'Login required', message: 'Please sign in to comment.' })
      return
    }
    setSubmittingComment(true)
    try {
      const comment = await commentsApi.create({ content: commentText, post: post._id })
      setComments((prev) => [...prev, comment])
      setCommentText('')
      addToast({ type: 'success', title: 'Comment added!' })
    } catch {
      addToast({ type: 'error', title: 'Failed to add comment' })
    } finally {
      setSubmittingComment(false)
    }
  }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <motion.div
      variants={itemVariants}
      className="border-b border-white/10 p-6 hover:bg-white/[0.02] transition-all duration-300 group"
    >
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
          {post.author?.username?.[0]?.toUpperCase() ?? 'U'}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-white">{post.author?.username ?? 'Unknown'}</span>
              <span className="text-gray-500 text-sm">·</span>
              <span className="text-gray-500 text-sm">{timeAgo(post.createdAt)}</span>
              {post.community?.name && (
                <>
                  <span className="text-gray-600">·</span>
                  <span className="text-purple-400 text-sm">r/{post.community.name}</span>
                </>
              )}
            </div>
            <button className="text-gray-500 hover:text-purple-400 opacity-0 group-hover:opacity-100 transition-all">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-white text-base mb-1">{post.title}</h3>

          {/* Content */}
          {post.content && (
            <p className="text-gray-300 text-sm mb-3 leading-relaxed">{post.content}</p>
          )}

          {/* Post image */}
          {post.image && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl overflow-hidden border border-white/10 mb-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${process.env.NEXT_PUBLIC_SOCKET_URL}${post.image}`}
                alt={post.title}
                className="w-full max-h-96 object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            </motion.div>
          )}

          {/* ── Vote + Action bar ─────────────────────────────────────────── */}
          <div className="flex items-center gap-1 text-gray-500 text-sm mt-3">

            {/* Upvote */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleVoteClick('upvote')}
              disabled={voting}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all font-medium ${
                userVote === 'upvote'
                  ? 'bg-green-500/20 text-green-400 ring-1 ring-green-500/40'
                  : 'hover:bg-green-500/10 hover:text-green-400'
              } disabled:opacity-50`}
              title="Upvote"
            >
              <Heart className={`w-4 h-4 transition-all ${userVote === 'upvote' ? 'fill-green-400 text-green-400' : ''}`} />
              <span className="text-xs tabular-nums">{localUpvotes}</span>
            </motion.button>

            {/* Downvote */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleVoteClick('downvote')}
              disabled={voting}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all font-medium ${
                userVote === 'downvote'
                  ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/40'
                  : 'hover:bg-red-500/10 hover:text-red-400'
              } disabled:opacity-50`}
              title="Downvote"
            >
              <Heart className={`w-4 h-4 rotate-180 transition-all ${userVote === 'downvote' ? 'fill-red-400 text-red-400' : ''}`} />
              <span className="text-xs tabular-nums">{localDownvotes}</span>
            </motion.button>

            {/* Comments */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadComments}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                showComments ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-blue-500/10 hover:text-blue-400'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs">Comments</span>
            </motion.button>

            {/* Share */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-purple-500/10 hover:text-purple-400 transition-all"
            >
              <Share2 className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 space-y-3"
            >
              {isAuthenticated && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Write a comment…"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submitComment()}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 text-sm h-9"
                  />
                  <Button
                    onClick={submitComment}
                    disabled={submittingComment || !commentText.trim()}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-sm h-9 px-3 shrink-0"
                  >
                    {submittingComment ? '…' : 'Send'}
                  </Button>
                </div>
              )}

              {loadingComments ? (
                <p className="text-gray-500 text-sm">Loading comments…</p>
              ) : comments.length === 0 ? (
                <p className="text-gray-500 text-sm">No comments yet. Be the first!</p>
              ) : (
                comments.map((c) => (
                  <div key={c._id} className="flex gap-2 text-sm">
                    <div className="w-7 h-7 rounded-full bg-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-xs shrink-0">
                      {c.user?.username?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                    <div className="bg-white/5 rounded-lg px-3 py-2 flex-1">
                      <span className="font-semibold text-white text-xs">{c.user?.username}</span>
                      <p className="text-gray-300 mt-0.5">{c.content}</p>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Home Page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { posts, setPosts, updatePost, isLoading, setLoading, setError } = usePostsStore()
  const { communities, setCommunities } = useCommunitiesStore()
  const { addToast } = useToastStore()
  const [activeTab, setActiveTab] = useState('for-you')
  // Map of postId → user's current vote ('upvote' | 'downvote' | null)
  const [userVotes, setUserVotes] = useState<Record<string, 'upvote' | 'downvote' | null>>({})

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [postsData, communitiesData] = await Promise.all([
        postsApi.getAll(),
        communitiesApi.getAll(),
      ])
      setPosts(postsData)
      setCommunities(communitiesData)

      // Fetch the current user's votes for all posts in one batch call
      if (isAuthenticated && postsData.length > 0) {
        try {
          const voteMap = await votesApi.getUserVotesBatch(postsData.map((p) => p._id))
          setUserVotes(voteMap)
        } catch {
          // Non-critical — votes just won't be highlighted on load
        }
      }
    } catch {
      setError('Failed to load feed')
      addToast({ type: 'error', title: 'Failed to load feed', message: 'Check your connection.' })
    } finally {
      setLoading(false)
    }
  }, [setPosts, setCommunities, setLoading, setError, addToast, isAuthenticated])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Called by PostCard after a successful vote API response
  const handleVoteComplete = (
    postId: string,
    updatedPost: Post,
    newUserVote: 'upvote' | 'downvote' | null
  ) => {
    updatePost(updatedPost)
    setUserVotes((prev) => ({ ...prev, [postId]: newUserVote }))
  }

  const handlePostCreated = (post: Post) => {
    setPosts([post, ...posts])
  }

  const handleLogout = () => {
    logout()
    addToast({ type: 'info', title: 'Logged out', message: 'See you next time!' })
    router.push('/')
  }

  const trendingTopics = [
    { category: 'Technology', trend: 'AI Revolution', posts: '342K', icon: Sparkles, color: 'from-blue-500 to-cyan-500' },
    { category: 'Design', trend: 'Glassmorphism', posts: '128K', icon: Flame, color: 'from-orange-500 to-pink-500' },
    { category: 'Business', trend: 'Startup Boom', posts: '156K', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
    { category: 'Community', trend: 'Creators Hub', posts: '89K', icon: Users, color: 'from-purple-500 to-pink-500' },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Left Sidebar */}
      <motion.aside
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed left-0 top-0 h-screen w-64 border-r border-white/10 p-6 hidden lg:flex flex-col bg-background/50 backdrop-blur-xl z-40"
      >
        {/* Logo */}
        <Link href="/">
          <motion.div className="flex items-center gap-3 mb-12 cursor-pointer group" whileHover={{ scale: 1.05 }}>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
              S
            </div>
            <span className="text-2xl font-bold text-white">SocialHub</span>
          </motion.div>
        </Link>

        {/* Nav */}
        <nav className="flex-1 space-y-2">
          {[
            { icon: Home, label: 'Home', href: '/home', active: true },
            { icon: Compass, label: 'Explore', href: '/explore', active: false },
            { icon: Bell, label: 'Notifications', href: '/home', active: false },
            { icon: Mail, label: 'Messages', href: '/messages', active: false },
            { icon: Bookmark, label: 'Bookmarks', href: '/home', active: false },
          ].map((item, idx) => (
            <Link key={idx} href={item.href}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ x: 4 }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group cursor-pointer ${
                  item.active
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="text-lg font-medium">{item.label}</span>
              </motion.div>
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        <div className="mt-4 space-y-3">
          {isAuthenticated && user ? (
            <div className="glass-dark rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                  {user.username[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm truncate">{user.username}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href="/profile" className="flex-1">
                  <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 text-xs h-8">
                    Profile
                  </Button>
                </Link>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-red-500/30 hover:bg-red-500/10 text-red-400 text-xs h-8 px-2"
                >
                  <LogOut className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Link href="/auth/login">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-5 rounded-2xl">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="outline" className="w-full border-white/20 hover:bg-white/5 text-white py-5 rounded-2xl">
                  Create Account
                </Button>
              </Link>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Main Feed */}
      <main className="lg:ml-64 xl:mr-80 max-w-2xl mx-auto">
        {/* Top Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-xl font-bold text-white">Home</h2>
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex px-6 border-t border-white/5">
            {['for-you', 'following'].map((tab) => (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-semibold transition-all relative ${
                  activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-white'
                }`}
              >
                {tab === 'for-you' ? 'For You' : 'Following'}
                {activeTab === tab && (
                  <motion.div
                    layoutId="underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500"
                  />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Create Post (only when authenticated) */}
        {isAuthenticated && (
          <CreatePostForm communities={communities} onCreated={handlePostCreated} />
        )}

        {/* Feed */}
        {isLoading ? (
          <FeedSkeleton />
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg">No posts yet.</p>
            <p className="text-sm mt-2">Be the first to post something!</p>
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                initialUserVote={userVotes[post._id] ?? null}
                onVoteComplete={handleVoteComplete}
              />
            ))}
          </motion.div>
        )}
      </main>

      {/* Right Sidebar */}
      <motion.aside
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed right-0 top-0 h-screen w-80 border-l border-white/10 p-6 hidden xl:flex flex-col bg-background/50 backdrop-blur-xl z-40 overflow-y-auto"
      >
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search SocialHub"
            className="pl-12 bg-white/5 border-white/10 hover:bg-white/10 text-white placeholder:text-gray-500 rounded-full"
          />
        </div>

        {/* Trending */}
        <div className="space-y-3 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl font-bold text-white">Trending Now</h2>
          </div>
          {trendingTopics.map((item, idx) => {
            const IconComponent = item.icon
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.02, x: 4 }}
                className="glass-dark rounded-xl p-4 cursor-pointer group border border-white/5 hover:border-white/10 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 mb-0.5">{item.category} · Trending</p>
                    <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                      {item.trend}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">{item.posts} posts</p>
                  </div>
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${item.color} text-white shrink-0`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Communities */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Communities</h2>
          </div>
          {communities.slice(0, 4).map((community, idx) => (
            <motion.div
              key={community._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className="glass-dark rounded-xl p-3 mb-2 border border-white/5 hover:border-purple-500/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {community.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm truncate group-hover:text-purple-300 transition-colors">
                    {community.name}
                  </p>
                  <p className="text-xs text-gray-500">{community.members.length} members</p>
                </div>
              </div>
            </motion.div>
          ))}
          {communities.length === 0 && (
            <p className="text-gray-500 text-sm">No communities yet.</p>
          )}
          <Link href="/community">
            <Button variant="outline" className="w-full mt-2 border-white/10 hover:bg-white/5 text-gray-400 text-sm">
              Browse all communities
            </Button>
          </Link>
        </div>
      </motion.aside>
    </div>
  )
}
