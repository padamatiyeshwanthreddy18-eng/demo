import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  term: string;
  content: string;
  children?: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ term, content, children }) => {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className="relative inline-flex items-center gap-1 cursor-help group"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children || <span className="underline decoration-dotted decoration-[#8A94A3] hover:text-[#168C82] transition-colors">{term}</span>}
      <HelpCircle className="w-3 h-3 text-[#8A94A3] hover:text-[#168C82] transition-colors shrink-0" />

      {visible && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-60 p-2.5 rounded-[7px] bg-[#18212F] text-white text-xs shadow-xl z-50 pointer-events-none">
          <strong className="block text-white font-semibold mb-1 text-xs">{term}</strong>
          <span className="leading-relaxed block text-[11px] text-[#CDD3DB]">{content}</span>
        </span>
      )}
    </span>
  );
};
