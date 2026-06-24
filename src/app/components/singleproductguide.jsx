import Link from 'next/link';
import React from 'react';
import { Heart, Eye } from 'lucide-react';

// Guide Card **
const Singleproductguide = ({ imageSrc, postTitle, subtitle, slug }) => {
  const modifiedSubtitle = String(subtitle).slice(0, 30);
  return (
    <div className="max-w-full sm:max-w-sm flex flex-col bg-background rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[0_0_30px_rgba(0,0,0,0.18)] transition-shadow duration-300 ease-[var(--weelp-ease-out)] motion-reduce:transition-none border border-border mb-4">
      <Link href={slug ? `/blogs/${slug}` : '/blogs'}>
        <img src={imageSrc || '/assets/images/8597548-ai 1.jpg'} alt={'China'} className="object-cover w-full h-52 sm:h-60" />
        <div className="p-4 sm:p-5">
          <h2 className="text-xs sm:text-sm font-medium text-weelp-copy mb-1 uppercase tracking-wider">{postTitle || 'Solo'}</h2>
          <p className="text-base sm:text-xl font-semibold text-foreground line-clamp-2">{modifiedSubtitle || 'Best Places for Solo Travel'}</p>
        </div>
      </Link>
    </div>
  );
};

export default Singleproductguide;

/** Shape of Blog Data
 * @typedef {BlogPost}
 */
export const BlogCard2 = ({ imageSrc = '', created_at = '', slug = '' }) => {
  const modifiedSubtitle = String(subtitle).slice(0, 30);
  return (
    <div className="max-w-full sm:max-w-sm flex flex-col bg-background rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[0_0_30px_rgba(0,0,0,0.18)] transition-shadow duration-300 ease-[var(--weelp-ease-out)] motion-reduce:transition-none border border-border">
      <Link href={'/blogs/blog'}>
        <img src={imageSrc || '/assets/images/8597548-ai 1.jpg'} alt={'China'} className="object-cover w-full h-60" />
        <div className="p-4">
          <h2 className="text-[16px] font-medium text-blackish">{postTitle || 'Solo'}</h2>
          <p className="text-[20px] font-medium text-foreground">{modifiedSubtitle || 'Best Places for Solo Travel'}</p>
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
          <img alt="sitelogo" src={authorImage ? authorImage : '/assets/Card.webp'} className=" size-12 rounded-full" />
          <h3 className="capitalize text-base text-foreground font-bold">
            {authorName ? authorName : 'Jessica Jone'} <span className="flex flex-col font-medium text-copy text-sm first-letter:capitalize">Updated at 16 Oct</span>
          </h3>
        </div>
        <div className="flex gap-4 ">
          <span className="text-copy flex items-center gap-2">
            <Heart className=" size-4 text-destructive fill-destructive" />
            {rating ? rating + 'k' : '3.4k'}
          </span>
          <span className="text-copy flex items-center gap-2">
            <Eye className="size-4 text-copy" />
            {views ? views : '23.4k'}
          </span>
        </div>
      </div>
    </div>
  );
};
