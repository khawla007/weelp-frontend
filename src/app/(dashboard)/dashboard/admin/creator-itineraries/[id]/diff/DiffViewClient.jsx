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
    <div className={`grid grid-cols-2 gap-4 p-3 rounded-lg ${changed ? 'bg-warning/10 border border-warning/40' : ''}`}>
      <div>
        <p className="text-xs text-muted-foreground mb-1">{label} (Current)</p>
        <p className="text-sm text-foreground">{approvedValue || <span className="text-muted-foreground italic">Empty</span>}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-1">
          {label} (Proposed)
          {changed && (
            <Badge variant="warning" className="ml-2 text-xs">
              Changed
            </Badge>
          )}
        </p>
        <p className="text-sm text-foreground">{draftValue || <span className="text-muted-foreground italic">Empty</span>}</p>
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
          <div key={i} className="border border-border rounded-lg overflow-hidden">
            <div className="bg-muted px-4 py-2 font-medium text-sm text-foreground">
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
                <p className="text-xs font-medium text-muted-foreground mb-2">Current</p>
                {approved ? (
                  <>
                    {approved.title && <p className="text-sm text-foreground mb-2 font-medium">{approved.title}</p>}
                    {approved.activities?.map((a, idx) => (
                      <div key={idx} className="text-sm text-copy py-1 border-b border-border">
                        {a.name || `Activity #${a.activity_id}`} {a.start_time && `(${a.start_time})`}
                      </div>
                    ))}
                    {approved.transfers?.map((t, idx) => (
                      <div key={idx} className="text-sm text-copy py-1 border-b border-border italic">
                        Transfer: {t.name || `#${t.transfer_id}`} {t.start_time && `(${t.start_time})`}
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No day {dayNum} in current version</p>
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Proposed</p>
                {draft ? (
                  <>
                    {draft.title && <p className="text-sm text-foreground mb-2 font-medium">{draft.title}</p>}
                    {draft.activities?.map((a, idx) => (
                      <div key={idx} className="text-sm text-copy py-1 border-b border-border">
                        {a.name || `Activity #${a.activity_id}`} {a.start_time && `(${a.start_time})`}
                      </div>
                    ))}
                    {draft.transfers?.map((t, idx) => (
                      <div key={idx} className="text-sm text-copy py-1 border-b border-border italic">
                        Transfer: {t.name || `#${t.transfer_id}`} {t.start_time && `(${t.start_time})`}
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No day {dayNum} in proposed version</p>
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
      <div className="bg-background rounded-lg border border-border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground mb-4">Basic Information</h2>
        <DiffField label="Name" approvedValue={approved.name} draftValue={draft.name} />
        <DiffField label="Description" approvedValue={approved.description} draftValue={draft.description} />
      </div>

      <div className="bg-background rounded-lg border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Schedule Changes</h2>
        <ScheduleDiff approvedSchedules={approved.schedules} draftSchedules={draft.schedules} />
      </div>

      <div className="flex gap-3 justify-end sticky bottom-4 bg-background p-4 rounded-lg border border-border shadow-lg">
        <Button variant="outline" onClick={() => router.back()} disabled={processing}>
          Back
        </Button>
        <Button variant="outline" onClick={handleReject} disabled={processing} className="border-destructive/40 text-destructive hover:bg-destructive/10">
          <XCircle className="size-4 mr-1" />
          Reject Edit
        </Button>
        <Button onClick={handleApprove} disabled={processing} className="bg-weelp-sage-deep hover:bg-weelp-sage-deep/90">
          <CheckCircle className="size-4 mr-1" />
          Approve Edit
        </Button>
      </div>
    </div>
  );
}
