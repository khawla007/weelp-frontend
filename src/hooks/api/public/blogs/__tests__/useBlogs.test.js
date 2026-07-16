import { useBlogs } from '../useBlogs';

const swrMock = jest.fn();

jest.mock('swr', () => ({
  __esModule: true,
  default: (...args) => swrMock(...args),
}));

describe('useBlogs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    swrMock.mockReturnValue({ data: {}, error: null, isValidating: false, isLoading: false, mutate: jest.fn() });
  });

  it('omits empty filter values from the public blog SWR URL', () => {
    useBlogs({ category: 'travel-tips', tag: '', sort_by: '', page: 1, per_page: 5 });

    expect(swrMock).toHaveBeenCalledWith('/api/public/blogs?category=travel-tips&page=1&per_page=5', expect.any(Function));
  });

  it('uses the unfiltered endpoint when no query values are provided', () => {
    useBlogs({ category: '', tag: undefined, sort_by: null });

    expect(swrMock).toHaveBeenCalledWith('/api/public/blogs', expect.any(Function));
  });

  it('preserves existing query-string callers', () => {
    useBlogs('?sort_by=latest&per_page=5');

    expect(swrMock).toHaveBeenCalledWith('/api/public/blogs?sort_by=latest&per_page=5', expect.any(Function));
  });
});
