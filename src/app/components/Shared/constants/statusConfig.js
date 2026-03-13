// Status type configurations for dashboard tables
export const STATUS_TYPES = {
  REVIEW: 'review',
  CATEGORY: 'category',
};

export const REVIEW_STATUS = {
  APPROVED: 'approved',
  PENDING: 'pending',
};

export const CATEGORY_STATUS = {
  ACTIVE: 'active',
  DRAFT: 'draft',
};

// Badge variant mapping for each status type
export const getStatusVariant = (status, type = STATUS_TYPES.CATEGORY) => {
  const statusLower = status?.toLowerCase();

  // Review status variants
  if (type === STATUS_TYPES.REVIEW) {
    if (statusLower === REVIEW_STATUS.APPROVED) return 'success';
    if (statusLower === REVIEW_STATUS.PENDING) return 'warning';
  }

  // Category status variants (default)
  if (statusLower === CATEGORY_STATUS.ACTIVE) return 'success';
  if (statusLower === CATEGORY_STATUS.DRAFT) return 'warning';

  return 'default';
};

// Badge label formatting
export const formatStatusLabel = (status) => {
  return status?.toLowerCase() || '';
};
