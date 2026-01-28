# Microsoft 365 SSO Setup Guide - Tài khoản tổ chức

## Bước 1: Đăng ký ứng dụng trên Azure Portal

1. Truy cập [Azure Portal](https://portal.azure.com/) với tài khoản admin của tổ chức
2. Vào **Azure Active Directory** > **App registrations** > **New registration**
3. Điền thông tin:
   - **Name**: Tên ứng dụng của bạn
   - **Supported account types**: Chọn "Accounts in this organizational directory only (Single tenant)" 
   - **Redirect URI**: Chọn "Single-page application (SPA)" và nhập `http://localhost:5174` (cho development)

## Bước 2: Lấy thông tin cần thiết

1. Sau khi tạo, copy **Application (client) ID**
2. Copy **Directory (tenant) ID** từ Overview page
3. Vào **Authentication**:
   - Thêm redirect URIs cho production: `https://yourdomain.com`
   - Bật **Access tokens** và **ID tokens** trong **Implicit grant and hybrid flows**
4. Vào **API permissions**:
   - Thêm **Microsoft Graph** permissions:
     - `User.Read` (Delegated)
     - `openid` (Delegated)
     - `profile` (Delegated)
     - `email` (Delegated)
   - Click **Grant admin consent** (cần quyền admin)

## Bước 3: Cập nhật environment variables

Cập nhật file `.env`:
```
VITE_MICROSOFT_CLIENT_ID=your_application_client_id_here
VITE_MICROSOFT_TENANT_ID=your_tenant_id_here
```

## Bước 4: Cấu hình Backend

Backend cần được cập nhật để xử lý Microsoft access tokens. Tạo endpoint mới:

```python
# server/app/api/auth.py
@router.post("/login/microsoft")
async def login_with_microsoft(request: MicrosoftLoginRequest):
    # Verify Microsoft access token với tenant cụ thể
    # Extract user info from Microsoft Graph API
    # Kiểm tra domain email (vd: @tinhvan.com)
    # Create or update user in database
    # Return JWT token
```

## Bước 5: Test với tài khoản tổ chức

1. Chạy frontend: `npm run dev`
2. Chạy backend: `poetry run uvicorn app.main:app --reload`
3. Thử đăng nhập bằng tài khoản tổ chức (vd: sonth@tinhvan.com)

## Lưu ý quan trọng

- **Single tenant**: Chỉ tài khoản từ tổ chức cụ thể mới đăng nhập được
- **Admin consent**: Cần admin của tổ chức approve permissions
- **Domain validation**: Backend nên kiểm tra domain email để đảm bảo bảo mật
- **Production**: Cập nhật redirect URIs trong Azure Portal cho production URL