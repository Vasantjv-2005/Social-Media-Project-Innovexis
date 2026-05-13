// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  _id: string
  username: string
  email: string
  avatar: string
  bio: string
  role: 'user' | 'admin'
  createdAt: string
  updatedAt: string
  token: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  _id: string
  username: string
  email: string
  avatar: string
  bio: string
  role: 'user' | 'admin'
  createdAt: string
  updatedAt: string
}

// ─── Community ────────────────────────────────────────────────────────────────

export interface Community {
  _id: string
  name: string
  description: string
  image: string
  creator: Pick<User, '_id' | 'username' | 'email'>
  members: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateCommunityPayload {
  name: string
  description: string
}

// ─── Post ─────────────────────────────────────────────────────────────────────

export interface Post {
  _id: string
  title: string
  content: string
  image: string
  author: Pick<User, '_id' | 'username' | 'email'>
  community: Pick<Community, '_id' | 'name'>
  upvotes: number
  downvotes: number
  createdAt: string
  updatedAt: string
}

export interface CreatePostPayload {
  title: string
  content: string
  image?: string
  imageFile?: File
  community: string
}

// ─── Comment ──────────────────────────────────────────────────────────────────

export interface Comment {
  _id: string
  content: string
  user: Pick<User, '_id' | 'username' | 'email'>
  post: string
  createdAt: string
  updatedAt: string
}

export interface CreateCommentPayload {
  content: string
  post: string
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalUsers: number
  totalPosts: number
  totalCommunities: number
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiError {
  message: string
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export interface Message {
  _id: string
  sender: Pick<User, '_id' | 'username' | 'avatar'>
  receiver: Pick<User, '_id' | 'username' | 'avatar'>
  content: string
  read: boolean
  createdAt: string
  updatedAt: string
}

export interface Conversation {
  user: Pick<User, '_id' | 'username' | 'avatar' | 'bio'>
  lastMessage: Message
  unreadCount: number
}

export interface SendMessagePayload {
  receiverId: string
  content: string
}
