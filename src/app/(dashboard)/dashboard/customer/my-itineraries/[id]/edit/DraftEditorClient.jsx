'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getDraftItinerary, updateDraft, submitDraft } from '@/lib/actions/creatorItineraries';
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

export default function DraftEditorClient({ draftId }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    const fetchDraft = async () => {
      const result = await getDraftItinerary(draftId);
      if (result.success && result.data) {
        setName(result.data.name || '');
        setDescription(result.data.description || '');
        setSchedules(result.data.schedules || []);
      } else {
        toast({ title: 'Error', description: result.message || 'Failed to load draft.', variant: 'destructive' });
      }
      setLoading(false);
    };
    fetchDraft();
  }, [draftId]);

  const handleSave = async () => {
    setSaving(true);
    const result = await updateDraft(draftId, { name, description, schedules });
    if (result.success) {
      toast({ title: 'Draft saved', description: result.message });
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setSaving(false);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const saveResult = await updateDraft(draftId, { name, description, schedules });
    if (!saveResult.success) {
      toast({ title: 'Error', description: 'Failed to save before submitting.', variant: 'destructive' });
      setSubmitting(false);
      return;
    }
    const result = await submitDraft(draftId);
    if (result.success) {
      toast({ title: 'Submitted for review', description: result.message });
      router.push('/dashboard/customer/my-itineraries');
      router.refresh();
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setSubmitting(false);
  };

  const addDay = () => {
    setSchedules((prev) => [...prev, { day: prev.length + 1, title: '', activities: [], transfers: [] }]);
  };

  const removeDay = (dayIndex) => {
    setSchedules((prev) => prev.filter((_, i) => i !== dayIndex).map((s, i) => ({ ...s, day: i + 1 })));
  };

  const updateScheduleTitle = (dayIndex, title) => {
    setSchedules((prev) => prev.map((s, i) => (i === dayIndex ? { ...s, title } : s)));
  };

  if (loading) {
    return <div className="text-center py-16 text-[#5A5A5A]">Loading draft...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white rounded-lg border border-[#435a6742] p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#142A38]">Basic Information</h2>
        <div>
          <Label htmlFor="name">Itinerary Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" placeholder="Enter itinerary name" />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 min-h-[120px]" placeholder="Describe your itinerary" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#435a6742] p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-[#142A38]">Schedule</h2>
          <Button variant="outline" size="sm" onClick={addDay} className="border-[#435a6742] text-[#435a67]">
            <Plus className="size-4 mr-1" />
            Add Day
          </Button>
        </div>

        {schedules.length === 0 ? (
          <p className="text-[#5A5A5A] text-sm">No days added yet. Click &quot;Add Day&quot; to start.</p>
        ) : (
          <div className="space-y-4">
            {schedules.map((schedule, dayIndex) => (
              <div key={dayIndex} className="border border-[#435a6742] rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-[#142A38]">Day {schedule.day}</h3>
                  <Button variant="ghost" size="sm" onClick={() => removeDay(dayIndex)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <Input value={schedule.title || ''} onChange={(e) => updateScheduleTitle(dayIndex, e.target.value)} placeholder="Day title (optional)" className="mb-3" />

                <div className="space-y-1">
                  {schedule.activities?.map((a, aIdx) => (
                    <div key={aIdx} className="text-sm text-[#435A67] py-1.5 px-2 bg-[#CFDBE54D] rounded flex justify-between">
                      <span>{a.name || `Activity #${a.activity_id}`}</span>
                      {a.start_time && <span className="text-[#5A5A5A]">{a.start_time}</span>}
                    </div>
                  ))}
                  {schedule.transfers?.map((t, tIdx) => (
                    <div key={tIdx} className="text-sm text-[#435A67] py-1.5 px-2 bg-blue-50 rounded flex justify-between italic">
                      <span>Transfer: {t.name || `#${t.transfer_id}`}</span>
                      {t.start_time && <span className="text-[#5A5A5A]">{t.start_time}</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-end sticky bottom-4 bg-white p-4 rounded-lg border border-[#435a6742] shadow-lg">
        <Button variant="outline" onClick={() => router.back()} disabled={saving || submitting}>
          Cancel
        </Button>
        <Button variant="outline" onClick={handleSave} disabled={saving || submitting} className="border-[#435a6742] text-[#435a67]">
          <Save className="size-4 mr-1" />
          {saving ? 'Saving...' : 'Save Draft'}
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={saving || submitting} className="bg-secondaryDark hover:bg-secondaryDark/90">
              <Send className="size-4 mr-1" />
              {submitting ? 'Submitting...' : 'Submit for Review'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Submit for Review</AlertDialogTitle>
              <AlertDialogDescription>Your changes will be sent to admin for approval. The current live version stays unchanged until approved.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white border-[#558e7b] text-black hover:bg-[#558e7b] hover:text-white">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleSubmit} className="bg-[#558e7b] border-[#558e7b] text-white hover:bg-white hover:text-black">
                Submit
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
