'use client';

import { useEffect, useState } from 'react';
import { MapPin, Calendar, Clock, FileEdit, MoreHorizontal, Pencil, Trash2, Sparkles, RotateCcw, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { requestCreatorItineraryPublish, requestEdit, requestRemoval, restoreCreatorItinerary } from '@/lib/actions/creatorItineraries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import NavigationLink from '@/app/components/Navigation/NavigationLink';
import { DashboardMotionFrame } from '@/app/components/DashboardShared';

export default function MyItinerariesClientWrapper({ initialItineraries, lastPage, currentPage = 1, isCreator = false, activeView = 'active', activeStatus = '' }) {
  const [itineraries, setItineraries] = useState(initialItineraries);
  const [processingId, setProcessingId] = useState(null);
  const [removalReason, setRemovalReason] = useState('');
  const [removalDialogOpen, setRemovalDialogOpen] = useState(false);
  const [removalTargetId, setRemovalTargetId] = useState(null);
  const { toast } = useToast();
  const router = useRouter();
  const activeTab = activeView === 'trash' ? 'trash' : activeStatus === 'draft' ? 'drafts' : 'all';
  const filtered = itineraries;
  useEffect(() => {
    setItineraries(initialItineraries);
  }, [initialItineraries]);

  const formatTrashDate = (value) =>
    value
      ? new Date(value).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : 'Unknown';
  const paginationHref = (page) => {
    const params = new URLSearchParams();
    if (activeView === 'trash') params.set('view', 'trash');
    if (activeStatus) params.set('status', activeStatus);
    if (page > 1) params.set('page', String(page));
    const query = params.toString();
    return `/dashboard/customer/my-itineraries${query ? `?${query}` : ''}`;
  };

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

  const handleRestore = async (id) => {
    setProcessingId(id);
    const result = await restoreCreatorItinerary(id);
    if (result.success) {
      toast({ title: 'Restored to Draft', description: result.message });
      router.push('/dashboard/customer/my-itineraries?status=draft');
      router.refresh();
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setProcessingId(null);
  };

  const handleRequestPublish = async (id) => {
    setProcessingId(id);
    const result = await requestCreatorItineraryPublish(id);
    if (result.success) {
      toast({ title: 'Publication requested', description: result.message });
      router.push('/dashboard/customer/my-itineraries');
      router.refresh();
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setProcessingId(null);
  };

  // Header — creator-only Create button
  const headerButton = isCreator ? (
    <NavigationLink href="/dashboard/customer/my-itineraries/new">
      <Button className="bg-weelp-sage-deep hover:bg-weelp-sage-deep/90 text-white">
        <Sparkles className="size-4 mr-2" />
        Create Itinerary
      </Button>
    </NavigationLink>
  ) : null;

  // Empty state — role-aware
  if (itineraries.length === 0 && !isCreator) {
    return (
      <div className="weelp-fade-up text-center py-16">
        <p className="text-lg font-semibold text-foreground">No itineraries yet</p>
        <p className="text-muted-foreground mt-2">Browse and save itineraries from the explore page to see them here.</p>
        <NavigationLink href="/explore-creators">
          <Button className="mt-4 bg-weelp-sage-deep hover:bg-weelp-sage-deep/90">Explore Itineraries</Button>
        </NavigationLink>
      </div>
    );
  }

  return (
    <DashboardMotionFrame className="space-y-6">
      {headerButton && <div className="flex justify-end">{headerButton}</div>}

      {isCreator && (
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Itineraries', href: '/dashboard/customer/my-itineraries' },
            { key: 'drafts', label: 'Drafts', href: '/dashboard/customer/my-itineraries?status=draft' },
            { key: 'trash', label: 'Trash', href: '/dashboard/customer/my-itineraries?view=trash' },
          ].map((tab) => (
            <NavigationLink key={tab.key} href={tab.href}>
              <Button
                size="sm"
                variant={activeTab === tab.key ? 'default' : 'outline'}
                className={activeTab === tab.key ? 'bg-weelp-sage-deep hover:bg-weelp-sage-deep/90' : 'border-border text-copy'}
              >
                {tab.label}
              </Button>
            </NavigationLink>
          ))}
        </div>
      )}

      {filtered.length === 0 && isCreator ? (
        <div className="weelp-fade-up text-center py-12 bg-background rounded-lg border border-border">
          <p className="text-lg font-semibold text-foreground">{activeTab === 'trash' ? 'Trash is empty' : activeTab === 'drafts' ? 'No drafts' : 'No itineraries yet'}</p>
          <p className="text-muted-foreground mt-2">
            {activeTab === 'trash'
              ? 'Removed itineraries will remain here for 30 days.'
              : activeTab === 'drafts'
                ? 'Restored and unpublished itineraries will appear here.'
                : 'Create your first itinerary and submit it for approval.'}
          </p>
        </div>
      ) : null}

      <div key={activeTab} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-fade-in">
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
          const isTrashItem = activeView === 'trash';
          const isStandaloneDraft = isCreatorCopy && approvalStatus === 'draft' && !draftItineraryId;

          const canRequestEdit = isCreatorCopy && approvalStatus === 'approved' && !draftItineraryId && removalStatus !== 'requested';
          const canRequestRemoval = isCreatorCopy && ['draft', 'rejected', 'approved'].includes(approvalStatus) && !draftItineraryId && removalStatus !== 'requested' && !isTrashItem;
          const showDropdown = canRequestEdit || canRequestRemoval;

          return (
            <div
              key={item.id || itinerary.id}
              className="bg-background rounded-xl border border-border overflow-hidden group transition-[transform,box-shadow] duration-150 ease-out hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(24,24,27,0.06),0_4px_12px_rgba(24,24,27,0.08)] focus-within:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:focus-within:translate-y-0"
            >
              <div className="h-[200px] bg-muted relative overflow-hidden">
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
                      {isTrashItem ? 'In Trash' : approvalStatus === 'pending' ? 'Pending' : approvalStatus.charAt(0).toUpperCase() + approvalStatus.slice(1)}
                    </Badge>
                  </div>
                )}
                {showDropdown && (
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="bg-background/90 hover:bg-background h-8 w-8 rounded-full" disabled={processingId === item.id}>
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
                          <DropdownMenuItem onClick={() => openRemovalDialog(item.id)} className="cursor-pointer text-destructive focus:text-destructive">
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
                <h3 className="font-semibold text-foreground text-base line-clamp-1 mb-2">{name}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
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
                {!isTrashItem && approvalStatus !== 'draft' && slug && citySlug ? (
                  <NavigationLink href={`/cities/${citySlug}/itineraries/${slug}`} className="block">
                    <Button variant="outline" size="sm" className="w-full border-border text-copy hover:bg-muted">
                      View & Book
                    </Button>
                  </NavigationLink>
                ) : !isTrashItem && approvalStatus !== 'draft' ? (
                  <Button variant="outline" size="sm" disabled className="w-full border-border text-copy">
                    View & Book
                  </Button>
                ) : null}

                {isTrashItem && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">Removed {formatTrashDate(item.deleted_at)}</p>
                    <p className="text-sm font-medium text-destructive">
                      {item.days_until_purge === 0 ? 'Scheduled for permanent removal today' : `Permanently removed in ${item.days_until_purge} ${item.days_until_purge === 1 ? 'day' : 'days'}`}
                    </p>
                    <p className="text-xs text-muted-foreground">Restore returns this itinerary to a private Draft.</p>
                    <Button className="w-full" variant="outline" onClick={() => handleRestore(item.id)} disabled={processingId === item.id}>
                      <RotateCcw className="size-4 mr-2" />
                      Restore to Draft
                    </Button>
                  </div>
                )}

                {isStandaloneDraft && (
                  <div className="mt-3 grid gap-2">
                    <NavigationLink href={`/dashboard/customer/my-itineraries/${item.id}/edit`} className="block">
                      <Button variant="outline" size="sm" className="w-full">
                        <Pencil className="size-4 mr-2" />
                        Continue editing
                      </Button>
                    </NavigationLink>
                    <Button size="sm" onClick={() => handleRequestPublish(item.id)} disabled={processingId === item.id} className="w-full bg-weelp-sage-deep hover:bg-weelp-sage-deep/90">
                      <Send className="size-4 mr-2" />
                      Request publish
                    </Button>
                  </div>
                )}

                {isCreatorCopy && draftItineraryId && (
                  <div className="mt-3 flex items-center gap-1 text-xs text-warning">
                    <FileEdit className="size-3" />
                    <span>Edit draft in progress</span>
                    <NavigationLink href={`/dashboard/customer/my-itineraries/${draftItineraryId}/edit`}>
                      <Button variant="link" size="sm" className="text-xs p-0 h-auto text-warning underline">
                        Continue editing
                      </Button>
                    </NavigationLink>
                  </div>
                )}

                {isCreatorCopy && removalStatus === 'requested' && (
                  <div className="mt-3 flex items-center gap-1 text-xs text-destructive">
                    <Clock className="size-3" />
                    <span>Removal request pending</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {lastPage > 1 && (
        <nav className="flex items-center justify-center gap-3" aria-label="Itinerary pages">
          <NavigationLink href={paginationHref(currentPage - 1)} aria-disabled={currentPage <= 1}>
            <Button variant="outline" size="sm" disabled={currentPage <= 1}>
              Previous
            </Button>
          </NavigationLink>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {lastPage}
          </span>
          <NavigationLink href={paginationHref(currentPage + 1)} aria-disabled={currentPage >= lastPage}>
            <Button variant="outline" size="sm" disabled={currentPage >= lastPage}>
              Next
            </Button>
          </NavigationLink>
        </nav>
      )}

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
            <Button onClick={handleRequestRemoval} disabled={processingId === removalTargetId} className="bg-destructive hover:bg-destructive/90 text-white">
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardMotionFrame>
  );
}
