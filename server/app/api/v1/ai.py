from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from app.api.auth_deps import get_current_user
from app.models.user import User
from app.core.config import get_settings
from app.core.prompts import (
    GENERATE_DESCRIPTION_PROMPT,
    GENERATE_PROMPT_CONTENT,
    IMPROVE_DESCRIPTION_PROMPT,
    IMPROVE_PROMPT_CONTENT
)
import openai


router = APIRouter()
settings = get_settings()

class GenerateTextRequest(BaseModel):
    title: str
    type: str = "description"
    value: str = ""

class ImproveTextRequest(BaseModel):
    text: str
    value: str
    type: str = "description"

class TextResponse(BaseModel):
    formattedText: str

@router.post("/generate-text", response_model=TextResponse)
async def generate_text(
    request: GenerateTextRequest,
    current_user: User = Depends(get_current_user)
):
    try:
        if not settings.openai_api_key:
            generated_text = _simple_generate_text(request.title, request.type)
            return TextResponse(formattedText=generated_text)
        
        client = openai.OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=settings.openai_api_key,
            timeout=120.0  # 2 minutes timeout
        )
        
        if request.type == "description":
            system_prompt = GENERATE_DESCRIPTION_PROMPT
            user_content = f"Prompt title: {request.title}"
            max_tokens = 300
            temperature = 0.7
        else:
            system_prompt = GENERATE_PROMPT_CONTENT
            user_content = f"Prompt title: {request.title}\n\nAdditional context:\n{request.value}" if request.value else f"Prompt title: {request.title}"
            max_tokens = 1000
            temperature = 0.7

        response = client.chat.completions.create(
            model="openai/gpt-oss-120b:free",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            max_tokens=max_tokens,
            temperature=temperature
        )

        generated_text = response.choices[0].message.content.strip()
        return TextResponse(formattedText=generated_text)
        
    except Exception as e:
        print("Error generating text:", e)
        generated_text = _simple_generate_text(request.title, request.type)
        return TextResponse(formattedText=generated_text)

@router.post("/improve-text", response_model=TextResponse)
async def improve_text(
    request: ImproveTextRequest,
    current_user: User = Depends(get_current_user)
):
    try:
        if not settings.openai_api_key:
            improved_text = _simple_improve_text(request.text, request.value, request.type)
            return TextResponse(formattedText=improved_text)
        
        client = openai.OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=settings.openai_api_key,
            timeout=120.0  # 2 minutes timeout
        )
        
        if request.type == "description":
            system_prompt = IMPROVE_DESCRIPTION_PROMPT
            max_tokens = 300
            temperature = 0.7
        else:
            system_prompt = IMPROVE_PROMPT_CONTENT
            max_tokens = 1000
            temperature = 0.7
        
        combined_text = f"Title: {request.text}\n\nContent:\n{request.value}"
        
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b:free",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": combined_text}
            ],
            max_tokens=max_tokens,
            temperature=temperature
        )

        improved_text = response.choices[0].message.content.strip()
        return TextResponse(formattedText=improved_text)
        
    except Exception as e:
        print("Error improving text:", e)
        improved_text = _simple_improve_text(request.text, request.value, request.type)
        return TextResponse(formattedText=improved_text)

def _simple_generate_text(title: str, text_type: str) -> str:
    if text_type == "description":
        return f"This is a prompt about: {title}. It helps users accomplish specific tasks using AI."
    else:
        return f"Prompt: {title}\n\nInstructions:\n1. Follow the guidelines provided\n2. Provide clear and detailed responses\n3. Maintain consistency throughout"

def _simple_improve_text(text: str, value: str, text_type: str) -> str:
    improved = value.strip()
    
    if improved:
        improved = improved[0].upper() + improved[1:]
    
    if improved and not improved.endswith(('.', '!', '?')):
        improved += '.'
    
    improved = ' '.join(improved.split())
    
    return improved


# ============================================
# RECOMMENDATION & CHATBOT ENDPOINTS
# ============================================

@router.get("/recommended")
async def get_recommended_prompts(
    limit: int = Query(12, ge=1, le=50)
):
    """
    Mock API - Trả về prompts gợi ý để test UI
    """
    mock_prompts = [
        {
            "id": 1,
            "title": "Prompt viết content marketing chuyên nghiệp",
            "description": "Giúp bạn tạo nội dung marketing hấp dẫn, thu hút khách hàng và tăng conversion rate",
            "slug": "prompt-viet-content-marketing",
            "rating": 4.8,
            "view_count": 1250,
            "category_id": 1,
            "status": "approved"
        },
        {
            "id": 2,
            "title": "Code Review Assistant - Python",
            "description": "AI assistant giúp review code Python, tìm bugs và suggest improvements",
            "slug": "code-review-python",
            "rating": 4.6,
            "view_count": 890,
            "category_id": 2,
            "status": "approved"
        },
        {
            "id": 3,
            "title": "SEO Content Optimizer",
            "description": "Tối ưu hóa nội dung cho SEO, tăng ranking trên Google",
            "slug": "seo-content-optimizer",
            "rating": 4.9,
            "view_count": 2100,
            "category_id": 1,
            "status": "approved"
        },
        {
            "id": 4,
            "title": "Data Analysis với Python Pandas",
            "description": "Phân tích dữ liệu nhanh chóng với Pandas, visualization và insights",
            "slug": "data-analysis-pandas",
            "rating": 4.7,
            "view_count": 1560,
            "category_id": 3,
            "status": "approved"
        },
        {
            "id": 5,
            "title": "UI/UX Design Feedback",
            "description": "Nhận feedback chuyên nghiệp về thiết kế UI/UX của bạn",
            "slug": "uiux-design-feedback",
            "rating": 4.5,
            "view_count": 780,
            "category_id": 4,
            "status": "approved"
        },
        {
            "id": 6,
            "title": "Email Marketing Template Generator",
            "description": "Tạo email marketing template chuyên nghiệp, tăng open rate",
            "slug": "email-marketing-template",
            "rating": 4.4,
            "view_count": 650,
            "category_id": 1,
            "status": "approved"
        },
        {
            "id": 7,
            "title": "React Component Generator",
            "description": "Tự động generate React components với best practices",
            "slug": "react-component-generator",
            "rating": 4.8,
            "view_count": 1890,
            "category_id": 2,
            "status": "approved"
        },
        {
            "id": 8,
            "title": "Social Media Caption Writer",
            "description": "Viết caption hấp dẫn cho Facebook, Instagram, TikTok",
            "slug": "social-media-caption",
            "rating": 4.6,
            "view_count": 1120,
            "category_id": 1,
            "status": "approved"
        }
    ]
    
    return mock_prompts[:limit]


@router.post("/chatbot")
async def chatbot_suggest(
    query: str = Query(..., min_length=1),
    limit: int = Query(5, ge=1, le=20)
):
    """
    Mock Chatbot - Trả về response giả để test UI
    """
    query_lower = query.lower()
    
    # Mock responses dựa trên keywords
    if any(word in query_lower for word in ['viết', 'content', 'marketing']):
        message = "Mình tìm thấy 3 prompts về viết content và marketing phù hợp với bạn! 📝"
        prompts = [
            {
                "id": 1,
                "title": "Prompt viết content marketing chuyên nghiệp",
                "description": "Giúp bạn tạo nội dung marketing hấp dẫn, thu hút khách hàng",
                "slug": "prompt-viet-content-marketing",
                "rating": 4.8,
                "view_count": 1250
            },
            {
                "id": 3,
                "title": "SEO Content Optimizer",
                "description": "Tối ưu hóa nội dung cho SEO, tăng ranking trên Google",
                "slug": "seo-content-optimizer",
                "rating": 4.9,
                "view_count": 2100
            },
            {
                "id": 8,
                "title": "Social Media Caption Writer",
                "description": "Viết caption hấp dẫn cho Facebook, Instagram, TikTok",
                "slug": "social-media-caption",
                "rating": 4.6,
                "view_count": 1120
            }
        ]
    elif any(word in query_lower for word in ['code', 'lập trình', 'python', 'react']):
        message = "Có 2 prompts về lập trình rất hay cho bạn! 💻"
        prompts = [
            {
                "id": 2,
                "title": "Code Review Assistant - Python",
                "description": "AI assistant giúp review code Python, tìm bugs",
                "slug": "code-review-python",
                "rating": 4.6,
                "view_count": 890
            },
            {
                "id": 7,
                "title": "React Component Generator",
                "description": "Tự động generate React components với best practices",
                "slug": "react-component-generator",
                "rating": 4.8,
                "view_count": 1890
            }
        ]
    elif any(word in query_lower for word in ['data', 'phân tích', 'analysis']):
        message = "Mình có 1 prompt về phân tích dữ liệu rất tốt! 📊"
        prompts = [
            {
                "id": 4,
                "title": "Data Analysis với Python Pandas",
                "description": "Phân tích dữ liệu nhanh chóng với Pandas",
                "slug": "data-analysis-pandas",
                "rating": 4.7,
                "view_count": 1560
            }
        ]
    else:
        message = "Đây là một số prompts phổ biến bạn có thể quan tâm! ✨"
        prompts = [
            {
                "id": 1,
                "title": "Prompt viết content marketing chuyên nghiệp",
                "description": "Giúp bạn tạo nội dung marketing hấp dẫn",
                "slug": "prompt-viet-content-marketing",
                "rating": 4.8,
                "view_count": 1250
            },
            {
                "id": 2,
                "title": "Code Review Assistant - Python",
                "description": "AI assistant giúp review code Python",
                "slug": "code-review-python",
                "rating": 4.6,
                "view_count": 890
            }
        ]
    
    return {
        'message': message,
        'prompts': prompts[:limit]
    }
