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

      <Reveal
        variant="lift"
        initialHidden
        delay={120}
        data-testid="blog-sidebar"
        className="flex w-full flex-1 flex-col gap-6 px-0 pt-8 sm:gap-8 lg:gap-12 lg:px-8 lg:py-6"
      >
        <RelatedLinks categories={categories || []} tags={tags || []} />
        <FollowUs />
      </Reveal>
    </section>
  );
};

export default ContentSection;
