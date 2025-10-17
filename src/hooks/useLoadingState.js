import { useState, useCallback } from 'react';

const useLoadingState = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState);
  const [error, setError] = useState(null);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setError(null);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const setLoadingError = useCallback((error) => {
    setIsLoading(false);
    setError(error);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const executeAsync = useCallback(async (asyncFunction) => {
    try {
      startLoading();
      const result = await asyncFunction();
      stopLoading();
      return result;
    } catch (error) {
      setLoadingError(error);
      throw error;
    }
  }, [startLoading, stopLoading, setLoadingError]);

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setLoadingError,
    clearError,
    executeAsync,
  };
};

export default useLoadingState;