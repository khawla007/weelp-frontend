'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImageOff } from 'lucide-react';

const AboutImage = ({ alt = '', fallbackLabel = 'Image unavailable', className = '', onError, ...props }) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role={alt ? 'img' : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
        data-testid="about-image-fallback"
        className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground"
      >
        <span className="flex flex-col items-center gap-2 text-sm">
          <ImageOff aria-hidden="true" size={24} />
          {alt ? fallbackLabel : null}
        </span>
      </div>
    );
  }

  return (
    <Image
      {...props}
      alt={alt}
      className={className}
      onError={(event) => {
        setFailed(true);
        onError?.(event);
      }}
    />
  );
};

export default AboutImage;
