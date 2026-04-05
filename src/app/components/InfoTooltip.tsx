import { Info } from 'lucide-react';
import { useState } from 'react';

interface InfoTooltipProps {
  id: string;
  title: string;
  description: string;
  activeTooltip: string | null;
  onShow: (id: string) => void;
  onHide: () => void;
}

export function InfoTooltip({ id, title, description, activeTooltip, onShow, onHide }: InfoTooltipProps) {
  return (
    <div className="relative inline-block">
      <Info 
        className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
        onMouseEnter={() => onShow(id)}
        onMouseLeave={onHide}
      />
      {activeTooltip === id && (
        <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
          <div className="font-semibold mb-1.5">{title}</div>
          <div className="text-gray-200 leading-relaxed">{description}</div>
          <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
}
