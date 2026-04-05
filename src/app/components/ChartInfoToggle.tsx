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
        className={`inline-flex items-center justify-center w-5 h-5 rounded-full transition-all duration-200 ${
          isOpen
            ? 'bg-[#8A1538] text-white'
            : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
        }`}
        title="Show chart info"
      >
        {isOpen ? <X className="w-3 h-3" /> : <Info className="w-3 h-3" />}
      </button>
      {isOpen && (
        <div className="absolute right-0 top-7 z-50 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl animate-in fade-in duration-150">
          <div className="text-gray-200 leading-relaxed">{description}</div>
          <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-900 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
}
