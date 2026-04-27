import { useEffect, useState, useCallback } from 'react'
import { CheckCircle2, XCircle, X } from 'lucide-react'

export function Toast({ toasts, removeToast }) {
    return (
        <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-xs w-full pointer-events-none">
            {toasts.map(t => (
                <ToastItem key={t.id} toast={t} onRemove={() => removeToast(t.id)} />
            ))}
        </div>
    )
}

function ToastItem({ toast, onRemove }) {
    useEffect(() => {
        const t = setTimeout(onRemove, 4000)
        return () => clearTimeout(t)
    }, [onRemove])

    const ok = toast.type === 'success'

    return (
        <div className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-2xl shadow-lg border animate-slide-right
      ${ok
                ? 'bg-white border-stone-200 text-stone-800'
                : 'bg-white border-red-200 text-red-700'
            }`}
        >
            {ok
                ? <CheckCircle2 size={17} className="text-emerald-500 shrink-0 mt-0.5" />
                : <XCircle size={17} className="text-red-500 shrink-0 mt-0.5" />
            }
            <p className="text-sm flex-1 leading-snug">{toast.message}</p>
            <button onClick={onRemove} className="text-stone-300 hover:text-stone-500 transition-colors shrink-0 mt-0.5">
                <X size={14} />
            </button>
        </div>
    )
}

export function useToast() {
    const [toasts, setToasts] = useState([])
    const addToast = useCallback((message, type = 'success') => {
        const id = Date.now().toString()
        setToasts(prev => [...prev, { id, message, type }])
    }, [])
    const removeToast = useCallback(id => setToasts(prev => prev.filter(t => t.id !== id)), [])
    return { toasts, addToast, removeToast }
}
