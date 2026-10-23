import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircleIcon, WarningIcon, CloseIcon } from '../components/Icons';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 rounded-xl border-2 border-[#3A0F34] px-4 py-3 shadow-[4px_4px_0px_#3A0F34] text-sm font-black animate-slide-up max-w-sm ${
              t.type === 'error'
                ? 'bg-rose-100 text-rose-950'
                : 'bg-[#EAAA00] text-[#3A0F34]'
            }`}
          >
            <span className="shrink-0">
              {t.type === 'error' ? (
                <WarningIcon className="w-4 h-4 text-rose-800" />
              ) : (
                <CheckCircleIcon className="w-4 h-4 text-[#3A0F34]" />
              )}
            </span>
            <span className="flex-1 font-bold">{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 p-1 text-[#3A0F34] hover:bg-[#3A0F34]/15 rounded border border-[#3A0F34] transition-colors"
              aria-label="Dismiss notification"
            >
              <CloseIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
