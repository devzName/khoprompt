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
            
        mapping = {
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
                    "category": {
                        "properties": {
                            "id": {"type": "integer"},
                            "name": {
                                "type": "text",
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
                    "tags": {
                        "type": "nested",
                        "properties": {
                            "id": {"type": "integer"},
                            "name": {
                                "type": "text",
                                "fields": {
                                    "keyword": {"type": "keyword"},
                                    "suggest": {
                                        "type": "completion",
                                        "analyzer": "simple"
                                    }
                                }
                            }
                        }
                    },
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
        
        try:
            exists = await self.client.indices.exists(index=self.index_name)
            if not exists:
                await self.client.indices.create(index=self.index_name, body=mapping)
        except Exception as e:
            logger.error(f"Failed to create Elasticsearch index: {e}")

    async def index_prompt(self, prompt: Prompt):
        """Index a single prompt"""
        if not self.client:
            return
            
        try:
            doc = {
                "id": prompt.id,
                "title": prompt.title,
                "description": prompt.description,
                "content": prompt.content,
                "slug": prompt.slug,
                "category": {
                    "id": prompt.category.id,
                    "name": prompt.category.name,
                    "slug": prompt.category.slug
                } if prompt.category else None,
                "tags": [
                    {
                        "id": tag.id,
                        "name": tag.name
                    }
                    for tag in prompt.tags
                ] if prompt.tags else [],
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
                body=doc
            )
            
        except Exception as e:
            logger.error(f"Failed to index prompt {prompt.id}: {e}")

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

    def _normalize_vietnamese(self, text: str) -> str:
        """Convert Vietnamese text with diacritics to without diacritics"""
        import unicodedata
        # Remove diacritics
        normalized = unicodedata.normalize('NFD', text)
        without_diacritics = ''.join(c for c in normalized if unicodedata.category(c) != 'Mn')
        return without_diacritics.lower()

    async def search_suggestions(self, query: str, limit: int = 10) -> Dict[str, List[Dict]]:
        """Get search suggestions using Elasticsearch"""
        if not self.client:
            return {"prompts": [], "categories": [], "tags": []}
        
        try:
            # Search for prompts with partial matching (wildcard + analyzed)
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
                "_source": ["id", "title", "category"]
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
                    "category": source.get("category", {}).get("name") if source.get("category") else None
                })
            
            # Get category suggestions
            category_search = {
                "query": {
                    "bool": {
                        "must": [
                            {"term": {"status": "approved"}},
                            {
                                "match": {
                                    "category.name": {
                                        "query": query,
                                        "fuzziness": "AUTO"
                                    }
                                }
                            }
                        ]
                    }
                },
                "size": 0,
                "aggs": {
                    "categories": {
                        "terms": {
                            "field": "category.name.keyword",
                            "size": limit
                        }
                    }
                }
            }
            
            category_result = await self.client.search(
                index=self.index_name,
                body=category_search
            )
            
            categories = []
            if "aggregations" in category_result:
                for bucket in category_result["aggregations"]["categories"]["buckets"]:
                    categories.append({
                        "id": None,
                        "name": bucket["key"],
                        "count": bucket["doc_count"]
                    })
            
            # Get tag suggestions
            tag_search = {
                "query": {
                    "bool": {
                        "must": [
                            {"term": {"status": "approved"}},
                            {
                                "nested": {
                                    "path": "tags",
                                    "query": {
                                        "match": {
                                            "tags.name": {
                                                "query": query,
                                                "fuzziness": "AUTO"
                                            }
                                        }
                                    }
                                }
                            }
                        ]
                    }
                },
                "size": 0,
                "aggs": {
                    "tags": {
                        "nested": {
                            "path": "tags"
                        },
                        "aggs": {
                            "tag_names": {
                                "terms": {
                                    "field": "tags.name.keyword",
                                    "size": limit
                                }
                            }
                        }
                    }
                }
            }
            
            tag_result = await self.client.search(
                index=self.index_name,
                body=tag_search
            )
            
            tags = []
            if "aggregations" in tag_result:
                for bucket in tag_result["aggregations"]["tags"]["tag_names"]["buckets"]:
                    tags.append({
                        "id": None,
                        "name": bucket["key"],
                        "count": bucket["doc_count"]
                    })
            
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
                            {"term": {"category.slug": category}},
                            {"match": {"category.name": category}}
                        ]
                    }
                })
            
            if tag:
                must_clauses.append({
                    "nested": {
                        "path": "tags",
                        "query": {
                            "match": {"tags.name": tag}
                        }
                    }
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
                prompts.append({
                    "id": source["id"],
                    "title": source["title"],
                    "description": source["description"],
                    "slug": source["slug"],
                    "category": source.get("category"),
                    "tags": source.get("tags", []),
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
            for prompt in prompts:
                doc = {
                    "id": prompt.id,
                    "title": prompt.title,
                    "description": prompt.description,
                    "content": prompt.content,
                    "slug": prompt.slug,
                    "category": {
                        "id": prompt.category.id,
                        "name": prompt.category.name,
                        "slug": prompt.category.slug
                    } if prompt.category else None,
                    "tags": [
                        {
                            "id": tag.id,
                            "name": tag.name
                        }
                        for tag in prompt.tags
                    ] if prompt.tags else [],
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
                    "_source": doc
                })
            
            from elasticsearch.helpers import async_bulk
            await async_bulk(self.client, actions)
            
        except Exception as e:
            logger.error(f"Bulk indexing failed: {e}")


# Global instance
elasticsearch_service = ElasticsearchService()