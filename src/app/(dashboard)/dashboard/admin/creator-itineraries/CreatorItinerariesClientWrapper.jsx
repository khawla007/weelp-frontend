'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, ExternalLink, Pencil, Trash2, FileEdit, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { approveCreatorItinerary, rejectCreatorItinerary } from '@/lib/actions/creatorItineraries';
import { adminDeleteCreatorItinerary, adminApproveEdit, adminRejectEdit, adminApproveRemoval, adminRejectRemoval } from '@/lib/actions/creatorItineraries';
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

const STATUS_TABS = ['all', 'pending', 'approved', 'rejected', 'deleted'];

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

export default function CreatorItinerariesClientWrapper({ initialItineraries, initialLastPage }) {
  const router = useRouter();
  const { toast } = useToast();
  const [itineraries, setItineraries] = useState(initialItineraries);
  const [activeTab, setActiveTab] = useState('all');
  const [processingId, setProcessingId] = useState(null);

  const filtered = activeTab === 'all' ? itineraries : itineraries.filter((i) => i.status === activeTab);

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
      <div className="flex gap-2 mb-6">
        {STATUS_TABS.map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab(tab)}
            className={activeTab === tab ? 'bg-secondaryDark hover:bg-secondaryDark/90' : 'border-[#435a6742] text-[#435a67]'}
          >
            {formatStatus(tab)}
          </Button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-[#142A38]">No itineraries found</p>
          <p className="text-[#5A5A5A] mt-2">{activeTab === 'all' ? 'No creator itineraries have been submitted yet.' : `No ${activeTab} itineraries.`}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-[#435a6742]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Creator</TableHead>
                <TableHead>Itinerary Name</TableHead>
                <TableHead>Preview</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => {
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.creator?.name || item.user?.name || '-'}</TableCell>
                    <TableCell>{item.name || item.title || '-'}</TableCell>
                    <TableCell>
                      <a href={`/preview/itinerary/${item.id}`} target="_blank" rel="noopener noreferrer" className="text-secondaryDark hover:underline inline-flex items-center gap-1">
                        Preview
                        <ExternalLink className="size-3" />
                      </a>
                    </TableCell>
                    <TableCell>{formatDate(item.created_at)}</TableCell>
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
                        {item.status === 'pending' && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => handleReject(item.id)} disabled={processingId === item.id} className="border-red-300 text-red-600 hover:bg-red-50">
                              <XCircle className="size-4 mr-1" />
                              Reject
                            </Button>
                            <Button size="sm" onClick={() => handleApprove(item.id)} disabled={processingId === item.id} className="bg-secondaryDark hover:bg-secondaryDark/90">
                              <CheckCircle className="size-4 mr-1" />
                              Approve
                            </Button>
                          </>
                        )}

                        {item.draft_itinerary_id && (
                          <>
                            <NavigationLink href={`/dashboard/admin/creator-itineraries/${item.id}/diff`}>
                              <Button variant="outline" size="sm" className="border-blue-300 text-blue-600 hover:bg-blue-50">
                                <FileEdit className="size-4 mr-1" />
                                Review Edit
                              </Button>
                            </NavigationLink>
                            <Button variant="outline" size="sm" onClick={() => handleRejectEdit(item.id)} disabled={processingId === item.id} className="border-red-300 text-red-600 hover:bg-red-50">
                              <XCircle className="size-4 mr-1" />
                              Reject Edit
                            </Button>
                            <Button size="sm" onClick={() => handleApproveEdit(item.id)} disabled={processingId === item.id} className="bg-secondaryDark hover:bg-secondaryDark/90">
                              <CheckCircle className="size-4 mr-1" />
                              Approve Edit
                            </Button>
                          </>
                        )}

                        {item.removal_status === 'requested' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRejectRemoval(item.id)}
                              disabled={processingId === item.id}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="size-4 mr-1" />
                              Reject Removal
                            </Button>
                            <Button size="sm" onClick={() => handleApproveRemoval(item.id)} disabled={processingId === item.id} className="bg-red-600 hover:bg-red-700 text-white">
                              <Ban className="size-4 mr-1" />
                              Approve Removal
                            </Button>
                          </>
                        )}

                        {item.status !== 'deleted' && (
                          <>
                            <NavigationLink href={`/dashboard/admin/creator-itineraries/${item.id}`}>
                              <Button variant="outline" size="sm" className="border-[#435a6742] text-[#435a67]">
                                <Pencil className="size-4 mr-1" />
                                Edit
                              </Button>
                            </NavigationLink>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" disabled={processingId === item.id} className="border-red-300 text-red-600 hover:bg-red-50">
                                  <Trash2 className="size-4 mr-1" />
                                  Remove
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-white">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Itinerary</AlertDialogTitle>
                                  <AlertDialogDescription>This will permanently remove &quot;{item.name}&quot; and all related data. This action cannot be undone.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-red-600 hover:bg-red-700">
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}

                        {item.status === 'deleted' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="icon" disabled={processingId === item.id} className="border-red-500 text-red-600 hover:bg-red-50 size-8">
                                <Trash2 className="size-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Permanently?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to permanently delete &quot;{item.name}&quot;? All related data will be erased from the database. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-[#558e7b] text-black hover:bg-[#558e7b] hover:text-white">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(item.id)} className="border-red-500 text-black bg-white hover:bg-red-500 hover:text-white">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
    </>
  );
}
