'use client';

import { X } from 'lucide-react';
import { forwardRef } from 'react';

const TagInput = forwardRef(({ value = [], onChange, placeholder = 'Type and press Enter...', maxLength = 30, className = '' }, ref) => {
  const addTag = (input) => {
    const tag = input.value.trim().replace(/,+$/, '').trim();
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    input.value = '';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(e.target);
    }
    if (e.key === 'Backspace' && !e.target.value && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const handleInput = (e) => {
    if (e.target.value.includes(',')) {
      addTag(e.target);
    }
  };

  const handleBlur = (e) => {
    addTag(e.target);
  };

  const removeTag = (tagToRemove) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className={`flex flex-wrap gap-2 p-2 border rounded-md min-h-[42px] ${className}`}>
      {value.map((tag, index) => (
        <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-sm text-sm">
          {tag}
          <button type="button" onClick={() => removeTag(tag)} className="hover:bg-secondary-foreground/20 rounded p-0.5">
            <X size={14} />
          </button>
        </span>
      ))}
      <input
        ref={ref}
        type="text"
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        onBlur={handleBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        className="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
      />
    </div>
  );
});

TagInput.displayName = 'TagInput';

export { TagInput };
