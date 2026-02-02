import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const ImageGallery = ({ images, title, serverUrl, isDrawer = false }) => {
  const { t } = useTranslation();
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [failedImages, setFailedImages] = useState(new Set());

  const handleImageLoad = (index) => {
    setLoadedImages(prev => new Set([...prev, index]));
  };

  const handleImageError = (index) => {
    setFailedImages(prev => new Set([...prev, index]));
  };

  if (!images || images.length === 0) {
    return null;
  }

  // Style for drawer vs page
  const containerClass = isDrawer 
    ? "space-y-4" // Drawer style - no background, just spacing
    : "bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200"; // Page style

  const headerClass = isDrawer
    ? "text-lg font-semibold text-gray-900 mb-3 border-l-4 border-green-500 pl-3" // Drawer header style
    : "text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"; // Page header style

  return (
    <div className={containerClass}>
      <h3 className={headerClass}>
        {!isDrawer && <div className="w-1 h-6 bg-green-600 rounded-full"></div>}
        {t('promptDetail.images', 'Hình ảnh')}
      </h3>
      
      <div className="space-y-4">
        {images.map((image, index) => (
          <div key={index} className="relative">
            {!failedImages.has(index) ? (
              <div className={`relative rounded-xl overflow-hidden ${isDrawer ? 'bg-gray-50' : 'bg-gray-50'}`}>
                {/* Loading placeholder */}
                {!loadedImages.has(index) && (
                  <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
                    <div className="text-gray-400 text-sm">Đang tải ảnh...</div>
                  </div>
                )}
                
                <img
                  src={`${serverUrl}/${image}`}
                  alt={`${title} - Hình ${index + 1}`}
                  className={`w-full h-auto object-contain transition-opacity duration-300 ${
                    loadedImages.has(index) ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => handleImageLoad(index)}
                  onError={() => handleImageError(index)}
                  loading="lazy"
                />
              </div>
            ) : (
              /* Error placeholder */
              <div className={`w-full h-32 rounded-xl flex items-center justify-center text-gray-500 ${
                isDrawer ? 'bg-gray-100' : 'bg-gray-100'
              }`}>
                <div className="text-center">
                  <div className="text-2xl mb-2">⚠️</div>
                  <div className="text-sm">Không thể tải ảnh</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;