'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useFeedback, FeedbackToast as ToastType } from '@/app/lib/FeedbackProvider'
import { minecraftTheme } from '@/app/lib/theme'

/**
 * FeedbackToast - Displays contextual hints and action confirmations
 * Two modes:
 * - "hint": Educational, larger, with title and dismiss button
 * - "toast": Quick confirmation, compact, auto-dismiss
 */
export default function FeedbackToastContainer() {
    const { toasts, removeToast } = useFeedback()

    return (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
                ))}
            </AnimatePresence>
        </div>
    )
}

interface ToastItemProps {
    toast: ToastType
    onDismiss: () => void
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
    const isHint = toast.type === 'hint'

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="pointer-events-auto"
        >
            {isHint ? (
                <HintToast toast={toast} onDismiss={onDismiss} />
            ) : (
                <QuickToast toast={toast} />
            )}
        </motion.div>
    )
}

function HintToast({ toast, onDismiss }: { toast: ToastType; onDismiss: () => void }) {
    return (
        <motion.div
            className="relative px-4 py-3 rounded-xl shadow-xl max-w-sm mx-auto"
            style={{
                background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.base}FA, ${minecraftTheme.colors.beige.light}F8)`,
                border: `3px solid ${minecraftTheme.colors.terracotta.base}`,
                boxShadow: `0 6px 0 ${minecraftTheme.colors.terracotta.dark}, 0 10px 30px rgba(0,0,0,0.3)`,
                backdropFilter: 'blur(12px)',
            }}
        >
            {/* Shine effect */}
            <div
                className="absolute top-0 left-0 right-0 h-[40%] pointer-events-none rounded-t-xl"
                style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 100%)'
                }}
            />

            {/* Content */}
            <div className="relative z-10 flex items-start gap-3">
                {/* Icon */}
                <motion.span
                    className="text-2xl flex-shrink-0"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    {toast.icon}
                </motion.span>

                {/* Text */}
                <div className="flex-1 min-w-0">
                    {toast.title && (
                        <div
                            className="text-xs font-bold uppercase tracking-wide mb-1"
                            style={{
                                color: minecraftTheme.colors.terracotta.base,
                                fontFamily: 'monospace'
                            }}
                        >
                            {toast.title}
                        </div>
                    )}
                    <p
                        className="text-sm leading-relaxed"
                        style={{
                            color: minecraftTheme.colors.text.primary,
                            fontFamily: 'monospace'
                        }}
                    >
                        {toast.message}
                    </p>
                </div>

                {/* Dismiss button */}
                {toast.dismissable && (
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onDismiss}
                        className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center"
                        style={{
                            background: minecraftTheme.colors.beige.dark,
                            border: `2px solid ${minecraftTheme.colors.terracotta.light}`,
                        }}
                    >
                        <span
                            className="text-xs font-bold"
                            style={{ color: minecraftTheme.colors.text.secondary }}
                        >
                            ✕
                        </span>
                    </motion.button>
                )}
            </div>

            {/* "Got it" button */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onDismiss}
                className="mt-3 w-full py-2 rounded-lg text-xs font-bold"
                style={{
                    background: `linear-gradient(145deg, ${minecraftTheme.colors.terracotta.base}, ${minecraftTheme.colors.terracotta.dark})`,
                    border: `2px solid ${minecraftTheme.colors.terracotta.dark}`,
                    boxShadow: `0 3px 0 ${minecraftTheme.colors.terracotta.dark}`,
                    color: '#FFF',
                    fontFamily: 'monospace',
                    textShadow: '1px 1px 0 rgba(0,0,0,0.3)'
                }}
            >
                GOT IT!
            </motion.button>

            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-2 h-2 bg-black/20 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-2 h-2 bg-black/20 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-2 h-2 bg-black/20 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-black/20 rounded-br-lg" />
        </motion.div>
    )
}

function QuickToast({ toast }: { toast: ToastType }) {
    return (
        <motion.div
            className="px-4 py-2 rounded-xl shadow-lg mx-auto flex items-center gap-2"
            style={{
                background: `linear-gradient(145deg, ${minecraftTheme.colors.beige.base}F5, ${minecraftTheme.colors.beige.light}F0)`,
                border: `2px solid ${minecraftTheme.colors.accent.green}`,
                boxShadow: `0 4px 0 ${minecraftTheme.colors.accent.greenDark}, 0 6px 16px rgba(0,0,0,0.2)`,
                backdropFilter: 'blur(8px)',
            }}
        >
            {/* Icon */}
            <span className="text-lg">{toast.icon}</span>

            {/* Message */}
            <span
                className="text-xs font-bold"
                style={{
                    color: minecraftTheme.colors.text.primary,
                    fontFamily: 'monospace'
                }}
            >
                {toast.message}
            </span>

            {/* Progress bar */}
            <motion.div
                className="absolute bottom-0 left-0 h-1 rounded-b-xl"
                style={{ background: minecraftTheme.colors.accent.green }}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: toast.duration / 1000, ease: 'linear' }}
            />
        </motion.div>
    )
}
