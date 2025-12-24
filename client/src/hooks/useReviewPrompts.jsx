import { useState, useEffect } from 'react';
import { message } from 'antd';
import { FileTextOutlined, AuditOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from './useAuth';

export const useReviewPrompts = () => {
    const { user, logout } = useAuth();
    const { t } = useTranslation();
    const [searchValue, setSearchValue] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [prompts, setPrompts] = useState([]);

    const fetchSubmittedPrompts = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('access_token');
            const response = await fetch(`/api/v1/prompts?state=SUBMITTED&limit=100`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch prompts');
            const data = await response.json();
            setPrompts(data);
        } catch (error) {
            console.error('Error fetching prompts for review:', error);
            message.error(t('reviewPrompts.errorFetching'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchSubmittedPrompts();
        }
    }, [user]);

    const handleApprove = async (id) => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`/api/v1/prompts/${id}/approve`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to approve prompt');
            message.success(t('reviewPrompts.approveSuccess'));
            setPrompts(prompts.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error approving prompt:', error);
            message.error(t('reviewPrompts.approveError'));
        }
    };

    const handleReject = async (id) => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`/api/v1/prompts/${id}/reject`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to reject prompt');
            message.success(t('reviewPrompts.rejectSuccess'));
            setPrompts(prompts.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error rejecting prompt:', error);
            message.error(t('reviewPrompts.rejectError'));
        }
    };

    const menuItems = [
        { key: 'review-list', icon: <AuditOutlined />, label: t('sidebar.reviewPrompts'), action: () => { } },
    ];

    const handleLogout = () => {
        logout(() => setMobileMenuOpen(false));
    };

    const handleSearchChange = (e) => {
        setSearchValue(e.target.value);
    };

    return {
        user,
        searchValue,
        mobileMenuOpen,
        loading,
        prompts,
        menuItems,
        setMobileMenuOpen,
        handleApprove,
        handleReject,
        handleLogout,
        handleSearchChange,
    };
};
