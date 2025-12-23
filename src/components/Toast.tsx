'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 3000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      setToasts((prev) => [...prev, { id, type, message, duration }]);

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, duration?: number) => showToast(message, 'success', duration),
    [showToast]
  );

  const error = useCallback(
    (message: string, duration?: number) => showToast(message, 'error', duration),
    [showToast]
  );

  const info = useCallback(
    (message: string, duration?: number) => showToast(message, 'info', duration),
    [showToast]
  );

  const warning = useCallback(
    (message: string, duration?: number) => showToast(message, 'warning', duration),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      {typeof window !== 'undefined' &&
        createPortal(
          <div className="fixed top-4 right-4 z-[100] space-y-3">
            <AnimatePresence>
              {toasts.map((toast) => (
                <ToastItem
                  key={toast.id}
                  toast={toast}
                  onClose={() => removeToast(toast.id)}
                />
              ))}
            </AnimatePresence>
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

const toastStyles: Record<ToastType, { bg: string; icon: string; border: string }> = {
  success: {
    bg: 'bg-green-50',
    icon: '✓',
    border: 'border-green-200',
  },
  error: {
    bg: 'bg-red-50',
    icon: '✕',
    border: 'border-red-200',
  },
  info: {
    bg: 'bg-blue-50',
    icon: 'ℹ',
    border: 'border-blue-200',
  },
  warning: {
    bg: 'bg-yellow-50',
    icon: '⚠',
    border: 'border-yellow-200',
  },
};

const iconColors: Record<ToastType, string> = {
  success: 'bg-green-500 text-white',
  error: 'bg-red-500 text-white',
  info: 'bg-blue-500 text-white',
  warning: 'bg-yellow-500 text-white',
};

function ToastItem({ toast, onClose }: ToastItemProps) {
  const style = toastStyles[toast.type];
  const iconColor = iconColors[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      className={`flex items-center gap-3 p-4 pr-10 rounded-xl border shadow-lg max-w-sm ${style.bg} ${style.border}`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${iconColor}`}>
        {style.icon}
      </div>
      <p className="text-gray-700 text-sm">{toast.message}</p>
      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>
    </motion.div>
  );
}

// Standalone Toast Component for non-provider usage
interface StandaloneToastProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  type?: ToastType;
  duration?: number;
}

export function StandaloneToast({
  isOpen,
  onClose,
  message,
  type = 'info',
  duration = 3000,
}: StandaloneToastProps) {
  const style = toastStyles[type];
  const iconColor = iconColors[type];

  // Auto close
  if (isOpen && duration > 0) {
    setTimeout(onClose, duration);
  }

  if (typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 p-4 pr-10 rounded-xl border shadow-lg ${style.bg} ${style.border}`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${iconColor}`}>
            {style.icon}
          </div>
          <p className="text-gray-700 text-sm">{message}</p>
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
