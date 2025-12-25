export const mockPrompts = [
  {
    id: 1,
    title: 'User Interview Questions',
    description: 'Bộ câu hỏi phỏng vấn người dùng để thu thập insights',
    category: 'Business Analysis',
    tags: ['interview', 'user research', 'insights'],
    rating: 4.7,
    uses: 650,
    author: 'UX Researcher',
    featured: false,
    views: 2800,
    likes: 340,
    dislikes: 15,
    fullDescription: 'Bộ câu hỏi phỏng vấn người dùng được thiết kế để thu thập insights sâu sắc về trải nghiệm và nhu cầu của khách hàng.',
    content: `Prompt: User Interview Question Generator

Hướng dẫn sử dụng:
1. Xác định mục tiêu nghiên cứu
2. Thay [PRODUCT/SERVICE] bằng sản phẩm cụ thể
3. Customize theo đối tượng người dùng

Template:
Tạo bộ câu hỏi phỏng vấn cho [PRODUCT/SERVICE] nhắm đến [TARGET_USER]

Output mong muốn: Danh sách câu hỏi có cấu trúc và logic`
  },
  {
    id: 2,
    title: 'Code Review Assistant',
    description: 'Review code và đưa ra gợi ý cải thiện chất lượng',
    category: 'Development',
    tags: ['code review', 'quality', 'best practices'],
    rating: 4.8,
    uses: 890,
    author: 'Senior Dev',
    featured: false,
    views: 4200,
    likes: 520,
    dislikes: 18,
    fullDescription: 'Assistant giúp review code và đưa ra các gợi ý cải thiện chất lượng code theo best practices.',
    content: `Prompt: Code Review Assistant

Hướng dẫn sử dụng:
1. Paste code cần review
2. Specify ngôn ngữ lập trình
3. Mention specific concerns nếu có

Template:
Review code [LANGUAGE] sau và đưa ra feedback về [ASPECTS]

Output mong muốn: Detailed review với suggestions và improvements`
  },
  {
    id: 3,
    title: 'Laravel Query Optimization',
    description: 'Tối ưu hóa database queries trong Laravel',
    category: 'Development',
    tags: ['laravel', 'database', 'optimization'],
    rating: 4.6,
    uses: 650,
    author: 'Laravel Expert',
    featured: false,
    views: 3100,
    likes: 380,
    dislikes: 22,
    fullDescription: 'Prompt giúp tối ưu hóa database queries trong Laravel để cải thiện performance.',
    content: `Prompt: Laravel Query Optimizer

Hướng dẫn sử dụng:
1. Paste Laravel query code
2. Describe performance issues
3. Mention database type nếu relevant

Template:
Tối ưu Laravel query sau để cải thiện performance: [QUERY_CODE]

Output mong muốn: Optimized query với explanations`
  },
  {
    id: 4,
    title: 'React Component Generator',
    description: 'Tạo React component với TypeScript và best practices',
    category: 'Development',
    tags: ['react', 'typescript', 'components'],
    rating: 4.9,
    uses: 1200,
    author: 'React Dev',
    featured: true,
    views: 5800,
    likes: 720,
    dislikes: 12,
    fullDescription: 'Generator tạo React components với TypeScript, hooks và best practices.',
    content: `Prompt: React Component Generator

Hướng dẫn sử dụng:
1. Describe component functionality
2. Specify props và state requirements
3. Mention styling approach

Template:
Tạo React component [COMPONENT_NAME] với functionality [DESCRIPTION]

Output mong muốn: Complete component với TypeScript và best practices`
  },
  {
    id: 5,
    title: 'Project Timeline Template',
    description: 'Template timeline chi tiết cho quản lý dự án',
    category: 'Project Management',
    tags: ['timeline', 'project', 'planning'],
    rating: 4.6,
    uses: 720,
    author: 'PM Expert',
    featured: false,
    views: 3500,
    likes: 450,
    dislikes: 25,
    fullDescription: 'Template timeline chi tiết giúp project manager lập kế hoạch và theo dõi tiến độ dự án một cách hiệu quả.',
    content: `Prompt: Project Timeline Creator

Hướng dẫn sử dụng:
1. Define project scope và deliverables
2. Estimate effort cho từng task
3. Set dependencies và milestones

Template:
Tạo timeline cho dự án [PROJECT_NAME] với scope [PROJECT_SCOPE] trong [DURATION]

Output mong muốn: Timeline chi tiết với milestones và dependencies`
  },
  {
    id: 6,
    title: 'API Documentation Generator',
    description: 'Tạo tài liệu API tự động từ code',
    category: 'Development',
    tags: ['api', 'documentation', 'automation'],
    rating: 4.7,
    uses: 540,
    author: 'API Expert',
    featured: false,
    views: 2900,
    likes: 340,
    dislikes: 15,
    fullDescription: 'Tool tự động tạo tài liệu API từ code với format chuẩn và examples.',
    content: `Prompt: API Documentation Generator

Hướng dẫn sử dụng:
1. Paste API endpoint code
2. Specify framework được sử dụng
3. Include example requests/responses

Template:
Tạo documentation cho API endpoint [ENDPOINT] trong [FRAMEWORK]

Output mong muốn: Complete API docs với examples và schemas`
  },
  {
    id: 7,
    title: 'Brand Identity Guide',
    description: 'Hướng dẫn tạo bộ nhận diện thương hiệu hoàn chỉnh',
    category: 'Design',
    tags: ['brand', 'identity', 'design'],
    rating: 4.9,
    uses: 430,
    author: 'Brand Designer',
    featured: false,
    views: 1900,
    likes: 280,
    dislikes: 8,
    fullDescription: 'Hướng dẫn toàn diện để tạo bộ nhận diện thương hiệu từ logo, màu sắc đến typography và voice & tone.',
    content: `Prompt: Brand Identity Guide Generator

Hướng dẫn sử dụng:
1. Research target audience và competitors
2. Define brand values và personality
3. Create visual và verbal identity

Template:
Tạo brand identity guide cho [BRAND_NAME] trong lĩnh vực [INDUSTRY]

Output mong muốn: Brand guide hoàn chỉnh với visual và verbal elements`
  },
  {
    id: 8,
    title: 'SQL Query Optimizer',
    description: 'Tối ưu hóa câu truy vấn SQL cho performance',
    category: 'Development',
    tags: ['sql', 'database', 'performance'],
    rating: 4.5,
    uses: 680,
    author: 'DB Admin',
    featured: false,
    views: 3200,
    likes: 410,
    dislikes: 28,
    fullDescription: 'Tool giúp tối ưu hóa SQL queries để cải thiện performance và reduce load.',
    content: `Prompt: SQL Query Optimizer

Hướng dẫn sử dụng:
1. Paste SQL query cần optimize
2. Describe performance issues
3. Include table schemas nếu có

Template:
Tối ưu SQL query sau: [SQL_QUERY] cho database [DB_TYPE]

Output mong muốn: Optimized query với performance explanations`
  },
  {
    id: 9,
    title: 'Unit Test Generator',
    description: 'Tạo unit tests tự động cho code',
    category: 'Development',
    tags: ['testing', 'unit tests', 'automation'],
    rating: 4.6,
    uses: 420,
    author: 'Test Engineer',
    featured: false,
    views: 2100,
    likes: 280,
    dislikes: 20,
    fullDescription: 'Tool tự động tạo unit tests cho code với coverage tốt và best practices.',
    content: `Prompt: Unit Test Generator

Hướng dẫn sử dụng:
1. Paste function/class cần test
2. Specify testing framework
3. Mention edge cases nếu có

Template:
Tạo unit tests cho [CODE] sử dụng [FRAMEWORK]

Output mong muốn: Complete test suite với edge cases`
  },
  {
    id: 10,
    title: 'Git Commit Message Helper',
    description: 'Viết commit message chuẩn theo convention',
    category: 'Development',
    tags: ['git', 'commit', 'convention'],
    rating: 4.4,
    uses: 350,
    author: 'DevOps',
    featured: false,
    views: 1800,
    likes: 220,
    dislikes: 15,
    fullDescription: 'Helper tạo commit messages theo conventional commits và best practices.',
    content: `Prompt: Git Commit Message Helper

Hướng dẫn sử dụng:
1. Describe changes made
2. Specify type of change
3. Include breaking changes nếu có

Template:
Tạo commit message cho changes: [CHANGES] với type [TYPE]

Output mong muốn: Conventional commit message`
  },
  {
    id: 11,
    title: 'Social Media Content Creator',
    description: 'Tạo nội dung social media hấp dẫn và viral',
    category: 'Marketing',
    tags: ['social media', 'content', 'viral'],
    rating: 4.7,
    uses: 890,
    author: 'Social Expert',
    featured: false,
    views: 3400,
    likes: 450,
    dislikes: 32,
    fullDescription: 'Tool tạo nội dung social media với engagement cao và khả năng viral.',
    content: `Prompt: Social Media Content Creator

Hướng dẫn sử dụng:
1. Define target audience
2. Choose platform (Facebook, Instagram, TikTok)
3. Set content goals

Template:
Tạo nội dung [PLATFORM] cho audience [TARGET] về chủ đề [TOPIC]

Output mong muốn: Engaging social media content`
  },
  {
    id: 12,
    title: 'Email Template Designer',
    description: 'Thiết kế email templates chuyên nghiệp',
    category: 'Design',
    tags: ['email', 'template', 'design'],
    rating: 4.5,
    uses: 620,
    author: 'Email Designer',
    featured: false,
    views: 2800,
    likes: 380,
    dislikes: 28,
    fullDescription: 'Tạo email templates responsive và chuyên nghiệp cho mọi mục đích.',
    content: `Prompt: Email Template Designer

Hướng dẫn sử dụng:
1. Define email purpose
2. Choose design style
3. Set brand guidelines

Template:
Thiết kế email template cho [PURPOSE] với style [STYLE]

Output mong muốn: Professional email template`
  },
  {
    id: 13,
    title: 'SEO Content Optimizer',
    description: 'Tối ưu nội dung cho SEO và ranking',
    category: 'Marketing',
    tags: ['seo', 'content', 'ranking'],
    rating: 4.8,
    uses: 750,
    author: 'SEO Expert',
    featured: true,
    views: 4100,
    likes: 520,
    dislikes: 22,
    fullDescription: 'Tối ưu nội dung để đạt ranking cao trên search engines.',
    content: `Prompt: SEO Content Optimizer

Hướng dẫn sử dụng:
1. Research target keywords
2. Analyze competitor content
3. Optimize for search intent

Template:
Tối ưu nội dung cho keyword [KEYWORD] với search intent [INTENT]

Output mong muốn: SEO-optimized content`
  },
  {
    id: 14,
    title: 'Database Schema Designer',
    description: 'Thiết kế database schema hiệu quả',
    category: 'Development',
    tags: ['database', 'schema', 'design'],
    rating: 4.6,
    uses: 480,
    author: 'DB Architect',
    featured: false,
    views: 2200,
    likes: 290,
    dislikes: 18,
    fullDescription: 'Thiết kế database schema tối ưu cho performance và scalability.',
    content: `Prompt: Database Schema Designer

Hướng dẫn sử dụng:
1. Define business requirements
2. Identify entities và relationships
3. Normalize database structure

Template:
Thiết kế database schema cho [APPLICATION] với requirements [REQUIREMENTS]

Output mong muốn: Optimized database schema`
  },
  {
    id: 15,
    title: 'Mobile App UI Designer',
    description: 'Thiết kế UI/UX cho mobile apps',
    category: 'Design',
    tags: ['mobile', 'ui', 'ux'],
    rating: 4.9,
    uses: 680,
    author: 'UI Designer',
    featured: true,
    views: 3600,
    likes: 480,
    dislikes: 15,
    fullDescription: 'Thiết kế mobile app UI với user experience tối ưu.',
    content: `Prompt: Mobile App UI Designer

Hướng dẫn sử dụng:
1. Define app purpose và target users
2. Create user journey maps
3. Design responsive layouts

Template:
Thiết kế UI cho mobile app [APP_TYPE] với target user [USER_TYPE]

Output mong muốn: Modern mobile UI design`
  },
  {
    id: 16,
    title: 'Performance Testing Guide',
    description: 'Hướng dẫn test performance ứng dụng',
    category: 'Testing',
    tags: ['performance', 'testing', 'optimization'],
    rating: 4.4,
    uses: 390,
    author: 'Performance Tester',
    featured: false,
    views: 1800,
    likes: 240,
    dislikes: 25,
    fullDescription: 'Guide toàn diện để test performance và tối ưu ứng dụng.',
    content: `Prompt: Performance Testing Guide

Hướng dẫn sử dụng:
1. Define performance metrics
2. Set up testing environment
3. Create test scenarios

Template:
Tạo performance test plan cho [APPLICATION] với metrics [METRICS]

Output mong muốn: Comprehensive performance test plan`
  }
];