'use client';
import { useState, useCallback } from 'react';

export function useSearch(delay = 300) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);
      if (timer) clearTimeout(timer);
      const t = setTimeout(() => setDebouncedQuery(value), delay);
      setTimer(t);
    },
    [timer, delay]
  );

  return { query, debouncedQuery, handleSearch };
}
