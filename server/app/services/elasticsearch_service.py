from __future__ import annotations

from typing import Dict, List, Any, Optional

from elasticsearch import AsyncElasticsearch
from loguru import logger

from app.core.config import get_settings
from app.models.prompt import Prompt


class ElasticsearchService:
    def __init__(self):
        self.settings = get_settings()
        self.client: Optional[AsyncElasticsearch] = None
        self.index_name = f"{self.settings.elasticsearch_index_prefix}_prompts"
        
    async def connect(self):
        """Initialize Elasticsearch connection"""
        if not self.settings.elasticsearch_enabled:
            return
            
        try:
            self.client = AsyncElasticsearch(
                [self.settings.elasticsearch_url],
                verify_certs=False,
                ssl_show_warn=False
            )
            
            await self.client.ping()
            await self.create_index()
            
        except Exception as e:
            logger.error(f"Failed to connect to Elasticsearch: {e}")
            self.client = None

    async def disconnect(self):
        """Close Elasticsearch connection"""
        if self.client:
            await self.client.close()

    async def create_index(self):
        """Create the prompts index with proper mapping"""
        if not self.client:
            return
            
        # Create prompts index
        prompts_mapping = {
            "mappings": {
                "properties": {
                    "id": {"type": "integer"},
                    "title": {
                        "type": "text",
                        "analyzer": "vietnamese_analyzer",
                        "fields": {
                            "keyword": {"type": "keyword"},
                            "suggest": {
                                "type": "completion",
                                "analyzer": "simple"
                            }
                        }
                    },
                    "description": {
                        "type": "text",
                        "analyzer": "standard"
                    },
                    "content": {
                        "type": "text",
                        "analyzer": "standard"
                    },
                    "slug": {"type": "keyword"},
                    "category_id": {"type": "integer"},
                    "category_name": {"type": "keyword"},
                    "category_slug": {"type": "keyword"},
                    "tag_ids": {"type": "integer"},
                    "tag_names": {"type": "keyword"},
                    "user": {
                        "properties": {
                            "id": {"type": "keyword"},
                            "full_name": {"type": "text"},
                            "avatar_url": {"type": "keyword"}
                        }
                    },
                    "status": {"type": "keyword"},
                    "view_count": {"type": "integer"},
                    "created_at": {"type": "date"},
                    "updated_at": {"type": "date"}
                }
            },
            "settings": {
                "analysis": {
                    "analyzer": {
                        "vietnamese_analyzer": {
                            "tokenizer": "standard",
                            "filter": ["lowercase", "asciifolding"]
                        },
                        "autocomplete": {
                            "tokenizer": "autocomplete",
                            "filter": ["lowercase", "asciifolding"]
                        },
                        "autocomplete_search": {
                            "tokenizer": "keyword",
                            "filter": ["lowercase", "asciifolding"]
                        }
                    },
                    "tokenizer": {
                        "autocomplete": {
                            "type": "edge_ngram",
                            "min_gram": 2,
                            "max_gram": 10,
                            "token_chars": ["letter", "digit"]
                        }
                    }
                }
            }
        }
        
        # Create categories index
        categories_mapping = {
            "mappings": {
                "properties": {
                    "id": {"type": "integer"},
                    "name": {
                        "type": "text",
                        "analyzer": "vietnamese_analyzer",
                        "fields": {
                            "keyword": {"type": "keyword"},
                            "suggest": {
                                "type": "completion",
                                "analyzer": "simple"
                            }
                        }
                    },
                    "slug": {"type": "keyword"}
                }
            },
            "settings": {
                "analysis": {
                    "analyzer": {
                        "vietnamese_analyzer": {
                            "tokenizer": "standard",
                            "filter": ["lowercase", "asciifolding"]
                        }
                    }
                }
            }
        }
        
        # Create tags index
        tags_mapping = {
            "mappings": {
                "properties": {
                    "id": {"type": "integer"},
                    "name": {
                        "type": "text",
                        "analyzer": "vietnamese_analyzer",
                        "fields": {
                            "keyword": {"type": "keyword"},
                            "suggest": {
                                "type": "completion",
                                "analyzer": "simple"
                            }
                        }
                    },
                    "category_id": {"type": "integer"},
                    "prompt_count": {"type": "integer"}
                }
            },
            "settings": {
                "analysis": {
                    "analyzer": {
                        "vietnamese_analyzer": {
                            "tokenizer": "standard",
                            "filter": ["lowercase", "asciifolding"]
                        }
                    }
                }
            }
        }
        
        try:
            # Create prompts index
            prompts_exists = await self.client.indices.exists(index=self.index_name)
            if not prompts_exists:
                await self.client.indices.create(index=self.index_name, body=prompts_mapping)
                
            # Create categories index
            categories_index = f"{self.settings.elasticsearch_index_prefix}_categories"
            categories_exists = await self.client.indices.exists(index=categories_index)
            if not categories_exists:
                await self.client.indices.create(index=categories_index, body=categories_mapping)
                
            # Create tags index
            tags_index = f"{self.settings.elasticsearch_index_prefix}_tags"
            tags_exists = await self.client.indices.exists(index=tags_index)
            if not tags_exists:
                await self.client.indices.create(index=tags_index, body=tags_mapping)
                
        except Exception as e:
            logger.error(f"Failed to create Elasticsearch indices: {e}")

    async def index_prompt(self, prompt: Prompt):
        """Index a single prompt"""
        if not self.client:
            return
            
        try:
            # Index prompt
            prompt_doc = {
                "id": prompt.id,
                "title": prompt.title,
                "description": prompt.description,
                "content": prompt.content,
                "slug": prompt.slug,
                "category_id": prompt.category.id if prompt.category else None,
                "category_name": prompt.category.name if prompt.category else None,
                "category_slug": prompt.category.slug if prompt.category else None,
                "tag_ids": [tag.id for tag in prompt.tags] if prompt.tags else [],
                "tag_names": [tag.name for tag in prompt.tags] if prompt.tags else [],
                "user": {
                    "id": str(prompt.user.id),
                    "full_name": prompt.user.full_name,
                    "avatar_url": prompt.user.avatar_url
                } if prompt.user else None,
                "status": prompt.status,
                "view_count": prompt.view_count or 0,
                "created_at": prompt.created_at.isoformat() if prompt.created_at else None,
                "updated_at": prompt.updated_at.isoformat() if prompt.updated_at else None
            }
            
            await self.client.index(
                index=self.index_name,
                id=prompt.id,
                body=prompt_doc
            )
            
            # Index category separately if exists
            if prompt.category:
                await self.index_category(prompt.category)
                
            # Index tags separately if exist
            if prompt.tags:
                for tag in prompt.tags:
                    await self.index_tag(tag)
            
        except Exception as e:
            logger.error(f"Failed to index prompt {prompt.id}: {e}")

    async def index_category(self, category):
        """Index a single category"""
        if not self.client or not category:
            return
            
        try:
            categories_index = f"{self.settings.elasticsearch_index_prefix}_categories"
            
            category_doc = {
                "id": category.id,
                "name": category.name,
                "slug": category.slug
            }
            
            await self.client.index(
                index=categories_index,
                id=category.id,
                body=category_doc
            )
            
        except Exception as e:
            logger.error(f"Failed to index category {category.id}: {e}")

    async def index_tag(self, tag):
        """Index a single tag"""
        if not self.client or not tag:
            return
            
        try:
            tags_index = f"{self.settings.elasticsearch_index_prefix}_tags"
            
            # Count prompts with this tag
            count_query = {
                "query": {
                    "bool": {
                        "must": [
                            {"term": {"status": "approved"}},
                            {"term": {"tag_ids": tag.id}}
                        ]
                    }
                }
            }
            
            count_result = await self.client.count(index=self.index_name, body=count_query)
            prompt_count = count_result.get("count", 0)
            
            tag_doc = {
                "id": tag.id,
                "name": tag.name,
                "category_id": getattr(tag, 'category_id', None),
                "prompt_count": prompt_count
            }
            
            await self.client.index(
                index=tags_index,
                id=tag.id,
                body=tag_doc
            )
            
        except Exception as e:
            logger.error(f"Failed to index tag {tag.id}: {e}")

    async def delete_prompt(self, prompt_id: int):
        """Delete a prompt from index"""
        if not self.client:
            return
            
        try:
            await self.client.delete(
                index=self.index_name,
                id=prompt_id,
                ignore=[404]
            )
        except Exception as e:
            logger.error(f"Failed to delete prompt {prompt_id}: {e}")

    async def delete_tag(self, tag_id: int):
        """Delete a tag from tags index"""
        if not self.client:
            return
            
        try:
            tags_index = f"{self.settings.elasticsearch_index_prefix}_tags"
            await self.client.delete(
                index=tags_index,
                id=tag_id,
                ignore=[404]
            )
        except Exception as e:
            logger.error(f"Failed to delete tag {tag_id}: {e}")

    async def delete_category(self, category_id: int):
        """Delete a category from categories index"""
        if not self.client:
            return
            
        try:
            categories_index = f"{self.settings.elasticsearch_index_prefix}_categories"
            await self.client.delete(
                index=categories_index,
                id=category_id,
                ignore=[404]
            )
        except Exception as e:
            logger.error(f"Failed to delete category {category_id}: {e}")

    def _normalize_vietnamese(self, text: str) -> str:
        """Convert Vietnamese text with diacritics to without diacritics"""
        import unicodedata
        # Remove diacritics
        normalized = unicodedata.normalize('NFD', text)
        without_diacritics = ''.join(c for c in normalized if unicodedata.category(c) != 'Mn')
        return without_diacritics.lower()

    async def search_suggestions(self, query: str, limit: int = 10) -> Dict[str, List[Dict]]:
        """Get search suggestions using Elasticsearch with separate indices"""
        if not self.client:
            return {"prompts": [], "categories": [], "tags": []}
        
        try:
            # Search for prompts
            prompt_search = {
                "query": {
                    "bool": {
                        "must": [
                            {"term": {"status": "approved"}},
                            {
                                "bool": {
                                    "should": [
                                        {
                                            "match_phrase": {
                                                "title": query
                                            }
                                        },
                                        {
                                            "match": {
                                                "title": {
                                                    "query": query,
                                                    "fuzziness": "0",
                                                    "operator": "and"
                                                }
                                            }
                                        },
                                        {
                                            "wildcard": {
                                                "title.keyword": f"*{query}*"
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                },
                "size": limit,
                "_source": ["id", "title", "category_name"]
            }
            
            prompt_result = await self.client.search(
                index=self.index_name,
                body=prompt_search
            )
            
            prompts = []
            for hit in prompt_result["hits"]["hits"]:
                source = hit["_source"]
                prompts.append({
                    "id": source["id"],
                    "title": source["title"],
                    "category": source.get("category_name")
                })
            
            # Search categories in separate index
            categories_index = f"{self.settings.elasticsearch_index_prefix}_categories"
            category_search = {
                "query": {
                    "bool": {
                        "should": [
                            {
                                "match_phrase": {
                                    "name": query
                                }
                            },
                            {
                                "match": {
                                    "name": {
                                        "query": query,
                                        "fuzziness": "0",
                                        "operator": "and"
                                    }
                                }
                            },
                            {
                                "wildcard": {
                                    "name.keyword": f"*{query}*"
                                }
                            }
                        ]
                    }
                },
                "size": limit,
                "_source": ["id", "name"]
            }
            
            try:
                category_result = await self.client.search(
                    index=categories_index,
                    body=category_search
                )
                
                categories = []
                for hit in category_result["hits"]["hits"]:
                    source = hit["_source"]
                    categories.append({
                        "id": source["id"],
                        "name": source["name"]
                    })
            except Exception as e:
                logger.warning(f"Categories search failed: {e}")
                categories = []
            
            # Search tags in separate index
            tags_index = f"{self.settings.elasticsearch_index_prefix}_tags"
            tag_search = {
                "query": {
                    "bool": {
                        "should": [
                            {
                                "match_phrase": {
                                    "name": query
                                }
                            },
                            {
                                "match": {
                                    "name": {
                                        "query": query,
                                        "fuzziness": "0",
                                        "operator": "and"
                                    }
                                }
                            },
                            {
                                "wildcard": {
                                    "name.keyword": f"*{query}*"
                                }
                            }
                        ]
                    }
                },
                "size": limit,
                "_source": ["id", "name", "prompt_count"]
            }
            
            try:
                tag_result = await self.client.search(
                    index=tags_index,
                    body=tag_search
                )
                
                tags = []
                for hit in tag_result["hits"]["hits"]:
                    source = hit["_source"]
                    tags.append({
                        "id": source["id"],
                        "name": source["name"],
                        "count": source.get("prompt_count", 0)
                    })
            except Exception as e:
                logger.warning(f"Tags search failed: {e}")
                tags = []
            
            return {
                "prompts": prompts,
                "categories": categories,
                "tags": tags
            }
            
        except Exception as e:
            logger.error(f"Elasticsearch search failed: {e}")
            return {"prompts": [], "categories": [], "tags": []}

    async def search_prompts(
        self,
        query: str = None,
        tag: str = None,
        category: str = None,
        page: int = 1,
        limit: int = 20
    ) -> Dict[str, Any]:
        """Search prompts using Elasticsearch"""
        if not self.client:
            return {"data": [], "pagination": {"page": page, "limit": limit, "total": 0, "pages": 0}}
            
        try:
            must_clauses = [{"term": {"status": "approved"}}]
            
            if query:
                must_clauses.append({
                    "bool": {
                        "should": [
                            {
                                "match_phrase": {
                                    "title": query
                                }
                            },
                            {
                                "match": {
                                    "title": {
                                        "query": query,
                                        "fuzziness": "0",
                                        "operator": "and"
                                    }
                                }
                            },
                            {
                                "wildcard": {
                                    "title.keyword": f"*{query}*"
                                }
                            }
                        ]
                    }
                })
            
            if category:
                must_clauses.append({
                    "bool": {
                        "should": [
                            {"term": {"category_slug": category}},
                            {"match": {"category_name": category}}
                        ]
                    }
                })
            
            if tag:
                must_clauses.append({
                    "terms": {"tag_names": [tag]}
                })
            
            search_body = {
                "query": {
                    "bool": {
                        "must": must_clauses
                    }
                },
                "sort": [
                    {"_score": {"order": "desc"}},
                    {"created_at": {"order": "desc"}}
                ],
                "from": (page - 1) * limit,
                "size": limit
            }
            
            result = await self.client.search(
                index=self.index_name,
                body=search_body
            )
            
            prompts = []
            for hit in result["hits"]["hits"]:
                source = hit["_source"]
                
                # Reconstruct category and tags objects for compatibility
                category = None
                if source.get("category_id"):
                    category = {
                        "id": source["category_id"],
                        "name": source.get("category_name"),
                        "slug": source.get("category_slug")
                    }
                
                tags = []
                if source.get("tag_ids") and source.get("tag_names"):
                    for i, tag_id in enumerate(source["tag_ids"]):
                        if i < len(source["tag_names"]):
                            tags.append({
                                "id": tag_id,
                                "name": source["tag_names"][i]
                            })
                
                prompts.append({
                    "id": source["id"],
                    "title": source["title"],
                    "description": source["description"],
                    "slug": source["slug"],
                    "category": category,
                    "tags": tags,
                    "user": source.get("user"),
                    "created_at": source.get("created_at"),
                    "view_count": source.get("view_count", 0),
                    "score": hit["_score"]
                })
            
            total = result["hits"]["total"]["value"]
            pages = (total + limit - 1) // limit
            
            return {
                "data": prompts,
                "pagination": {
                    "page": page,
                    "limit": limit,
                    "total": total,
                    "pages": pages
                }
            }
            
        except Exception as e:
            logger.error(f"Elasticsearch search failed: {e}")
            return {"data": [], "pagination": {"page": page, "limit": limit, "total": 0, "pages": 0}}

    async def bulk_index_prompts(self, prompts: List[Prompt]):
        """Bulk index multiple prompts"""
        if not self.client or not prompts:
            return
            
        try:
            actions = []
            categories_to_index = {}
            tags_to_index = {}
            
            for prompt in prompts:
                # Prepare prompt document
                prompt_doc = {
                    "id": prompt.id,
                    "title": prompt.title,
                    "description": prompt.description,
                    "content": prompt.content,
                    "slug": prompt.slug,
                    "category_id": prompt.category.id if prompt.category else None,
                    "category_name": prompt.category.name if prompt.category else None,
                    "category_slug": prompt.category.slug if prompt.category else None,
                    "tag_ids": [tag.id for tag in prompt.tags] if prompt.tags else [],
                    "tag_names": [tag.name for tag in prompt.tags] if prompt.tags else [],
                    "user": {
                        "id": str(prompt.user.id),
                        "full_name": prompt.user.full_name,
                        "avatar_url": prompt.user.avatar_url
                    } if prompt.user else None,
                    "status": prompt.status,
                    "view_count": prompt.view_count or 0,
                    "created_at": prompt.created_at.isoformat() if prompt.created_at else None,
                    "updated_at": prompt.updated_at.isoformat() if prompt.updated_at else None
                }
                
                actions.append({
                    "_index": self.index_name,
                    "_id": prompt.id,
                    "_source": prompt_doc
                })
                
                # Collect categories and tags for separate indexing
                if prompt.category:
                    categories_to_index[prompt.category.id] = prompt.category
                    
                if prompt.tags:
                    for tag in prompt.tags:
                        tags_to_index[tag.id] = tag
            
            # Bulk index prompts
            from elasticsearch.helpers import async_bulk
            await async_bulk(self.client, actions)
            
            # Index categories separately
            for category in categories_to_index.values():
                await self.index_category(category)
                
            # Index tags separately
            for tag in tags_to_index.values():
                await self.index_tag(tag)
            
        except Exception as e:
            logger.error(f"Bulk indexing failed: {e}")


# Global instance
elasticsearch_service = ElasticsearchService()