export const resolveBlogFilters = async (searchParams) => {
  const { category = '', tag = '' } = (await searchParams) || {};

  return {
    category: typeof category === 'string' ? category : '',
    tag: typeof tag === 'string' ? tag : '',
  };
};
