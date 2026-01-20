from __future__ import annotations

import logging
from typing import Dict, Any, Optional
from ldap3 import Server, Connection, ALL, NTLM
from ldap3.core.exceptions import LDAPException

from app.core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


class LDAPService:
    def __init__(self):
        # Cấu hình LDAP server - bạn cần điều chỉnh theo môi trường công ty
        self.server_host = getattr(settings, 'ldap_server_host', 'ldap://your-company-ldap-server.com')
        self.server_port = getattr(settings, 'ldap_server_port', 389)
        self.base_dn = getattr(settings, 'ldap_base_dn', 'dc=company,dc=com')
        self.user_search_base = getattr(settings, 'ldap_user_search_base', 'ou=users,dc=company,dc=com')
        self.bind_dn_template = getattr(settings, 'ldap_bind_dn_template', 'cn={username},ou=users,dc=company,dc=com')
        
        # Tạo server connection
        self.server = Server(
            host=self.server_host,
            port=self.server_port,
            get_info=ALL,
            use_ssl=getattr(settings, 'ldap_use_ssl', False)
        )
    
    async def authenticate_user(self, username: str, password: str) -> Optional[Dict[str, Any]]:
        """
        Xác thực người dùng qua LDAP
        
        Args:
            username: Tên đăng nhập (có thể là email hoặc username)
            password: Mật khẩu
            
        Returns:
            Dict chứa thông tin user nếu thành công, None nếu thất bại
        """
        try:
            # Mock authentication for testing - remove this in production
            if username == "sonth" and password == "abc123":
                return {
                    'username': username,
                    'email': f"{username}@company.com",
                    'full_name': "Son Tran Hoang",
                    'first_name': 'Son',
                    'last_name': 'Tran Hoang',
                    'department': 'IT',
                    'title': 'Developer',
                    'user_type': 'ldap'
                }
            
            # Nếu username là email, extract username part
            if '@' in username:
                username = username.split('@')[0]
            
            # Tạo bind DN
            bind_dn = self.bind_dn_template.format(username=username)
            
            # Tạo connection và authenticate
            conn = Connection(
                self.server,
                user=bind_dn,
                password=password,
                auto_bind=True,
                authentication=NTLM if getattr(settings, 'ldap_use_ntlm', False) else None
            )
            
            if conn.bind():
                # Lấy thông tin user từ LDAP
                user_info = await self._get_user_info(conn, username)
                conn.unbind()
                return user_info
            else:
                logger.warning(f"LDAP authentication failed for user: {username}")
                return None
                
        except LDAPException as e:
            logger.error(f"LDAP error during authentication for {username}: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error during LDAP authentication for {username}: {str(e)}")
            return None
    
    async def _get_user_info(self, conn: Connection, username: str) -> Dict[str, Any]:
        """
        Lấy thông tin chi tiết của user từ LDAP
        
        Args:
            conn: LDAP connection đã authenticated
            username: Username để search
            
        Returns:
            Dict chứa thông tin user
        """
        try:
            # Search user trong LDAP
            search_filter = f"(cn={username})"
            conn.search(
                search_base=self.user_search_base,
                search_filter=search_filter,
                attributes=['cn', 'mail', 'displayName', 'givenName', 'sn', 'department', 'title']
            )
            
            if conn.entries:
                entry = conn.entries[0]
                return {
                    'username': str(entry.cn) if hasattr(entry, 'cn') else username,
                    'email': str(entry.mail) if hasattr(entry, 'mail') else f"{username}@company.com",
                    'full_name': str(entry.displayName) if hasattr(entry, 'displayName') else 
                                f"{entry.givenName} {entry.sn}" if hasattr(entry, 'givenName') and hasattr(entry, 'sn') else username,
                    'first_name': str(entry.givenName) if hasattr(entry, 'givenName') else '',
                    'last_name': str(entry.sn) if hasattr(entry, 'sn') else '',
                    'department': str(entry.department) if hasattr(entry, 'department') else '',
                    'title': str(entry.title) if hasattr(entry, 'title') else '',
                    'user_type': 'ldap'
                }
            else:
                # Fallback nếu không tìm thấy thông tin chi tiết
                return {
                    'username': username,
                    'email': f"{username}@company.com",
                    'full_name': username,
                    'first_name': '',
                    'last_name': '',
                    'department': '',
                    'title': '',
                    'user_type': 'ldap'
                }
                
        except Exception as e:
            logger.error(f"Error getting user info from LDAP for {username}: {str(e)}")
            # Return basic info as fallback
            return {
                'username': username,
                'email': f"{username}@company.com",
                'full_name': username,
                'first_name': '',
                'last_name': '',
                'department': '',
                'title': '',
                'user_type': 'ldap'
            }
    
    async def test_connection(self) -> bool:
        """
        Test LDAP server connection
        
        Returns:
            True nếu kết nối thành công, False nếu thất bại
        """
        try:
            conn = Connection(self.server)
            result = conn.bind()
            if conn.bound:
                conn.unbind()
            return result
        except Exception as e:
            logger.error(f"LDAP connection test failed: {str(e)}")
            return False