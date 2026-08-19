import { Baby, Clock, Languages, Mountain, Tag, Users } from 'lucide-react';

const ATTRIBUTE_ICONS = {
  duration: Clock,
  'group-size': Users,
  'age-restriction': Baby,
  language: Languages,
  'difficulty-level': Mountain,
  'activity-level': Mountain,
  'skill-required': Mountain,
};

export function getAttributeIcon(slug) {
  return ATTRIBUTE_ICONS[slug] ?? Tag;
}
