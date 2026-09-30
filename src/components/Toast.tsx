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
    <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full font-sans">
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
            ? 'border-[#69E2AD]/40 text-[#69E2AD]'
            : toast.type === 'warning'
            ? 'border-[#FFD080]/40 text-[#FFD080]'
            : toast.type === 'injection'
            ? 'border-[#AB98FF]/40 text-[#AB98FF]'
            : 'border-[#FF8585]/40 text-[#FF8585]';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-lg border bg-[#151B21] shadow-2xl flex items-start justify-between gap-3 text-xs transition-all duration-200 transform translate-y-0 opacity-100 ${borderStyle}`}
          >
            <div className="flex items-start gap-2.5">
              <Icon className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-[#F0F4F8]">{toast.title}</div>
                {toast.message && <div className="text-[11px] text-[#9DAAB8] mt-0.5 font-mono">{toast.message}</div>}
              </div>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-[#5C6978] hover:text-[#F0F4F8] cursor-pointer p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
