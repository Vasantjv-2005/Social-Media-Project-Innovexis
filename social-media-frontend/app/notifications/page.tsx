'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Bell, Heart, MessageCircle, UserPlus } from 'lucide-react'
import Link from 'next/link'

const notifications = [
  { id: 1, type: 'like', user: 'Alex', action: 'liked your post', time: '2m ago', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-500/10' },
  { id: 2, type: 'comment', user: 'Sarah', action: 'commented on your photo', time: '1h ago', icon: MessageCircle, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 3, type: 'follow', user: 'Mike', action: 'started following you', time: '3h ago', icon: UserPlus, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 4, type: 'system', user: 'System', action: 'Welcome to SocialHub!', time: '1d ago', icon: Bell, color: 'text-purple-500', bg: 'bg-purple-500/10' },
]

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-xl"
      >
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center gap-4">
          <Link href="/home">
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
              <ArrowLeft className="w-6 h-6" />
            </button>
          </Link>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Bell className="w-8 h-8 text-purple-400" />
            Notifications
          </h1>
        </div>
      </motion.div>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ staggerChildren: 0.1 }}
          className="space-y-4"
        >
          {notifications.map((notif, idx) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-dark rounded-2xl p-5 border border-white/5 hover:border-purple-500/30 transition-all flex items-center gap-4 cursor-pointer group"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${notif.bg} ${notif.color}`}>
                <notif.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-white text-base">
                  <span className="font-bold">{notif.user}</span> {notif.action}
                </p>
                <p className="text-sm text-gray-500 mt-1">{notif.time}</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-purple-500 opacity-100 group-hover:opacity-50 transition-opacity" />
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  )
}
