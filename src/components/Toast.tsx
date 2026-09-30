import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ShieldAlert, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  type: 'success' | 'warning' | 'error' | 'injection';
  title: string;
  message?: string;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map(toast => {
        const Icon =
          toast.type === 'success'
            ? CheckCircle2
            : toast.type === 'warning'
            ? AlertTriangle
            : toast.type === 'injection'
            ? ShieldAlert
            : XCircle;

        const borderStyle =
          toast.type === 'success'
            ? 'border-[#21A67A]/30 bg-white text-[#21A67A]'
            : toast.type === 'warning'
            ? 'border-[#D99018]/30 bg-white text-[#D99018]'
            : toast.type === 'injection'
            ? 'border-[#8B5CF6]/30 bg-white text-[#8B5CF6]'
            : 'border-[#E65353]/30 bg-white text-[#E65353]';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-[8px] border shadow-xl flex items-start justify-between gap-3 text-xs transition-all duration-200 transform translate-y-0 opacity-100 ${borderStyle}`}
          >
            <div className="flex items-start gap-2.5">
              <Icon className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-[#18212F]">{toast.title}</div>
                {toast.message && <div className="text-[11px] text-[#596579] mt-0.5">{toast.message}</div>}
              </div>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-[#8A94A3] hover:text-[#18212F] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
