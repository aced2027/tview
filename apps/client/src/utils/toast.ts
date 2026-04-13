type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

let toasts: Toast[] = [];
let listeners: ((toasts: Toast[]) => void)[] = [];

export const toast = {
  success: (message: string) => showToast(message, 'success'),
  error: (message: string) => showToast(message, 'error'),
  info: (message: string) => showToast(message, 'info'),
  warning: (message: string) => showToast(message, 'warning'),
  
  subscribe: (listener: (toasts: Toast[]) => void) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }
};

function showToast(message: string, type: ToastType) {
  const id = Date.now().toString();
  const newToast = { id, message, type };
  
  toasts = [...toasts, newToast];
  notifyListeners();
  
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id);
    notifyListeners();
  }, 3000);
}

function notifyListeners() {
  listeners.forEach(listener => listener(toasts));
}
