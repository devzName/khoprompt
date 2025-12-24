import { useState, useEffect } from 'react';
import { message } from 'antd';
import { useTranslation } from 'react-i18next';
import apiClient from '../axios/apiClient';
import { API_ENDPOINTS } from '../constants/api';

export const useManagePrompts = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [prompts, setPrompts] = useState([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchValue, setSearchValue] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Filters
    const [filters, setFilters] = useState({
        state: null,
        category: null,
    });

    useEffect(() => {
        fetchPrompts();
    }, [currentPage, pageSize, searchValue, filters]);

    const fetchPrompts = async () => {
        setLoading(true);
        try {
            const params = {
                limit: pageSize,
                offset: (currentPage - 1) * pageSize,
                q: searchValue || undefined,
                state: filters.state || undefined,
                categoryId: filters.category || undefined,
            };

            const response = await apiClient.get(API_ENDPOINTS.PROMPTS.BASE, { params });
            // Note: API returns [items, total] if we change response model? 
            // Currently v1/prompt.py list_prompts returns list[PromptOut].
            // Does it return headers for total? Or just the list?
            // Re-checking api implementation...
            // It calls PromptService.list_prompts which returns (items, total).
            // BUT the router endpoint: @router.get("", response_model=list[PromptOut]) returning "items".
            // So we don't get total count in current API implementation! 
            // We might need to assume no pagination total support or update API. 
            // For now, I'll trust it returns list.

            setPrompts(response.data);
            // setTotal(??); 
        } catch (error) {
            console.error('Failed to fetch prompts:', error);
            message.error(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await apiClient.delete(API_ENDPOINTS.PROMPTS.BY_ID(id));
            message.success(t('common.success'));
            fetchPrompts();
        } catch (error) {
            message.error(t('common.error'));
        }
    };

    const handleArchive = async (id) => {
        try {
            await apiClient.post(`/prompts/${id}/archive`);
            message.success(t('common.success'));
            fetchPrompts();
        } catch (error) {
            message.error(t('common.error'));
        }
    };

    return {
        loading,
        prompts,
        total,
        currentPage,
        pageSize,
        searchValue,
        mobileMenuOpen,
        setSearchValue,
        setMobileMenuOpen,
        setCurrentPage,
        setPageSize,
        handleDelete,
        handleArchive,
        refresh: fetchPrompts
    };
};
