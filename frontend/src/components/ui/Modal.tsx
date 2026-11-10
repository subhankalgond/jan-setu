import React, { useEffect } from 'react';
import { GovIcon } from './GovIcon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
        aria-hidden="true"
      />
      <div className={`relative w-full ${maxWidthClass} bg-[#FDFBF7] border border-[#D5CEBF] rounded-lg shadow-xl overflow-hidden z-10 my-8`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2DCCE] bg-[#FAF6F0]">
          <h3 className="text-lg font-bold text-[#0F1E36]">{title}</h3>
          <button
            onClick={onClose}
            className="text-[#64748B] hover:text-[#0F1E36] rounded p-1 transition-colors"
            aria-label="Close dialog"
          >
            <GovIcon name="x-mark" className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

