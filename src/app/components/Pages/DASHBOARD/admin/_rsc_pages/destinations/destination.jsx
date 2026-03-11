'use client';

import React from 'react';
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUp, FileDown, Globe, MapPin, Building, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DestinationListCard } from './components/cards/DestinationCard';
import useSWR from 'swr';
import { getDestinationsCounts } from '@/lib/services/destinations';

const DestinationsPageAdmin = () => {
  // Fetch destination counts
  const { data: counts, isLoading, error } = useSWR(
    '/api/admin/destinations/counts',
    getDestinationsCounts,
    { refreshInterval: 300000 } // Cache for 5 minutes
  );

  // Helper function to get count with loading/error states
  const getCount = (type) => {
    if (isLoading) return '...';
    if (error) return '—';
    return counts?.data?.[type] ?? 0;
  };

  // import export data
  const IMPORT_EXPORT = [
    { icon: FileUp, label: 'import' },
    { icon: FileDown, label: 'export all' },
  ];

  // destinations data
  const DESTINATIONS_ROUTE = [
    {
      label: 'Countries',
      icon: Globe,
      items: getCount('countries'),
      description: 'Manage countries and their details',
      url: '/dashboard/admin/destinations/countries',
    },
    {
      label: 'States',
      icon: MapPin,
      items: getCount('states'),
      description: 'Manage states and regions',
      url: '/dashboard/admin/destinations/states',
    },
    {
      label: 'Cities',
      icon: Building,
      items: getCount('cities'),
      description: 'Manage cities and their attractions',
      url: '/dashboard/admin/destinations/cities',
    },
    {
      label: 'Places',
      icon: User,
      items: getCount('places'),
      description: 'Manage specific places and points of interest',
      url: '/dashboard/admin/destinations/places',
    },
  ];

  return (
    <Card className="bg-inherit border-none shadow-none">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Destinations</CardTitle>

          {/* Displaying Buttons for uplaoding downlaoding data */}
          <CardDescription className="flex gap-2">
            {IMPORT_EXPORT.map(({ icon: IconComponent, label }, index) => (
              <Button key={index} variant="outline" className="text-black">
                <IconComponent />
                <span className=" capitalize text-sm">{label}</span>
              </Button>
            ))}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        {/* Displaying Route Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full gap-4">
          {DESTINATIONS_ROUTE.map((destination, index) => {
            return <DestinationListCard key={index} {...destination}></DestinationListCard>;
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default DestinationsPageAdmin;
