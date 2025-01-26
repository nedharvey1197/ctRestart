import { useEffect, useState, useCallback } from 'react';
import { loadingManager } from '../utils/loadingStateManager';

export function useLoadingState(componentId, operation) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const startLoading = useCallback(() => {
    loadingManager.setLoading(componentId, operation, true);
  }, [componentId, operation]);

  const stopLoading = useCallback((error = null) => {
    loadingManager.setLoading(componentId, operation, false);
    setError(error);
  }, [componentId, operation]);

  useEffect(() => {
    const unsubscribe = loadingManager.addObserver((id, op, loading) => {
      if (id === componentId && op === operation) {
        setIsLoading(loading);
      }
    });
    return unsubscribe;
  }, [componentId, operation]);

  return {
    isLoading,
    error,
    startLoading,
    stopLoading
  };
} 