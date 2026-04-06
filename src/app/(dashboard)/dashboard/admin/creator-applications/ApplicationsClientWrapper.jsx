'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { approveApplication, rejectApplication } from '@/lib/actions/creatorApplications';

const STATUS_TABS = ['all', 'pending', 'approved', 'rejected'];

const statusBadgeVariant = (status) => {
  switch (status) {
    case 'approved':
      return 'success';
    case 'rejected':
      return 'destructive';
    case 'pending':
      return 'warning';
    default:
      return 'secondary';
  }
};

export default function ApplicationsClientWrapper({ initialApplications, initialLastPage }) {
  const router = useRouter();
  const { toast } = useToast();
  const [applications, setApplications] = useState(initialApplications);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const filtered = activeTab === 'all' ? applications : applications.filter((a) => a.status === activeTab);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleView = (app) => {
    setSelectedApp(app);
    setRejectNotes('');
    setDialogOpen(true);
  };

  const handleApprove = async (id) => {
    setProcessing(true);
    const result = await approveApplication(id);
    if (result.success) {
      toast({ title: 'Application approved', description: result.message || 'The creator application has been approved.' });
      setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'approved' } : a)));
      setDialogOpen(false);
      router.refresh();
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setProcessing(false);
  };

  const handleReject = async (id) => {
    setProcessing(true);
    const result = await rejectApplication(id, rejectNotes);
    if (result.success) {
      toast({ title: 'Application rejected', description: result.message || 'The creator application has been rejected.' });
      setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'rejected', admin_notes: rejectNotes } : a)));
      setDialogOpen(false);
      setRejectNotes('');
      router.refresh();
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setProcessing(false);
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
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-[#142A38]">No applications found</p>
          <p className="text-[#5A5A5A] mt-2">{activeTab === 'all' ? 'No creator applications have been submitted yet.' : `No ${activeTab} applications.`}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-[#435a6742]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Instagram</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.user?.name || app.name || '-'}</TableCell>
                  <TableCell>{app.user?.email || app.email || '-'}</TableCell>
                  <TableCell>{app.instagram || '-'}</TableCell>
                  <TableCell>{formatDate(app.created_at)}</TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant(app.status)}>{app.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleView(app)}>
                      <Eye className="size-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Application Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>Review the creator application below.</DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[#5A5A5A] block">Name</span>
                  <span className="font-medium text-[#142A38]">{selectedApp.user?.name || selectedApp.name || '-'}</span>
                </div>
                <div>
                  <span className="text-[#5A5A5A] block">Email</span>
                  <span className="font-medium text-[#142A38]">{selectedApp.user?.email || selectedApp.email || '-'}</span>
                </div>
                <div>
                  <span className="text-[#5A5A5A] block">Instagram</span>
                  <span className="font-medium text-[#142A38]">{selectedApp.instagram_handle || '-'}</span>
                </div>
                <div>
                  <span className="text-[#5A5A5A] block">Gender</span>
                  <span className="font-medium text-[#142A38]">{selectedApp.gender || '-'}</span>
                </div>
                <div>
                  <span className="text-[#5A5A5A] block">Phone</span>
                  <span className="font-medium text-[#142A38]">{selectedApp.phone || '-'}</span>
                </div>
                {selectedApp.youtube && (
                  <div>
                    <span className="text-[#5A5A5A] block">YouTube</span>
                    <span className="font-medium text-[#142A38]">{selectedApp.youtube}</span>
                  </div>
                )}
                {selectedApp.facebook && (
                  <div>
                    <span className="text-[#5A5A5A] block">Facebook</span>
                    <span className="font-medium text-[#142A38]">{selectedApp.facebook}</span>
                  </div>
                )}
                <div>
                  <span className="text-[#5A5A5A] block">Status</span>
                  <Badge variant={statusBadgeVariant(selectedApp.status)}>{selectedApp.status}</Badge>
                </div>
                <div>
                  <span className="text-[#5A5A5A] block">Submitted</span>
                  <span className="font-medium text-[#142A38]">{formatDate(selectedApp.created_at)}</span>
                </div>
                {selectedApp.admin_notes && (
                  <div className="col-span-2">
                    <span className="text-[#5A5A5A] block">Admin Notes</span>
                    <span className="font-medium text-[#142A38]">{selectedApp.admin_notes}</span>
                  </div>
                )}
              </div>

              {/* Reject textarea - only for pending */}
              {selectedApp.status === 'pending' && (
                <div>
                  <label className="text-sm text-[#5A5A5A] block mb-1">Rejection notes (optional)</label>
                  <textarea
                    value={rejectNotes}
                    onChange={(e) => setRejectNotes(e.target.value)}
                    placeholder="Reason for rejection..."
                    className="w-full border border-[#435a6742] rounded-md p-2 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-secondaryDark/30"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {selectedApp?.status === 'pending' && (
              <div className="flex gap-2 w-full justify-end">
                <Button variant="outline" onClick={() => handleReject(selectedApp.id)} disabled={processing} className="border-red-300 text-red-600 hover:bg-red-50">
                  <XCircle className="size-4 mr-1" />
                  {processing ? 'Processing...' : 'Reject'}
                </Button>
                <Button onClick={() => handleApprove(selectedApp.id)} disabled={processing} className="bg-secondaryDark hover:bg-secondaryDark/90">
                  <CheckCircle className="size-4 mr-1" />
                  {processing ? 'Processing...' : 'Approve'}
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
