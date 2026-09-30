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
      {children || <span className="underline decoration-dotted decoration-[#5C6978] hover:text-[#CBFF70] transition-colors">{term}</span>}
      <HelpCircle className="w-3 h-3 text-[#5C6978] group-hover:text-[#CBFF70] transition-colors shrink-0" />

      {visible && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 rounded-lg bg-[#1B232B] text-[#F0F4F8] text-xs border border-[#2A343E] shadow-2xl z-50 pointer-events-none font-sans">
          <strong className="block text-[#CBFF70] font-semibold mb-1 text-xs font-mono">{term}</strong>
          <span className="leading-relaxed block text-[11px] text-[#9DAAB8]">{content}</span>
        </span>
      )}
    </span>
  );
};
