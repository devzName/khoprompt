import { useTranslation } from 'react-i18next';

const ImageGallery = ({ images, title, serverUrl, isDrawer = false }) => {
  const { t } = useTranslation();

  const handleViewImage = (index) => {
    // Open image in new tab
    const imageUrl = `${serverUrl}/${images[index]}`;
    window.open(imageUrl, '_blank');
  };

  if (!images || images.length === 0) {
    return null;
  }

  const containerClass = isDrawer 
    ? "space-y-4" 
    : "bg-white dark:bg-[#141414] rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 dark:border-gray-700";

  const getGridClass = () => {
    return "grid-cols-2";
  };

  return (
    <div className={containerClass}>
      <h3 className="text-base font-medium text-gray-900 dark:text-white mb-3">
        {t('promptDetail.images', 'Hình ảnh')}
      </h3>
      
      <div className={`grid ${getGridClass()} gap-1.5`}>
        {images.map((image, index) => (
          <div 
            key={index} 
            className="relative group cursor-pointer bg-gray-50 dark:bg-[#1f1f1f] rounded-lg overflow-hidden aspect-[2/1] border border-gray-200 dark:border-gray-700"
            onClick={() => handleViewImage(index)}
          >
            <img
              src={`${serverUrl}/${image}`}
              alt={`Hình ${index + 1}`}
              className="w-full h-full object-cover transition-all"
              loading="lazy"
            />
            
            {/* Image counter */}
            <div className="absolute top-0.5 left-0.5 bg-black bg-opacity-60 text-white text-[10px] px-1 py-0.5 rounded-sm font-medium">
              {index + 1}/{images.length}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;