const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Logo và mô tả */}
          <div>
            <a href="/" className="inline-flex items-center gap-2 mb-3">
              <img src="/logo.png" alt="Prompt Library Logo" className="w-8 h-8 object-contain shrink-0" />
              <span className="text-lg font-bold whitespace-nowrap">Prompt Library</span>
            </a>
            <p className="text-gray-400 text-sm leading-relaxed mb-3">
              Thư viện prompt AI chất lượng cao cho ChatGPT, Claude, Gemini và các AI tools khác. Tối ưu hóa công việc với prompt chuyên nghiệp.
            </p>
            <p className="text-gray-500 text-xs">
              © 2025 Prompt Library. All rights reserved.
            </p>
          </div>

          {/* Danh mục */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm">Danh mục phổ biến</h3>
            <ul className="space-y-1.5">
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Development <span className="text-gray-600">(8)</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Marketing <span className="text-gray-600">(3)</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Design <span className="text-gray-600">(3)</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Testing <span className="text-gray-600">(2)</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Xem tất cả
                </a>
              </li>
            </ul>
          </div>

          {/* Hỗ trợ */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm">Hỗ trợ</h3>
            <ul className="space-y-1.5">
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Hướng dẫn sử dụng
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Liên hệ
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Báo lỗi
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Điều khoản sử dụng
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="text-gray-500 text-xs">
              Được xây dựng với ❤️ AI Champions
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
