import Link from 'next/link';
import React from 'react';
import { Heart, Eye } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import { FALLBACK_IMAGE } from '@/constants/image';

// Guide Card **
const Singleproductguide = ({ imageSrc, postTitle, subtitle, slug }) => {
  const modifiedSubtitle = String(subtitle).slice(0, 30);
  return (
    <div className="max-w-full sm:max-w-sm flex flex-col bg-white rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[0_0_30px_rgba(0,0,0,0.18)] transition-all duration-300 border border-gray-50 mb-4">
      <Link href={slug ? `/blogs/${slug}` : '/blogs'}>
        <img src={imageSrc || '/assets/images/8597548-ai 1.jpg'} alt={'China'} className="object-cover w-full h-52 sm:h-60" />
        <div className="p-4 sm:p-5">
          <h2 className="text-xs sm:text-sm font-medium text-secondaryDark mb-1 uppercase tracking-wider">{postTitle || 'Solo'}</h2>
          <p className="text-base sm:text-xl font-semibold text-Nileblue line-clamp-2">{modifiedSubtitle || 'Best Places for Solo Travel'}</p>
        </div>
      </Link>
    </div>
  );
};

export default Singleproductguide;

// Blog Cards **
/** Shape of Blog Data
 * @typedef {BlogPost}
 */
export const BlogCard = ({ imageSrc = '', blogTitle = '', created_at = '', slug = '' }) => {
  return (
    <div className="max-w-full sm:max-w-sm w-full flex flex-col bg-white rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[0_0_30px_rgba(0,0,0,0.18)] transition-all duration-300 border border-gray-50 mb-4">
      <Link href={`/blogs/${slug}`}>
        <Image alt="blog_logo" src={imageSrc ? imageSrc : FALLBACK_IMAGE.src} className="w-full h-52 sm:h-60" width={400} height={250} style={{ objectFit: 'cover' }} />
        <div className="p-4 sm:p-5">
          <h2 className="text-base sm:text-xl font-semibold text-Nileblue mb-3 line-clamp-2">{blogTitle ? blogTitle : "Spend the night on the set of SEVENTEEN's latest music video"}</h2>
          {created_at && <span className="text-xs sm:text-sm uppercase tracking-widest text-[#5A5A5A]">{format(created_at, 'MMM dd yyyy')}</span>}
        </div>
      </Link>
    </div>
  );
};

/** Shape of Blog Data
 * @typedef {BlogPost}
 */
export const BlogCard2 = ({ imageSrc = '', created_at = '', slug = '' }) => {
  const modifiedSubtitle = String(subtitle).slice(0, 30);
  return (
    <div className="max-w-full sm:max-w-sm flex flex-col bg-white rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[0_0_30px_rgba(0,0,0,0.18)] transition-all duration-300 border border-gray-50">
      <Link href={'/blogs/blog'}>
        <img src={imageSrc || '/assets/images/8597548-ai 1.jpg'} alt={'China'} className="object-cover w-full h-60" />
        <div className="p-4">
          <h2 className="text-[16px] font-medium text-blackish">{postTitle || 'Solo'}</h2>
          <p className="text-[20px] font-medium text-[#142A38]">{modifiedSubtitle || 'Best Places for Solo Travel'}</p>
        </div>
      </Link>
    </div>
  );
};

// component about Author Information information
export const BlogAuthorInfo = ({ authorName, authorImage, views, rating }) => {
  return (
    <div className="max-w-4xl mx-auto p-6 lg:px-6 ">
      <div className="flex justify-between flex-wrap gap-2">
        <div className="flex gap-4">
          <img alt="sitelogo" src={authorImage ? authorImage : '/assets/Card.png'} className=" size-12 rounded-full" />
          <h3 className="capitalize text-base text-[#143042] font-bold">
            {authorName ? authorName : 'Jessica Jone'} <span className="flex flex-col font-medium text-[#5A5A5A] text-sm first-letter:capitalize">Updated at 16 Oct</span>
          </h3>
        </div>
        <div className="flex gap-4 ">
          <span className="text-[#5A5A5A] flex items-center gap-2">
            <Heart className=" size-4 text-[#FF8686] fill-[#FF8686]" />
            {rating ? rating + 'k' : '3.4k'}
          </span>
          <span className="text-[#5A5A5A] flex items-center gap-2">
            <Eye className="size-4 text-[#5A5A5A]" />
            {views ? views : '23.4k'}
          </span>
        </div>
      </div>
    </div>
  );
};
