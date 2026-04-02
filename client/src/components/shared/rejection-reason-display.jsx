import { Alert, Button } from 'antd';
import { RedoOutlined } from '@ant-design/icons';

/**
 * RejectionReasonDisplay
 * Shows the rejection reason for a rejected prompt with a resubmit action.
 *
 * Props:
 *   reason     — string: rejection reason text (renders nothing if falsy)
 *   onResubmit — () => void: callback when user clicks "Sửa & gửi lại"
 */
const RejectionReasonDisplay = ({ reason, onResubmit }) => {
  if (!reason) return null;

  return (
    <Alert
      type="warning"
      showIcon
      className="mt-2 mb-1"
      message={
        <span className="font-medium text-sm">Lý do từ chối</span>
      }
      description={
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
          <span className="text-sm text-gray-700 flex-1">{reason}</span>
          <Button
            type="primary"
            size="small"
            icon={<RedoOutlined />}
            onClick={onResubmit}
            aria-label="Sửa và gửi lại prompt này"
            className="shrink-0"
          >
            Sửa &amp; gửi lại
          </Button>
        </div>
      }
    />
  );
};

export default RejectionReasonDisplay;
