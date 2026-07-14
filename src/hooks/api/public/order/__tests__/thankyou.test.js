import axios from 'axios';

import { resultFetcher } from '../thankyou';

jest.mock('axios');
jest.mock('@/lib/fetchers', () => ({ fetcher: jest.fn() }));

describe('thank-you result fetcher', () => {
  it('preserves the HTTP status used for session-expired and not-found states', async () => {
    const error = { response: { status: 401 } };
    axios.get.mockRejectedValue(error);

    await expect(resultFetcher('/api/public/checkout/thankyou?payment_intent=pi_safe_fixture')).rejects.toBe(error);
  });
});
