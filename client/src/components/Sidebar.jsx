import { Button, Tooltip } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

/**
 * Application sidebar — OpenRouter-inspired minimalist style.
 * Supports section dividers: items with { type: 'section', label: string }
 */
const Sidebar = ({ menuItems, activeTab, isMobile = false, onClose = null }) => {
  const handleMenuClick = (item) => {
    if (item.disabled) return;
    if (item.action) item.action();
    if (isMobile && onClose) onClose();
  };

  const isActive = (itemKey) =>
    itemKey === activeTab ||
    (itemKey === 'my-prompts' && activeTab === 'list') ||
    (itemKey === 'create-prompt' && activeTab === 'create') ||
    (itemKey === 'manage' && activeTab === 'manage') ||
    (itemKey === 'login-management' && activeTab === 'login-management') ||
    (itemKey === 'review-prompts' && activeTab === 'review') ||
    (itemKey === 'dashboard' && activeTab === 'dashboard');

  const renderItem = (item) => {
    if (item.type === 'section') {
      return (
        <div key={item.label} className="pt-4 pb-1 px-3">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-neutral-500">
            {item.label}
          </span>
        </div>
      );
    }

    const active = isActive(item.key);
    const baseClass = `flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-150 cursor-pointer`;
    const stateClass = active
      ? 'bg-gray-100 dark:bg-white/[0.07] text-gray-900 dark:text-white font-medium'
      : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/[0.04]';

    return (
      <button
        key={item.key}
        onClick={() => handleMenuClick(item)}
        className={`${baseClass} ${stateClass}`}
        aria-current={active ? 'page' : undefined}
      >
        <span className="text-base flex-shrink-0 leading-none">{item.icon}</span>
        <span className="truncate">{item.label}</span>
      </button>
    );
  };

  // Mobile sidebar
  if (isMobile) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-[#111]">
        {onClose && (
          <div className="flex justify-end px-3 pt-3 pb-2 border-b border-gray-100 dark:border-white/[0.06]">
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              onClick={onClose}
              aria-label="Close menu"
              className="text-gray-400 hover:text-gray-900 dark:text-neutral-500 dark:hover:text-white"
            />
          </div>
        )}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {menuItems.map(renderItem)}
        </nav>
      </div>
    );
  }

  // Desktop sidebar — fixed width, no collapse
  return (
    <div className="w-52 flex-shrink-0 h-full bg-white dark:bg-[#111] border-r border-gray-100 dark:border-white/[0.06] flex flex-col">
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {menuItems.map((item) =>
          item.type === 'section' ? renderItem(item) : (
            <Tooltip key={item.key} title="" placement="right">
              {renderItem(item)}
            </Tooltip>
          )
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
