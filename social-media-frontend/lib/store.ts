import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser, Post, Community, Comment } from './types'

// ─── Auth Store ───────────────────────────────────────────────────────────────

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: AuthUser) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user: AuthUser) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', user.token)
          localStorage.setItem('user', JSON.stringify(user))
        }
        set({ user, token: user.token, isAuthenticated: true })
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    {
      name: 'auth-storage',
      // Only persist user and token, not functions
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
)

// ─── Posts Store ──────────────────────────────────────────────────────────────

interface PostsState {
  posts: Post[]
  isLoading: boolean
  error: string | null
  setPosts: (posts: Post[]) => void
  addPost: (post: Post) => void
  updatePost: (post: Post) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const usePostsStore = create<PostsState>((set) => ({
  posts: [],
  isLoading: false,
  error: null,

  setPosts: (posts) => set({ posts }),
  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
  updatePost: (post) =>
    set((state) => ({
      posts: state.posts.map((p) => (p._id === post._id ? post : p)),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}))

// ─── Communities Store ────────────────────────────────────────────────────────

interface CommunitiesState {
  communities: Community[]
  isLoading: boolean
  error: string | null
  setCommunities: (communities: Community[]) => void
  addCommunity: (community: Community) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useCommunitiesStore = create<CommunitiesState>((set) => ({
  communities: [],
  isLoading: false,
  error: null,

  setCommunities: (communities) => set({ communities }),
  addCommunity: (community) =>
    set((state) => ({ communities: [community, ...state.communities] })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}))

// ─── Comments Store ───────────────────────────────────────────────────────────

interface CommentsState {
  commentsByPost: Record<string, Comment[]>
  isLoading: boolean
  setComments: (postId: string, comments: Comment[]) => void
  addComment: (postId: string, comment: Comment) => void
  setLoading: (loading: boolean) => void
}

export const useCommentsStore = create<CommentsState>((set) => ({
  commentsByPost: {},
  isLoading: false,

  setComments: (postId, comments) =>
    set((state) => ({
      commentsByPost: { ...state.commentsByPost, [postId]: comments },
    })),

  addComment: (postId, comment) =>
    set((state) => ({
      commentsByPost: {
        ...state.commentsByPost,
        [postId]: [comment, ...(state.commentsByPost[postId] || [])],
      },
    })),

  setLoading: (isLoading) => set({ isLoading }),
}))

// ─── Toast Store ──────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastItem {
  id: string
  type: ToastType
  title: string
  message?: string
}

interface ToastState {
  toasts: ToastItem[]
  addToast: (toast: Omit<ToastItem, 'id'>) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = Math.random().toString(36).slice(2)
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }))
    // Auto-remove after 4 seconds
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 4000)
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))
