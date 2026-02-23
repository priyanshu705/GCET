'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/lib/ToastContext';

const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
};

export default function ToastContainer() {
    const { toasts, removeToast } = useToast();
    const [exitingIds, setExitingIds] = useState<Set<string>>(new Set());

    const handleRemove = (id: string) => {
        setExitingIds(prev => new Set([...prev, id]));
        setTimeout(() => {
            removeToast(id);
            setExitingIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }, 300);
    };

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`toast toast-${toast.type} ${exitingIds.has(toast.id) ? 'toast-exit' : ''}`}
                    onClick={() => handleRemove(toast.id)}
                >
                    <span className="text-xl">{icons[toast.type]}</span>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{toast.title}</p>
                        {toast.message && (
                            <p className="text-xs opacity-80 truncate">{toast.message}</p>
                        )}
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleRemove(toast.id); }}
                        className="opacity-60 hover:opacity-100 text-lg"
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
}
