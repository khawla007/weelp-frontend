'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { SearchIcon, Clock, MapPin, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { getCityActivities } from '@/lib/actions/creatorItineraries';

export default function ActivitySearchModalPublic({ open, onOpenChange, slug, onSelect }) {
  const [activities, setActivities] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch activities when modal opens
  useEffect(() => {
    if (!open || !slug) return;
    let cancelled = false;

    const fetchActivities = async () => {
      setLoading(true);
      const res = await getCityActivities(slug);
      if (!cancelled && res.success) {
        setActivities(res.data || []);
      }
      if (!cancelled) setLoading(false);
    };

    fetchActivities();
    return () => {
      cancelled = true;
    };
  }, [open, slug]);

  // Client-side filter by name
  const filtered = activities.filter((a) => a.name?.toLowerCase().includes(search.toLowerCase()));

  const handleSelect = useCallback(
    (activity) => {
      onSelect({
        activity_id: activity.id,
        name: activity.name,
        place_name: activity.place_name,
        duration_minutes: activity.duration_minutes,
        type: activity.type,
        featured_image: activity.featured_image,
        tags: activity.tags,
        start_time: null,
        end_time: null,
        notes: null,
        price: null,
        included: true,
      });
      // Close and clear
      setSearch('');
      onOpenChange(false);
    },
    [onSelect, onOpenChange],
  );

  const handleOpenChange = (value) => {
    if (!value) setSearch('');
    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Activity</DialogTitle>
          <DialogDescription className="sr-only">Search and select an activity to add to your schedule.</DialogDescription>
        </DialogHeader>

        {/* Search input */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="text" placeholder="Search activities..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 focus-visible:ring-secondaryDark focus-visible:ring-1" />
          </div>
        </div>

        {/* Activity list */}
        <div className="overflow-y-auto flex-1 -mx-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">{search ? 'No activities match your search.' : 'No activities available.'}</p>
          ) : (
            <ul className="space-y-1">
              {filtered.map((activity) => (
                <li key={activity.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-neutral-100 cursor-pointer transition-colors" onClick={() => handleSelect(activity)}>
                  <div className="relative h-14 w-14 rounded-md overflow-hidden bg-neutral-200 flex-shrink-0">
                    {activity.featured_image ? (
                      <Image src={activity.featured_image} alt={activity.name} fill className="object-cover" sizes="56px" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">No img</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.name}</p>
                    {activity.place_name && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" />
                        <span>Place: {activity.place_name}</span>
                      </p>
                    )}
                    {activity.duration_minutes && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {activity.duration_minutes} min
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
