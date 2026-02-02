import { Form, Upload, Button, message, Card, Empty, Modal } from 'antd';
import { DeleteOutlined, CloudUploadOutlined, EyeOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PromptFormSection from './PromptFormSection';

const ImageUploadSection = () => {
  const { t } = useTranslation();
  const [previewUrls, setPreviewUrls] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [viewingIndex, setViewingIndex] = useState(null);
  const form = Form.useFormInstance();

  const handleBeforeUpload = (file, fileList) => {
    const filesToProcess = fileList || [file];
    const allowedFormats = ['image/jpeg', 'image/png'];
    let processedCount = 0;
    const newUrls = [...previewUrls];
    const newFiles = [...imageFiles];

    filesToProcess.forEach((f) => {
      if (!allowedFormats.includes(f.type)) {
        message.error(t('myPrompts.createPrompt.imageTypeError', 'Vui lòng chọn file hình ảnh (JPG, PNG)'));
        return;
      }

      const isLt5M = f.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error(t('myPrompts.createPrompt.imageSizeError', 'Hình ảnh phải nhỏ hơn 5MB'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        newUrls.push(base64);
        newFiles.push(f);
        processedCount++;

        if (processedCount === filesToProcess.length) {
          setPreviewUrls(newUrls);
          setImageFiles(newFiles);
          form.setFieldValue('images', newFiles);
        }
      };
      reader.readAsDataURL(f);
    });

    return false;
  };

  const handleRemoveImage = (index) => {
    const newUrls = previewUrls.filter((_, i) => i !== index);
    const newFiles = imageFiles.filter((_, i) => i !== index);
    setPreviewUrls(newUrls);
    setImageFiles(newFiles);
    form.setFieldValue('images', newFiles.length > 0 ? newFiles : null);
  };

  const handleViewImage = (index) => {
    setViewingIndex(index);
  };

  const handleCloseModal = () => {
    setViewingIndex(null);
  };

  return (
    <PromptFormSection title={t('myPrompts.createPrompt.imageSection', 'Hình ảnh')}>
      <Form.Item
        name="images"
        valuePropName="file"
        className="mb-0"
      >
        <div className="space-y-4">
          <Upload
            multiple
            beforeUpload={handleBeforeUpload}
            accept="image/*"
            showUploadList={false}
            style={{ width: '100%' }}
          >
            <Card
              hoverable
              className="border-2 border-dashed border-blue-300 hover:border-blue-500 transition-colors w-full"
              style={{ background: '#fafafa', width: '100%' }}
            >
              <div className="flex flex-col items-center justify-center py-8 px-4">
                <CloudUploadOutlined className="text-4xl text-blue-500 mb-3" />
                <p className="text-base font-medium text-gray-800 mb-1">
                  {t('myPrompts.createPrompt.uploadImage', 'Tải lên hình ảnh')}
                </p>
                <p className="text-sm text-gray-500">
                  {t('myPrompts.createPrompt.dragDrop', 'Kéo thả hoặc nhấp để chọn')}
                </p>
              </div>
            </Card>
          </Upload>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <p className="text-sm text-gray-700 mb-1">
              <span className="font-medium">📋 {t('myPrompts.createPrompt.imageHint', 'Yêu cầu:')}</span>
            </p>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• {t('myPrompts.createPrompt.imageFormat', 'Định dạng: JPG, PNG, GIF')}</li>
              <li>• {t('myPrompts.createPrompt.imageSize', 'Kích thước tối đa: 5MB mỗi ảnh')}</li>
            </ul>
          </div>

          {previewUrls.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">
                  {t('myPrompts.createPrompt.uploadedImages', { count: previewUrls.length })}
                </h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {previewUrls.map((url, index) => (
                  <div
                    key={index}
                    className="relative rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition-all"
                    onMouseEnter={(e) => {
                      e.currentTarget.querySelector('.overlay')?.classList.remove('hidden');
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.querySelector('.overlay')?.classList.add('hidden');
                    }}
                  >
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover block cursor-pointer"
                      onClick={() => handleViewImage(index)}
                    />
                    <div className="overlay hidden absolute inset-0 bg-opacity-20 flex items-center justify-center gap-2 z-20">
                      <Button
                        type="primary"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewImage(index)}
                      />
                      <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveImage(index)}
                      />
                    </div>
                    <span className="absolute top-1 left-1 bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded z-10">
                      {index + 1}
                    </span>
                  </div>
                ))}
              </div>

              {/* Image Preview Modal */}
              <Modal
                title={`${t('myPrompts.createPrompt.viewImage', 'Xem ảnh')} ${viewingIndex !== null ? viewingIndex + 1 : ''}`}
                open={viewingIndex !== null}
                onCancel={handleCloseModal}
                footer={null}
                width={800}
                centered
              >
                {viewingIndex !== null && (
                  <div className="flex justify-center">
                    <img
                      src={previewUrls[viewingIndex]}
                      alt={`Preview ${viewingIndex + 1}`}
                      style={{ maxWidth: '100%', maxHeight: '600px', borderRadius: '8px' }}
                    />
                  </div>
                )}
              </Modal>
            </div>
          ) : (
            <Empty
              description={t('myPrompts.createPrompt.noImages', 'Chưa có hình ảnh')}
              style={{ marginTop: '20px', marginBottom: '20px' }}
            />
          )}
        </div>
      </Form.Item>
    </PromptFormSection>
  );
};

export default ImageUploadSection;
