import { useState } from 'react';
import { Modal, Input, Typography } from 'antd';

const { TextArea } = Input;
const { Text } = Typography;

// Props: open (bool), onConfirm(reason: string), onCancel()
const RejectReasonModal = ({ open, onConfirm, onCancel }) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isValid = reason.trim().length >= 10 && reason.trim().length <= 1000;

  const handleOk = async () => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      await onConfirm(reason.trim());
      setReason('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setReason('');
    onCancel();
  };

  return (
    <Modal
      title="Lý do từ chối"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="Từ chối"
      cancelText="Hủy"
      okButtonProps={{ danger: true, disabled: !isValid, loading: submitting }}
      destroyOnHide
    >
      <div className="flex flex-col gap-2 mt-2">
        <TextArea
          rows={4}
          placeholder="Nhập lý do từ chối (tối thiểu 10 ký tự)..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={1000}
          showCount
        />
        {reason.length > 0 && reason.trim().length < 10 && (
          <Text type="danger" className="text-xs">
            Lý do phải có ít nhất 10 ký tự.
          </Text>
        )}
      </div>
    </Modal>
  );
};

export default RejectReasonModal;
