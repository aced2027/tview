import { ReactNode, useState, useRef, useEffect } from 'react';

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
}

export function Dropdown({ trigger, children }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-bg-panel border border-border rounded shadow-lg z-50 min-w-[150px]">
          {children}
        </div>
      )}
    </div>
  );
}
