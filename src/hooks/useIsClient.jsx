'use client';
import { useState, useEffect } from 'react';

/**
 * Returns if in Client Side for Hydration
 * @returns {Promise<{isClient:boolean}>}
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // eslint-disable-line react-hooks/set-state-in-effect -- standard hydration-detection pattern
  }, []);

  return isClient;
}
