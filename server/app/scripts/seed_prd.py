"""
Script to seed PRD data into the skills table
Run: python -m app.scripts.seed_prd
"""
import asyncio
import sys
import os
import json
from uuid import UUID

sys.path.append(os.getcwd())

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.models.skill import Skill

# PRD data
PRD_SKILLS = [
    {
        "name": "soultrace",
        "description": "Take an adaptive personality assessment through the SoulTrace API. Answer 24 questions on a 1-7 Likert scale and receive your personality archetype based on a 5-color psychological model.",
        "spec": {
            "version": "1.0",
            "metadata": {
                "name": "soultrace",
                "description": "Personality assessment via SoulTrace API with 5-color psychological model"
            },
            "steps": [
                "Start the test by calling POST https://soultrace.app/api/agent with empty answers array",
                "Present each question to the user clearly with 1-7 scale (1=Strongly Disagree, 4=Neutral, 7=Strongly Agree)",
                "Collect the user's numeric answer (1-7) and accumulate all answers",
                "Send ALL accumulated answers with each request",
                "After all 24 questions, present the results with archetype name, color distribution, top matches, and result URL"
            ],
            "tools": ["webfetch", "AskUserQuestion"],
            "constraints": [
                "Never skip questions or auto-answer on behalf of the user",
                "Map descriptive answers to 1-7 scale when needed",
                "Present results with all required information"
            ]
        },
        "tags": ["personality", "assessment", "psychology", "api"],
        "category": "lifestyle",
        "is_public": True,
        "approval_status": "approved",
        "view_count": 27800,
        "like_count": 0,
        "dislike_count": 0,
        "user_id": "df59c630-b91c-4c36-af34-a7639a8865f8"
    },
    {
        "name": "find-skills",
        "description": "Discover and install specialized agent skills from the open ecosystem when users need extended capabilities. Helps identify relevant skills by domain and task.",
        "spec": {
            "version": "1.0",
            "metadata": {
                "name": "find-skills",
                "description": "Discover and install agent skills from skills.sh ecosystem"
            },
            "steps": [
                "Understand what the user needs - domain, specific task, whether a skill likely exists",
                "Check skills.sh leaderboard for well-known skills",
                "Run 'npx skills find [query]' to search for skills",
                "Verify quality: install count (prefer 1K+), source reputation, GitHub stars",
                "Present options with install command and link to skills.sh",
                "Offer to install with 'npx skills add <owner/repo@skill> -g -y'"
            ],
            "tools": ["bash", "webfetch", "AskUserQuestion"],
            "constraints": [
                "Verify quality before recommending - check install count and source reputation",
                "Never recommend skills from repos with <100 stars without caution",
                "Present install commands and links to skills.sh"
            ]
        },
        "tags": ["skills", "discovery", "installation", "cli"],
        "category": "developer-tools",
        "is_public": True,
        "approval_status": "approved",
        "view_count": 18300,
        "like_count": 0,
        "dislike_count": 0,
        "user_id": "df59c630-b91c-4c36-af34-a7639a8865f8"
    },
    {
        "name": "microsoft-foundry",
        "description": "End-to-end deployment, evaluation, and management of AI agents on Microsoft Foundry. Covers complete agent lifecycle from creation to deployment, invocation, and batch evaluation.",
        "spec": {
            "version": "1.0",
            "metadata": {
                "name": "microsoft-foundry",
                "description": "Microsoft Foundry AI agent lifecycle management"
            },
            "steps": [
                "Read sub-skill document before executing any workflow",
                "Discover agent roots by searching for .foundry/agent-metadata.yaml",
                "Resolve environment from metadata or user input",
                "Execute workflow: create → deploy → invoke → observe",
                "Use models/deploy-model for intelligent model deployment routing",
                "Use observe for prompt optimization workflow"
            ],
            "tools": ["AskUserQuestion", "task", "bash"],
            "constraints": [
                "MANDATORY: Read corresponding sub-skill document before executing workflow",
                "Use .foundry/agent-metadata.yaml as source of truth",
                "Skip resolution if value already known from session context"
            ]
        },
        "tags": ["microsoft", "azure", "ai", "deployment", "foundry"],
        "category": "devops",
        "is_public": True,
        "approval_status": "approved",
        "view_count": 6600,
        "like_count": 0,
        "dislike_count": 0,
        "user_id": "df59c630-b91c-4c36-af34-a7639a8865f8"
    },
    {
        "name": "frontend-design",
        "description": "Distinctive, production-grade frontend interfaces that reject generic AI aesthetics. Emphasizes typography, color theming, motion, spatial composition, and textural details.",
        "spec": {
            "version": "1.0",
            "metadata": {
                "name": "frontend-design",
                "description": "Create distinctive frontend interfaces avoiding AI slop aesthetics"
            },
            "steps": [
                "Establish bold aesthetic direction: purpose, tone, constraints, differentiation",
                "Choose extreme tone: brutalist, maximalist, retro-futuristic, luxury, playful, etc.",
                "Focus on typography: distinctive fonts, avoid generic ones",
                "Commit to cohesive color theme with CSS variables",
                "Use motion: CSS animations, scroll-triggered effects, staggered reveals",
                "Create unexpected layouts: asymmetry, overlap, diagonal flow, negative space",
                "Add backgrounds and textures for atmosphere"
            ],
            "tools": ["write", "read", "edit"],
            "constraints": [
                "NEVER use generic AI aesthetics: Inter, Roboto, purple gradients, predictable layouts",
                "Match implementation complexity to aesthetic vision",
                "Vary between light/dark themes, different fonts across generations"
            ]
        },
        "tags": ["frontend", "design", "ui", "css", "react", "vue"],
        "category": "design",
        "is_public": True,
        "approval_status": "approved",
        "view_count": 5000,
        "like_count": 0,
        "dislike_count": 0,
        "user_id": "df59c630-b91c-4c36-af34-a7639a8865f8"
    },
    {
        "name": "shadcn",
        "description": "Manages shadcn components and projects — adding, searching, fixing, debugging, styling, and composing UI.",
        "spec": {
            "version": "1.0",
            "metadata": {
                "name": "shadcn",
                "description": "shadcn component management and project integration"
            },
            "steps": [
                "Get project context with package manager info",
                "Check currently installed components",
                "Search for components in registries",
                "Get documentation for components",
                "Add new components to project"
            ],
            "tools": ["bash"],
            "constraints": [
                "Always use project's package manager (npm, yarn, pnpm)",
                "Verify component compatibility with project",
                "Follow shadcn installation workflow"
            ]
        },
        "tags": ["shadcn", "ui", "components", "tailwind", "cli"],
        "category": "design",
        "is_public": True,
        "approval_status": "approved",
        "view_count": 2400,
        "like_count": 0,
        "dislike_count": 0,
        "user_id": "df59c630-b91c-4c36-af34-a7639a8865f8"
    },
    {
        "name": "mcp-builder",
        "description": "Build MCP servers for LLM-external service integration with FastMCP and MCP SDK.",
        "spec": {
            "version": "1.0",
            "metadata": {
                "name": "mcp-builder",
                "description": "MCP server building for LLM-external service integration"
            },
            "steps": [
                "Identify service requirements and integration points",
                "Design MCP tool definitions and interfaces",
                "Implement FastMCP server with resource providers",
                "Test integration with MCP clients",
                "Validate API endpoints and protocols"
            ],
            "tools": ["write", "read", "edit", "bash"],
            "constraints": [
                "Follow MCP protocol specifications exactly",
                "Ensure secure communication between services",
                "Provide clear documentation for tool definitions"
            ]
        },
        "tags": ["mcp", "model-context-protocol", "integration", "server"],
        "category": "developer-tools",
        "is_public": True,
        "approval_status": "approved",
        "view_count": 578,
        "like_count": 0,
        "dislike_count": 0,
        "user_id": "df59c630-b91c-4c36-af34-a7639a8865f8"
    },
    {
        "name": "pdf",
        "description": "Extract text/tables, create, merge, split PDFs. Fill PDF forms programmatically.",
        "spec": {
            "version": "1.0",
            "metadata": {
                "name": "pdf",
                "description": "PDF document processing with text extraction and form filling"
            },
            "steps": [
                "Load PDF document for processing",
                "Extract text content and tables",
                "Process form fields and data",
                "Create or modify PDF content",
                "Fill PDF forms programmatically"
            ],
            "tools": ["read", "write"],
            "constraints": [
                "Handle PDF form fields correctly with proper encoding",
                "Maintain document structure during modifications",
                "Support various PDF formats and standards"
            ]
        },
        "tags": ["pdf", "document", "extraction", "generation"],
        "category": "productivity",
        "is_public": True,
        "approval_status": "approved",
        "view_count": 1200,
        "like_count": 0,
        "dislike_count": 0,
        "user_id": "df59c630-b91c-4c36-af34-a7639a8865f8"
    },
    {
        "name": "docx",
        "description": "Create, edit, analyze .docx Word documents with tracked changes, comments, formatting preservation.",
        "spec": {
            "version": "1.0",
            "metadata": {
                "name": "docx",
                "description": "Word document processing with tracked changes and formatting preservation"
            },
            "steps": [
                "Load Word document with formatting",
                "Edit document content with preserved formatting",
                "Add tracked changes and comments",
                "Analyze document properties and structure",
                "Save modified document with all metadata"
            ],
            "tools": ["read", "write"],
            "constraints": [
                "Preserve original document formatting during edits",
                "Maintain tracked changes and comments integrity",
                "Support complex document structures and tables"
            ]
        },
        "tags": ["docx", "word", "document", "generation"],
        "category": "productivity",
        "is_public": True,
        "approval_status": "approved",
        "view_count": 1000,
        "like_count": 0,
        "dislike_count": 0,
        "user_id": "df59c630-b91c-4c36-af34-a7639a8865f8"
    },
    {
        "name": "xlsx",
        "description": "Create, edit, analyze spreadsheets (.xlsx, .csv, .tsv). Excel formulas, data analysis, and visualization.",
        "spec": {
            "version": "1.0",
            "metadata": {
                "name": "xlsx",
                "description": "Spreadsheet processing with data analysis and formula support"
            },
            "steps": [
                "Load spreadsheet files (xlsx, csv, tsv)",
                "Process data rows and columns",
                "Apply Excel formulas and calculations",
                "Create charts and visualizations",
                "Save processed data back to file"
            ],
            "tools": ["read", "write"],
            "constraints": [
                "Handle Excel formulas correctly without corruption",
                "Support various spreadsheet formats and encodings",
                "Preserve cell formatting and data types"
            ]
        },
        "tags": ["xlsx", "excel", "spreadsheet", "generation"],
        "category": "productivity",
        "is_public": True,
        "approval_status": "approved",
        "view_count": 922,
        "like_count": 0,
        "dislike_count": 0,
        "user_id": "df59c630-b91c-4c36-af34-a7639a8865f8"
    },
    {
        "name": "pptx",
        "description": "Create, edit, analyze .pptx PowerPoint files. Presentations, slides, layouts, animations, and transitions.",
        "spec": {
            "version": "1.0",
            "metadata": {
                "name": "pptx",
                "description": "PowerPoint presentation processing with animations and layouts"
            },
            "steps": [
                "Create PowerPoint presentation with initial structure",
                "Add slides with specified layouts and themes",
                "Apply formatting and visual elements",
                "Add animations and transitions",
                "Save presentation with all elements intact"
            ],
            "tools": ["read", "write"],
            "constraints": [
                "Preserve slide layouts and design consistency",
                "Handle animations and transitions properly",
                "Support various presentation elements and structure"
            ]
        },
        "tags": ["pptx", "powerpoint", "presentation", "slides"],
        "category": "productivity",
        "is_public": True,
        "approval_status": "approved",
        "view_count": 1100,
        "like_count": 0,
        "dislike_count": 0,
        "user_id": "df59c630-b91c-4c36-af34-a7639a8865f8"
    }
]


async def seed_prd_skills():
    """Seed PRD skills data"""
    db_url = os.getenv("DATABASE_URL", "postgresql+asyncpg://admin:Tinhvan123@localhost:5432/app")
    
    # If running from host but .env has 'db' (container name)
    if 'db:5432' in db_url and not os.getenv("IS_IN_DOCKER"):
        db_url = db_url.replace('db:5432', 'localhost:5432')
        print(f"Swapped DB host to localhost: {db_url}")
    
    engine = create_async_engine(db_url)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Check if skills already exist
        result = await session.execute(select(Skill))
        existing_skills = result.scalars().all()
        
        if existing_skills:
            print(f"\n⚠️  {len(existing_skills)} skills already exist. Skipping seed.")
            return
        
        # Insert skills
        skills_created = 0
        for skill_data in PRD_SKILLS:
            try:
                # Convert user_id string to UUID
                user_id = UUID(skill_data["user_id"])
                
                # Convert spec to JSON string
                spec_json = json.dumps(skill_data["spec"])
                
                # Create skill
                skill = Skill(
                    name=skill_data["name"],
                    description=skill_data["description"],
                    spec=spec_json,
                    tags=skill_data["tags"],
                    category=skill_data["category"],
                    is_public=skill_data["is_public"],
                    approval_status=skill_data["approval_status"],
                    view_count=skill_data["view_count"],
                    like_count=skill_data["like_count"],
                    dislike_count=skill_data["dislike_count"],
                    user_id=user_id,
                    created_by=user_id,
                    updated_by=user_id
                )
                
                session.add(skill)
                skills_created += 1
                print(f"  ✓ {skill_data['name']}")
                
            except Exception as e:
                print(f"  ✗ Failed to insert {skill_data['name']}: {str(e)}")
                continue
        
        await session.commit()
        print(f"\n✅ Successfully created {skills_created} PRD skills!")


if __name__ == "__main__":
    asyncio.run(seed_prd_skills())