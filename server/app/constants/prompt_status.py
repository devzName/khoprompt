"""
Prompt status constants
"""

class PromptStatus:
    PENDING = 'pending'
    APPROVED = 'approved'
    REJECTED = 'rejected'
    DRAFT = 'draft'
    ARCHIVED = 'archived'

# List of all valid statuses
VALID_PROMPT_STATUSES = [
    PromptStatus.PENDING,
    PromptStatus.APPROVED,
    PromptStatus.REJECTED,
    PromptStatus.DRAFT,
    PromptStatus.ARCHIVED
]