import React, { useState } from 'react';

/**
 * @param {Object} props
 * @param {number} [props.value] - Current rating value
 * @param {(value: number) => void} [props.onChange] - Callback when rating changes
 * @param {number} [props.max] - Max number of stars
 */
export function Rating({ value = 0, onChange, max = 5 }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <span
          key={star}
          style={{
            cursor: 'pointer',
            color: star <= (hovered || value) ? '#FFD700' : '#e4e5e9', // gold vs gray
            fontSize: 24,
          }}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange && onChange(star)}
        >
          ★
        </span>
      ))}
    </div>
  );
}
