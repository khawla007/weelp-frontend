import { z } from 'zod';

import { HELP_TOPICS } from '@/app/components/Help/helpTopics';

const hasPlausibleEmailShape = (value) => {
  const separatorIndex = value.lastIndexOf('@');

  if (separatorIndex <= 0 || separatorIndex === value.length - 1) {
    return false;
  }

  const localPart = value.slice(0, separatorIndex);
  const domain = value.slice(separatorIndex + 1);
  const isQuotedLocalPart = localPart.length >= 2 && localPart.startsWith('"') && localPart.endsWith('"');

  if (isQuotedLocalPart) {
    if (/[\r\n]/.test(localPart)) {
      return false;
    }
  } else if (/[\s@]/.test(localPart) || localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) {
    return false;
  }

  if (domain.startsWith('[') && domain.endsWith(']')) {
    return domain.length > 2 && !/[\s@\[\]]/.test(domain.slice(1, -1));
  }

  return !/[\s@]/.test(domain) && !domain.startsWith('.') && !domain.endsWith('.') && !domain.includes('..');
};

export const supportRequestSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(100),
  email: z.string().trim().min(1, 'Enter a valid email address').max(255).refine(hasPlausibleEmailShape, 'Enter a valid email address'),
  topic: z.enum(HELP_TOPICS.map((topic) => topic.value)),
  message: z.string().trim().min(10, 'Tell us a little more').max(2000),
  website: z.string().max(0).optional(),
});
