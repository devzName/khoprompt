import { Avatar, Dropdown } from 'antd';

const UserProfile = ({ user, menuItems, placement = 'topRight', size = 40 }) => {
  if (!user) return null;

  return (
    <Dropdown menu={{ items: menuItems }} placement={placement} trigger={['click']}>
      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
        <Avatar size={size} src={user?.picture} className="shrink-0">
          {user?.name?.[0] || 'U'}
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {user?.name || 'User'}
          </div>
          <div className="text-xs text-gray-500 truncate">
            {user?.email || 'user@example.com'}
          </div>
        </div>
      </div>
    </Dropdown>
  );
};

export default UserProfile;