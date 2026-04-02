import { useState } from 'react';
import {
  FolderOutlined,
  FolderOpenOutlined,
  CaretRightOutlined,
  CaretDownOutlined,
  AppstoreOutlined,
  TeamOutlined,
  SafetyOutlined,
  CodeOutlined,
  ExperimentOutlined,
  FileSearchOutlined,
  ProjectOutlined,
  BgColorsOutlined,
  BulbOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Spin } from 'antd';
const getIcon = (name) => {
  switch (name) {
    case 'HR': return <TeamOutlined />;
    case 'Administration': return <SafetyOutlined />;
    case 'Testing': return <ExperimentOutlined />;
    case 'Development': return <CodeOutlined />;
    case 'Business Analysis': return <FileSearchOutlined />;
    case 'Project Management': return <ProjectOutlined />;
    case 'Design': return <BgColorsOutlined />;
    case 'Marketing': return <BulbOutlined />;
    case 'Data Analysis': return <BarChartOutlined />;
    default: return <AppstoreOutlined />;
  }
};
const TreeNode = ({ node, level = 0, selectedId, selectedType, onSelect, expandedNodes, onToggle }) => {
  const hasTags = node.tags && node.tags.length > 0;
  const isExpanded = expandedNodes.has(node.id);
  const isSelected = selectedType === 'category' && selectedId === node.id;
  const handleToggle = (e) => {
    e.stopPropagation();
    if (hasTags) {
      onToggle(node.id);
    }
  };
  const handleSelect = () => {
    onSelect({ type: 'category', data: node });
  };
  const handleTagSelect = (tag) => {
    onSelect({ type: 'tag', data: tag, category: node });
  };
  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-all duration-200 group ${
          isSelected
            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium'
              : 'hover:bg-gray-50 dark:hover:bg-[#1f1f1f] text-gray-700 dark:text-gray-300'
        }`}
        style={{ paddingLeft: `${level * 20 + 12}px` }}
        onClick={handleSelect}
      >
        {hasTags ? (
          <span
            onClick={handleToggle}
            className="flex items-center justify-center w-5 h-5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
            {isExpanded ? (
              <CaretDownOutlined className="text-xs text-gray-500" />
            ) : (
              <CaretRightOutlined className="text-xs text-gray-500" />
            )}
          </span>
        ) : (
          <span className="w-5" />
        )}
        <span className={`text-base ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400'}`}>
          {hasTags ? (
            isExpanded ? <FolderOpenOutlined /> : <FolderOutlined />
          ) : (
            getIcon(node.name)
          )}
        </span>
        <span className="flex-1 text-sm">{node.name}</span>
        <span
          className={`px-2 py-0.5 text-xs rounded-full ${
            isSelected
              ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-700 dark:group-hover:text-blue-400'
          }`}
        >
          {node.count}
        </span>
      </div>
      {hasTags && isExpanded && (
        <div className="mt-1">
          {node.tags.map((tag) => {
            const isTagSelected = selectedType === 'tag' && selectedId === tag.id;
            return (
              <div
                key={tag.id}
              className={`flex items-center gap-2 py-1.5 px-3 rounded-lg cursor-pointer transition-all duration-200 group ${
                isTagSelected
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium'
                  : 'hover:bg-gray-50 dark:hover:bg-[#1f1f1f] text-gray-600 dark:text-gray-300'
              }`}
                style={{ paddingLeft: `${(level + 1) * 20 + 12}px` }}
                onClick={() => handleTagSelect(tag)}
              >
                <span className="w-5" />
                <span className={`text-sm ${isTagSelected ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                  #
                </span>
                <span className="flex-1 text-sm">{tag.name}</span>
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    isTagSelected
                      ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:bg-green-100 dark:group-hover:bg-green-900/30 group-hover:text-green-700 dark:group-hover:text-green-400'
                  }`}
                >
                  {tag.count}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
const CategoryTree = ({ selectedCategory, onCategorySelect, treeData, loading }) => {
  const { t } = useTranslation();
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [selectedItem, setSelectedItem] = useState({ type: null, id: null }); // Track type (category/tag) and id
  const handleToggle = (nodeId) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };
  const handleSelect = (selection) => {
    setSelectedItem({ type: selection.type, id: selection.data.id });
    if (selection.type === 'category') {
      onCategorySelect(selection.data);
    } else if (selection.type === 'tag') {
      onCategorySelect({ ...selection.data, isTag: true, categoryId: selection.category.id });
    }
  };
  const handleSelectAll = () => {
    setSelectedItem({ type: null, id: null });
    onCategorySelect(null);
  };
  const totalCount = treeData.reduce((sum, cat) => sum + cat.count, 0);
  if (loading) {
    return (
      <div className="bg-white dark:bg-[#141414] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-8 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }
  return (
    <div className="bg-white dark:bg-[#141414] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <FolderOutlined className="text-blue-600" />
          {t('categories.title', 'Danh mục Prompts')}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {t('categories.treeHint', 'Click category để xem tất cả, click tag (#) để lọc theo tag')}
        </p>
      </div>
      <div className="p-2 max-h-[600px] overflow-y-auto">
        <div
          className={`flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-all duration-200 mb-2 ${
            selectedItem.type === null
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium'
            : 'hover:bg-gray-50 dark:hover:bg-[#1f1f1f] text-gray-700 dark:text-gray-300'
          }`}
          onClick={handleSelectAll}
        >
          <span className="w-5" />
          <span className={`text-base ${selectedItem.type === null ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
            <AppstoreOutlined />
          </span>
          <span className="flex-1 text-sm">{t('categories.all', 'Tất cả')}</span>
          <span
            className={`px-2 py-0.5 text-xs rounded-full ${
              selectedItem.type === null
                ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            {totalCount}
          </span>
        </div>
        {}
        {treeData.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            level={0}
            selectedId={selectedItem.id}
            selectedType={selectedItem.type}
            onSelect={handleSelect}
            expandedNodes={expandedNodes}
            onToggle={handleToggle}
          />
        ))}
      </div>
    </div>
  );
};
export default CategoryTree;
