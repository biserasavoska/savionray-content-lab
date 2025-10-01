interface StatusBadgeProps {
  status: 'NOT_STARTED' | 'ON_TRACK' | 'BEHIND_SCHEDULE' | 'COMPLETED';
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'COMPLETED':
        return {
          text: 'Completed',
          className: 'bg-green-100 text-green-800',
        };
      case 'ON_TRACK':
        return {
          text: 'On Track',
          className: 'bg-blue-100 text-blue-800',
        };
      case 'BEHIND_SCHEDULE':
        return {
          text: 'Behind Schedule',
          className: 'bg-yellow-100 text-yellow-800',
        };
      case 'NOT_STARTED':
      default:
        return {
          text: 'Not Started',
          className: 'bg-gray-100 text-gray-800',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className} ${className}`}>
      {config.text}
    </span>
  );
}
