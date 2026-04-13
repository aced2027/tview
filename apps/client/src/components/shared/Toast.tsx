import { useEffect, useState } from 'react';
import { toast } from '../../utils/toast';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    return toast.subscribe(setToasts);
  }, []);

  const colors = {
    success: 'bg-accent-bull',
    error: 'bg-accent-bear',
    info: 'bg-accent-info',
    warning: 'bg-yellow-600'
  };

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`${colors[t.type]} text-white px-4 py-3 rounded shadow-lg text-sm animate-slide-in`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
