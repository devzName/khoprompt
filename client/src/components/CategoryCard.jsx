import { ArrowRightOutlined } from '@ant-design/icons';

const CategoryCard = ({ title, icon, gradient }) => {
  return (
    <div className={`relative group rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer h-52 sm:h-56 md:h-60`}>
      <div className={`absolute inset-0 ${gradient} opacity-95 group-hover:opacity-100 transition-opacity`}></div>

      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgZmlsbD0iI2ZmZmZmZiIgZmlsbC1vcGFjaXR5PSIwLjA1IiBjeD0iMjAiIGN5PSIyMCIgcj0iMiIvPjwvZz48L3N2Zz4=')] opacity-50"></div>

      <div className="relative h-full p-5 sm:p-6 flex flex-col justify-between">
        <div className="flex justify-end">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/25 group-hover:scale-110 transition-all duration-300 border border-white/20">
            <ArrowRightOutlined className="text-white text-lg sm:text-xl" />
          </div>
        </div>

        <div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
            {title}
          </h3>
          <div className="mt-2 w-12 h-1 bg-white/40 rounded-full group-hover:w-20 transition-all duration-300"></div>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;
