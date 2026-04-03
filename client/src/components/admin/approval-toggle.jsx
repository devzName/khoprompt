import { useState } from 'react';
import { Switch, App, notification } from 'antd';
import apiClient from '../../axios/apiClient';

// Props: value (bool), onChange (fn)
const ApprovalToggle = ({ value, onChange }) => {
  const { modal } = App.useApp();
  const [loading, setLoading] = useState(false);

  const handleChange = (checked) => {
    if (!checked) {
      // Confirm before turning OFF approval
      modal.confirm({
        title: 'Tắt chế độ duyệt?',
        content: 'Tắt duyệt sẽ publish tất cả prompt mới ngay lập tức mà không cần phê duyệt.',
        okText: 'Tắt duyệt',
        cancelText: 'Hủy',
        okButtonProps: { danger: true },
        onOk: () => updateSetting(false),
      });
    } else {
      updateSetting(true);
    }
  };

  const updateSetting = async (newValue) => {
    setLoading(true);
    try {
      await apiClient.put('/admin/settings/require_approval', {
        value: newValue ? 'true' : 'false',
      });
      onChange(newValue);
      notification.success({
        message: 'Cập nhật thành công',
        description: newValue ? 'Đã bật chế độ duyệt prompt.' : 'Đã tắt chế độ duyệt prompt.',
        placement: 'topRight',
      });
    } catch {
      notification.error({
        message: 'Lỗi',
        description: 'Không thể cập nhật cài đặt.',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Chế độ duyệt prompt:</span>
      <Switch
        checked={value}
        onChange={handleChange}
        loading={loading}
        checkedChildren="Bật duyệt"
        unCheckedChildren="Tắt duyệt"
      />
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {value ? 'Prompt mới sẽ chờ phê duyệt' : 'Prompt mới được publish ngay'}
      </span>
    </div>
  );
};

export default ApprovalToggle;
