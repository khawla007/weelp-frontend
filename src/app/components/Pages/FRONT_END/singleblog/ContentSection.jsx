import React from 'react';
import { BlogAuthorInfo } from '@/app/components/singleproductguide';
import { FollowUs, RelatedLinks } from './SingleBlogModules';
import { TiptapPublic } from '../../DASHBOARD/admin/_rsc_pages/blogs/components/TiptapPublic';

const ContentSection = ({ content = '', categories = [] }) => {
  return (
    <section className="flex flex-col lg:flex-row">
      <div className="flex-[2]">
        {/* Post Author */}
        <BlogAuthorInfo />

        {/* Content */}
        {content.length > 50 && (
          <div className="bg-[#cccccc]">
            <div className="max-w-4xl mx-auto p-6  flex flex-col gap-4">
              <TiptapPublic content={content} />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 lg:gap-12 flex-1 p-6 px-8">
        <h3 className="text-lg sm:text-[28px] lg:mt-4 font-semibold text-Nileblue capitalize">Categories</h3>
        <RelatedLinks categories={categories || []} />
        <FollowUs />
      </div>
    </section>
  );
};

export default ContentSection;
