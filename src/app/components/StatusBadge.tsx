import { useLanguage } from '../contexts/LanguageContext';

interface StatusBadgeProps {
  status: 'on-track' | 'at-risk' | 'critical' | 'completed' | 'delayed' | 'upcoming' | 'open' | 'mitigated' | 'closed';
  size?: 'sm' | 'md' | 'lg';
}

const statusKeyMap: Record<string, string> = {
  'on-track': 'exec.onTrack',
  'at-risk': 'exec.atRisk',
  'critical': 'exec.critical',
  'completed': 'exec.completed',
  'delayed': 'exec.delayed',
  'upcoming': 'ms.upcoming',
  'open': 'statusBadge.open',
  'mitigated': 'statusBadge.mitigated',
  'closed': 'statusBadge.closed',
};

const statusColors: Record<string, string> = {
  'on-track': 'bg-green-100 text-green-800 border-green-200',
  'at-risk': 'bg-amber-100 text-amber-800 border-amber-200',
  'critical': 'bg-red-100 text-red-800 border-red-200',
  'completed': 'bg-green-100 text-green-800 border-green-200',
  'delayed': 'bg-red-100 text-red-800 border-red-200',
  'upcoming': 'bg-blue-100 text-blue-800 border-blue-200',
  'open': 'bg-red-100 text-red-800 border-red-200',
  'mitigated': 'bg-amber-100 text-amber-800 border-amber-200',
  'closed': 'bg-gray-100 text-gray-800 border-gray-200',
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const { t } = useLanguage();

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const color = statusColors[status];
  const label = t(statusKeyMap[status]);

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${color} ${sizeClasses[size]}`}>
      {label}
    </span>
  );
}
