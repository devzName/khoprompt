import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Avatar, Dropdown, AutoComplete, Spin, Input } from 'antd';
import { PlusOutlined, SearchOutlined, FolderOutlined, TagOutlined, ClockCircleOutlined, CloseOutlined } from '@ant-design/icons';
import { useLanguage } from '../hooks/useLanguage';
import { createUserMenuItems } from '../utils/userMenuUtils.jsx';
import Logo from './shared/Logo';
import { ROUTES } from '../constants/routes';
import { searchService } from '../services/searchService';

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
const Header = () => {
  const { t, getLanguageMenuItems } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [user, setUser] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  useEffect(() => {
    const queryFromUrl = searchParams.get('q') || '';
    setSearchValue(queryFromUrl);
  }, [searchParams]);
  
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save search to history
  const saveToHistory = (query, type = null) => {
    if (!query || query.trim().length < 2) return;
    
    const trimmedQuery = query.trim();
    const historyItem = {
      query: trimmedQuery,
      type: type,
      timestamp: Date.now()
    };
    
    const newHistory = [
      historyItem,
      ...searchHistory.filter(item => 
        typeof item === 'string' ? item !== trimmedQuery : item.query !== trimmedQuery
      )
    ].slice(0, 10);
    
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };
  const removeFromHistory = (queryToRemove) => {
    const newHistory = searchHistory.filter(item => 
      typeof item === 'string' ? item !== queryToRemove : item.query !== queryToRemove
    );
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    
    if ((!searchValue || searchValue.length < 2) && isSearchFocused) {
      setSuggestions(newHistory.map((item, index) => {
        const query = typeof item === 'string' ? item : item.query;
        const type = typeof item === 'string' ? null : item.type;
        
        let icon = <ClockCircleOutlined className="text-gray-400 text-sm shrink-0" />;
        if (type === 'category') {
          icon = <FolderOutlined className="text-gray-400 text-sm shrink-0" />;
        } else if (type === 'tag') {
          icon = <TagOutlined className="text-gray-400 text-sm shrink-0" />;
        }
        
        return {
          value: query,
          label: (
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {icon}
                <span className="truncate" title={query}>{query}</span>
              </div>
              <button
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromHistory(query);
                }}
              >
                <CloseOutlined className="text-gray-400 text-xs" />
              </button>
            </div>
          ),
          key: `history-${index}`,
          type: type || 'history',
          historyType: type
        };
      }));
    }
  };
  const getHistoryOptions = () => {
    if (searchValue && searchValue.length >= 2) return [];
    
    return searchHistory.map((item, index) => {
      const query = typeof item === 'string' ? item : item.query;
      const type = typeof item === 'string' ? null : item.type;
      
      let icon = <ClockCircleOutlined className="text-gray-400 text-sm shrink-0" />;
      if (type === 'category') {
        icon = <FolderOutlined className="text-gray-400 text-sm shrink-0" />;
      } else if (type === 'tag') {
        icon = <TagOutlined className="text-gray-400 text-sm shrink-0" />;
      }
      
      return {
        value: query,
        label: (
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {icon}
              <span className="truncate" title={query}>{query}</span>
            </div>
            <button
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
              onClick={(e) => {
                e.stopPropagation();
                removeFromHistory(query);
              }}
            >
              <CloseOutlined className="text-gray-400 text-xs" />
            </button>
          </div>
        ),
        key: `history-${index}`,
        type: type || 'history',
        historyType: type
      };
    });
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    if (!searchValue || searchValue.length < 2) {
      setSuggestions(getHistoryOptions());
    }
  };

  const handleSearchBlur = () => {
    setTimeout(() => {
      setIsSearchFocused(false);
    }, 200);
  };
  const fetchSuggestions = useCallback(
    debounce(async (query) => {
      if (!query || query.length < 2) {
        if (isSearchFocused) {
          setSuggestions(getHistoryOptions());
        }
        setHasSearched(false);
        return;
      }

      try {
        setLoading(true);
        setHasSearched(false);
        const { prompts, categories, tags } = await searchService.getSuggestions(query);

        const suggestionOptions = [];

        if (prompts && prompts.length > 0) {
          prompts.slice(0, 5).forEach(prompt => {
            suggestionOptions.push({
              value: prompt.title,
              label: (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <SearchOutlined className="text-gray-400 text-sm" />
                    <span className="truncate" title={prompt.title}>{prompt.title}</span>
                  </div>
                  {prompt.category && (
                    <span className="text-gray-400 text-xs ml-2 shrink-0">{prompt.category}</span>
                  )}
                </div>
              ),
              key: `prompt-${prompt.id}`,
              type: 'prompt'
            });
          });
        }

        if (categories && categories.length > 0) {
          categories.slice(0, 3).forEach(category => {
            suggestionOptions.push({
              value: category.name,
              label: (
                <div className="flex items-center gap-2">
                  <FolderOutlined className="text-gray-400 text-sm" />
                  <span className="truncate" title={category.name}>{category.name}</span>
                </div>
              ),
              key: `category-${category.id}`,
              type: 'category'
            });
          });
        }

        if (tags && tags.length > 0) {
          tags.slice(0, 4).forEach(tag => {
            suggestionOptions.push({
              value: `#${tag.name}`,
              label: (
                <div className="flex items-center gap-2">
                  <TagOutlined className="text-gray-400 text-sm" />
                  <span className="truncate" title={`#${tag.name}`}>#{tag.name}</span>
                </div>
              ),
              key: `tag-${tag.id}`,
              type: 'tag'
            });
          });
        }

        setSuggestions(suggestionOptions);
        setHasSearched(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
        setHasSearched(true);
      } finally {
        setLoading(false);
      }
    }, 300),
    [searchHistory, isSearchFocused]
  );

  const handleSearch = (value, option = null) => {
    if (!value || !value.trim()) return;

    const searchQuery = value.trim();
    let searchType = null;
    
    if (option?.type === 'category') {
      searchType = 'category';
      navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(searchQuery)}&type=category`);
    } else if (option?.type === 'tag' || searchQuery.startsWith('#')) {
      searchType = 'tag';
      navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(searchQuery.replace('#', ''))}&type=tag`);
    } else if (option?.historyType) {
      searchType = option.historyType;
      navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(searchQuery)}&type=${option.historyType}`);
    } else {
      navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(searchQuery)}`);
    }
    
    saveToHistory(searchQuery, searchType);
  };
  
  const handleSearchInputChange = (value) => {
    setSearchValue(value);
    fetchSuggestions(value);
  };
  
  const handleSelect = (value, option) => {
    setSearchValue(value);
    handleSearch(value, option);
  };

  useEffect(() => {
    if ((!searchValue || searchValue.length < 2) && isSearchFocused) {
      setSuggestions(getHistoryOptions());
    }
  }, [searchHistory, searchValue, isSearchFocused]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
    window.dispatchEvent(new Event('logout'));
  };
  
  const userMenuItems = createUserMenuItems(t, getLanguageMenuItems, handleLogout, true, user);
  
  return (
    <>
      <style jsx>{`
        .search-autocomplete {
          border-radius: 8px;
        }
        .search-autocomplete .ant-select-selector {
          border-radius: 8px !important;
          border: 1px solid #d1d5db !important;
          height: 42px !important;
          padding: 0 12px 0 48px !important;
        }
        .search-autocomplete .ant-select-selection-placeholder {
          padding-left: 0 !important;
          margin-left: 0 !important;
          color: #9ca3af !important;
        }
        .search-autocomplete .ant-select-selection-search {
          padding-left: 0 !important;
          margin-left: 0 !important;
        }
        .search-autocomplete .ant-select-selection-search-input {
          padding-left: 0 !important;
          margin-left: 0 !important;
        }
        .search-autocomplete .ant-select-selector:hover {
          border-color: #3b82f6 !important;
        }
        .search-autocomplete .ant-select-focused .ant-select-selector {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
        }
        .search-autocomplete .ant-select-selection-search-input {
          height: 40px !important;
          font-size: 14px !important;
        }
        .ant-select-dropdown {
          border-radius: 8px !important;
          border: 1px solid #d1d5db !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
          margin-top: 4px !important;
        }
        .ant-select-item {
          padding: 8px 12px !important;
        }
        .ant-select-item:hover {
          background-color: #f3f4f6 !important;
        }
        .ant-select-item .truncate {
          max-width: 400px;
        }
      `}</style>
      <header className="border-b border-gray-200 sticky top-0 z-50 shadow-sm backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          <div className="flex items-center shrink-0">
            <Link to={ROUTES.HOME} className="hover:opacity-80 transition-opacity">
              <Logo size="large" />
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:block" id="search-container-desktop">
              <AutoComplete
                value={searchValue}
                options={suggestions}
                onSelect={handleSelect}
                onChange={handleSearchInputChange}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                allowClear
                style={{ width: '500px' }}
                getPopupContainer={() => document.getElementById('search-container-desktop')}
                notFoundContent={loading ? (
                  <div className="flex items-center justify-center py-3">
                    <Spin size="small" />
                    <span className="ml-2 text-gray-500">{t('header.searching')}</span>
                  </div>
                ) : hasSearched && suggestions.length === 0 && searchValue && searchValue.length >= 2 ? (
                  <div className="py-3 text-center text-gray-500">
                    {t('header.noResults')}
                  </div>
                ) : null}
                className="search-autocomplete"
              >
                <Input
                  placeholder={t('header.search', 'Tìm kiếm prompts, #tags, categories...')}
                  prefix={<SearchOutlined className="text-gray-400" />}
                  onPressEnter={(e) => handleSearch(e.target.value)}
                  className="search-input"
                />
              </AutoComplete>
            </div>
            <Button
              type="primary"
              size="middle"
              icon={<PlusOutlined />}
              onClick={() => navigate('/my-prompts?tab=create')}
              className="bg-gray-900 hover:bg-gray-800 border-0 shadow-md hover:shadow-lg transition-all rounded-xl font-medium text-white"
            >
              <span className="hidden sm:inline ml-1">{t('header.createPrompt')}</span>
            </Button>
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow={{ pointAtCenter: true }}
              trigger={['click']}
            >
              <div className="cursor-pointer hover:bg-gray-50 rounded-xl p-2 transition-colors">
                <Avatar size={36} src={user?.picture} className="border-2 border-gray-200" />
              </div>
            </Dropdown>
          </div>
        </div>
        <div className="md:hidden pb-4 pt-2" id="search-container-mobile">
          <AutoComplete
            value={searchValue}
            options={suggestions}
            onSelect={handleSelect}
            onChange={handleSearchInputChange}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            allowClear
            style={{ width: '100%' }}
            getPopupContainer={() => document.getElementById('search-container-mobile')}
            notFoundContent={loading ? (
              <div className="flex items-center justify-center py-3">
                <Spin size="small" />
                <span className="ml-2 text-gray-500">{t('header.searching')}</span>
              </div>
            ) : hasSearched && suggestions.length === 0 && searchValue && searchValue.length >= 2 ? (
              <div className="py-3 text-center text-gray-500">
                {t('header.noResults')}
              </div>
            ) : null}
            className="search-autocomplete"
          >
            <Input
              placeholder={t('header.search', 'Tìm kiếm prompts, #tags, categories...')}
              prefix={<SearchOutlined className="text-gray-400" />}
              onPressEnter={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
          </AutoComplete>
        </div>
      </div>
    </header>
    </>
  );
};
export default Header;
