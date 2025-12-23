import { mockPrompts } from '../data/mockPrompts';

const CategorySidebar = ({ currentCategory }) => {
  const allCategories = [...new Set(mockPrompts.map(prompt => prompt.category))];
  const categoryCounts = allCategories.map(cat => ({
    name: cat,
    count: mockPrompts.filter(p => p.category === cat).length
  }));

  const allTags = [...new Set(mockPrompts.flatMap(prompt => prompt.tags || []))];
  const popularTags = allTags.slice(0, 8);

  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Danh mục liên quan</h3>
        <ul className="space-y-2">
          {categoryCounts.map((cat) => (
            <li key={cat.name}>
              <a 
                href={`/category/${cat.name.toLowerCase()}`}
                className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                  cat.name.toLowerCase() === currentCategory?.toLowerCase()
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{cat.name}</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {cat.count}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags phổ biến</h3>
        <div className="flex flex-wrap gap-2">
          {popularTags.map((tag) => (
            <span 
              key={tag}
              className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full cursor-pointer hover:bg-blue-100 transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategorySidebar;