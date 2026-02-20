'use client';
import SafeImage from '@/app/components/Image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Ellipsis, Pencil, Star, Trash2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
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
export const RouteCard = ({ id, type, name, code, description, featured_destination, media_gallery = [] }) => {
  const router = useRouter(); // intialize route
  const pathname = usePathname(); // intialize pathname
  const { url = '', alt_text = '' } = media_gallery.at(0) || {}; // extract first image
  const { mutate } = useSWRConfig(); // mutate
  const { toast } = useToast(); // intialize toaster

  // Handling Route
  const handleRoute = (pageId) => {
    router.push(pathname + `/${pageId}`);
  };

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
        {/* {url && */}
        <SafeImage src={url} alt={alt_text} />
        {/* } */}

        {/* Featrued Destination */}
        {featured_destination && (
          <Badge variant="outline" className="px-2 gap-1 absolute right-4 top-2 z-10 bg-white">
            <Star size={14} /> Featured
          </Badge>
        )}
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
                <DropdownMenuItem className="cursor-pointer" onClick={() => handleRoute(id)}>
                  <Pencil size={14} /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    handleDelete(id, type); // delete item via id and type
                  }}
                  className="cursor-pointer text-red-400"
                >
                  <Trash2 size={14} />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4">
        <p>{description}</p>
        {/* Badges Data */}
        <div>
          <Badge className="bg-accent text-black hover:bg-accent">country</Badge>
        </div>
      </CardFooter>
    </Card>
  );
};
