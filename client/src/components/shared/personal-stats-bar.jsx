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
            className="cursor-pointer select-none rounded-full px-3 py-1 text-sm font-medium transition-all"
            style={{
              backgroundColor: isActive ? pill.colorActive : '#f5f5f5',
              color: isActive ? '#fff' : '#595959',
              border: isActive ? `1px solid ${pill.colorActive}` : '1px solid #d9d9d9',
              userSelect: 'none',
            }}
          >
            {pill.label}
            <span
              className="ml-1 inline-flex items-center justify-center rounded-full text-xs font-bold"
              style={{
                backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#e8e8e8',
                color: isActive ? '#fff' : '#595959',
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
