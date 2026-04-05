import { Info, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface ChartInfoToggleProps {
  description: string;
}

export function ChartInfoToggle({ description }: ChartInfoToggleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative inline-flex" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 border ${
          isOpen
            ? 'bg-[#8A1538] text-white border-[#8A1538] shadow-md'
            : 'bg-gray-50 text-gray-500 border-gray-300 hover:bg-[#8A1538]/10 hover:text-[#8A1538] hover:border-[#8A1538]/40'
        }`}
        title="Show chart info"
      >
        {isOpen ? <X className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
      </button>
      {isOpen && (
        <div className="absolute right-0 top-9 z-50 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl animate-in fade-in duration-150">
          <div className="text-gray-200 leading-relaxed">{description}</div>
          <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-900 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
}
