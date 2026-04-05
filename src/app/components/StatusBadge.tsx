interface StatusBadgeProps {
  status: 'on-track' | 'at-risk' | 'critical' | 'completed' | 'delayed' | 'upcoming' | 'open' | 'mitigated' | 'closed';
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const statusConfig = {
    'on-track': { label: 'On Track', color: 'bg-green-100 text-green-800 border-green-200' },
    'at-risk': { label: 'At Risk', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    'critical': { label: 'Critical', color: 'bg-red-100 text-red-800 border-red-200' },
    'completed': { label: 'Completed', color: 'bg-green-100 text-green-800 border-green-200' },
    'delayed': { label: 'Delayed', color: 'bg-red-100 text-red-800 border-red-200' },
    'upcoming': { label: 'Upcoming', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    'open': { label: 'Open', color: 'bg-red-100 text-red-800 border-red-200' },
    'mitigated': { label: 'Mitigated', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    'closed': { label: 'Closed', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${config.color} ${sizeClasses[size]}`}>
      {config.label}
    </span>
  );
}
