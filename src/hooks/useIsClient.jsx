'use client';
import { useState, useEffect } from 'react';

/**
 * Returns if in Client Side for Hydration
 * @returns {Promise<{isClient:boolean}>}
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}
