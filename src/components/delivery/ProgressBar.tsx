interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
  showText?: boolean;
}

export default function ProgressBar({ current, total, className = '', showText = true }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-1">
        {showText && (
          <span className="text-sm font-medium text-gray-700">
            {current}/{total} items
          </span>
        )}
        <span className="text-sm text-gray-500">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
