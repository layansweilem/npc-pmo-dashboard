import { ReactNode, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  status?: 'healthy' | 'attention' | 'critical';
  subtitle?: string;
  icon?: ReactNode;
  tooltip?: string;
  calculation?: string;
}

export function KPICard({ 
  title, 
  value, 
  trend, 
  trendValue, 
  status = 'healthy',
  subtitle,
  icon,
  tooltip,
  calculation
}: KPICardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const statusColors = {
    healthy: 'border-green-500/20 bg-green-500/5',
    attention: 'border-amber-500/20 bg-amber-500/5',
    critical: 'border-red-500/20 bg-red-500/5',
  };

  const statusTextColors = {
    healthy: 'text-green-600',
    attention: 'text-amber-600',
    critical: 'text-red-600',
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-500',
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <div 
      className={`relative rounded-lg border p-2 ${statusColors[status]} hover:shadow-md transition-shadow`}
      title={tooltip}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-1 mb-0.5">
            {icon && <div className="text-gray-600">{icon}</div>}
            <p className="text-[10px] font-medium text-gray-600">{title}</p>
            {calculation && (
              <div className="relative">
                <Info 
                  className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                />
                {showTooltip && (
                  <div className="absolute left-0 top-6 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                    <div className="font-semibold mb-1">How it's calculated:</div>
                    <div className="text-gray-200">{calculation}</div>
                    <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-baseline gap-1">
            <p className={`text-lg font-semibold ${statusTextColors[status]}`}>
              {value}
            </p>
            {trend && trendValue && (
              <div className={`flex items-center gap-0.5 text-[10px] ${trendColors[trend]}`}>
                <TrendIcon className="w-3 h-3" />
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          {subtitle && (
            <p className="text-[9px] text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}