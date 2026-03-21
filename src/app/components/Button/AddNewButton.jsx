'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Upload } from 'lucide-react';

/**
 * AddNewButton - Reusable button for adding new items
 *
 * @param {string} label - Button label (e.g., 'Add New', 'Upload')
 * @param {string} href - Link destination
 * @param {ReactNode} icon - Optional icon component
 * @param {string} className - Optional additional classes
 */
export function AddNewButton({ label = 'Add New', href, icon = <Plus size={16} className="mr-2" />, className = '' }) {
  return (
    <Button asChild className="shrink-0 whitespace-nowrap">
      <Link className={`bg-secondaryDark text-black hover:bg-secondaryDark/90 ${className}`} href={href}>
        {icon}
        {label}
      </Link>
    </Button>
  );
}

// Export a specific Upload variant for Media page
export function UploadButton({ href, className = '' }) {
  return <AddNewButton label="Upload" href={href} icon={<Upload className="h-4 w-4 mr-2" />} className={className} />;
}
