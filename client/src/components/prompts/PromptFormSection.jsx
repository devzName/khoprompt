const PromptFormSection = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-[#141414] rounded-xl p-6 mb-6 shadow-sm border border-gray-100 dark:border-gray-800 ${className}`}>
      {title && (
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};
export default PromptFormSection;