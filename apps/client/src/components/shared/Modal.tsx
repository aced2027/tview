import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-bg-panel border border-border rounded-lg w-[500px] max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h3 className="font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary text-xl"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
