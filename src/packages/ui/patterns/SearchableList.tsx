/**
 * SearchableList - List with search filter
 */

import { useState, useMemo, type ReactNode } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface SearchableListProps<T> {
  /** Data items */
  items: T[];
  /** Search keys (fields to search in) */
  searchKeys: (keyof T)[];
  /** Render item */
  renderItem: (item: T, index: number) => ReactNode;
  /** Key extractor */
  keyExtractor: (item: T, index: number) => string | number;
  /** Search placeholder */
  placeholder?: string;
  /** Empty state */
  emptyState?: ReactNode;
  /** No results state */
  noResultsState?: ReactNode;
  /** Header content */
  header?: ReactNode;
  /** Show item count */
  showCount?: boolean;
  /** Additional class name */
  className?: string;
  /** List class name */
  listClassName?: string;
}

export function SearchableList<T>({
  items,
  searchKeys,
  renderItem,
  keyExtractor,
  placeholder = '검색...',
  emptyState,
  noResultsState,
  header,
  showCount = false,
  className,
  listClassName,
}: SearchableListProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;

    const query = searchQuery.toLowerCase();
    return items.filter((item) =>
      searchKeys.some((key) => {
        const value = item[key];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(query);
      })
    );
  }, [items, searchQuery, searchKeys]);

  const handleClear = () => setSearchQuery('');

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      {header}

      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full pl-10 pr-10 py-3 rounded-xl',
            'bg-gray-100 dark:bg-white/10',
            'text-gray-900 dark:text-white',
            'placeholder-gray-500 dark:placeholder-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/20',
            'transition-all'
          )}
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Count */}
      {showCount && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {searchQuery
            ? `${filteredItems.length}개 검색됨`
            : `총 ${items.length}개`}
        </p>
      )}

      {/* List */}
      {items.length === 0 ? (
        emptyState || (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            항목이 없습니다
          </div>
        )
      ) : filteredItems.length === 0 ? (
        noResultsState || (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            "{searchQuery}"에 대한 검색 결과가 없습니다
          </div>
        )
      ) : (
        <div className={listClassName}>
          {filteredItems.map((item, index) => (
            <div key={keyExtractor(item, index)}>
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
