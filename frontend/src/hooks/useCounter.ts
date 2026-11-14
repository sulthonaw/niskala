import { useCallback, useState } from 'react';

export interface UseCounterOptions {
  initialValue?: number;
  min?: number;
  max?: number;
}

export function useCounter({ initialValue = 0, min, max }: UseCounterOptions = {}) {
  const [count, setCount] = useState<number>(initialValue);

  const increment = useCallback(() => {
    setCount((prev) => (max !== undefined ? Math.min(prev + 1, max) : prev + 1));
  }, [max]);

  const decrement = useCallback(() => {
    setCount((prev) => (min !== undefined ? Math.max(prev - 1, min) : prev - 1));
  }, [min]);

  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);

  const isEven = count % 2 === 0;
  const isPositive = count > 0;
  const isZero = count === 0;

  return {
    count,
    increment,
    decrement,
    reset,
    setCount,
    isEven,
    isPositive,
    isZero,
  };
}
