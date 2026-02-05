#!/usr/bin/env python3
"""
Script to index all approved prompts into Elasticsearch
Run this after setting up Elasticsearch to populate the search index
"""

import asyncio
import sys
from pathlib import Path

# Add the app directory to Python path
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.prompt import Prompt
from app.constants.prompt_status import PromptStatus
from app.services.elasticsearch_service import elasticsearch_service
from loguru import logger


async def index_all_prompts(recreate_index: bool = False):
    """Index all approved prompts into Elasticsearch"""
    logger.info("Starting to index all approved prompts...")
    
    # Connect to Elasticsearch
    await elasticsearch_service.connect()
    
    if not elasticsearch_service.client:
        logger.error("Failed to connect to Elasticsearch")
        return
    
    # Optionally recreate indices
    if recreate_index:
        logger.info("Recreating Elasticsearch indices...")
        try:
            # Delete existing indices
            indices_to_delete = [
                elasticsearch_service.index_name,
                f"{elasticsearch_service.settings.elasticsearch_index_prefix}_categories",
                f"{elasticsearch_service.settings.elasticsearch_index_prefix}_tags"
            ]
            
            for index_name in indices_to_delete:
                exists = await elasticsearch_service.client.indices.exists(index=index_name)
                if exists:
                    await elasticsearch_service.client.indices.delete(index=index_name)
                    logger.info(f"Deleted index: {index_name}")
            
            # Recreate indices with new mapping
            await elasticsearch_service.create_index()
            logger.info("Recreated indices with new mapping")
            
        except Exception as e:
            logger.error(f"Error recreating indices: {e}")
            return
    
    # Get database session
    async for session in get_db():
        try:
            # Fetch all approved prompts with relationships
            stmt = (
                select(Prompt)
                .options(
                    selectinload(Prompt.category),
                    selectinload(Prompt.tags),
                    selectinload(Prompt.user)
                )
                .where(Prompt.status == PromptStatus.APPROVED)
            )
            
            result = await session.execute(stmt)
            prompts = result.scalars().all()
            
            logger.info(f"Found {len(prompts)} approved prompts to index")
            
            if prompts:
                # Bulk index prompts
                await elasticsearch_service.bulk_index_prompts(prompts)
                logger.info(f"Successfully indexed {len(prompts)} prompts")
            else:
                logger.info("No prompts to index")
                
        except Exception as e:
            logger.error(f"Error indexing prompts: {e}")
        finally:
            await session.close()
    
    # Disconnect from Elasticsearch
    await elasticsearch_service.disconnect()
    logger.info("Indexing completed")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Index prompts to Elasticsearch')
    parser.add_argument('--recreate', action='store_true', 
                       help='Recreate indices with new mapping before indexing')
    
    args = parser.parse_args()
    
    asyncio.run(index_all_prompts(recreate_index=args.recreate))