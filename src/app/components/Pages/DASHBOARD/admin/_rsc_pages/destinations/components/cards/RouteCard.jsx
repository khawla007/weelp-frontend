'use client';
import SafeImage from '@/app/components/Image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Ellipsis, Pencil, Trash2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSWRConfig } from 'swr';

// actions to delete
import { deleteCountry } from '@/lib/actions/country';
import { deleteState } from '@/lib/actions/state';
import { deleteCity } from '@/lib/actions/cities';
import { deletePlace } from '@/lib/actions/places';

/**
 * DestinationRouteCard component displaying the DestinationRouteCard component
 * @param {{label:string, icon:string, items:number ,description:string, url:string}} props label,icons,items,description,url
 * @returns {JSX.Element}
 */
export const RouteCard = ({ id, type, name, code, description, featured_destination, feature_image, media_gallery = [], country, region }) => {
  const router = useRouter(); // intialize route
  const pathname = usePathname(); // intialize pathname

  // Use featured image if available, otherwise fall back to first image from gallery
  const displayImage = feature_image || media_gallery.find(m => m.is_featured)?.url || media_gallery.at(0)?.url || '';
  const altText = media_gallery.find(m => m.is_featured)?.alt_text || media_gallery.at(0)?.alt_text || name;

  // Create excerpt with "..." for description
  const getExcerpt = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text || '';
    return text.substring(0, maxLength).trim() + '...';
  };

  const { mutate } = useSWRConfig(); // mutate
  const { toast } = useToast(); // intialize toaster

  // Handle Delete
  const handleDelete = async (itemId, type) => {
    if (!itemId || !type) return console.warn('Missing id or type', { itemId, type });

    try {
      let res;
      let apiPath = '';

      switch (type) {
        case 'country':
          res = await deleteCountry(itemId); // Action to Delete Country
          apiPath = '/api/admin/destinations/countries';
          break;

        case 'state':
          res = await deleteState(itemId); // Action to State Country
          apiPath = '/api/admin/destinations/states';
          break;

        case 'city':
          res = await deleteCity(itemId); // Action to City Country
          apiPath = '/api/admin/destinations/cities';
          break;

        case 'place':
          res = await deletePlace(itemId); // Action to place Country
          apiPath = '/api/admin/destinations/places';
          break;

        default:
          return console.warn('Unknown type', type);
      }

      if (res?.success) {
        mutate((key) => key.startsWith(apiPath), undefined, {
          revalidate: true,
        });
        toast({ title: res.message || 'Deleted Successfully' });
        return;
      }

      toast({
        title: res?.error || 'Something went wrong',
        variant: 'destructive',
      });
    } catch (err) {
      toast({ title: 'Something went wrong', variant: 'destructive' });
      console.error(`Failed to delete ${type}`, err);
    }
  };

  return (
    <Card className="sm:max-w-xs overflow-hidden rounded-lg border">
      {/*  Image wrapper must be relative + have height */}
      <div className="relative w-full h-40">
        <SafeImage src={displayImage} alt={altText} />

        {/* Featured Badge Removed - Not needed on destination listing cards */}
      </div>

      {/* Content section */}
      <CardContent>
        <div className="flex justify-between pt-4">
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Code:{code}</CardDescription>
          </div>

          {/* DropDown Menu */}
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                  <Ellipsis size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="end" sideOffset={10}>
                <Link
                  href={`${pathname}/${id}`}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-neutral-100 cursor-pointer focus:bg-neutral-100 outline-none"
                >
                  <Pencil size={14} /> Edit
                </Link>
                <DropdownMenuItem
                  textValue="delete"
                  onSelect={() => {
                    handleDelete(id, type); // delete item via id and type
                  }}
                  className="cursor-pointer text-red-400"
                >
                  <Trash2 size={14} /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4">
        <p>{getExcerpt(description)}</p>
        {/* Badges Data - Show Region for countries, Country for states */}
        <div>
          {type === 'country' && region ? (
            <Badge className="bg-accent text-black hover:bg-accent">Region: {region}</Badge>
          ) : type === 'state' && country ? (
            <Badge className="bg-accent text-black hover:bg-accent">Country: {country.name}</Badge>
          ) : (
            <Badge className="bg-accent text-black hover:bg-accent">{type || 'country'}</Badge>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
