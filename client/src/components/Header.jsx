import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Avatar, Dropdown, AutoComplete, Spin, Input } from 'antd';
import {
  SearchOutlined,
  FolderOutlined,
  TagOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  SunOutlined,
  MoonOutlined,
  ThunderboltOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useLanguage } from '../hooks/useLanguage';
import { useDarkMode } from '../hooks/use-dark-mode';
import { createUserMenuItems } from '../utils/userMenuUtils.jsx';
import Logo from './shared/Logo';
import { ROUTES } from '../constants/routes';
import { searchService } from '../services/searchService';

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => { clearTimeout(timeout); func(...args); };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/** Keyboard shortcut hint badge shown inside the search bar */
const SearchShortcut = () => (
  <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono
    bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-600">
    /
  </kbd>
);

const Header = () => {
  const { t, getLanguageMenuItems } = useLanguage();
  const [isDark, setIsDark] = useDarkMode();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [user, setUser] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const queryFromUrl = searchParams.get('q') || '';
    setSearchValue(queryFromUrl);
  }, [searchParams]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) setSearchHistory(JSON.parse(savedHistory));
  }, []);

  // Focus search on "/" keypress (OpenRouter-style shortcut)
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const saveToHistory = (query, type = null) => {
    if (!query || query.trim().length < 2) return;
    const trimmedQuery = query.trim();
    const historyItem = { query: trimmedQuery, type, timestamp: Date.now() };
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
  };

  const makeHistoryOption = (item, index) => {
    const query = typeof item === 'string' ? item : item.query;
    const type = typeof item === 'string' ? null : item.type;
    let icon = <ClockCircleOutlined className="text-gray-400 text-sm shrink-0" />;
    if (type === 'category') icon = <FolderOutlined className="text-gray-400 text-sm shrink-0" />;
    else if (type === 'tag') icon = <TagOutlined className="text-gray-400 text-sm shrink-0" />;
    return {
      value: query,
      label: (
        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {icon}
            <span className="truncate text-sm" title={query}>{query}</span>
          </div>
          <button
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            onClick={(e) => { e.stopPropagation(); removeFromHistory(query); }}
          >
            <CloseOutlined className="text-gray-400 text-xs" />
          </button>
        </div>
      ),
      key: `history-${index}`,
      type: type || 'history',
      historyType: type,
    };
  };

  const getHistoryOptions = () =>
    searchValue && searchValue.length >= 2 ? [] : searchHistory.map(makeHistoryOption);

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    if (!searchValue || searchValue.length < 2) setSuggestions(getHistoryOptions());
  };

  const handleSearchBlur = () => setTimeout(() => setIsSearchFocused(false), 200);

  const fetchSuggestions = useCallback(
    debounce(async (query) => {
      if (!query || query.length < 2) {
        if (isSearchFocused) setSuggestions(getHistoryOptions());
        setHasSearched(false);
        return;
      }
      try {
        setLoading(true);
        setHasSearched(false);
        const { prompts, categories, tags } = await searchService.getSuggestions(query);
        const opts = [];
        prompts?.slice(0, 5).forEach(p => opts.push({
          value: p.title,
          label: (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <SearchOutlined className="text-gray-400 text-sm" />
                <span className="truncate text-sm" title={p.title}>{p.title}</span>
              </div>
              {p.category && <span className="text-gray-400 text-xs ml-2 shrink-0">{p.category}</span>}
            </div>
          ),
          key: `prompt-${p.id}`, type: 'prompt',
        }));
        categories?.slice(0, 3).forEach(c => opts.push({
          value: c.name,
          label: (
            <div className="flex items-center gap-2">
              <FolderOutlined className="text-gray-400 text-sm" />
              <span className="truncate text-sm">{c.name}</span>
            </div>
          ),
          key: `cat-${c.id}`, type: 'category',
        }));
        tags?.slice(0, 4).forEach(tag => opts.push({
          value: `#${tag.name}`,
          label: (
            <div className="flex items-center gap-2">
              <TagOutlined className="text-gray-400 text-sm" />
              <span className="truncate text-sm">#{tag.name}</span>
            </div>
          ),
          key: `tag-${tag.id}`, type: 'tag',
        }));
        setSuggestions(opts);
        setHasSearched(true);
      } catch {
        setSuggestions([]);
        setHasSearched(true);
      } finally {
        setLoading(false);
      }
    }, 300),
    [searchHistory, isSearchFocused]
  );

  const handleSearch = (value, option = null) => {
    if (!value?.trim()) return;
    const q = value.trim();
    let type = null;
    if (option?.type === 'category') {
      type = 'category';
      navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(q)}&type=category`);
    } else if (option?.type === 'tag' || q.startsWith('#')) {
      type = 'tag';
      navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(q.replace('#', ''))}&type=tag`);
    } else if (option?.historyType) {
      type = option.historyType;
      navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(q)}&type=${option.historyType}`);
    } else {
      navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(q)}`);
    }
    saveToHistory(q, type);
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
    <header className="sticky top-0 z-50
      border-b border-gray-100 dark:border-white/[0.06]
      bg-white dark:bg-[#111] backdrop-blur-xl">
      <div className="w-full px-4 sm:px-6">
        <div className="flex items-center h-14 gap-3">

          {/* Logo */}
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-2 shrink-0 hover:opacity-70 transition-opacity duration-150"
          >
            <Logo size="small" />
          </Link>

          {/* Search — desktop */}
          <div className="hidden md:block flex-shrink-0" id="search-container-desktop">
            <AutoComplete
              value={searchValue}
              options={suggestions}
              onSelect={handleSelect}
              onChange={handleSearchInputChange}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              allowClear
              style={{ width: 220 }}
              getPopupContainer={() => document.getElementById('search-container-desktop')}
              notFoundContent={
                loading ? (
                  <div className="flex items-center justify-center py-3 gap-2">
                    <Spin size="small" />
                    <span className="text-gray-500 text-sm">{t('header.searching')}</span>
                  </div>
                ) : hasSearched && suggestions.length === 0 && searchValue?.length >= 2 ? (
                  <div className="py-3 text-center text-gray-500 text-sm">{t('header.noResults')}</div>
                ) : null
              }
              className="search-autocomplete"
            >
              <Input
                ref={searchRef}
                placeholder={t('header.search', 'Search…')}
                prefix={<SearchOutlined className="text-gray-400 dark:text-neutral-500 text-[11px]" aria-hidden="true" />}
                suffix={<SearchShortcut />}
                onPressEnter={(e) => handleSearch(e.target.value)}
                size="small"
                className="!rounded-md !text-sm
                  !bg-gray-100 dark:!bg-white/[0.07]
                  !border-transparent dark:!border-transparent
                  hover:!border-gray-300 dark:hover:!border-white/[0.15]
                  focus-within:!border-gray-400 dark:focus-within:!border-white/[0.25]
                  !text-gray-900 dark:!text-neutral-100
                  placeholder:!text-gray-400 dark:placeholder:!text-neutral-500"
              />
            </AutoComplete>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">

            {/* Playground */}
            <button
              onClick={() => navigate(ROUTES.PLAYGROUND)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm
                text-gray-500 dark:text-neutral-400
                hover:text-black dark:hover:text-white
                hover:bg-gray-100 dark:hover:bg-white/[0.06]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 dark:focus-visible:ring-white/20
                transition-colors duration-150"
            >
              <ThunderboltOutlined aria-hidden="true" />
              Playground
            </button>

            <button
              onClick={() => navigate(ROUTES.MY_PROMPTS)}
              className="px-3 py-1.5 rounded-md text-sm
                text-gray-500 dark:text-neutral-400
                hover:text-black dark:hover:text-white
                hover:bg-gray-100 dark:hover:bg-white/[0.06]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 dark:focus-visible:ring-white/20
                transition-colors duration-150"
            >
              {t('sidebar.myPrompts', 'Prompts')}
            </button>

            <button
              onClick={() => navigate(ROUTES.BOOKMARKED)}
              className="px-3 py-1.5 rounded-md text-sm
                text-gray-500 dark:text-neutral-400
                hover:text-black dark:hover:text-white
                hover:bg-gray-100 dark:hover:bg-white/[0.06]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 dark:focus-visible:ring-white/20
                transition-colors duration-150"
            >
              {t('bookmarked.title', 'Bookmarks')}
            </button>

            {/* Divider */}
            <span aria-hidden="true" className="w-px h-4 bg-gray-200 dark:bg-white/10 mx-1.5" />

            {/* Create — high-contrast CTA */}
            <button
              onClick={() => navigate(ROUTES.MY_PROMPTS_CREATE)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium
                bg-black dark:bg-white
                text-white dark:text-black
                hover:bg-gray-800 dark:hover:bg-gray-100
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 dark:focus-visible:ring-white/40
                transition-colors duration-150"
            >
              <PlusOutlined aria-hidden="true" />
              {t('header.createPrompt', 'Create')}
            </button>
          </nav>

          {/* Dark mode toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-md
              text-gray-400 dark:text-neutral-500
              hover:text-black dark:hover:text-white
              hover:bg-gray-100 dark:hover:bg-white/[0.06]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 dark:focus-visible:ring-white/20
              transition-colors duration-150"
          >
            {isDark
              ? <SunOutlined aria-hidden="true" className="text-sm" />
              : <MoonOutlined aria-hidden="true" className="text-sm" />}
          </button>

          {/* Avatar / user menu */}
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            arrow={{ pointAtCenter: true }}
            trigger={['click']}
          >
            <button
              aria-label="Open user menu"
              className="cursor-pointer rounded-full
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 dark:focus-visible:ring-white/30 dark:focus-visible:ring-offset-[#111]
                hover:opacity-75 transition-opacity duration-150"
            >
              <Avatar
                size={28}
                src={user?.picture}
                className="border border-gray-200 dark:border-white/10"
              />
            </button>
          </Dropdown>
        </div>

        {/* Mobile search bar */}
        <div className="md:hidden pb-2.5" id="search-container-mobile">
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
            notFoundContent={
              loading ? (
                <div className="flex items-center justify-center py-3 gap-2">
                  <Spin size="small" />
                  <span className="text-gray-500 text-sm">{t('header.searching')}</span>
                </div>
              ) : hasSearched && suggestions.length === 0 && searchValue?.length >= 2 ? (
                <div className="py-3 text-center text-gray-500 text-sm">{t('header.noResults')}</div>
              ) : null
            }
            className="search-autocomplete"
          >
            <Input
              placeholder={t('header.search', 'Search…')}
              prefix={<SearchOutlined className="text-gray-400 dark:text-neutral-500 text-[11px]" aria-hidden="true" />}
              onPressEnter={(e) => handleSearch(e.target.value)}
              size="small"
              className="!rounded-md !text-sm
                !bg-gray-100 dark:!bg-white/[0.07]
                !border-transparent dark:!border-transparent"
            />
          </AutoComplete>
        </div>
      </div>
    </header>
  );
};

export default Header;
