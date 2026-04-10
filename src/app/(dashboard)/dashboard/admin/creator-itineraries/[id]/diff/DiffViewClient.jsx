'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { adminApproveEdit, adminRejectEdit } from '@/lib/actions/creatorItineraries';

function DiffField({ label, approvedValue, draftValue }) {
  const changed = approvedValue !== draftValue;
  return (
    <div className={`grid grid-cols-2 gap-4 p-3 rounded-lg ${changed ? 'bg-amber-50 border border-amber-200' : ''}`}>
      <div>
        <p className="text-xs text-[#5A5A5A] mb-1">{label} (Current)</p>
        <p className="text-sm text-[#142A38]">{approvedValue || <span className="text-[#5A5A5A] italic">Empty</span>}</p>
      </div>
      <div>
        <p className="text-xs text-[#5A5A5A] mb-1">
          {label} (Proposed)
          {changed && (
            <Badge variant="warning" className="ml-2 text-xs">
              Changed
            </Badge>
          )}
        </p>
        <p className="text-sm text-[#142A38]">{draftValue || <span className="text-[#5A5A5A] italic">Empty</span>}</p>
      </div>
    </div>
  );
}

function ScheduleDiff({ approvedSchedules, draftSchedules }) {
  const maxDays = Math.max(approvedSchedules?.length || 0, draftSchedules?.length || 0);

  return (
    <div className="space-y-4">
      {Array.from({ length: maxDays }, (_, i) => {
        const approved = approvedSchedules?.[i];
        const draft = draftSchedules?.[i];
        const dayNum = i + 1;

        return (
          <div key={i} className="border border-[#435a6742] rounded-lg overflow-hidden">
            <div className="bg-[#CFDBE54D] px-4 py-2 font-medium text-sm text-[#142A38]">
              Day {dayNum}
              {!approved && (
                <Badge variant="success" className="ml-2 text-xs">
                  New
                </Badge>
              )}
              {!draft && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  Removed
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 p-4">
              <div>
                <p className="text-xs font-medium text-[#5A5A5A] mb-2">Current</p>
                {approved ? (
                  <>
                    {approved.title && <p className="text-sm text-[#142A38] mb-2 font-medium">{approved.title}</p>}
                    {approved.activities?.map((a, idx) => (
                      <div key={idx} className="text-sm text-[#435A67] py-1 border-b border-[#435a6714]">
                        {a.name || `Activity #${a.activity_id}`} {a.start_time && `(${a.start_time})`}
                      </div>
                    ))}
                    {approved.transfers?.map((t, idx) => (
                      <div key={idx} className="text-sm text-[#435A67] py-1 border-b border-[#435a6714] italic">
                        Transfer: {t.name || `#${t.transfer_id}`} {t.start_time && `(${t.start_time})`}
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-sm text-[#5A5A5A] italic">No day {dayNum} in current version</p>
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-[#5A5A5A] mb-2">Proposed</p>
                {draft ? (
                  <>
                    {draft.title && <p className="text-sm text-[#142A38] mb-2 font-medium">{draft.title}</p>}
                    {draft.activities?.map((a, idx) => (
                      <div key={idx} className="text-sm text-[#435A67] py-1 border-b border-[#435a6714]">
                        {a.name || `Activity #${a.activity_id}`} {a.start_time && `(${a.start_time})`}
                      </div>
                    ))}
                    {draft.transfers?.map((t, idx) => (
                      <div key={idx} className="text-sm text-[#435A67] py-1 border-b border-[#435a6714] italic">
                        Transfer: {t.name || `#${t.transfer_id}`} {t.start_time && `(${t.start_time})`}
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-sm text-[#5A5A5A] italic">No day {dayNum} in proposed version</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function DiffViewClient({ approved, draft, itineraryId }) {
  const router = useRouter();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

  const handleApprove = async () => {
    setProcessing(true);
    const result = await adminApproveEdit(itineraryId);
    if (result.success) {
      toast({ title: 'Edit approved', description: result.message });
      router.push('/dashboard/admin/creator-itineraries');
      router.refresh();
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setProcessing(false);
  };

  const handleReject = async () => {
    setProcessing(true);
    const result = await adminRejectEdit(itineraryId);
    if (result.success) {
      toast({ title: 'Edit rejected', description: result.message });
      router.push('/dashboard/admin/creator-itineraries');
      router.refresh();
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setProcessing(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-[#435a6742] p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#142A38] mb-4">Basic Information</h2>
        <DiffField label="Name" approvedValue={approved.name} draftValue={draft.name} />
        <DiffField label="Description" approvedValue={approved.description} draftValue={draft.description} />
      </div>

      <div className="bg-white rounded-lg border border-[#435a6742] p-6">
        <h2 className="text-lg font-semibold text-[#142A38] mb-4">Schedule Changes</h2>
        <ScheduleDiff approvedSchedules={approved.schedules} draftSchedules={draft.schedules} />
      </div>

      <div className="flex gap-3 justify-end sticky bottom-4 bg-white p-4 rounded-lg border border-[#435a6742] shadow-lg">
        <Button variant="outline" onClick={() => router.back()} disabled={processing}>
          Back
        </Button>
        <Button variant="outline" onClick={handleReject} disabled={processing} className="border-red-300 text-red-600 hover:bg-red-50">
          <XCircle className="size-4 mr-1" />
          Reject Edit
        </Button>
        <Button onClick={handleApprove} disabled={processing} className="bg-secondaryDark hover:bg-secondaryDark/90">
          <CheckCircle className="size-4 mr-1" />
          Approve Edit
        </Button>
      </div>
    </div>
  );
}
