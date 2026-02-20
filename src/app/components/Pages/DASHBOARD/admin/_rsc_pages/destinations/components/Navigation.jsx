import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CirclePlus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

/**
 * Reusable destination navigation card.
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {string} props.description - Card description
 * @param {string} props.url - Link for "Add" button ->URL SPECIFIC
 * @param {string} props.name - Name to show in "Add" button ->URL SPECIFIC
 * @returns {JSX.Element}
 */
export const NavigationDestinations = ({ title = '', description = '', url = '', name = '' }) => {
  const router = useRouter(); // intialize router

  if (title && description) {
    // icon size
    const ICON_SIZE = 16;
    return (
      <Card className="bg-inherit border-none shadow-none">
        <CardHeader className="px-0">
          <div className="flex items-center justify-between flex-wrap">
            <div className="flex items-start gap-2 flex-col sm:flex-row">
              <ArrowLeft onClick={() => router.back()} cursor="pointer" />
              <div className="space-y-2">
                <CardTitle className="capitalize">{title}</CardTitle>
                <CardDescription className="text-base">{description}</CardDescription>
              </div>
            </div>

            {url && name && (
              <Link href={url}>
                <Button className="text-base" variant="secondary">
                  <CirclePlus size={ICON_SIZE} />
                  {name}
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
      </Card>
    );
  }
  return <span>Compoenet Props not defined</span>;
};
