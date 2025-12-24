from __future__ import annotations

import hashlib
from datetime import datetime

from fastapi import Request


class FingerprintService:
    """Service for generating viewer fingerprints and detecting bots."""

    @staticmethod
    def generate_viewer_hash(ip: str, user_agent: str, date: str) -> str:
        """
        Generate SHA256 hash for guest identification.
        
        Args:
            ip: Client IP address
            user_agent: Client user agent string
            date: Date string (YYYY-MM-DD format)
            
        Returns:
            64-character hex string (SHA256 hash)
        """
        data = f"{ip}|{user_agent}|{date}"
        return hashlib.sha256(data.encode()).hexdigest()

    @staticmethod
    def extract_client_info(request: Request) -> tuple[str, str]:
        """
        Extract IP address and User-Agent from request.
        Handles proxies and load balancers.
        
        Args:
            request: FastAPI request object
            
        Returns:
            Tuple of (ip_address, user_agent)
        """
        # Handle X-Forwarded-For (proxy/load balancer)
        forwarded_for = request.headers.get("X-Forwarded-For", "")
        if forwarded_for:
            # Take first IP in chain (original client)
            ip = forwarded_for.split(",")[0].strip()
        else:
            # Try X-Real-IP header
            ip = request.headers.get("X-Real-IP", "")
        
        # Fallback to direct client IP
        if not ip:
            ip = request.client.host if request.client else "unknown"
        
        # Get user agent
        user_agent = request.headers.get("User-Agent", "unknown")
        
        return ip, user_agent

    @staticmethod
    def is_bot(user_agent: str) -> bool:
        """
        Detect common bots and crawlers.
        
        Args:
            user_agent: User agent string
            
        Returns:
            True if bot detected, False otherwise
        """
        bot_patterns = [
            "bot",
            "crawler",
            "spider",
            "scraper",
            "curl",
            "wget",
            "python-requests",
            "axios",
            "postman",
            "insomnia",
            "httpie",
            "go-http-client",
            "java",
            "okhttp",
            "apache-httpclient",
            "headless",
            "phantom",
            "selenium",
            "webdriver",
        ]
        
        ua_lower = user_agent.lower()
        return any(pattern in ua_lower for pattern in bot_patterns)

    @staticmethod
    def get_date_string() -> str:
        """Get current date in YYYY-MM-DD format for fingerprinting."""
        return datetime.utcnow().strftime("%Y-%m-%d")
