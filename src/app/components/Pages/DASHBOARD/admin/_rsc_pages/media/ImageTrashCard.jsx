import { Trash2 } from 'lucide-react';

export const ImageTrashCard = ({ image, onDelete, galleryThumbnail = false }) => {
  return (
    <div className="group/item relative rounded-md border cursor-pointer p-2 border-black">
      <img className={` rounded-md border ${galleryThumbnail ? 'size-16' : 'size-72'}`} src={image?.url} alt={image?.alt ?? 'store_image'} />
      <Trash2 onClick={() => onDelete(image)} className="absolute bottom-8 right-8 size-0 group-hover/item:size-6 transition-all text-red-400 bg-white rounded-full shadow" />
    </div>
  );
};
