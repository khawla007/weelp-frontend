'use client';

import { useState } from 'react';
import { MapPin, Calendar, Pencil, Trash2, Clock, FileEdit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { requestEdit, requestRemoval } from '@/lib/actions/creatorItineraries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import NavigationLink from '@/app/components/Navigation/NavigationLink';

export default function MyItinerariesClientWrapper({ initialItineraries, lastPage }) {
  const [itineraries, setItineraries] = useState(initialItineraries);
  const [processingId, setProcessingId] = useState(null);
  const [removalReason, setRemovalReason] = useState('');
  const [removalDialogOpen, setRemovalDialogOpen] = useState(false);
  const [removalTargetId, setRemovalTargetId] = useState(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleRequestEdit = async (id) => {
    setProcessingId(id);
    const result = await requestEdit(id);
    if (result.success) {
      toast({ title: 'Edit draft created', description: 'Redirecting to editor...' });
      router.push(`/dashboard/customer/my-itineraries/${result.data?.id}/edit`);
      router.refresh();
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setProcessingId(null);
  };

  const handleRequestRemoval = async () => {
    if (!removalTargetId) return;
    setProcessingId(removalTargetId);
    const result = await requestRemoval(removalTargetId, removalReason || null);
    if (result.success) {
      toast({ title: 'Removal requested', description: result.message });
      setItineraries((prev) => prev.map((i) => (i.id === removalTargetId ? { ...i, removal_status: 'requested', removal_reason: removalReason } : i)));
      router.refresh();
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setProcessingId(null);
    setRemovalDialogOpen(false);
    setRemovalReason('');
    setRemovalTargetId(null);
  };

  if (itineraries.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-[#142A38]">No itineraries yet</p>
        <p className="text-[#5A5A5A] mt-2">Browse and save itineraries from the explore page to see them here.</p>
        <NavigationLink href="/explore">
          <Button className="mt-4 bg-secondaryDark hover:bg-secondaryDark/90">Explore Itineraries</Button>
        </NavigationLink>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {itineraries.map((item) => {
        const itinerary = item.itinerary || item;
        const featuredMedia = itinerary.media_gallery?.find((m) => m.is_featured)?.media?.url || itinerary.media_gallery?.[0]?.media?.url;
        const featuredImage = featuredMedia || itinerary.featured_image || '/assets/images/placeholder-itinerary.jpg';
        const name = itinerary.name || itinerary.title || 'Untitled Itinerary';
        const cityData = itinerary.locations?.[0]?.city;
        const city = cityData?.name || itinerary.city?.name || itinerary.city_name || '';
        const citySlug = cityData?.slug || itinerary.city?.slug || '';
        const dayCount = itinerary.day_count || itinerary.days_count || itinerary.schedules?.length || 0;
        const slug = itinerary.slug;
        const isCreatorCopy = !!item.creator_id;
        const approvalStatus = item.status;

        return (
          <div key={item.id || itinerary.id} className="bg-white rounded-xl border border-[#435a6742] overflow-hidden group">
            <div className="h-[200px] bg-[#CFDBE54D] relative overflow-hidden">
              <img
                src={featuredImage}
                alt={name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.target.src = '/assets/images/placeholder-itinerary.jpg';
                }}
              />
              {isCreatorCopy && approvalStatus && (
                <div className="absolute top-2 right-2">
                  <Badge variant={approvalStatus === 'approved' ? 'success' : approvalStatus === 'rejected' ? 'destructive' : 'warning'}>
                    {approvalStatus === 'pending' ? 'Pending' : approvalStatus.charAt(0).toUpperCase() + approvalStatus.slice(1)}
                  </Badge>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-[#142A38] text-base line-clamp-1 mb-2">{name}</h3>
              <div className="flex items-center gap-4 text-sm text-[#5A5A5A] mb-4">
                {city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    {city}
                  </span>
                )}
                {dayCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3.5" />
                    {dayCount} {dayCount === 1 ? 'Day' : 'Days'}
                  </span>
                )}
              </div>
              {slug && citySlug ? (
                <NavigationLink href={`/cities/${citySlug}/itineraries/${slug}`} className="block">
                  <Button variant="outline" size="sm" className="w-full border-[#435a6742] text-[#435a67] hover:bg-[#CFDBE54D]">
                    View & Book
                  </Button>
                </NavigationLink>
              ) : (
                <Button variant="outline" size="sm" disabled className="w-full border-[#435a6742] text-[#435a67]">
                  View & Book
                </Button>
              )}
              {/* Creator itinerary actions */}
              {isCreatorCopy && (
                <div className="mt-3 space-y-2">
                  {item.draft_itinerary_id && (
                    <div className="flex items-center gap-1 text-xs text-amber-600">
                      <FileEdit className="size-3" />
                      <span>Edit draft in progress</span>
                      <NavigationLink href={`/dashboard/customer/my-itineraries/${item.draft_itinerary_id}/edit`}>
                        <Button variant="link" size="sm" className="text-xs p-0 h-auto text-amber-600 underline">
                          Continue editing
                        </Button>
                      </NavigationLink>
                    </div>
                  )}

                  {item.removal_status === 'requested' && (
                    <div className="flex items-center gap-1 text-xs text-red-500">
                      <Clock className="size-3" />
                      <span>Removal request pending</span>
                    </div>
                  )}

                  {approvalStatus === 'approved' && !item.draft_itinerary_id && item.removal_status !== 'requested' && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleRequestEdit(item.id)} disabled={processingId === item.id} className="flex-1 border-[#435a6742] text-[#435a67] text-xs">
                        <Pencil className="size-3 mr-1" />
                        Request Edit
                      </Button>
                      <Dialog
                        open={removalDialogOpen && removalTargetId === item.id}
                        onOpenChange={(open) => {
                          setRemovalDialogOpen(open);
                          if (!open) {
                            setRemovalTargetId(null);
                            setRemovalReason('');
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setRemovalTargetId(item.id);
                              setRemovalDialogOpen(true);
                            }}
                            disabled={processingId === item.id}
                            className="flex-1 border-red-200 text-red-500 hover:bg-red-50 text-xs"
                          >
                            <Trash2 className="size-3 mr-1" />
                            Request Removal
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Request Itinerary Removal</DialogTitle>
                            <DialogDescription>Your request will be reviewed by an admin. Optionally provide a reason.</DialogDescription>
                          </DialogHeader>
                          <Textarea value={removalReason} onChange={(e) => setRemovalReason(e.target.value)} placeholder="Reason for removal (optional)" className="min-h-[80px]" />
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setRemovalDialogOpen(false);
                                setRemovalReason('');
                              }}
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleRequestRemoval} disabled={processingId === item.id} className="bg-red-600 hover:bg-red-700 text-white">
                              Submit Request
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
