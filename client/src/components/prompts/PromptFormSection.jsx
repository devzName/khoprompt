const PromptFormSection = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-[#141414] rounded-lg p-6 mb-6 shadow-sm ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      {children}
    </div>
  );
};
export default PromptFormSection;