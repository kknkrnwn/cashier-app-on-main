import React from 'react';
import { HelpCircle, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmStyle?: 'rose' | 'emerald' | 'indigo';
  confirmText?: string;
  cancelText?: string;
  isWarning?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmStyle = 'rose',
  confirmText = 'Yakin',
  cancelText = 'Batal',
  isWarning = false,
}) => {
  // Color configuration depending on selected style
  const getConfirmButtonClasses = () => {
    switch (confirmStyle) {
      case 'rose':
        return 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/10 focus:ring-rose-500';
      case 'emerald':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/10 focus:ring-emerald-500';
      case 'indigo':
        return 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/10 focus:ring-indigo-500';
      default:
        return 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/10 focus:ring-rose-500';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-sm bg-white border border-gray-200 rounded-3xl p-6 shadow-2xl dark:bg-zinc-900 dark:border-zinc-800"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4.5 top-4.5 p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-slate-50 dark:hover:bg-zinc-800 dark:hover:text-zinc-350 rounded-xl transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header / Avatar Icon */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`p-3 rounded-2xl flex items-center justify-center ${
                isWarning 
                  ? 'bg-amber-50 text-amber-500 dark:bg-amber-950/20' 
                  : confirmStyle === 'rose'
                    ? 'bg-rose-50 text-rose-500 dark:bg-rose-950/20'
                    : 'bg-indigo-50 text-indigo-500 dark:bg-indigo-950/20'
              }`}>
                {isWarning ? (
                  <AlertTriangle className="h-6 w-6" />
                ) : (
                  <HelpCircle className="h-6 w-6" />
                )}
              </div>

              {/* Title & info description */}
              <div className="space-y-1.5 px-2">
                <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                  {title}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                  {message}
                </p>
              </div>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 bg-slate-50 border border-gray-200 hover:bg-slate-100 rounded-xl text-zinc-600 hover:text-zinc-900 text-xs font-bold transition-all cursor-pointer dark:bg-zinc-950/45 dark:border-zinc-800 dark:text-zinc-350 dark:hover:bg-zinc-800"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-[0.98] cursor-pointer ${getConfirmButtonClasses()}`}
              >
                {confirmText}
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
