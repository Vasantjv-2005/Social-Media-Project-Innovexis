import axios from 'axios'
import type {
  AuthUser,
  LoginPayload,
  RegisterPayload,
  User,
  Community,
  CreateCommunityPayload,
  Post,
  CreatePostPayload,
  Comment,
  CreateCommentPayload,
  DashboardStats,
  Message,
  Conversation,
  SendMessagePayload,
} from './types'

// ─── Axios Instance ───────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach JWT token from localStorage on every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Global response error handler — do NOT auto-redirect here.
// Each page/component handles auth errors individually.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 if we're NOT on an auth page already
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const isAuthPage = window.location.pathname.startsWith('/auth')
        if (!isAuthPage) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/auth/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register: async (payload: RegisterPayload): Promise<AuthUser> => {
    const { data } = await api.post<AuthUser>('/auth/register', payload)
    return data
  },

  login: async (payload: LoginPayload): Promise<AuthUser> => {
    const { data } = await api.post<AuthUser>('/auth/login', payload)
    return data
  },
}

// ─── Users ────────────────────────────────────────────────────────────────────

export const usersApi = {
  getProfile: async (): Promise<{ message: string; user: User }> => {
    const { data } = await api.get('/users/profile')
    return data
  },

  getAllUsers: async (): Promise<User[]> => {
    const { data } = await api.get<User[]>('/users')
    return data
  },

  getUserById: async (id: string): Promise<User> => {
    const { data } = await api.get<User>(`/users/${id}`)
    return data
  },
}

// ─── Communities ──────────────────────────────────────────────────────────────

export const communitiesApi = {
  getAll: async (): Promise<Community[]> => {
    const { data } = await api.get<Community[]>('/communities')
    return data
  },

  create: async (payload: CreateCommunityPayload): Promise<Community> => {
    const { data } = await api.post<Community>('/communities', payload)
    return data
  },
}

// ─── Posts ────────────────────────────────────────────────────────────────────

export const postsApi = {
  getAll: async (): Promise<Post[]> => {
    const { data } = await api.get<Post[]>('/posts')
    return data
  },

  create: async (payload: CreatePostPayload): Promise<Post> => {
    // Build FormData so we can attach an optional image file
    const form = new FormData()
    form.append('title', payload.title)
    form.append('content', payload.content ?? '')
    form.append('community', payload.community)
    if (payload.imageFile) {
      form.append('image', payload.imageFile)
    }

    const { data } = await api.post<Post>('/posts', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export const commentsApi = {
  getByPost: async (postId: string): Promise<Comment[]> => {
    const { data } = await api.get<Comment[]>(`/comments/${postId}`)
    return data
  },

  create: async (payload: CreateCommentPayload): Promise<Comment> => {
    const { data } = await api.post<Comment>('/comments', payload)
    return data
  },
}

// ─── Votes ────────────────────────────────────────────────────────────────────

export interface VoteResponse {
  post: Post | null
  userVote: 'upvote' | 'downvote' | null
}

export const votesApi = {
  upvote: async (postId: string): Promise<VoteResponse> => {
    const { data } = await api.post<VoteResponse>(`/votes/upvote/${postId}`)
    return data
  },

  downvote: async (postId: string): Promise<VoteResponse> => {
    const { data } = await api.post<VoteResponse>(`/votes/downvote/${postId}`)
    return data
  },

  // Get current user's vote on a single post
  getUserVote: async (postId: string): Promise<{ userVote: 'upvote' | 'downvote' | null }> => {
    const { data } = await api.get(`/votes/user/${postId}`)
    return data
  },

  // Get current user's votes on many posts at once — returns { postId: voteType }
  getUserVotesBatch: async (postIds: string[]): Promise<Record<string, 'upvote' | 'downvote'>> => {
    const { data } = await api.post('/votes/user/batch', { postIds })
    return data
  },
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminApi = {
  getDashboard: async (): Promise<DashboardStats> => {
    const { data } = await api.get<DashboardStats>('/admin/dashboard')
    return data
  },
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export const messagesApi = {
  // All users I can chat with
  getUsers: async (): Promise<User[]> => {
    const { data } = await api.get<User[]>('/messages/users')
    return data
  },

  // My inbox — one entry per conversation partner
  getConversations: async (): Promise<Conversation[]> => {
    const { data } = await api.get<Conversation[]>('/messages/conversations')
    return data
  },

  // Full message thread with one user
  getConversation: async (otherUserId: string): Promise<Message[]> => {
    const { data } = await api.get<Message[]>(`/messages/conversation/${otherUserId}`)
    return data
  },

  // Send a message (persists to DB, then caller emits via socket for real-time)
  send: async (payload: SendMessagePayload): Promise<Message> => {
    const { data } = await api.post<Message>('/messages', payload)
    return data
  },
}

export default api
