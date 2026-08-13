const BLOG_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

export const formatBlogPublishedDate = (value) => {
  if (!value) return '';

  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';

  return BLOG_DATE_FORMATTER.format(date);
};

export default function BlogPublishedDate({ date, className = '' }) {
  const formattedDate = formatBlogPublishedDate(date);
  if (!formattedDate) return null;

  return (
    <time dateTime={date} className={className}>
      Published {formattedDate}
    </time>
  );
}
