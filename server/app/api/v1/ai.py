from fastapi import APIRouter, HTTPException, Depends
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
            api_key=settings.openai_api_key
        )
        
        if request.type == "description":
            system_prompt = GENERATE_DESCRIPTION_PROMPT
            user_content = f"Prompt title: {request.title}"
        else:
            system_prompt = GENERATE_PROMPT_CONTENT
            user_content = f"Prompt title: {request.title}\n\nAdditional context:\n{request.value}" if request.value else f"Prompt title: {request.title}"

        response = client.chat.completions.create(
            model="openai/gpt-oss-120b:free",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            max_tokens=1000,
            temperature=0.7
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
            api_key=settings.openai_api_key
        )
        
        if request.type == "description":
            system_prompt = IMPROVE_DESCRIPTION_PROMPT
        else:
            system_prompt = IMPROVE_PROMPT_CONTENT
        
        combined_text = f"Title: {request.text}\n\nContent:\n{request.value}"
        
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b:free",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": combined_text}
            ],
            max_tokens=1000,
            temperature=0.3
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