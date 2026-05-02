'use client';

import { useState } from 'react';
import { MapPin, Calendar, Clock, FileEdit, MoreHorizontal, Pencil, Trash2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { requestEdit, requestRemoval } from '@/lib/actions/creatorItineraries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import NavigationLink from '@/app/components/Navigation/NavigationLink';

export default function MyItinerariesClientWrapper({ initialItineraries, lastPage, isCreator = false }) {
  const [itineraries, setItineraries] = useState(initialItineraries);
  const [processingId, setProcessingId] = useState(null);
  const [removalReason, setRemovalReason] = useState('');
  const [removalDialogOpen, setRemovalDialogOpen] = useState(false);
  const [removalTargetId, setRemovalTargetId] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();
  const router = useRouter();

  const filtered = (() => {
    if (!isCreator || activeTab === 'all') return itineraries;
    if (activeTab === 'drafts') {
      return itineraries.filter((item) => {
        const meta = item.meta || {};
        const draftId = item.draft_itinerary_id ?? meta.draft_itinerary_id;
        return draftId != null;
      });
    }
    return itineraries;
  })();

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

  const openRemovalDialog = (id) => {
    setRemovalTargetId(id);
    setRemovalDialogOpen(true);
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

  // Header — creator-only Create button
  const headerButton = isCreator ? (
    <NavigationLink href="/dashboard/customer/my-itineraries/new">
      <Button className="bg-secondaryDark hover:bg-secondaryDark/90 text-white">
        <Sparkles className="size-4 mr-2" />
        Create Itinerary
      </Button>
    </NavigationLink>
  ) : null;

  // Empty state — role-aware
  if (itineraries.length === 0) {
    if (isCreator) {
      return (
        <div className="space-y-6">
          {headerButton && <div className="flex justify-end">{headerButton}</div>}
          <div className="text-center py-16">
            <p className="text-lg text-[#142A38]">No itineraries yet</p>
            <p className="text-[#5A5A5A] mt-2">Create your first itinerary and submit it for approval.</p>
            <div className="mt-4 flex justify-center">
              <NavigationLink href="/dashboard/customer/my-itineraries/new">
                <Button className="bg-secondaryDark hover:bg-secondaryDark/90 text-white">
                  <Sparkles className="size-4 mr-2" />
                  Create Itinerary
                </Button>
              </NavigationLink>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="text-center py-16">
        <p className="text-lg text-[#142A38]">No itineraries yet</p>
        <p className="text-[#5A5A5A] mt-2">Browse and save itineraries from the explore page to see them here.</p>
        <NavigationLink href="/explore-creators">
          <Button className="mt-4 bg-secondaryDark hover:bg-secondaryDark/90">Explore Itineraries</Button>
        </NavigationLink>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {headerButton && <div className="flex justify-end">{headerButton}</div>}

      {isCreator && (
        <div className="flex gap-2">
          {['all', 'drafts'].map((tab) => (
            <Button
              key={tab}
              size="sm"
              variant={activeTab === tab ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab)}
              className={activeTab === tab ? 'bg-secondaryDark hover:bg-secondaryDark/90' : 'border-[#435a6742] text-[#435a67]'}
            >
              {tab === 'all' ? 'All Itineraries' : 'Drafts'}
            </Button>
          ))}
        </div>
      )}

      {filtered.length === 0 && isCreator && activeTab === 'drafts' ? (
        <div className="text-center py-12 bg-white rounded-lg border border-[#435a6742]">
          <p className="text-lg text-[#142A38]">No drafts</p>
          <p className="text-[#5A5A5A] mt-2">Edits you&apos;ve submitted for review will appear here.</p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map((item) => {
          const itinerary = item.itinerary || item;
          const featuredMedia = itinerary.media_gallery?.find((m) => m.is_featured)?.media?.url || itinerary.media_gallery?.[0]?.media?.url;
          const featuredImage = featuredMedia || itinerary.featured_image || '/assets/images/placeholder-itinerary.jpg';
          const name = itinerary.name || itinerary.title || 'Untitled Itinerary';
          const cityData = itinerary.locations?.[0]?.city;
          const city = cityData?.name || itinerary.city?.name || itinerary.city_name || '';
          const citySlug = cityData?.slug || itinerary.city?.slug || '';
          const dayCount = itinerary.day_count || itinerary.days_count || itinerary.schedules?.length || 0;
          const slug = itinerary.slug;
          const meta = item.meta || {};
          const creatorId = item.creator_id ?? meta.creator_id;
          const approvalStatus = item.status ?? meta.status;
          const draftItineraryId = item.draft_itinerary_id ?? meta.draft_itinerary_id;
          const removalStatus = item.removal_status ?? meta.removal_status;
          const isCreatorCopy = !!creatorId;

          const canRequestEdit = isCreatorCopy && approvalStatus === 'approved' && !draftItineraryId && removalStatus !== 'requested';
          const canRequestRemoval = canRequestEdit;
          const showDropdown = canRequestEdit || canRequestRemoval;

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
                  <div className="absolute top-2 left-2">
                    <Badge variant={approvalStatus === 'approved' ? 'success' : approvalStatus === 'rejected' ? 'destructive' : 'warning'}>
                      {approvalStatus === 'pending' ? 'Pending' : approvalStatus.charAt(0).toUpperCase() + approvalStatus.slice(1)}
                    </Badge>
                  </div>
                )}
                {showDropdown && (
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="bg-white/90 hover:bg-white h-8 w-8 rounded-full" disabled={processingId === item.id}>
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" offset={10}>
                        {canRequestEdit && (
                          <DropdownMenuItem onClick={() => handleRequestEdit(item.id)} className="cursor-pointer">
                            <Pencil className="size-3.5 mr-2" />
                            Request Edit
                          </DropdownMenuItem>
                        )}
                        {canRequestRemoval && (
                          <DropdownMenuItem onClick={() => openRemovalDialog(item.id)} className="cursor-pointer text-red-600 focus:text-red-600">
                            <Trash2 className="size-3.5 mr-2" />
                            Request Removal
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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

                {isCreatorCopy && draftItineraryId && (
                  <div className="mt-3 flex items-center gap-1 text-xs text-amber-600">
                    <FileEdit className="size-3" />
                    <span>Edit draft in progress</span>
                    <NavigationLink href={`/dashboard/customer/my-itineraries/${draftItineraryId}/edit`}>
                      <Button variant="link" size="sm" className="text-xs p-0 h-auto text-amber-600 underline">
                        Continue editing
                      </Button>
                    </NavigationLink>
                  </div>
                )}

                {isCreatorCopy && removalStatus === 'requested' && (
                  <div className="mt-3 flex items-center gap-1 text-xs text-red-500">
                    <Clock className="size-3" />
                    <span>Removal request pending</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog
        open={removalDialogOpen}
        onOpenChange={(open) => {
          setRemovalDialogOpen(open);
          if (!open) {
            setRemovalTargetId(null);
            setRemovalReason('');
          }
        }}
      >
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
            <Button onClick={handleRequestRemoval} disabled={processingId === removalTargetId} className="bg-red-600 hover:bg-red-700 text-white">
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
