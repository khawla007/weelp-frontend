'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FALLBACK_IMAGE } from '../../constants/image';

export default function SafeImage({ src = '', alt = '', ...props }) {
  console.log(src);
  const [imgSrc, setImgSrc] = useState(src || FALLBACK_IMAGE);
  return <Image {...props} src={imgSrc} alt={alt} onError={() => setImgSrc(FALLBACK_IMAGE)} sizes="100vw" objectFit="cover" fill />;
}
