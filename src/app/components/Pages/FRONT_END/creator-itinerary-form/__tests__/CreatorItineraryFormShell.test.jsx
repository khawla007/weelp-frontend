import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import CreatorItineraryFormShell from '../CreatorItineraryFormShell';
import { submitDraft, updateDraft } from '@/lib/actions/creatorItineraries';

const push = jest.fn();

jest.mock('next/navigation', () => ({ useRouter: () => ({ push, back: jest.fn() }) }));
jest.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: jest.fn() }) }));
jest.mock('@/lib/actions/creatorItineraries', () => ({
  submitCreatorItineraryDraft: jest.fn(),
  updateDraft: jest.fn(),
  submitDraft: jest.fn(),
}));
jest.mock('@/app/components/Pages/DASHBOARD/admin/_rsc_pages/itineraries/itinerary_shared', () => ({ NavigationItinerary: () => null }));
jest.mock(
  '../steps/Step1BasicInfo',
  () =>
    function MockStep1BasicInfo() {
      return <div>Basic information</div>;
    },
);
jest.mock(
  '../steps/Step2Schedule',
  () =>
    function MockStep2Schedule({ onSubmit, submitLabel }) {
      return <button onClick={onSubmit}>{submitLabel}</button>;
    },
);

const initialData = {
  name: 'Draft trip',
  slug: 'draft-trip',
  description: 'A complete description',
  locations: [1],
  schedules: [],
  activities: [],
  transfers: [],
};

describe('CreatorItineraryFormShell Draft modes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    updateDraft.mockResolvedValue({ success: true, message: 'Saved' });
    submitDraft.mockResolvedValue({ success: true, message: 'Submitted' });
  });

  it('saves a standalone restored Draft without submitting it as an edit', async () => {
    render(<CreatorItineraryFormShell mode="edit" draftMode="standalone" draftId="12" initialData={initialData} />);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Save draft' }));

    await waitFor(() => expect(updateDraft).toHaveBeenCalled());
    expect(submitDraft).not.toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith('/dashboard/customer/my-itineraries?status=draft');
  });
});
