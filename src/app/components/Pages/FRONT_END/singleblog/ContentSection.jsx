import React from 'react';
import { BlogAuthorInfo } from '@/app/components/singleproductguide';
import { FollowUs, RelatedLinks } from './SingleBlogModules';
import { RichTextRenderer } from '../../DASHBOARD/admin/_rsc_pages/shared/RichTextRenderer';
import Reveal from '@/app/components/ui/Reveal';

const ContentSection = ({ content = '', categories = [], tags = [] }) => {
  return (
    <section className="mx-auto flex max-w-pen flex-col px-4 pb-12 md:pb-16 lg:flex-row lg:pb-24">
      <Reveal variant="lift" initialHidden className="flex-[2]">
        {/* Post Author */}
        <BlogAuthorInfo />

        {/* Content */}
        {content.length > 50 && (
          <div className="bg-muted">
            <div className="max-w-4xl mx-auto p-6  flex flex-col gap-4">
              <RichTextRenderer content={content} className="public-rich-text" />
            </div>
          </div>
        )}
      </Reveal>

      <Reveal variant="lift" initialHidden delay={120} className="flex flex-col gap-4 lg:gap-12 flex-1 p-6 px-8">
        <RelatedLinks categories={categories || []} tags={tags || []} />
        <FollowUs />
      </Reveal>
    </section>
  );
};

export default ContentSection;
