"use client";

import { useState, useEffect, useRef } from 'react';
import { SearchBoxProps } from '@/models/order/search-model';

export default function SearchBox({
  apiUrl,
  dataSource,
  minLength = 0,
  onSelect,
}: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < minLength) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        if (dataSource) {
          // Local search
          const fuse = (await import('fuse.js')).default;
          const fuseInstance = new fuse(dataSource, {
            threshold: 0.3,
            minMatchCharLength: minLength,
          });

          const results = fuseInstance.search(query).slice(0, 5).map(r => r.item);
          setSuggestions(results);
        } else if (apiUrl) {
          // API search
          const response = await fetch(`${apiUrl}?query=${encodeURIComponent(query)}`);
          const data = await response.json();
          setSuggestions(data.suggestions || []);
        }

        setShowSuggestions(true);
      } catch (error) {
        console.error('Search error:', error);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, apiUrl, dataSource, minLength]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (value: string) => {
    setQuery(value);
    setShowSuggestions(false);
    if (onSelect) onSelect(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && activeSuggestion >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeSuggestion]);
    }
  };

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActiveSuggestion(-1);
        }}
        onFocus={() => setShowSuggestions(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search..."
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          {suggestions.map((s, i) => (
            <li
              key={i}
              onClick={() => handleSelect(s)}
              className={`p-3 cursor-pointer hover:bg-gray-100 ${
                i === activeSuggestion ? 'bg-gray-100' : ''
              }`}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
