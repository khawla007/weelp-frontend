import { Star, UserRound, ThumbsUp, Trash2, FilePen } from 'lucide-react';
import BreakSection from './BreakSection';
import { SingleProductPhotoGallery } from './SingleProductPhotoGallery';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { PUBLIC_CARD_RADIUS_CLASS } from '@/app/components/ui/cardStyles';

const ReviewCard = ({ title, rating, comment, itemLabel, as: TitleTag = 'h3' }) => {
  return (
    <div data-public-card="review" className={`flex h-full min-h-[200px] w-full min-w-0 flex-col gap-2 overflow-hidden border bg-background p-5 shadow-[0_0_20px_rgba(0,0,0,0.1)] transition-shadow duration-300 ease-[var(--weelp-ease-out)] hover:shadow-[0_0_30px_rgba(0,0,0,0.18)] motion-reduce:transition-none sm:p-6 md:p-8 ${PUBLIC_CARD_RADIUS_CLASS}`}>
      <TitleTag className="text-foreground font-medium text-sm md:text-base font-semibold line-clamp-1">{title}</TitleTag>
      {itemLabel && <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground line-clamp-1">{itemLabel}</p>}
      <div className="flex">
        {Array(rating)
          .fill()
          .map((_, index) => (
            <Star key={index} className="fill-warning stroke-none" size={16} />
          ))}
      </div>
      <p className="text-sm md:text-base text-foreground line-clamp-4 text-pretty">{comment}</p>
    </div>
  );
};

export default ReviewCard;

export const ReviewCard2 = ({ userImageSrc, userName, galleryImages, date, title, rating, comment }) => {
  return (
    <div
      data-public-card="review-gallery"
      className={`bg-background p-6 sm:py-7 sm:px-6 shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[0_0_30px_rgba(0,0,0,0.18)] transition-shadow duration-300 ease-[var(--weelp-ease-out)] motion-reduce:transition-none border flex flex-col gap-2 justify-evenly w-full ${PUBLIC_CARD_RADIUS_CLASS} ${galleryImages && galleryImages.length > 0 ? 'h-full' : 'h-[300px]'}`}
    >
      <div className="flex gap-4">
        {userImageSrc ? (
          <img className="size-12 rounded-full" alt="userImage" src={`${userImageSrc}`} />
        ) : (
          <UserRound size={42} className="stroke-muted-foreground border-border border-2 rounded-full" />
        )}
        {userName ? (
          <div className="flex flex-col gap-1 sm:text-base font-medium capitalize">
            {userName} {date && <span className="text-xs text-muted-foreground">{date}</span>}
          </div>
        ) : null}
      </div>

      {rating && (
        <div className="flex">
          {Array(rating)
            .fill()
            .map((_, index) => (
              <Star key={index} className="fill-warning stroke-none" size={16} />
            ))}
        </div>
      )}
      {galleryImages && galleryImages.length > 0 && <SingleProductPhotoGallery photos={galleryImages} />}

      {title && <h3 className="text-foreground font-medium sm:text-lg pt-3 capitalize">{title}</h3>}
      {comment && <p className="text-base text-foreground capitalize h-24 overflow-y-scroll tfc_scroll">{comment}</p>}
      <BreakSection marginTop={'mt-2'} className={'mb-4'} />
      <button className="w-fit flex gap-2 items-center group-active:first:fill-weelp-sage-deep ">
        <ThumbsUp size={20} className=" text-weelp-sage-text active:fill-weelp-sage-deep " />
        <span className="capitalize underline font-medium">helpful</span>
      </button>
    </div>
  );
};

export const SingleProductReviewCard = ({ title, rating, comment }) => {
  return (
    <div data-public-card="single-review" className={`bg-background p-8 shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[0_0_30px_rgba(0,0,0,0.18)] transition-shadow duration-300 ease-[var(--weelp-ease-out)] motion-reduce:transition-none flex flex-col gap-1 w-full h-[200px] ${PUBLIC_CARD_RADIUS_CLASS}`}>
      <h3 className="text-foreground font-medium text-base">{title}</h3>
      <div className="flex">
        {Array(rating)
          .fill()
          .map((_, index) => (
            <Star key={index} className="fill-warning stroke-none" size={16} />
          ))}
      </div>
      <p className="text-base text-foreground overflow-x-hidden tfc_scroll">{comment}</p>
    </div>
  );
};

/**
 * Card For User Dashboard Review
 * @param {object} props.review review  Data of Card
 * @param {object} props.delete Handle Of Delete
 * @param {ReviewFormCustomer}
 * @returns
 */
export const UserDashboardReviewCard = ({ review, onDelete }) => {
  // destructure review
  const { id, order_id, item_type = '', item_name = '', item_slug, has_live_item, rating, review_text = '', status, created_at } = review;

  // Format date from created_at
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const safeRating = Number(rating) || 0;

  return (
    <Card className="flex w-full min-w-0 flex-col rounded-lg border-border/80 bg-background shadow-sm">
      <CardHeader className="flex w-full flex-col gap-3 p-4">
        {/* First Row: Item Name and Date */}
        <div className="flex w-full min-w-0 flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          {item_name && <CardTitle className="min-w-0 break-words text-lg font-semibold leading-snug text-foreground sm:text-xl">{item_name}</CardTitle>}
          {created_at && formatDate(created_at) && <span className="shrink-0 text-sm font-normal text-weelp-steel sm:text-base">{formatDate(created_at)}</span>}
        </div>

        {/* Second Row: Location/Type and Booking ID */}
        <div className="flex w-full min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-2">
            {item_type && <span className="text-sm capitalize font-normal text-weelp-steel sm:text-base">{item_type}</span>}
            {!has_live_item && <span className="text-xs text-muted-foreground">(Archived)</span>}
          </div>
          {order_id && <span className="text-sm font-medium text-muted-foreground opacity-60 sm:text-right sm:text-base">Booking ID: {order_id}</span>}
        </div>
      </CardHeader>
      <Separator className={'w-11/12 mx-auto'} />
      <CardContent className="space-y-3 p-4">
        <div className="rounded-md border border-border/70 bg-muted/30 p-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-sm font-semibold text-foreground sm:text-base">Your Review</CardTitle>
            <div className="flex shrink-0 gap-0.5" aria-label={`${safeRating} out of 5 stars`}>
              {Array.from({ length: safeRating }).map((r, index) => {
                return <Star key={index} className="size-4 fill-yellow-400 text-yellow-400 sm:size-5" />;
              })}
            </div>
          </div>

          {review_text && <CardDescription className="mt-2 break-words text-sm leading-relaxed text-muted-foreground sm:text-base">{review_text}</CardDescription>}
        </div>

        <CardFooter className="flex w-full justify-end gap-2 border-none bg-inherit p-0 pt-1 shadow-none">
          <button
            type="button"
            onClick={() => onDelete(id)}
            aria-label="Delete review"
            className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Trash2 className="size-5 cursor-pointer" />
          </button>

          <Link
            href={`/dashboard/customer/reviews/${id}`}
            aria-label="Edit review"
            className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <FilePen className="size-5 cursor-pointer" />
          </Link>
        </CardFooter>
      </CardContent>
    </Card>
  );
};
