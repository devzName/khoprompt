export const PROMPT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved', 
  REJECTED: 'rejected',
  DRAFT: 'draft',
  ARCHIVED: 'archived'
};

export const PROMPT_STATUS_TRANSLATION_MAP = {
  'pending': 'SUBMITTED',
  'approved': 'APPROVED',
  'rejected': 'REJECTED',
  'draft': 'DRAFT',
  'archived': 'ARCHIVED'
};

export const PROMPT_STATUS_COLORS = {
  [PROMPT_STATUS.PENDING]: 'orange',
  [PROMPT_STATUS.APPROVED]: 'green',
  [PROMPT_STATUS.REJECTED]: 'red',
  [PROMPT_STATUS.DRAFT]: 'default',
  [PROMPT_STATUS.ARCHIVED]: 'gray'
};

export const getStatusLabel = (status, t) => {
  const translationKey = PROMPT_STATUS_TRANSLATION_MAP[status];
  if (translationKey && t) {
    return t(`myPrompts.status.${translationKey}`);
  }
  return status;
};