interface ContentStageCountsProps {
  ideasCount: number;
  draftsCount: number;
  approvedCount: number;
  deliveredCount: number;
  totalItems: number;
  className?: string;
}

export default function ContentStageCounts({
  ideasCount,
  draftsCount,
  approvedCount,
  deliveredCount,
  totalItems,
  className = ''
}: ContentStageCountsProps) {
  const stages = [
    { label: 'Ideas', count: ideasCount, color: 'text-blue-600' },
    { label: 'Drafts', count: draftsCount, color: 'text-yellow-600' },
    { label: 'Approved', count: approvedCount, color: 'text-purple-600' },
    { label: 'Delivered', count: deliveredCount, color: 'text-green-600' },
  ];

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="text-sm font-medium text-gray-700">Content Progress</div>
      <div className="grid grid-cols-2 gap-2">
        {stages.map((stage) => (
          <div key={stage.label} className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{stage.label}</span>
            <span className={`text-sm font-medium ${stage.color}`}>
              {stage.count}/{totalItems}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
