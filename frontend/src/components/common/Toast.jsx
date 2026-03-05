import React, { useState, useCallback } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react'

// Simple in-app toast system
// Usage: import { useToast } from './Toast'; then const toast = useToast(); toast.success('Done!')

const ToastContext = React.createContext(null)

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now()
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, duration)
    }, [])

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const toast = {
        success: (msg) => addToast(msg, 'success'),
        error: (msg) => addToast(msg, 'error'),
        info: (msg) => addToast(msg, 'info'),
        warning: (msg) => addToast(msg, 'warning'),
    }

    const typeStyles = {
        success: { background: 'linear-gradient(135deg, #059669, #065f46)', icon: <CheckCircle2 size={18} /> },
        error: { background: 'linear-gradient(135deg, #dc2626, #991b1b)', icon: <XCircle size={18} /> },
        warning: { background: 'linear-gradient(135deg, #d97706, #92400e)', icon: <AlertTriangle size={18} /> },
        info: { background: 'linear-gradient(135deg, #2563eb, #1e40af)', icon: <Info size={18} /> },
    }

    return (
        <ToastContext.Provider value={toast}>
            {children}
            {/* Toast Container */}
            <div style={{
                position: 'fixed',
                bottom: '1.5rem',
                right: '1.5rem',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                pointerEvents: 'none'
            }}>
                {toasts.map(t => (
                    <div
                        key={t.id}
                        onClick={() => removeToast(t.id)}
                        style={{
                            ...typeStyles[t.type],
                            color: 'white',
                            padding: '0.75rem 1.25rem',
                            borderRadius: '10px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            minWidth: '280px',
                            maxWidth: '380px',
                            pointerEvents: 'all',
                            cursor: 'pointer',
                            animation: 'slideIn 0.3s ease',
                            fontSize: '0.9rem',
                            fontWeight: '500'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {typeStyles[t.type].icon}
                        </div>
                        <span style={{ flex: 1 }}>{t.message}</span>
                        <span style={{ opacity: 0.7, fontSize: '1rem', lineHeight: 1 }}>×</span>
                    </div>
                ))}
            </div>
            <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
      `}</style>
        </ToastContext.Provider>
    )
}

export function useToast() {
    const ctx = React.useContext(ToastContext)
    if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
    return ctx
}
