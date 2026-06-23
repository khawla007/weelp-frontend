import { Trash2 } from 'lucide-react';
import { DASHBOARD_PLACEHOLDER_IMAGE } from '@/app/components/DashboardShared/Card/CardImage';

export const ImageTrashCard = ({ image, onDelete, galleryThumbnail = false }) => {
  return (
    <div className="group/item relative rounded-md border cursor-pointer p-2 border-border">
      <img
        className={`rounded-md border object-cover ${galleryThumbnail ? 'size-16' : 'size-72'}`}
        src={image?.url || DASHBOARD_PLACEHOLDER_IMAGE}
        alt={image?.alt ?? 'store_image'}
        onError={(event) => {
          event.currentTarget.src = DASHBOARD_PLACEHOLDER_IMAGE;
        }}
      />
      <Trash2
        onClick={() => onDelete(image)}
        className="absolute bottom-8 right-8 size-6 scale-90 opacity-0 pointer-events-none group-hover/item:pointer-events-auto group-hover/item:scale-100 group-hover/item:opacity-100 transition-[opacity,transform] duration-200 ease-[var(--weelp-ease-out)] motion-reduce:transition-none text-red-400 bg-background rounded-full shadow"
      />
    </div>
  );
};
