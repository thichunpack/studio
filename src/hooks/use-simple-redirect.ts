'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface UseSimpleRedirectOptions {
  redirectUrl?: string;
  fallbackUrl?: string;
  initialStatus?: string;
  progressStatus?: string;
  delayMs?: number;
}

export function useSimpleRedirect({
  redirectUrl,
  fallbackUrl = 'https://www.google.com/',
  initialStatus = 'Đang chuẩn bị mở tài liệu...',
  progressStatus = 'Đang chuyển đến tài liệu...',
  delayMs = 300,
}: UseSimpleRedirectOptions) {
  const [status, setStatus] = useState(initialStatus);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const targetUrl = useMemo(() => {
    const cleanedRedirectUrl = redirectUrl?.trim();
    if (cleanedRedirectUrl) return cleanedRedirectUrl;

    const cleanedFallbackUrl = fallbackUrl.trim();
    return cleanedFallbackUrl || 'https://www.google.com/';
  }, [fallbackUrl, redirectUrl]);

  const startRedirect = useCallback(() => {
    if (hasTriggered) return;

    setHasTriggered(true);
    setIsRedirecting(true);
    setStatus(progressStatus);

    timeoutRef.current = setTimeout(() => {
      window.location.assign(targetUrl);
    }, delayMs);
  }, [delayMs, hasTriggered, progressStatus, targetUrl]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    status,
    isRedirecting,
    startRedirect,
  };
}
