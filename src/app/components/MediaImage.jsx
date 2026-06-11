'use client';

import Image from 'next/image';
import mediaImageLoader from '@/lib/imageLoader';

export default function MediaImage(props) {
  // eslint-disable-next-line jsx-a11y/alt-text -- alt passed through props
  return <Image {...props} loader={mediaImageLoader} />;
}
