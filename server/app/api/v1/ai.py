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
import httpx
import os


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
# CHATBOT ENDPOINT
# ============================================

class ChatHistoryItem(BaseModel):
    role: str
    content: str

class ChatbotRequest(BaseModel):
    message: str
    session_id: str = "default_session"
    chat_history: list[ChatHistoryItem] = []

@router.post("/chatbot")
async def chatbot_suggest(
    request: ChatbotRequest = None,
    query: str = Query(None),
    limit: int = Query(5, ge=1, le=20)
):
    """
    Call n8n webhook để xử lý chatbot với AI
    Hỗ trợ cả request body và query params
    """
    try:
        # Lấy message từ body hoặc query param
        message = request.message if request else query
        session_id = request.session_id if request else "default_session"
        chat_history = request.chat_history if request else []
        
        if not message:
            raise HTTPException(
                status_code=400,
                detail="Message is required"
            )
        
        n8n_webhook_url = settings.n8n_webhook_url
        
        payload = {
            "message": message,
            "session_id": session_id,
            "chat_history": [{"role": item.role, "content": item.content} for item in chat_history]
        }

        print('payload', payload)
        
        # Call n8n webhook
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                n8n_webhook_url,
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            # Test webhook trả về array, lấy item đầu tiên
            if response.status_code == 200:
                result = response.json()
                
                # N8n test webhook trả về array of items
                if isinstance(result, list) and len(result) > 0:
                    return result[0]
                
                return result
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"N8N error: {response.text}"
                )
            
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="N8N webhook timeout"
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Cannot connect to N8N: {str(e)}"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Chatbot error: {str(e)}"
        )
