import { Form, Upload, Button, message, Card, Empty, Modal } from 'antd';
import { DeleteOutlined, CloudUploadOutlined, EyeOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000';

const ImageUploadSection = ({ existingImages = [] }) => {
  const { t } = useTranslation();
  const [previewUrls, setPreviewUrls] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImageUrls, setExistingImageUrls] = useState([]);
  const [keptExistingImages, setKeptExistingImages] = useState([]);
  const [viewingIndex, setViewingIndex] = useState(null);
  const form = Form.useFormInstance();

  useEffect(() => {
    if (existingImages && existingImages.length > 0) {
      const urls = existingImages.map(imagePath => `${SERVER_URL}/${imagePath}`);
      setExistingImageUrls(urls);
      setKeptExistingImages([...existingImages]);
    } else {
      setExistingImageUrls([]);
      setKeptExistingImages([]);
    }
  }, [existingImages]);

  useEffect(() => {
    form.setFieldValue('images', imageFiles);
    form.setFieldValue('existingImages', keptExistingImages);
  }, [imageFiles, keptExistingImages, form]);

  const allImages = [...existingImageUrls, ...previewUrls];
  const totalImages = allImages.length;

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
      if (f.size / 1024 / 1024 >= 5) {
        message.error(t('myPrompts.createPrompt.imageSizeError', 'Hình ảnh phải nhỏ hơn 5MB'));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        newUrls.push(e.target.result);
        newFiles.push(f);
        processedCount++;
        if (processedCount === filesToProcess.length) {
          setPreviewUrls(newUrls);
          setImageFiles(newFiles);
          form.setFieldValue('images', newFiles);
          form.setFieldValue('existingImages', keptExistingImages);
        }
      };
      reader.readAsDataURL(f);
    });

    return false;
  };

  const handleRemoveImage = (index) => {
    const existingCount = existingImageUrls.length;
    if (index < existingCount) {
      const newKeptImages = keptExistingImages.filter((_, i) => i !== index);
      setKeptExistingImages(newKeptImages);
      setExistingImageUrls(existingImageUrls.filter((_, i) => i !== index));
      form.setFieldValue('existingImages', newKeptImages);
    } else {
      const newIndex = index - existingCount;
      const newUrls = previewUrls.filter((_, i) => i !== newIndex);
      const newFiles = imageFiles.filter((_, i) => i !== newIndex);
      setPreviewUrls(newUrls);
      setImageFiles(newFiles);
      form.setFieldValue('images', newFiles);
    }
  };

  return (
    <Form.Item name="images" valuePropName="file" className="mb-0">
      <div className="space-y-4">
        <Form.Item name="existingImages" style={{ display: 'none' }}>
          <input type="hidden" />
        </Form.Item>

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
            <div className="flex flex-col items-center justify-center py-6 px-4">
              <CloudUploadOutlined aria-hidden="true" className="text-4xl text-blue-500 mb-3" />
              <p className="text-base font-medium text-gray-800 mb-1">
                {t('myPrompts.createPrompt.uploadImage', 'Tải lên hình ảnh')}
              </p>
              <p className="text-sm text-gray-500">
                {t('myPrompts.createPrompt.dragDrop', 'Kéo thả hoặc nhấp để chọn')}
              </p>
            </div>
          </Card>
        </Upload>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg p-3">
          <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">
            {t('myPrompts.createPrompt.imageHint', 'Yêu cầu:')}
          </p>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4 list-disc">
            <li>{t('myPrompts.createPrompt.imageFormat', 'Định dạng: JPG, PNG')}</li>
            <li>{t('myPrompts.createPrompt.imageSize', 'Kích thước tối đa: 5\u00a0MB mỗi ảnh')}</li>
          </ul>
        </div>

        {totalImages > 0 ? (
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {existingImageUrls.length > 0 && previewUrls.length > 0
                ? `Ảnh hiện có: ${existingImageUrls.length} | Ảnh mới: ${previewUrls.length}`
                : existingImageUrls.length > 0
                ? `Ảnh hiện có: ${existingImageUrls.length}`
                : t('myPrompts.createPrompt.uploadedImages', { count: previewUrls.length })}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {allImages.map((url, index) => {
                const isExisting = index < existingImageUrls.length;
                return (
                  <div
                    key={index}
                    className="group relative rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition-colors"
                  >
                    <img
                      src={url}
                      alt={`Ảnh ${index + 1}`}
                      className="w-full h-28 object-cover block"
                    />
                    {/* CSS-driven overlay via group-hover */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        type="primary"
                        size="small"
                        icon={<EyeOutlined aria-hidden="true" />}
                        aria-label={`Xem ảnh ${index + 1}`}
                        onClick={() => setViewingIndex(index)}
                      />
                      <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined aria-hidden="true" />}
                        aria-label={`Xóa ảnh ${index + 1}`}
                        onClick={() => handleRemoveImage(index)}
                      />
                    </div>
                    <span className={`absolute top-1 left-1 text-white text-xs font-medium px-1.5 py-0.5 rounded ${
                      isExisting ? 'bg-green-500' : 'bg-blue-500'
                    }`}>
                      {isExisting ? 'Có sẵn' : 'Mới'}
                    </span>
                  </div>
                );
              })}
            </div>

            <Modal
              title={`${t('myPrompts.createPrompt.viewImage', 'Xem ảnh')} ${viewingIndex !== null ? viewingIndex + 1 : ''}`}
              open={viewingIndex !== null}
              onCancel={() => setViewingIndex(null)}
              footer={null}
              width={800}
              centered
            >
              {viewingIndex !== null && (
                <div className="flex justify-center">
                  <img
                    src={allImages[viewingIndex]}
                    alt={`Xem ảnh ${viewingIndex + 1}`}
                    style={{ maxWidth: '100%', maxHeight: '600px', borderRadius: '8px' }}
                  />
                </div>
              )}
            </Modal>
          </div>
        ) : (
          <Empty
            description={t('myPrompts.createPrompt.noImages', 'Chưa có hình ảnh')}
            style={{ marginTop: '16px', marginBottom: '16px' }}
          />
        )}
      </div>
    </Form.Item>
  );
};

export default ImageUploadSection;
