import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

// Inject scoped styles for CKEditor inside modal (runs once)
if (!document.head.querySelector('[data-noti-ck]')) {
  const style = document.createElement('style');
  style.setAttribute('data-noti-ck', '1');
  style.textContent = `
    .notification-ck-editor .ck-editor__editable {
      min-height: 160px;
      max-height: 300px;
      overflow-y: auto;
    }
  `;
  document.head.appendChild(style);
}

const NotificationEditor = ({ value, onChange }) => (
  <div className="notification-ck-editor">
    <CKEditor
      editor={ClassicEditor}
      config={{
        placeholder: 'Write notification content...',
        toolbar: [
          'bold', 'italic', 'underline', '|',
          'fontColor', 'fontBackgroundColor', '|',
          'bulletedList', 'numberedList', '|',
          'link', 'blockQuote', '|',
          'undo', 'redo',
        ],
      }}
      data={value || ''}
      onChange={(_, editor) => onChange?.(editor.getData())}
    />
  </div>
);

export default NotificationEditor;
