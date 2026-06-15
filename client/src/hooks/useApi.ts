import { useState, useEffect, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  refetch: () => Promise<void>;
  setData: (data: T | null) => void;
}

export function useApi<T>(
  fetchFn: () => Promise<{ data: T }>,
  deps: unknown[] = [],
  immediate = true
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: immediate,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await fetchFn();
      setState({ data: response.data, isLoading: false, error: null });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setState(prev => ({ ...prev, isLoading: false, error: message }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [fetchData, immediate]);

  const setData = useCallback((data: T | null) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  return { ...state, refetch: fetchData, setData };
}
