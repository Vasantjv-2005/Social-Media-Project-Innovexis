'use client'

import { useToastStore } from '@/lib/store'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, AlertCircle, Info, X } from 'lucide-react'

// ─── Toast Renderer ───────────────────────────────────────────────────────────

function GlobalToasts() {
  const { toasts, removeToast } = useToastStore()

  const icons = {
    success: <Check className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
  }

  const colors = {
    success: 'bg-green-500/10 border-green-500/50 text-green-400',
    error: 'bg-red-500/10 border-red-500/50 text-red-400',
    info: 'bg-blue-500/10 border-blue-500/50 text-blue-400',
    warning: 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400',
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] space-y-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 15 }}
            className={`pointer-events-auto backdrop-blur-xl rounded-lg border p-4 flex items-start gap-3 max-w-sm shadow-xl ${colors[toast.type]}`}
          >
            <div className="shrink-0 mt-0.5">{icons[toast.type]}</div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">{toast.title}</p>
              {toast.message && (
                <p className="text-sm opacity-75 mt-0.5">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-gray-400 hover:text-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// ─── Root Provider ────────────────────────────────────────────────────────────

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <GlobalToasts />
    </>
  )
}
