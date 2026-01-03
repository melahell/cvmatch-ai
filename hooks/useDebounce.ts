import { useCallback, useRef, useEffect } from 'react';

export function useDebounce<T extends (...args: any[]) => any>(
    callback: T,
    delay: number = 500
): T {
    const timeoutRef = useRef<NodeJS.Timeout>();
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    return useCallback((...args: Parameters<T>) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            callbackRef.current(...args);
        }, delay);
    }, [delay]) as T;
}
