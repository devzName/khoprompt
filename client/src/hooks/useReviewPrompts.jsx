import { useState, useEffect } from 'react';
import { message } from 'antd';
import { AuditOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from './useAuth';
import { API_ENDPOINTS } from '../constants/api';
import apiClient from '../axios/apiClient';

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
            const response = await apiClient.get(API_ENDPOINTS.PROMPTS.BASE, {
                params: { state: 'SUBMITTED', limit: 100 }
            });
            setPrompts(response.data);
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
            await apiClient.post(API_ENDPOINTS.PROMPTS.APPROVE(id));
            message.success(t('reviewPrompts.approveSuccess'));
            setPrompts(prompts.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error approving prompt:', error);
            message.error(error.message);
        }
    };

    const handleReject = async (id) => {
        try {
            await apiClient.post(API_ENDPOINTS.PROMPTS.REJECT(id));
            message.success(t('reviewPrompts.rejectSuccess'));
            setPrompts(prompts.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error rejecting prompt:', error);
            message.error(error.message);
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
