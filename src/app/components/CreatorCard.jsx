import { Eye, Heart } from 'lucide-react';
import Image from 'next/image';

export const CreatorCard = ({ imagSrc, rating, views, title, creatorLogo }) => {
  return (
    <div className="w-full max-w-full sm:max-w-sm p-4 sm:p-6">
      <div className="relative w-full aspect-[93/100]">
        <Image src={imagSrc || '/assets/Card.webp'} alt="Product Image" fill className="rounded-lg object-cover" />
      </div>
      <div className="px-2 flex justify-between items-center pt-2">
        <div className="flex flex-col gap-[3px]">
          <div className="flex gap-4">
            <span className="text-[#5A5A5A] flex items-center gap-2 text-sm">
              <Heart className="size-4 text-[#FF8686] fill-[#FF8686]" />
              {rating ? rating + 'k' : '3.4k'}
            </span>
            <span className="text-[#5A5A5A] flex items-center gap-2 text-sm">
              <Eye className="size-4 text-[#5A5A5A]" />
              {views ? views : '23.4k'}
            </span>
          </div>
          <h3 className="text-[#142A38] text-lg font-medium">{title ? title : '4N-3D In London'}</h3>
        </div>
        <div className="flex items-center">
          <Image src={creatorLogo ? creatorLogo : '/assets/Card.webp'} className="size-11 rounded-full" width={44} height={44} alt="creator_image" />
        </div>
      </div>
    </div>
  );
};
