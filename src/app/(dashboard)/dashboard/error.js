'use client'; // Error boundaries must be Client Components

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="flex justify-center items-center shadow-none border-none flex-col gap-2">
        <h2>Something went wrong! in Dashoard</h2>
        <Button
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
        >
          Try again
        </Button>
      </Card>
    </div>
  );
}
