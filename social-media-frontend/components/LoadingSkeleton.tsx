'use client'

import { motion } from 'framer-motion'

export function PostSkeleton() {
  return (
    <div className="border-b border-white/10 p-6">
      <div className="flex gap-4">
        {/* Avatar skeleton */}
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 rounded-full bg-white/10 flex-shrink-0"
        />

        {/* Content skeleton */}
        <div className="flex-1 space-y-3">
          {/* Header */}
          <div className="flex gap-2">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-4 bg-white/10 rounded flex-1 max-w-xs"
            />
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-4 bg-white/10 rounded flex-1 max-w-[60px]"
            />
          </div>

          {/* Text lines */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
              className={`h-4 bg-white/10 rounded ${i === 2 ? 'max-w-2xl' : 'w-full'}`}
            />
          ))}

          {/* Action buttons skeleton */}
          <div className="flex gap-4 pt-2">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                className="h-8 bg-white/10 rounded flex-1 max-w-[80px]"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="glass-dark rounded-2xl p-6 space-y-4"
    >
      <div className="h-6 bg-white/10 rounded w-2/3" />
      <div className="space-y-2">
        <div className="h-4 bg-white/10 rounded w-full" />
        <div className="h-4 bg-white/10 rounded w-5/6" />
        <div className="h-4 bg-white/10 rounded w-4/5" />
      </div>
      <div className="h-10 bg-white/10 rounded w-full" />
    </motion.div>
  )
}

export function ProfileHeaderSkeleton() {
  return (
    <div>
      {/* Banner */}
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="h-48 bg-white/10"
      />

      {/* Profile info */}
      <div className="px-6 pb-6 -mt-16 relative z-10">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-32 h-32 rounded-full bg-white/10 mb-6"
        />

        <div className="space-y-3 max-w-sm">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-8 bg-white/10 rounded w-2/3"
          />
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
            className="h-4 bg-white/10 rounded w-1/3"
          />
        </div>
      </div>
    </div>
  )
}

export function FeedSkeleton() {
  return (
    <div className="space-y-0">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="border-b border-white/10">
          <PostSkeleton />
        </div>
      ))}
    </div>
  )
}
