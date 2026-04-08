import { Button, Breadcrumb } from 'antd';
import { MenuOutlined, HomeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

/**
 * Page-level header — compact, OpenRouter-style.
 * Renders breadcrumb + title + optional description + children (toolbar slots).
 * User profile lives in the global top Header.
 */
const PageHeader = ({ title, description, breadcrumb, onMenuClick, children }) => {
  const breadcrumbItems = breadcrumb
    ? [
        { title: <Link to={ROUTES.HOME}><HomeOutlined className="text-xs" /></Link> },
        { title: <span className="text-gray-500 dark:text-neutral-400 text-xs">{breadcrumb}</span> },
      ]
    : null;

  return (
    <div className="bg-white dark:bg-[#111] border-b border-gray-100 dark:border-white/[0.06] px-6 py-4 shrink-0">
      {/* Mobile: hamburger + title */}
      <div className="flex items-center gap-3 lg:hidden">
        <Button
          type="text"
          size="small"
          icon={<MenuOutlined />}
          onClick={onMenuClick}
          aria-label="Open menu"
          className="text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white"
        />
        <h1 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h1>
      </div>

      {/* Desktop: breadcrumb + title + description + children */}
      <div className="hidden lg:block">
        {breadcrumbItems && (
          <Breadcrumb items={breadcrumbItems} className="mb-2" />
        )}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-gray-400 dark:text-neutral-500 mt-0.5">{description}</p>
            )}
          </div>
          {children && (
            <div className="flex items-center gap-2 shrink-0 mt-0.5">{children}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
