// Status type configurations for dashboard tables
export const STATUS_TYPES = {
  REVIEW: 'review',
  CATEGORY: 'category',
  TAG: 'tag',
  ATTRIBUTE: 'attribute',
  ADDON: 'addon',
  ADDON_TYPE: 'addon_type',
  USER: 'user',
};

export const REVIEW_STATUS = {
  APPROVED: 'approved',
  PENDING: 'pending',
};

export const CATEGORY_STATUS = {
  ACTIVE: 'active',
  DRAFT: 'draft',
};

export const TAG_STATUS = {
  ACTIVE: 'active',
  DRAFT: 'draft',
};

export const ATTRIBUTE_STATUS = {
  ACTIVE: 'active',
  DRAFT: 'draft',
};

export const ADDON_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
};

// Badge variant mapping for each status type
export const getStatusVariant = (status, type = STATUS_TYPES.CATEGORY) => {
  const statusLower = status?.toLowerCase();

  // Review status variants
  if (type === STATUS_TYPES.REVIEW) {
    if (statusLower === REVIEW_STATUS.APPROVED) return 'success';
    if (statusLower === REVIEW_STATUS.PENDING) return 'warning';
  }

  // Category, Tag, Attribute status variants (all use same values)
  if (statusLower === CATEGORY_STATUS.ACTIVE) return 'success';
  if (statusLower === CATEGORY_STATUS.DRAFT) return 'warning';

  // Addon status variants
  if (type === STATUS_TYPES.ADDON) {
    if (statusLower === ADDON_STATUS.ACTIVE) return 'success';
    if (statusLower === ADDON_STATUS.INACTIVE) return 'destructive';
  }

  // Addon type variants
  if (type === STATUS_TYPES.ADDON_TYPE) {
    if (statusLower === 'itinerary') return 'success';
    if (statusLower === 'activity') return 'warning';
    if (statusLower === 'transfer') return 'outline';
    if (statusLower === 'package') return 'destructive';
  }

  // User status variants
  if (type === STATUS_TYPES.USER) {
    if (statusLower === USER_STATUS.ACTIVE) return 'success';
    if (statusLower === USER_STATUS.SUSPENDED) return 'destructive';
    if (statusLower === USER_STATUS.INACTIVE) return 'destructive';
  }

  return 'default';
};

// Badge label formatting
export const formatStatusLabel = (status) => {
  return status?.toLowerCase() || '';
};
