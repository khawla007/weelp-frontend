import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export const NavigationUser = ({ title, content }) => {
  // check if title and content are missing
  if (!title && !content) {
    return <p className="text-red-400">Props Are Missing</p>;
  }
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/admin/users">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        </div>
        <p className="text-muted-foreground">{content}</p>
      </div>
    </div>
  );
};
