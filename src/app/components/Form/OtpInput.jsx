'use client';

import { useRef, useEffect, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const OtpInput = forwardRef(
  (
    {
      length = 6,
      value = '',
      onChange,
      onComplete,
      error,
      disabled = false,
      autoFocus = true,
      className,
    },
    ref
  ) => {
    const inputRefs = useRef([]);

    // Focus first input on mount
    useEffect(() => {
      if (autoFocus && inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, [autoFocus]);

    // Handle external value changes
    useEffect(() => {
      if (value && inputRefs.current[value.length - 1]) {
        inputRefs.current[value.length - 1].focus();
      }
    }, [value]);

    const handleChange = (index, e) => {
      const val = e.target.value;

      // Only allow numbers
      if (!/^\d*$/.test(val)) return;

      // Take only the last character if multiple chars entered
      const digit = val.slice(-1);

      // Build new OTP value
      const newValue =
        value.slice(0, index) + digit + value.slice(index + 1);

      if (onChange) {
        onChange(newValue);
      }

      // Auto-focus next input
      if (digit && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      // Call onComplete when all digits entered
      if (newValue.length === length && onComplete) {
        onComplete(newValue);
      }
    };

    const handleKeyDown = (index, e) => {
      // Handle backspace
      if (e.key === 'Backspace' && !value[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    };

    const handlePaste = (e) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text').trim();

      // Only allow numbers
      const digits = pastedData.replace(/\D/g, '').slice(0, length);

      if (digits.length > 0) {
        if (onChange) {
          onChange(digits);
        }

        // Focus appropriate input
        const focusIndex = Math.min(digits.length, length - 1);
        inputRefs.current[focusIndex]?.focus();

        if (digits.length === length && onComplete) {
          onComplete(digits);
        }
      }
    };

    const handleFocus = (e) => {
      e.target.select();
    };

    return (
      <div className={cn('flex gap-2 justify-center', className)}>
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={handleFocus}
            disabled={disabled}
            className={cn(
              'w-12 h-14 text-center text-2xl font-semibold',
              'border-2 rounded-lg',
              'focus:outline-none focus:ring-2 focus:ring-secondaryDark',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-300 focus:border-secondaryDark'
            )}
            autoComplete="one-time-code"
          />
        ))}
      </div>
    );
  }
);

OtpInput.displayName = 'OtpInput';
