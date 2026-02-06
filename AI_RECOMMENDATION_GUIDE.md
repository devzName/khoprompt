# 🤖 AI Chatbot - Hệ thống Gợi ý Prompt Thông minh

## Tổng quan

Hệ thống AI Chatbot giúp người dùng tìm kiếm prompt phù hợp thông qua giao diện chat tự nhiên. Chatbot xuất hiện ở tất cả các trang với floating button và tooltip gợi ý thông minh.

## Tính năng

### 1. AI Chatbot (PromptChatbot.jsx)
- **Floating button** ở góc phải màn hình (tất cả các trang)
- **Tooltip gợi ý** xuất hiện sau 2 giây với animation fade-in
- **Chat interface** với typing animation
- **Quick questions** - Gợi ý câu hỏi nhanh
- **Reset chat** - Làm mới cuộc trò chuyện
- **Responsive** - Ẩn tooltip trên mobile, chatbot vẫn hoạt động

### 2. Hiệu ứng & Animation
- **Tooltip**: Fade-in + slide-up trong 1 giây
- **Typing indicator**: 3 chấm nhỏ khi AI đang "suy nghĩ"
- **Welcome message**: Hiển thị sau 2 giây typing khi mở chat
- **Reset**: Typing 1 giây trước khi hiện welcome message mới

### 3. Gợi ý Câu hỏi
- "Tìm prompt về viết content"
- "Prompt lập trình Python"
- "Gợi ý prompt marketing"
- "Prompt phân tích dữ liệu"

Click vào gợi ý sẽ tự động gửi câu hỏi cho AI.

## API Endpoints

### POST `/api/v1/ai/chatbot`
Chatbot gợi ý prompts dựa trên câu hỏi

**Query Parameters:**
- `query` (required): Câu hỏi của người dùng
- `limit` (optional): Số lượng prompts (default: 5, max: 20)

**Response:**
```json
{
  "message": "Mình tìm thấy 3 prompts về viết content và marketing phù hợp với bạn! 📝",
  "prompts": [
    {
      "id": 1,
      "title": "Prompt viết content marketing chuyên nghiệp",
      "description": "Giúp bạn tạo nội dung marketing hấp dẫn",
      "slug": "prompt-viet-content-marketing",
      "rating": 4.8,
      "view_count": 1250
    }
  ]
}
```

## Cách hoạt động

### Chatbot Logic (Mock Data)

1. **Phân tích câu hỏi:**
   - Mapping keywords đơn giản
   - Ví dụ: "viết" → content/marketing, "code" → programming

2. **Tìm kiếm:**
   - Match keywords với mock data
   - Return prompts phù hợp

3. **Trả lời tự nhiên:**
   - Generate message phù hợp với context
   - Kèm theo danh sách prompts với link trực tiếp

### Keywords Mapping

```javascript
{
  'viết', 'content', 'marketing' → Content & Marketing prompts
  'code', 'lập trình', 'python', 'react' → Programming prompts
  'data', 'phân tích', 'analysis' → Data Analysis prompts
  default → Trending prompts
}
```

## UI Components

### PromptChatbot.jsx
**Location**: `client/src/components/PromptChatbot.jsx`

**Features:**
- Floating button với icon chat
- Tooltip gợi ý (desktop only)
- Chat window responsive
- Typing animation
- Quick questions
- Reset button
- Message history
- Prompt cards trong chat

**States:**
- `isOpen`: Trạng thái mở/đóng chatbot
- `messages`: Lịch sử chat
- `isTyping`: Hiển thị typing indicator
- `showTooltip`: Hiển thị tooltip gợi ý
- `hasShownWelcome`: Đã hiển thị welcome message chưa

### Integration

**App.jsx** - Chatbot xuất hiện ở tất cả trang:
```jsx
import PromptChatbot from './components/PromptChatbot';

return (
  <>
    <Routes>
      {/* All routes */}
    </Routes>
    <PromptChatbot />
  </>
);
```

## Services

### recommendationService.js
**Location**: `client/src/services/recommendationService.js`

```javascript
export const recommendationService = {
  chatbotSuggest: async (query, limit = 5) => {
    const response = await apiClient.post('/ai/chatbot', null, {
      params: { query, limit }
    });
    return response.data;
  }
};
```

## Backend Implementation

### ai.py
**Location**: `server/app/api/v1/ai.py`

**Endpoints:**
- `POST /ai/chatbot` - Chatbot suggest prompts

**Mock Data:**
- 8 prompts mẫu với categories khác nhau
- Keyword matching đơn giản
- Response messages tự nhiên

## Responsive Design

### Desktop (≥1024px)
- ✅ Floating button
- ✅ Tooltip gợi ý
- ✅ Full chat window (384px width)

### Mobile/Tablet (<1024px)
- ✅ Floating button
- ❌ Tooltip gợi ý (ẩn)
- ✅ Chat window responsive (max-w-[calc(100vw-3rem)])

## Timing & Animation

| Event | Timing | Animation |
|-------|--------|-----------|
| Tooltip xuất hiện | 2s | Fade-in + slide-up (1s) |
| Mở chatbot | Instant | Slide-in-from-bottom |
| Welcome message | 2s typing | 3 chấm → text |
| User gửi câu hỏi | 0.8s typing | 3 chấm → response |
| Reset chat | 1s typing | 3 chấm → welcome |

## Testing

### Test Chatbot API
```bash
# Test với keyword "viết content"
curl -X POST "http://localhost:8000/api/v1/ai/chatbot?query=Tìm%20prompt%20về%20viết%20content&limit=5"

# Test với keyword "lập trình"
curl -X POST "http://localhost:8000/api/v1/ai/chatbot?query=Prompt%20lập%20trình%20Python&limit=5"

# Test với keyword không match
curl -X POST "http://localhost:8000/api/v1/ai/chatbot?query=Tìm%20prompt%20về%20thiết%20kế&limit=5"
```

### Expected Response
```json
{
  "message": "Có 2 prompts về lập trình rất hay cho bạn! 💻",
  "prompts": [
    {
      "id": 2,
      "title": "Code Review Assistant - Python",
      "description": "AI assistant giúp review code Python, tìm bugs",
      "slug": "code-review-python",
      "rating": 4.6,
      "view_count": 890
    }
  ]
}
```

## Nâng cấp trong tương lai

### Phase 2: Real AI Integration
- Tích hợp OpenAI/Claude API
- Semantic search với embeddings
- Context-aware conversations
- Learning from user interactions

### Phase 3: Advanced Features
- Multi-turn conversations
- Prompt generation (tạo prompt mới theo yêu cầu)
- User feedback & ratings
- Analytics & tracking

### Phase 4: Personalization
- User behavior tracking
- Personalized recommendations
- A/B testing
- Real-time learning

## Cấu hình

Không cần cấu hình thêm. Hệ thống hoạt động ngay sau khi:
1. ✅ Backend đã chạy
2. ✅ Frontend đã build/start
3. ✅ Mock data có sẵn trong code

## Performance

- Chatbot lazy load (chỉ render khi cần)
- Mock data response instant
- Animation smooth với CSS
- Responsive cho mọi thiết bị

## Troubleshooting

### Chatbot không xuất hiện
- Kiểm tra `PromptChatbot` đã import vào `App.jsx`
- Kiểm tra z-index (z-50)
- Kiểm tra responsive class (hidden lg:block cho tooltip)

### Tooltip không hiển thị
- Đợi 2 giây sau khi load trang
- Kiểm tra màn hình >= 1024px (desktop only)
- Kiểm tra animation CSS đã load

### Click gợi ý không hoạt động
- Kiểm tra `handleSend` nhận parameter
- Kiểm tra API endpoint `/ai/chatbot`
- Xem console log để debug

### Animation không mượt
- Kiểm tra CSS animation đã inject vào DOM
- Kiểm tra Tailwind classes
- Thử tăng duration nếu cần

---

**Tác giả**: AI Assistant  
**Ngày tạo**: 2026-02-06  
**Cập nhật**: 2026-02-06  
**Version**: 2.0
