'use client';

import { Trash2, Facebook, Instagram, Linkedin, Globe } from 'lucide-react';
import { useState } from 'react';

const SOCIAL_ICONS = {
  facebook: { icon: Facebook, color: 'text-blue-600' },
  instagram: { icon: Instagram, color: 'text-pink-600' },
  linkedin: { icon: Linkedin, color: 'text-blue-700' },
  twitter: { icon: Globe, color: 'text-blue-400' },
  default: { icon: Globe, color: 'text-gray-600' },
};

const detectPlatform = (url) => {
  if (!url) return 'default';
  const lower = url.toLowerCase();
  if (lower.includes('facebook.com') || lower.includes('fb.com')) return 'facebook';
  if (lower.includes('instagram.com')) return 'instagram';
  if (lower.includes('linkedin.com')) return 'linkedin';
  if (lower.includes('twitter.com') || lower.includes('x.com')) return 'twitter';
  return 'default';
};

export function EnhancedUrlInput({ value = [], onChange, className = '' }) {
  const [fields, setFields] = useState(value.length > 0 ? value : [{ label: '', url: '' }]);

  const updateField = (index, key, val) => {
    const updated = fields.map((f, i) => (i === index ? { ...f, [key]: val } : f));
    setFields(updated);
    onChange(updated);
  };

  const addField = () => {
    const updated = [...fields, { label: '', url: '' }];
    setFields(updated);
    onChange(updated);
  };

  const removeField = (index) => {
    const updated = fields.filter((_, i) => i !== index);
    setFields(updated.length > 0 ? updated : [{ label: '', url: '' }]);
    onChange(updated.length > 0 ? updated : [{ label: '', url: '' }]);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {fields.map((field, index) => {
        const platform = detectPlatform(field.url);
        const Icon = SOCIAL_ICONS[platform].icon;
        const iconColor = SOCIAL_ICONS[platform].color;

        return (
          <div key={index} className="flex gap-2 items-start">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                value={field.label}
                onChange={(e) => updateField(index, 'label', e.target.value)}
                placeholder="Label (e.g., Portfolio)"
                className="px-3 py-2 border rounded-md text-sm"
              />
              <div className="sm:col-span-2 relative">
                <input
                  type="url"
                  value={field.url}
                  onChange={(e) => updateField(index, 'url', e.target.value)}
                  placeholder="https://example.com"
                  className="w-full pl-10 pr-3 py-2 border rounded-md text-sm"
                />
                {field.url && <Icon className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${iconColor}`} />}
              </div>
            </div>
            <button type="button" onClick={() => removeField(index)} className="p-2 text-destructive hover:bg-destructive/10 rounded-md">
              <Trash2 size={16} />
            </button>
          </div>
        );
      })}
      <button type="button" onClick={addField} className="text-sm text-secondary-foreground hover:text-secondaryDark">
        + Add URL
      </button>
    </div>
  );
}
