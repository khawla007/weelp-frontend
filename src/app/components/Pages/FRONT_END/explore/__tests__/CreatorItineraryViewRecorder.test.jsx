import { act, render, waitFor } from '@testing-library/react';

import CreatorItineraryViewRecorder from '../CreatorItineraryViewRecorder';
import { recordItineraryView } from '@/lib/actions/creatorItineraries';

jest.mock('@/lib/actions/creatorItineraries', () => ({
  recordItineraryView: jest.fn(() => Promise.resolve({ success: true, views_count: 1 })),
}));

beforeEach(() => {
  jest.clearAllMocks();
  window.sessionStorage.clear();
});

describe('CreatorItineraryViewRecorder', () => {
  it('records an opened creator itinerary once per browser session', async () => {
    render(<CreatorItineraryViewRecorder enabled itineraryId={40} />);

    await waitFor(() => expect(recordItineraryView).toHaveBeenCalledWith(40));
    expect(window.sessionStorage.getItem('weelp:creator-itinerary-opened:40')).toBe('1');

    render(<CreatorItineraryViewRecorder enabled itineraryId={40} />);

    await act(async () => {
      await Promise.resolve();
    });

    expect(recordItineraryView).toHaveBeenCalledTimes(1);
  });

  it('does not record normal itinerary pages', async () => {
    render(<CreatorItineraryViewRecorder enabled={false} itineraryId={11} />);

    await act(async () => {
      await Promise.resolve();
    });

    expect(recordItineraryView).not.toHaveBeenCalled();
  });

  it('retries when the view request fails', async () => {
    recordItineraryView.mockResolvedValueOnce({ success: false }).mockResolvedValueOnce({ success: true, views_count: 2 });

    const { rerender } = render(<CreatorItineraryViewRecorder enabled itineraryId={41} />);

    await waitFor(() => expect(recordItineraryView).toHaveBeenCalledTimes(1));
    expect(window.sessionStorage.getItem('weelp:creator-itinerary-opened:41')).toBeNull();

    rerender(<CreatorItineraryViewRecorder enabled={false} itineraryId={41} />);
    rerender(<CreatorItineraryViewRecorder enabled itineraryId={41} />);

    await waitFor(() => expect(recordItineraryView).toHaveBeenCalledTimes(2));
    expect(window.sessionStorage.getItem('weelp:creator-itinerary-opened:41')).toBe('1');
  });
});
