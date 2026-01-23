from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.api.auth_deps import get_current_user
from app.models.user import User
from app.core.config import get_settings
import openai


router = APIRouter()
settings = get_settings()

class FormatTextRequest(BaseModel):
    text: str
    type: str = "description"

class FormatTextResponse(BaseModel):
    formattedText: str
    originalText: str

@router.post("/format-text", response_model=FormatTextResponse)
async def format_text(
    request: FormatTextRequest,
    current_user: User = Depends(get_current_user)
):
    try:
        if not settings.openai_api_key:
            formatted_text = _simple_text_format(request.text)
            return FormatTextResponse(
                formattedText=formatted_text,
                originalText=request.text
            )
        
        # Configure OpenAI API
        client = openai.OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=settings.openai_api_key
        )
        
        if request.type == "description":
            system_prompt = """You are a professional text editor. Your task is to improve the given text by:
1. Fixing grammar and spelling errors
2. Improving sentence structure and flow
3. Making it more concise and clear
4. Maintaining the original meaning and tone
5. Ensuring it's suitable for a prompt description

Return only the improved text without any explanations or additional comments."""
        elif request.type == "content":
            system_prompt = """You are a professional text editor. Your task is to improve the given prompt content by:
1. Fixing grammar and spelling errors
2. Improving sentence structure and clarity
3. Making instructions more precise and actionable
4. Organizing content with better structure
5. Maintaining the original intent and functionality

Return only the improved text without any explanations or additional comments."""
        else:
            system_prompt = """You are a professional text editor. Improve the given text by fixing grammar, improving structure, and making it more readable while maintaining the original meaning."""
        
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b:free",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.text}
            ],
            max_tokens=500,
            temperature=0.3
        )

        formatted_text = response.choices[0].message.content.strip()
        
        return FormatTextResponse(
            formattedText=formatted_text,
            originalText=request.text
        )
        
    except Exception as e:
        print("Lỗi xảy ra:", e)
        formatted_text = _simple_text_format(request.text)
        return FormatTextResponse(
            formattedText=formatted_text,
            originalText=request.text
        )

def _simple_text_format(text: str) -> str:
    formatted = text.strip()
    
    if formatted:
        formatted = formatted[0].upper() + formatted[1:]
    
    if formatted and not formatted.endswith(('.', '!', '?')):
        formatted += '.'
    
    formatted = ' '.join(formatted.split())
    
    return formatted