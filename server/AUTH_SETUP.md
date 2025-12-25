# Google OAuth Authentication Setup

## Cấu hình

### 1. Environment Variables
Thêm vào file `.env`:
```
GOOGLE_CLIENT_ID=your-google-client-id-here
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### 2. Database Migration
Chạy migration để tạo bảng users:
```bash
cd server
alembic upgrade head
```

## API Endpoints

### POST /api/v1/auth/login/google
Đăng nhập bằng Google OAuth

**Request Body:**
```json
{
  "id_token": "google_id_token_from_frontend"
}
```

**Response:**
```json
{
  "access_token": "jwt_access_token",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "User Name",
    "avatar_url": "https://...",
    "user_type": "google",
    "is_active": true,
    "last_login_at": "2024-12-25T10:30:00Z"
  }
}
```

### POST /api/v1/auth/login/admin
Đăng nhập bằng email/password (chỉ admin)

**Request Body:**
```json
{
  "email": "admin@gmail.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "access_token": "jwt_access_token",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "email": "admin@gmail.com",
    "full_name": "System Administrator",
    "avatar_url": "https://...",
    "user_type": "admin",
    "is_active": true,
    "last_login_at": "2024-12-25T10:30:00Z"
  }
}
```

### GET /api/v1/auth/me
Lấy thông tin user hiện tại (yêu cầu JWT token)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com", 
  "full_name": "User Name",
  "avatar_url": "https://...",
  "user_type": "google",
  "is_active": true,
  "last_login_at": "2024-12-25T10:30:00Z"
}
```

## Cách sử dụng từ Frontend

### 1. Lấy Google ID Token
```javascript
// Sử dụng Google Sign-In library
const response = await gapi.auth2.getAuthInstance().signIn();
const id_token = response.getAuthResponse().id_token;
```

### 2. Gửi đến Backend
```javascript
const response = await fetch('/api/v1/auth/login/google', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    id_token: id_token
  })
});

const data = await response.json();
// Chỉ lưu access_token
localStorage.setItem('access_token', data.access_token);
localStorage.setItem('user', JSON.stringify(data.user));
```

### 3. Sử dụng JWT Token
```javascript
const response = await fetch('/api/v1/auth/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  }
});
```

## Token Expiration Handling

### Tự động logout khi token hết hạn
- Khi API trả về 401 Unauthorized
- Tự động clear localStorage
- Chuyển hướng về trang home
- Không sử dụng refresh token

### Frontend Auto-check
```javascript
import { checkAuthStatus } from './utils/auth';

// Check auth status before making API calls
if (!checkAuthStatus()) {
  // User will be automatically logged out
  return;
}
```

## Luồng xử lý

1. Frontend nhận Google ID token từ Google Sign-In
2. Frontend gửi ID token đến `/api/v1/auth/login/google`
3. Backend verify ID token với Google
4. Backend tạo hoặc cập nhật user trong database
5. **Backend tự động cập nhật thông tin mới nhất từ Google** (tên, avatar)
6. **Backend ghi lại thời gian đăng nhập cuối cùng**
7. Backend trả về JWT access_token (không có refresh_token)
8. Frontend sử dụng access_token cho các API calls tiếp theo
9. **Khi token hết hạn: Tự động logout và chuyển về home**

## Tính năng đồng bộ thông tin

- **Tự động cập nhật**: Mỗi lần đăng nhập, hệ thống sẽ tự động cập nhật thông tin mới nhất từ Google
- **Theo dõi thay đổi**: Chỉ cập nhật khi có thay đổi thực sự (tên hoặc avatar khác)
- **Lưu lịch sử**: Ghi lại thời gian đăng nhập cuối cùng trong `last_login_at`
- **Bảo toàn dữ liệu**: Không ghi đè thông tin nếu Google trả về giá trị rỗng

## Bảo mật

- ID token được verify với Google servers
- JWT tokens có thời gian hết hạn (mặc định 60 phút)
- **Không sử dụng refresh token** - khi hết hạn phải đăng nhập lại
- User phải có email verified từ Google
- Soft delete cho users (is_deleted flag)
- Audit trail cho tất cả thay đổi
- **Tự động logout** khi token hết hạn