import { Star, UserRound, ThumbsUp, Trash2, FilePen } from 'lucide-react';
import BreakSection from './BreakSection';
import { SingleProductPhotoGallery } from './SingleProductPhotoGallery';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

const ReviewCard = ({ title, rating, comment, as: TitleTag = 'h3' }) => {
  return (
    <div className="w-full sm:w-[360px] bg-background border rounded-2xl p-5 sm:p-6 md:p-8 min-h-[200px] shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[0_0_30px_rgba(0,0,0,0.18)] transition-shadow duration-300 ease-[var(--weelp-ease-out)] motion-reduce:transition-none flex flex-col gap-2 overflow-hidden">
      <TitleTag className="text-foreground font-medium text-sm md:text-base font-semibold line-clamp-1">{title}</TitleTag>
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
      className={`bg-background p-6 sm:py-7 sm:px-6 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[0_0_30px_rgba(0,0,0,0.18)] transition-shadow duration-300 ease-[var(--weelp-ease-out)] motion-reduce:transition-none border flex flex-col gap-2 justify-evenly w-full ${galleryImages && galleryImages.length > 0 ? 'h-full' : 'h-[300px]'}`}
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
        <ThumbsUp size={20} className=" text-weelp-sage-deep active:fill-weelp-sage-deep " />
        <span className="capitalize underline font-medium">helpful</span>
      </button>
    </div>
  );
};

export const SingleProductReviewCard = ({ title, rating, comment }) => {
  return (
    <div className="bg-background p-8 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[0_0_30px_rgba(0,0,0,0.18)] transition-shadow duration-300 ease-[var(--weelp-ease-out)] motion-reduce:transition-none flex flex-col gap-1 w-full h-[200px]">
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

  return (
    <Card className={'flex w-full max-w-full sm:max-w-md flex-col'}>
      <CardHeader className="flex flex-col w-full gap-2">
        {/* First Row: Item Name and Date */}
        <div className="flex justify-between items-center w-full">
          {item_name && <CardTitle className="text-foreground text-xl font-medium">{item_name}</CardTitle>}
          {created_at && formatDate(created_at) && <span className="text-weelp-steel text-base font-normal">{formatDate(created_at)}</span>}
        </div>

        {/* Second Row: Location/Type and Booking ID */}
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2">
            {item_type && <span className="text-weelp-steel text-base capitalize font-normal">{item_type}</span>}
            {!has_live_item && <span className="text-xs text-muted-foreground">(Archived)</span>}
          </div>
          {order_id && <span className="text-muted-foreground text-base font-medium opacity-40 text-right">Booking ID : {order_id}</span>}
        </div>
      </CardHeader>
      <Separator className={'w-11/12 mx-auto'} />
      <CardContent className={'space-y-2 py-4'}>
        <CardTitle className={'text-foreground text-base font-semibold'}>Your Review</CardTitle>
        <div className={'shadow-none bg-inherit border-none w-full'}>
          <Card className="flex shadow-none border-none bg-inherit gap-1">
            {Array.from({ length: rating }).map((r, index) => {
              return <Star key={index} className="fill-yellow-400 text-yellow-400  size-4" />;
            })}
          </Card>
        </div>

        {review_text && <CardDescription>{review_text}</CardDescription>}

        <CardFooter className={'shadow-none bg-inherit border-none w-full pt-8 flex justify-end gap-4'}>
          <button onClick={() => onDelete(id)}>
            <Trash2 className="text-muted-foreground cursor-pointer" />
          </button>

          <Link href={`/dashboard/customer/reviews/${id}`}>
            <FilePen className="text-muted-foreground cursor-pointer" />
          </Link>
        </CardFooter>
      </CardContent>
    </Card>
  );
};
