# Vote API Documentation

## Overview
API cho chức năng vote (hữu ích/không hữu ích) prompts. Mỗi user chỉ được vote 1 lần cho 1 prompt.

## Endpoints

### 1. Vote for a Prompt
**POST** `/api/v1/prompts/{prompt_id}/vote`

Vote cho một prompt (hữu ích hoặc không hữu ích).

**Headers:**
- `Authorization: Bearer <token>` (required)

**Path Parameters:**
- `prompt_id` (integer): ID của prompt

**Request Body:**
```json
{
  "is_helpful": true  // true = hữu ích, false = không hữu ích
}
```

**Response:**
```json
{
  "vote_id": 123,
  "is_helpful": true,
  "like_count": 15,
  "dislike_count": 3,
  "message": "Vote recorded successfully"
}
```

**Error Responses:**
- `400`: Cannot vote on your own prompt
- `400`: Prompt not found
- `401`: Authentication required

### 2. Remove Vote
**DELETE** `/api/v1/prompts/{prompt_id}/vote`

Xóa vote của user cho một prompt.

**Headers:**
- `Authorization: Bearer <token>` (required)

**Path Parameters:**
- `prompt_id` (integer): ID của prompt

**Response:**
```json
{
  "like_count": 14,
  "dislike_count": 3,
  "message": "Vote removed successfully"
}
```

### 3. Get Vote Statistics (Authenticated)
**GET** `/api/v1/prompts/{prompt_id}/stats`

Lấy thống kê vote cho một prompt, bao gồm vote của user hiện tại.

**Headers:**
- `Authorization: Bearer <token>` (required)

**Response:**
```json
{
  "prompt_id": 123,
  "like_count": 15,
  "dislike_count": 3,
  "user_vote": true  // null nếu chưa vote, true/false nếu đã vote
}
```

### 4. Get Vote Statistics (Public)
**GET** `/api/v1/prompts/{prompt_id}/stats/public`

Lấy thống kê vote công khai (không cần authentication).

**Response:**
```json
{
  "prompt_id": 123,
  "like_count": 15,
  "dislike_count": 3,
  "user_vote": null
}
```

## Business Rules

1. **One Vote Per User Per Prompt**: Mỗi user chỉ được vote 1 lần cho 1 prompt
2. **Update Existing Vote**: Nếu user vote lại, vote cũ sẽ được cập nhật
3. **Cannot Vote Own Prompt**: User không thể vote cho prompt của chính mình
4. **Authentication Required**: Tất cả vote actions đều cần authentication
5. **Auto Update Counts**: Like/dislike counts trong prompt table được tự động cập nhật

## Database Schema

### prompt_votes table
```sql
CREATE TABLE prompt_votes (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    prompt_id INTEGER NOT NULL REFERENCES prompts(id),
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_prompt_vote UNIQUE (user_id, prompt_id)
);
```

## Usage Examples

### Vote helpful
```javascript
const response = await fetch('/api/v1/prompts/123/vote', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ is_helpful: true })
});
```

### Vote not helpful
```javascript
const response = await fetch('/api/v1/prompts/123/vote', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ is_helpful: false })
});
```

### Remove vote
```javascript
const response = await fetch('/api/v1/prompts/123/vote', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer ' + token
  }
});
```