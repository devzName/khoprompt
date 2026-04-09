import { useState, useEffect } from 'react';
import { Modal } from 'antd';
import DOMPurify from 'dompurify';
import { getPublicNotifications } from '../services/notificationService';

const STORAGE_KEY = 'seen_noti_modal_ids';
const MAX_SEEN = 200;

const getSeenIds = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
};

const markSeen = (id) => {
  const seen = getSeenIds();
  if (!seen.includes(id)) {
    const updated = [...seen, id].slice(-MAX_SEEN);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
};

const NotificationModal = () => {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    (async () => {
      const notis = await getPublicNotifications();
      const modals = notis.filter(n => n.show_as_modal);
      const seen = getSeenIds();
      const unseen = modals.find(n => !seen.includes(n.id));
      if (unseen) setNotification(unseen);
    })();
  }, []);

  if (!notification) return null;

  const handleClose = () => {
    markSeen(notification.id);
    setNotification(null);
  };

  return (
    <Modal
      title={notification.title}
      open={true}
      onCancel={handleClose}
      onOk={handleClose}
      okText="Got it"
    >
      <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(notification.content) }} />
    </Modal>
  );
};

export default NotificationModal;
