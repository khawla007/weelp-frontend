import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const putMock = jest.fn().mockResolvedValue({
  data: {
    data: {
      head_code: '<meta name="saved" content="head">',
      body_code: '<script>window.savedBody=true</script>',
      footer_code: '<script>window.savedFooter=true</script>',
    },
  },
});

jest.mock('../../../../../../../lib/axiosInstance', () => ({
  authApi: {
    get: jest.fn().mockResolvedValue({ data: { data: { head_code: '', body_code: '', footer_code: '' } } }),
    put: (...args) => putMock(...args),
  },
}));

jest.mock('swr', () => ({
  __esModule: true,
  default: () => ({
    data: { head_code: '', body_code: '', footer_code: '' },
    mutate: jest.fn(),
    isLoading: false,
  }),
}));

import GlobalScriptsAdmin from '../GlobalScriptsAdmin';

describe('GlobalScriptsAdmin', () => {
  beforeEach(() => {
    putMock.mockClear();
  });

  test('saves header body and footer script slots', async () => {
    render(<GlobalScriptsAdmin />);

    fireEvent.change(screen.getByLabelText(/header scripts/i), { target: { value: '<meta name="global" content="head">' } });
    fireEvent.change(screen.getByLabelText(/body scripts/i), { target: { value: '<script>window.globalBody=true</script>' } });
    fireEvent.change(screen.getByLabelText(/footer scripts/i), { target: { value: '<script>window.globalFooter=true</script>' } });
    fireEvent.click(screen.getByRole('button', { name: /save global scripts/i }));

    await waitFor(() => expect(putMock).toHaveBeenCalled());
    expect(putMock).toHaveBeenCalledWith('/api/admin/global-scripts', {
      head_code: '<meta name="global" content="head">',
      body_code: '<script>window.globalBody=true</script>',
      footer_code: '<script>window.globalFooter=true</script>',
    });
  });
});
