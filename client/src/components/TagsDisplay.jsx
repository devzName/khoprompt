import { useState, useEffect, useRef } from 'react';
import { Tooltip } from 'antd';

const TagsDisplay = ({ tags = [], className = "" }) => {
  const [visibleTags, setVisibleTags] = useState(tags);
  const [hiddenTags, setHiddenTags] = useState([]);
  const containerRef = useRef(null);
  const [isCalculated, setIsCalculated] = useState(false);

  useEffect(() => {
    if (!tags || tags.length === 0) {
      setIsCalculated(true);
      return;
    }
    
    const calculateVisibleTags = async () => {
      if (!containerRef.current) return;
      
      // Reset to show all tags first
      setVisibleTags(tags);
      setHiddenTags([]);
      setIsCalculated(false);
      
      // Wait for render then measure
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const container = containerRef.current;
      if (!container) return;
      
      const containerHeight = container.offsetHeight;
      const singleLineHeight = 32; // Approximate height of one line with tags + gap
      
      // If content fits in one line, show all tags
      if (containerHeight <= singleLineHeight) {
        setIsCalculated(true);
        return;
      }
      
      // If content overflows, start reducing tags
      let testTags = [...tags];
      
      while (testTags.length > 1) {
        // Remove one tag and try again
        testTags = testTags.slice(0, -1);
        setVisibleTags(testTags);
        setHiddenTags(tags.slice(testTags.length));
        
        // Wait for render
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const newHeight = container.offsetHeight;
        
        if (newHeight <= singleLineHeight) {
          // Found the right number of tags
          break;
        }
      }
      
      setIsCalculated(true);
    };
    
    calculateVisibleTags();
  }, [tags]);

  if (!tags || tags.length === 0) {
    return <div className={`min-h-[28px] ${className}`}></div>;
  }

  return (
    <div 
      ref={containerRef}
      className={`flex flex-wrap gap-2 min-h-[28px] ${className} ${!isCalculated ? 'opacity-50' : 'opacity-100'} transition-opacity duration-300`}
    >
      {visibleTags.map((tag, index) => (
        <span key={index} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs rounded whitespace-nowrap">
          #{typeof tag === 'object' ? tag.name : tag}
        </span>
      ))}
      {hiddenTags.length > 0 && (
        <Tooltip 
          title={
            <div>
              <div className="font-medium mb-1">Các tags khác:</div>
              {hiddenTags.map((tag, index) => (
                <div key={index} className="text-xs">
                  #{typeof tag === 'object' ? tag.name : tag}
                </div>
              ))}
            </div>
          }
          placement="top"
        >
          <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs rounded whitespace-nowrap cursor-help">
            +{hiddenTags.length}
          </span>
        </Tooltip>
      )}
    </div>
  );
};

export default TagsDisplay;