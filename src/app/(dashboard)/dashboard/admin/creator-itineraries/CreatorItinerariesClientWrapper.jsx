'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { approveCreatorItinerary, rejectCreatorItinerary } from '@/lib/actions/creatorItineraries';

const STATUS_TABS = ['all', 'pending_approval', 'approved', 'rejected'];

const statusBadgeVariant = (status) => {
  switch (status) {
    case 'approved':
      return 'success';
    case 'rejected':
      return 'destructive';
    case 'pending_approval':
      return 'warning';
    default:
      return 'secondary';
  }
};

const formatStatus = (status) => {
  if (status === 'pending_approval') return 'Pending';
  return status ? status.charAt(0).toUpperCase() + status.slice(1) : '-';
};

export default function CreatorItinerariesClientWrapper({ initialItineraries, initialLastPage }) {
  const router = useRouter();
  const { toast } = useToast();
  const [itineraries, setItineraries] = useState(initialItineraries);
  const [activeTab, setActiveTab] = useState('all');
  const [processingId, setProcessingId] = useState(null);

  const filtered = activeTab === 'all' ? itineraries : itineraries.filter((i) => i.approval_status === activeTab);

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
      setItineraries((prev) => prev.map((i) => (i.id === id ? { ...i, approval_status: 'approved' } : i)));
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
      setItineraries((prev) => prev.map((i) => (i.id === id ? { ...i, approval_status: 'rejected' } : i)));
      router.refresh();
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setProcessingId(null);
  };

  const getOriginalLink = (item) => {
    const slug = item.parent_itinerary?.slug;
    const citySlug = item.parent_itinerary?.locations?.[0]?.city?.slug;
    if (!slug || !citySlug) return null;
    return `/cities/${citySlug}/itineraries/${slug}`;
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
                <TableHead>Original</TableHead>
                <TableHead>Preview</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => {
                const originalLink = getOriginalLink(item);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.creator?.name || item.user?.name || '-'}</TableCell>
                    <TableCell>{item.name || item.title || '-'}</TableCell>
                    <TableCell>
                      {originalLink ? (
                        <a href={originalLink} target="_blank" rel="noopener noreferrer" className="text-secondaryDark hover:underline inline-flex items-center gap-1">
                          {item.parent_itinerary?.name || 'View'}
                          <ExternalLink className="size-3" />
                        </a>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <a href={`/preview/itinerary/${item.id}`} target="_blank" rel="noopener noreferrer" className="text-secondaryDark hover:underline inline-flex items-center gap-1">
                        Preview
                        <ExternalLink className="size-3" />
                      </a>
                    </TableCell>
                    <TableCell>{formatDate(item.created_at)}</TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(item.approval_status)}>{formatStatus(item.approval_status)}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.approval_status === 'pending_approval' ? (
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => handleReject(item.id)} disabled={processingId === item.id} className="border-red-300 text-red-600 hover:bg-red-50">
                            <XCircle className="size-4 mr-1" />
                            Reject
                          </Button>
                          <Button size="sm" onClick={() => handleApprove(item.id)} disabled={processingId === item.id} className="bg-secondaryDark hover:bg-secondaryDark/90">
                            <CheckCircle className="size-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm text-[#5A5A5A]">-</span>
                      )}
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
