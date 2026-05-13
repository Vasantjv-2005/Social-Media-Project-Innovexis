
'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Search, Send, MoreHorizontal, Phone, Video,
  ArrowLeft, Plus, MessageSquare, Loader2, AlertCircle,
} from 'lucide-react'
import { messagesApi } from '@/lib/api'
import { useAuthStore, useToastStore } from '@/lib/store'
import { useSocket } from '@/hooks/use-socket'
import type { Message, Conversation, User } from '@/lib/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function Avatar({ username, size = 'md' }: { username: string; size?: 'sm' | 'md' | 'lg' }) {
  const cls = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' }
  return (
    <div className={`${cls[size]} rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold shrink-0`}>
      {username?.[0]?.toUpperCase() ?? '?'}
    </div>
  )
}

// ─── New Conversation Modal ───────────────────────────────────────────────────

function NewConversationModal({
  users,
  usersLoading,
  usersError,
  onSelect,
  onClose,
}: {
  users: User[]
  usersLoading: boolean
  usersError: string
  onSelect: (user: User) => void
  onClose: () => void
}) {
  const [search, setSearch] = useState('')
  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-sm bg-slate-900 border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-5 border-b border-white/10">
          <h2 className="text-lg font-bold text-white mb-3">New Message</h2>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500 pointer-events-none" />
            <Input
              autoFocus
              placeholder="Search by username…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-9"
            />
          </div>
        </div>

        <div className="max-h-72 overflow-y-auto">
          {usersLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
            </div>
          ) : usersError ? (
            <div className="flex items-center gap-2 text-red-400 text-sm px-5 py-8 justify-center">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {usersError}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-500 py-8 text-sm">
              {search ? `No users matching "${search}"` : 'No other users found'}
            </p>
          ) : (
            filtered.map((u) => (
              <button
                key={u._id}
                onClick={() => { onSelect(u); onClose() }}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors text-left"
              >
                <Avatar username={u.username} size="sm" />
                <div>
                  <p className="font-semibold text-white text-sm">{u.username}</p>
                  {u.bio && (
                    <p className="text-xs text-gray-500 truncate max-w-[200px]">{u.bio}</p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        <div className="p-4 border-t border-white/10">
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full border-white/10 hover:bg-white/5 text-gray-400 text-sm"
          >
            Cancel
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Conversation List Item ───────────────────────────────────────────────────

function ConvItem({
  conv,
  isSelected,
  isOnline,
  onClick,
}: {
  conv: Conversation
  isSelected: boolean
  isOnline: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={onClick}
      className={`w-full px-4 py-3.5 border-b border-white/5 text-left transition-all ${
        isSelected
          ? 'bg-purple-600/20 border-l-2 border-l-purple-500'
          : 'hover:bg-white/5'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <Avatar username={conv.user.username} size="md" />
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <span className="font-semibold text-white text-sm truncate">
              {conv.user.username}
            </span>
            <span className="text-xs text-gray-500 shrink-0 ml-2">
              {timeAgo(conv.lastMessage.createdAt)}
            </span>
          </div>
          <p className={`text-xs truncate ${
            conv.unreadCount > 0 ? 'text-white font-medium' : 'text-gray-500'
          }`}>
            {conv.lastMessage.content}
          </p>
        </div>
        {conv.unreadCount > 0 && (
          <span className="shrink-0 min-w-[18px] h-[18px] bg-purple-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center px-1">
            {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
          </span>
        )}
      </div>
    </motion.button>
  )
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg, isMine }: { msg: Message; isMine: boolean }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}
    >
      {!isMine && <Avatar username={msg.sender.username} size="sm" />}

      <div className={`max-w-[70%] flex flex-col gap-1 ${isMine ? 'items-end' : 'items-start'}`}>
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isMine
            ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-br-sm'
            : 'bg-white/10 text-gray-100 rounded-bl-sm border border-white/10'
        }`}>
          {msg.content}
        </div>
        <span className="text-[10px] text-gray-600 px-1">{formatTime(msg.createdAt)}</span>
      </div>

      {isMine && <Avatar username={msg.sender.username} size="sm" />}
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const { addToast } = useToastStore()
  const { emit, on } = useSocket()

  // Zustand persist hydration guard — prevents calling APIs before token is loaded
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => { setHydrated(true) }, [])

  // ── State ─────────────────────────────────────────────────────────────────
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([])
  const [partnerTyping, setPartnerTyping] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  const [convsLoading, setConvsLoading] = useState(false)
  const [convsError, setConvsError] = useState('')
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState('')
  const [msgsLoading, setMsgsLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [showNewModal, setShowNewModal] = useState(false)
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const selectedUserRef = useRef<User | null>(null)

  // Keep ref in sync so socket callbacks always see latest selectedUser
  useEffect(() => { selectedUserRef.current = selectedUser }, [selectedUser])

  // ── Auth guard ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [hydrated, isAuthenticated, router])

  // ── Load conversations ────────────────────────────────────────────────────
  const loadConversations = useCallback(async () => {
    setConvsLoading(true)
    setConvsError('')
    try {
      const convs = await messagesApi.getConversations()
      setConversations(convs)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not load conversations. Is the backend running?'
      setConvsError(msg)
    } finally {
      setConvsLoading(false)
    }
  }, [])

  // ── Load users for new-chat modal ─────────────────────────────────────────
  const loadUsers = useCallback(async () => {
    setUsersLoading(true)
    setUsersError('')
    try {
      const users = await messagesApi.getUsers()
      setAllUsers(users)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not load users.'
      setUsersError(msg)
    } finally {
      setUsersLoading(false)
    }
  }, [])

  // Run both after hydration + auth confirmed
  useEffect(() => {
    if (!hydrated || !isAuthenticated) return
    loadConversations()
    loadUsers()
  }, [hydrated, isAuthenticated, loadConversations, loadUsers])

  // ── Socket listeners ──────────────────────────────────────────────────────
  useEffect(() => {
    const offMsg = on<Message>('receiveMessage', (msg) => {
      const senderId = String(msg.sender._id)
      const myId = String(user?._id)
      const currentPartner = selectedUserRef.current

      // Append to open conversation
      if (
        currentPartner &&
        (senderId === String(currentPartner._id) || senderId === myId)
      ) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev
          return [...prev, msg]
        })
      }

      // Update conversation preview
      const partnerId = senderId === myId ? String(msg.receiver._id) : senderId
      setConversations((prev) => {
        const exists = prev.find((c) => String(c.user._id) === partnerId)
        if (exists) {
          return prev.map((c) =>
            String(c.user._id) === partnerId
              ? {
                  ...c,
                  lastMessage: msg,
                  unreadCount:
                    senderId !== myId &&
                    String(currentPartner?._id) !== partnerId
                      ? c.unreadCount + 1
                      : c.unreadCount,
                }
              : c
          )
        }
        // Brand new conversation — reload list
        loadConversations()
        return prev
      })
    })

    const offOnline = on<string[]>('onlineUsers', (ids) => {
      setOnlineUserIds(ids)
    })

    const offTyping = on<{ fromUserId: string }>('userTyping', ({ fromUserId }) => {
      if (String(selectedUserRef.current?._id) === fromUserId) {
        setPartnerTyping(true)
      }
    })

    const offStopTyping = on<{ fromUserId: string }>('userStopTyping', ({ fromUserId }) => {
      if (String(selectedUserRef.current?._id) === fromUserId) {
        setPartnerTyping(false)
      }
    })

    return () => { offMsg(); offOnline(); offTyping(); offStopTyping() }
  }, [on, user, loadConversations])

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, partnerTyping])

  // ── Open a conversation ───────────────────────────────────────────────────
  const openConversation = useCallback(async (partner: User) => {
    setSelectedUser(partner)
    setMessages([])
    setPartnerTyping(false)
    setShowMobileChat(true)
    setMsgsLoading(true)

    try {
      const msgs = await messagesApi.getConversation(partner._id)
      setMessages(msgs)
      // Clear unread badge
      setConversations((prev) =>
        prev.map((c) =>
          String(c.user._id) === String(partner._id) ? { ...c, unreadCount: 0 } : c
        )
      )
    } catch {
      addToast({ type: 'error', title: 'Failed to load messages' })
    } finally {
      setMsgsLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [addToast])

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!messageInput.trim() || !selectedUser || sending) return
    const content = messageInput.trim()
    setMessageInput('')
    setSending(true)

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    if (isTyping) {
      emit('stopTyping', { toUserId: selectedUser._id, fromUserId: user!._id })
      setIsTyping(false)
    }

    try {
      const saved = await messagesApi.send({ receiverId: selectedUser._id, content })
      setMessages((prev) => [...prev, saved])
      emit('sendMessage', saved)

      setConversations((prev) => {
        const exists = prev.find((c) => String(c.user._id) === String(selectedUser._id))
        if (exists) {
          return prev.map((c) =>
            String(c.user._id) === String(selectedUser._id)
              ? { ...c, lastMessage: saved }
              : c
          )
        }
        return [{ user: selectedUser, lastMessage: saved, unreadCount: 0 }, ...prev]
      })
    } catch {
      addToast({ type: 'error', title: 'Failed to send message' })
      setMessageInput(content)
    } finally {
      setSending(false)
    }
  }

  // ── Typing indicator ──────────────────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value)
    if (!selectedUser || !user) return
    if (!isTyping) {
      setIsTyping(true)
      emit('typing', { toUserId: selectedUser._id, fromUserId: user._id })
    }
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    typingTimerRef.current = setTimeout(() => {
      setIsTyping(false)
      emit('stopTyping', { toUserId: selectedUser._id, fromUserId: user._id })
    }, 1500)
  }

  // ── Filtered conversations ────────────────────────────────────────────────
  const filteredConvs = conversations.filter((c) =>
    c.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ── Loading / not-authed guard ────────────────────────────────────────────
  if (!hydrated) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated || !user) return null

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen bg-background flex overflow-hidden">

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        className={`w-full md:w-80 border-r border-white/10 flex flex-col bg-background/60 backdrop-blur-xl shrink-0 ${
          showMobileChat ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">Messages</h1>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNewModal(true)}
              title="New conversation"
              className="p-2 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 rounded-full transition-all text-purple-300"
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500 pointer-events-none" />
            <Input
              placeholder="Search conversations…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-full h-9 text-sm"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {convsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
            </div>
          ) : convsError ? (
            <div className="flex flex-col items-center gap-3 py-12 px-6 text-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <p className="text-red-400 text-sm">{convsError}</p>
              <button
                onClick={loadConversations}
                className="text-purple-400 hover:text-purple-300 text-sm underline"
              >
                Retry
              </button>
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="text-center py-16 px-6">
              <MessageSquare className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                {searchQuery ? `No results for "${searchQuery}"` : 'No conversations yet'}
              </p>
              <button
                onClick={() => setShowNewModal(true)}
                className="mt-3 text-purple-400 hover:text-purple-300 text-sm transition-colors"
              >
                Start a new chat →
              </button>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredConvs.map((conv) => (
                <ConvItem
                  key={conv.user._id}
                  conv={conv}
                  isSelected={selectedUser?._id === conv.user._id}
                  isOnline={onlineUserIds.includes(conv.user._id)}
                  onClick={() => openConversation(conv.user)}
                />
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Logged-in user footer */}
        <div className="p-4 border-t border-white/10 flex items-center gap-3">
          <div className="relative">
            <Avatar username={user.username} size="sm" />
            <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-background" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user.username}</p>
            <p className="text-xs text-green-400">Online</p>
          </div>
        </div>
      </motion.div>

      {/* ── Chat Area ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`flex-1 flex flex-col min-w-0 ${
          !showMobileChat ? 'hidden md:flex' : 'flex'
        }`}
      >
        {selectedUser ? (
          <>
            {/* Chat header */}
            <div className="border-b border-white/10 px-5 py-4 flex items-center justify-between bg-background/60 backdrop-blur-xl shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowMobileChat(false)}
                  className="md:hidden p-1.5 hover:bg-white/10 rounded-full transition-colors text-gray-400"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="relative">
                  <Avatar username={selectedUser.username} size="md" />
                  {onlineUserIds.includes(selectedUser._id) && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                  )}
                </div>
                <div>
                  <h2 className="font-bold text-white">{selectedUser.username}</h2>
                  <p className="text-xs text-gray-400">
                    {partnerTyping
                      ? 'typing…'
                      : onlineUserIds.includes(selectedUser._id)
                      ? 'Online'
                      : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                  <Video className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {msgsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 text-purple-400" />
                  </div>
                  <p className="text-white font-semibold">Start the conversation</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Say hi to {selectedUser.username}!
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout" initial={false}>
                  {messages.map((msg) => (
                    <MessageBubble
                      key={msg._id}
                      msg={msg}
                      isMine={String(msg.sender._id) === String(user._id)}
                    />
                  ))}
                </AnimatePresence>
              )}

              {/* Typing indicator */}
              <AnimatePresence>
                {partnerTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="flex items-end gap-2"
                  >
                    <Avatar username={selectedUser.username} size="sm" />
                    <div className="bg-white/10 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-white/10 px-5 py-4 bg-background/60 backdrop-blur-xl shrink-0">
              <div className="flex items-center gap-3">
                <Input
                  ref={inputRef}
                  placeholder={`Message ${selectedUser.username}…`}
                  value={messageInput}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 focus:bg-white/10 text-white placeholder:text-gray-500 rounded-full"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={!messageInput.trim() || sending}
                  className="p-2.5 bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  {sending
                    ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                    : <Send className="w-5 h-5 text-white" />
                  }
                </motion.button>
              </div>
            </div>
          </>
        ) : (
          /* No conversation selected */
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-24 h-24 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6"
            >
              <MessageSquare className="w-10 h-10 text-purple-400" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">Your Messages</h2>
            <p className="text-gray-500 mb-6 max-w-xs">
              Select a conversation or start a new one.
            </p>
            <Button
              onClick={() => setShowNewModal(true)}
              className="bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold px-6"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Message
            </Button>
          </div>
        )}
      </motion.div>

      {/* ── New Conversation Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {showNewModal && (
          <NewConversationModal
            users={allUsers}
            usersLoading={usersLoading}
            usersError={usersError}
            onSelect={openConversation}
            onClose={() => setShowNewModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
