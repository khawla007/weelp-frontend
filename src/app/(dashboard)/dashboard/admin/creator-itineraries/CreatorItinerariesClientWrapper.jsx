'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, ExternalLink, Pencil, Trash2, FileEdit, Ban, Eye, RotateCcw, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { approveCreatorItinerary, rejectCreatorItinerary } from '@/lib/actions/creatorItineraries';
import { adminDeleteCreatorItinerary, adminApproveEdit, adminRejectEdit, adminApproveRemoval, adminRejectRemoval } from '@/lib/actions/creatorItineraries';
import { adminPermanentlyDeleteCreatorItinerary, adminPublishCreatorItinerary, adminRestoreCreatorItinerary } from '@/lib/actions/creatorItineraries';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import NavigationLink from '@/app/components/Navigation/NavigationLink';
import { getItineraryDisplayImage } from '@/lib/utils/itineraryImages';

const STATUS_TABS = [
  { key: 'all', label: 'All', href: '/dashboard/admin/creator-itineraries' },
  { key: 'pending', label: 'Pending', href: '/dashboard/admin/creator-itineraries?status=pending' },
  { key: 'approved', label: 'Approved', href: '/dashboard/admin/creator-itineraries?status=approved' },
  { key: 'rejected', label: 'Rejected', href: '/dashboard/admin/creator-itineraries?status=rejected' },
  { key: 'draft', label: 'Draft', href: '/dashboard/admin/creator-itineraries?status=draft' },
  { key: 'trash', label: 'Trash', href: '/dashboard/admin/creator-itineraries?view=trash' },
];

const statusBadgeVariant = (status) => {
  switch (status) {
    case 'approved':
      return 'success';
    case 'rejected':
      return 'destructive';
    case 'pending':
      return 'warning';
    case 'deleted':
      return 'destructive';
    default:
      return 'secondary';
  }
};

const formatStatus = (status) => {
  if (status === 'pending') return 'Pending';
  return status ? status.charAt(0).toUpperCase() + status.slice(1) : '-';
};

export default function CreatorItinerariesClientWrapper({ initialItineraries, initialLastPage, currentPage = 1, activeView = 'active', activeStatus = '' }) {
  const router = useRouter();
  const { toast } = useToast();
  const [itineraries, setItineraries] = useState(initialItineraries);
  const [processingId, setProcessingId] = useState(null);
  const activeTab = activeView === 'trash' ? 'trash' : activeStatus || 'all';
  const filtered = itineraries;
  const isTrash = activeView === 'trash';
  useEffect(() => {
    setItineraries(initialItineraries);
  }, [initialItineraries]);
  const paginationHref = (page) => {
    const params = new URLSearchParams();
    if (activeView === 'trash') params.set('view', 'trash');
    if (activeStatus) params.set('status', activeStatus);
    if (page > 1) params.set('page', String(page));
    const query = params.toString();
    return `/dashboard/admin/creator-itineraries${query ? `?${query}` : ''}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleApprove = async (id) => {
    setProcessingId(id);
    const result = await approveCreatorItinerary(id);
    if (result.success) {
      toast({ title: 'Itinerary approved', description: result.message || 'The creator itinerary has been approved.' });
      setItineraries((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'approved' } : i)));
      router.refresh();
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setProcessingId(null);
  };

  const handleReject = async (id) => {
    setProcessingId(id);
    const result = await rejectCreatorItinerary(id);
    if (result.success) {
      toast({ title: 'Itinerary rejected', description: result.message || 'The creator itinerary has been rejected.' });
      setItineraries((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'rejected' } : i)));
      router.refresh();
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setProcessingId(null);
  };

  const handleDelete = async (id) => {
    setProcessingId(id);
    const result = await adminDeleteCreatorItinerary(id);
    if (result.success) {
      toast({ title: 'Itinerary removed', description: result.message });
      setItineraries((prev) => prev.filter((i) => i.id !== id));
      router.refresh();
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setProcessingId(null);
  };

  const handleRestore = async (id) => {
    setProcessingId(id);
    const result = await adminRestoreCreatorItinerary(id);
    if (result.success) {
      setItineraries((prev) => prev.filter((item) => item.id !== id));
      toast({ title: 'Restored to Draft', description: result.message });
      router.refresh();
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setProcessingId(null);
  };

  const handlePublish = async (id) => {
    setProcessingId(id);
    const result = await adminPublishCreatorItinerary(id);
    if (result.success) {
      toast({ title: 'Itinerary published', description: result.message });
      router.refresh();
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setProcessingId(null);
  };

  const handlePermanentDelete = async (id) => {
    setProcessingId(id);
    const result = await adminPermanentlyDeleteCreatorItinerary(id);
    if (result.success) {
      setItineraries((prev) => prev.filter((item) => item.id !== id));
      toast({ title: 'Itinerary permanently deleted', description: result.message });
      router.refresh();
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setProcessingId(null);
  };

  const handleApproveEdit = async (id) => {
    setProcessingId(id);
    const result = await adminApproveEdit(id);
    if (result.success) {
      toast({ title: 'Edit approved', description: result.message });
      setItineraries((prev) => prev.map((i) => (i.id === id ? { ...i, draft_itinerary_id: null } : i)));
      router.refresh();
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setProcessingId(null);
  };

  const handleRejectEdit = async (id) => {
    setProcessingId(id);
    const result = await adminRejectEdit(id);
    if (result.success) {
      toast({ title: 'Edit rejected', description: result.message });
      setItineraries((prev) => prev.map((i) => (i.id === id ? { ...i, draft_itinerary_id: null } : i)));
      router.refresh();
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setProcessingId(null);
  };

  const handleApproveRemoval = async (id) => {
    setProcessingId(id);
    const result = await adminApproveRemoval(id);
    if (result.success) {
      toast({ title: 'Removal approved', description: result.message });
      setItineraries((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'deleted', removal_status: 'approved' } : i)));
      router.refresh();
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setProcessingId(null);
  };

  const handleRejectRemoval = async (id) => {
    setProcessingId(id);
    const result = await adminRejectRemoval(id);
    if (result.success) {
      toast({ title: 'Removal rejected', description: result.message });
      setItineraries((prev) => prev.map((i) => (i.id === id ? { ...i, removal_status: null } : i)));
      router.refresh();
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setProcessingId(null);
  };

  return (
    <>
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_TABS.map((tab) => (
          <NavigationLink key={tab.key} href={tab.href}>
            <Button variant={activeTab === tab.key ? 'default' : 'outline'} size="sm" className={activeTab === tab.key ? 'bg-weelp-sage-deep hover:bg-weelp-sage-deep/90' : 'border-border text-copy'}>
              {tab.label}
            </Button>
          </NavigationLink>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-foreground">No itineraries found</p>
          <p className="text-muted-foreground mt-2">{activeTab === 'all' ? 'No creator itineraries have been submitted yet.' : `No ${activeTab} itineraries.`}</p>
        </div>
      ) : (
        <div className="bg-background rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Image</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Itinerary Name</TableHead>
                <TableHead>Original</TableHead>
                {!isTrash && <TableHead>Preview</TableHead>}
                <TableHead>{isTrash ? 'Retention' : 'Date'}</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => {
                const thumbnail = getItineraryDisplayImage(item);
                const parentSlug = item.parent_itinerary?.slug;
                const parentCitySlug = item.parent_itinerary?.locations?.[0]?.city?.slug;
                const parentHref = parentSlug && parentCitySlug ? `/cities/${parentCitySlug}/itineraries/${parentSlug}` : null;
                const hasWorkflowConflict = item.removal_status === 'requested' || Boolean(item.draft_itinerary_id) || ['pending', 'edit_pending'].includes(item.status);
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      {thumbnail ? (
                        <img src={thumbnail} alt={item.name || 'Itinerary thumbnail'} className="size-12 rounded-md object-cover border border-border" />
                      ) : (
                        <div className="size-12 rounded-md bg-muted border border-border" aria-label="No image" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{item.creator?.name || item.user?.name || '-'}</TableCell>
                    <TableCell>{item.name || item.title || '-'}</TableCell>
                    <TableCell>
                      {parentHref ? (
                        <a href={parentHref} target="_blank" rel="noopener noreferrer" className="text-weelp-sage-text hover:underline inline-flex items-center gap-1">
                          {item.parent_itinerary?.name || 'View'}
                          <ExternalLink className="size-3" />
                        </a>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    {!isTrash && (
                      <TableCell>
                        <a href={`/preview/itinerary/${item.id}`} target="_blank" rel="noopener noreferrer" className="text-weelp-sage-text hover:underline inline-flex items-center gap-1">
                          Preview
                          <ExternalLink className="size-3" />
                        </a>
                      </TableCell>
                    )}
                    <TableCell>
                      {isTrash ? (
                        <div className="space-y-1 text-xs">
                          <p>Removed {formatDate(item.deleted_at)}</p>
                          <p className="text-muted-foreground">Purges {formatDate(item.purge_at)}</p>
                        </div>
                      ) : (
                        formatDate(item.created_at)
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={statusBadgeVariant(item.status)} className="justify-center">
                          {formatStatus(item.status)}
                        </Badge>
                        {item.draft_itinerary_id && <Badge variant="warning">Edit Pending</Badge>}
                        {item.removal_status === 'requested' && <Badge variant="destructive">Removal Requested</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end flex-wrap">
                        {!isTrash && (
                          <a href={`/preview/itinerary/${item.id}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="border-border text-copy" title="View itinerary">
                              <Eye className="size-4 mr-1" />
                              View
                            </Button>
                          </a>
                        )}

                        {isTrash && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => handleRestore(item.id)} disabled={processingId === item.id}>
                              <RotateCcw className="size-4 mr-1" />
                              Restore to Draft
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="border-destructive/40 text-destructive">
                                  <Trash2 className="size-4 mr-1" />
                                  Delete permanently
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete permanently?</AlertDialogTitle>
                                  <AlertDialogDescription>This itinerary and its owned content cannot be recovered.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handlePermanentDelete(item.id)} className="bg-destructive hover:bg-destructive/90">
                                    Confirm permanent deletion
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}

                        {!isTrash && item.status === 'draft' && item.removal_status !== 'requested' && !item.draft_itinerary_id && (
                          <Button size="sm" onClick={() => handlePublish(item.id)} disabled={processingId === item.id} className="bg-weelp-sage-deep hover:bg-weelp-sage-deep/90">
                            <Send className="size-4 mr-1" />
                            Publish
                          </Button>
                        )}

                        {!isTrash && item.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReject(item.id)}
                              disabled={processingId === item.id}
                              className="border-destructive/40 text-destructive hover:bg-destructive/10"
                            >
                              <XCircle className="size-4 mr-1" />
                              Reject
                            </Button>
                            <Button size="sm" onClick={() => handleApprove(item.id)} disabled={processingId === item.id} className="bg-weelp-sage-deep hover:bg-weelp-sage-deep/90">
                              <CheckCircle className="size-4 mr-1" />
                              Approve
                            </Button>
                          </>
                        )}

                        {!isTrash && item.draft_itinerary_id && (
                          <>
                            <NavigationLink href={`/dashboard/admin/creator-itineraries/${item.id}/diff`}>
                              <Button variant="outline" size="sm" className="border-info/40 text-info hover:bg-info/10">
                                <FileEdit className="size-4 mr-1" />
                                Review Edit
                              </Button>
                            </NavigationLink>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRejectEdit(item.id)}
                              disabled={processingId === item.id}
                              className="border-destructive/40 text-destructive hover:bg-destructive/10"
                            >
                              <XCircle className="size-4 mr-1" />
                              Reject Edit
                            </Button>
                            <Button size="sm" onClick={() => handleApproveEdit(item.id)} disabled={processingId === item.id} className="bg-weelp-sage-deep hover:bg-weelp-sage-deep/90">
                              <CheckCircle className="size-4 mr-1" />
                              Approve Edit
                            </Button>
                          </>
                        )}

                        {!isTrash && item.removal_status === 'requested' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRejectRemoval(item.id)}
                              disabled={processingId === item.id}
                              className="border-destructive/40 text-destructive hover:bg-destructive/10"
                            >
                              <XCircle className="size-4 mr-1" />
                              Reject Removal
                            </Button>
                            <Button size="sm" onClick={() => handleApproveRemoval(item.id)} disabled={processingId === item.id} className="bg-destructive hover:bg-destructive/90 text-white">
                              <Ban className="size-4 mr-1" />
                              Approve Removal
                            </Button>
                          </>
                        )}

                        {!isTrash && (
                          <>
                            <NavigationLink href={`/dashboard/admin/creator-itineraries/${item.id}`}>
                              <Button variant="outline" size="sm" className="border-border text-copy">
                                <Pencil className="size-4 mr-1" />
                                Edit
                              </Button>
                            </NavigationLink>
                            {!hasWorkflowConflict && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" disabled={processingId === item.id} className="border-destructive/40 text-destructive hover:bg-destructive/10">
                                    <Trash2 className="size-4 mr-1" />
                                    Remove
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-background">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove Itinerary</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This moves &quot;{item.name}&quot; to Trash, hides it from public pages, and notifies the creator. An admin can restore it before permanent deletion.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive hover:bg-destructive/90">
                                      Remove
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {initialLastPage > 1 && (
        <nav className="mt-6 flex items-center justify-center gap-3" aria-label="Creator itinerary pages">
          <NavigationLink href={paginationHref(currentPage - 1)} aria-disabled={currentPage <= 1}>
            <Button variant="outline" size="sm" disabled={currentPage <= 1}>
              Previous
            </Button>
          </NavigationLink>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {initialLastPage}
          </span>
          <NavigationLink href={paginationHref(currentPage + 1)} aria-disabled={currentPage >= initialLastPage}>
            <Button variant="outline" size="sm" disabled={currentPage >= initialLastPage}>
              Next
            </Button>
          </NavigationLink>
        </nav>
      )}
    </>
  );
}
