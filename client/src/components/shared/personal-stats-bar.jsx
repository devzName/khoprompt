import { Tag } from 'antd';

// Pill definitions — order matters for display
const PILLS = [
  { key: 'all', label: 'Tất cả', colorActive: '#1677ff', colorInactive: '#d9d9d9' },
  { key: 'approved', label: 'Đã duyệt', colorActive: '#52c41a', colorInactive: '#d9d9d9' },
  { key: 'pending', label: 'Chờ duyệt', colorActive: '#faad14', colorInactive: '#d9d9d9' },
  { key: 'draft', label: 'Nháp', colorActive: '#8c8c8c', colorInactive: '#d9d9d9' },
  { key: 'rejected', label: 'Từ chối', colorActive: '#ff4d4f', colorInactive: '#d9d9d9' },
];

/**
 * PersonalStatsBar
 * Renders clickable status filter pills with live counts.
 *
 * Props:
 *   stats        — { total, approved, pending, draft, rejected }
 *   activeStatus — currently active key ('all' | 'approved' | 'pending' | 'draft' | 'rejected')
 *   onStatusClick — (key: string) => void
 */
const PersonalStatsBar = ({ stats = {}, activeStatus = 'all', onStatusClick }) => {
  const getCount = (key) => {
    if (key === 'all') return stats.total ?? 0;
    return stats[key] ?? 0;
  };

  // We map the colors to Tailwind classes for active states.
  const activeColorClasses = {
    all: 'bg-purple-600 border-purple-600 text-white',
    approved: 'bg-green-500 border-green-500 text-white',
    pending: 'bg-yellow-500 border-yellow-500 text-white',
    draft: 'bg-gray-500 border-gray-500 text-white',
    rejected: 'bg-red-500 border-red-500 text-white',
  };

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {PILLS.map((pill) => {
        const isActive = activeStatus === pill.key;
        const count = getCount(pill.key);
        return (
          <Tag
            key={pill.key}
            aria-label={`Lọc ${pill.label}: ${count}`}
            onClick={() => onStatusClick && onStatusClick(pill.key)}
            className={`cursor-pointer touch-manipulation select-none rounded-full px-3 py-1 text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-purple-500 focus-visible:outline-none ${
              isActive
                ? activeColorClasses[pill.key]
                : 'bg-gray-100 dark:bg-[#141414] border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
            }`}
            style={{ userSelect: 'none' }}
          >
            {pill.label}
            <span
              className={`ml-1 inline-flex items-center justify-center rounded-full text-xs font-bold ${
                isActive
                  ? 'bg-white/25 text-white'
                  : 'bg-gray-200 dark:bg-[#1f1f1f] text-gray-600 dark:text-gray-400'
              }`}
              style={{
                minWidth: 20,
                padding: '0 5px',
              }}
            >
              {count}
            </span>
          </Tag>
        );
      })}
    </div>
  );
};

export default PersonalStatsBar;
