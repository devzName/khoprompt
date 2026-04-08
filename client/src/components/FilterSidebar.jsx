import { Radio, Checkbox, Button, Divider } from 'antd';
import { FilterOutlined, ReloadOutlined } from '@ant-design/icons';

/**
 * Filter sidebar for Skills and Prompts pages
 */
const FilterSidebar = ({ 
  type = 'skills', // 'skills' or 'prompts'
  categories = [],
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  onReset,
  isMobile = false 
}) => {
  const skillSortOptions = [
    { label: 'Latest', value: 'latest' },
    { label: 'Most Popular', value: 'popular' },
    { label: 'Most Liked', value: 'liked' },
  ];

  const promptSortOptions = [
    { label: 'Latest', value: 'latest' },
    { label: 'Popular', value: 'popular' },
    { label: 'Featured', value: 'featured' },
  ];

  const sortOptions = type === 'skills' ? skillSortOptions : promptSortOptions;

  return (
    <div className={`${isMobile ? 'w-full' : 'w-64'} flex-shrink-0 h-full bg-white dark:bg-[#111] border-r border-gray-100 dark:border-white/[0.06] flex flex-col p-6`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FilterOutlined className="text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
        </div>
        <Button 
          type="text" 
          size="small" 
          icon={<ReloadOutlined />}
          onClick={onReset}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          Reset
        </Button>
      </div>

      {/* Sort By */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Sort By</h4>
        <Radio.Group 
          value={sortBy} 
          onChange={(e) => onSortChange(e.target.value)}
          className="flex flex-col gap-2"
        >
          {sortOptions.map(option => (
            <Radio 
              key={option.value} 
              value={option.value}
              className="text-gray-600 dark:text-gray-400"
            >
              {option.label}
            </Radio>
          ))}
        </Radio.Group>
      </div>

      <Divider className="my-4 border-gray-100 dark:border-white/[0.06]" />

      {/* Categories */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Categories</h4>
        <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
          <div
            onClick={() => onCategoryChange(null)}
            className={`px-3 py-2 rounded-lg cursor-pointer transition-colors ${
              !selectedCategory 
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
          >
            All {type === 'skills' ? 'Skills' : 'Prompts'}
          </div>
          {categories.map(cat => (
            <div
              key={type === 'skills' ? cat : cat.id}
              onClick={() => onCategoryChange(type === 'skills' ? cat : cat.id)}
              className={`px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                selectedCategory === (type === 'skills' ? cat : cat.id)
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              {type === 'skills' ? cat : cat.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
