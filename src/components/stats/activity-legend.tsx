'use client';

export default function ActivityLegend() {
  const levels = [
    { level: 0, label: '없음', color: 'bg-zinc-100 dark:bg-zinc-800' },
    { level: 1, label: '1-2', color: 'bg-blue-200 dark:bg-blue-900' },
    { level: 2, label: '3-4', color: 'bg-blue-400 dark:bg-blue-700' },
    { level: 3, label: '5-7', color: 'bg-blue-600 dark:bg-blue-400' },
    { level: 4, label: '8+', color: 'bg-blue-800 dark:bg-blue-300' },
  ];

  return (
    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
      <span>Less</span>
      <div className="flex gap-1">
        {levels.map((level) => (
          <div
            key={level.level}
            className={`w-3 h-3 rounded-sm ${level.color}`}
            title={level.label}
          />
        ))}
      </div>
      <span>More</span>
    </div>
  );
}
