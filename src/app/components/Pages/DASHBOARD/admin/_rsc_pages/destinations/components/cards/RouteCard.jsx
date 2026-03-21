'use client';
import SafeImage from '@/app/components/Image';
import { useToast } from '@/hooks/use-toast';
import { usePathname, useRouter } from 'next/navigation';
import { useSWRConfig } from 'swr';
import { SelectableCardCheckbox } from '@/app/components/Checkbox/SelectableCardCheckbox';
// Shared card components
import { CardBadge } from '@/app/components/DashboardShared/Card';
import { CardActions } from '@/app/components/DashboardShared/Card';

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
export const RouteCard = ({
  id,
  type,
  name,
  code,
  description,
  featured_destination,
  feature_image,
  media_gallery = [],
  country,
  state,
  city,
  region,
  regions = [],
  checked = false,
  onCheckedChange,
  showCheckbox = false,
}) => {
  const router = useRouter(); // intialize route
  const pathname = usePathname(); // intialize pathname

  // Use featured image if available, otherwise fall back to first image from gallery
  const displayImage = feature_image || media_gallery.find((m) => m.is_featured)?.url || media_gallery.at(0)?.url || '';
  const altText = media_gallery.find((m) => m.is_featured)?.alt_text || media_gallery.at(0)?.alt_text || name;

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
    <div className="w-full overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
      {/* Image wrapper */}
      <div className="relative w-full h-[183px]">
        <SafeImage src={displayImage} alt={altText} />

        {/* Selection Checkbox */}
        {showCheckbox && (
          <div className="absolute top-4 left-4 w-fit z-20">
            <SelectableCardCheckbox checked={checked} onCheckedChange={onCheckedChange} itemId={id} />
          </div>
        )}
      </div>

      {/* Content section */}
      <div className="p-6 pt-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-lg leading-none tracking-tight">{name}</h3>
            <p className="text-sm text-muted-foreground">Code: {code}</p>
          </div>

          {/* Actions - using shared CardActions with confirmation dialog */}
          <CardActions itemId={id} editHref={`${pathname}/${id}`} onDelete={() => handleDelete(id, type)} />
        </div>
      </div>

      {/* Badges section */}
      <div className="p-6 flex flex-col items-start gap-4 border-t">
        <p className="text-sm text-muted-foreground">{getExcerpt(description)}</p>

        {/* Location Badges - use shared CardBadge component */}
        <div className="flex flex-wrap gap-2">
          {/* Regions - show all if available */}
          {regions && regions.length > 0 && regions.map((region) => <CardBadge key={region.id} type="location" label={`Region: ${region.name}`} />)}

          {/* Country badge */}
          {country && <CardBadge type="location" label={`Country: ${country.name}`} />}

          {/* State badge */}
          {state && <CardBadge type="location" label={`State: ${state.name}`} />}

          {/* City badge */}
          {city && <CardBadge type="location" label={`City: ${city.name}`} />}
        </div>
      </div>
    </div>
  );
};
