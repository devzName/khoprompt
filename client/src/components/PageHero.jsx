const PageHero = ({ title, description, breadcrumb, stats }) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {breadcrumb && (
            <nav className="text-blue-200 text-sm mb-4">
              {breadcrumb}
            </nav>
          )}
          <h1 className="text-4xl font-bold mb-4 capitalize">{title}</h1>
          <p className="text-blue-100 text-lg mb-6 max-w-2xl mx-auto">
            {description}
          </p>
          {stats && (
            <div className="flex items-center justify-center gap-2 text-blue-200">
              <span className="w-4 h-4 bg-blue-400 rounded-full flex items-center justify-center">
                <span className="text-xs">📊</span>
              </span>
              <span>{stats}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHero;