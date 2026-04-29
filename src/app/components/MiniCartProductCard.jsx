'use client';
import React from 'react';
import useMiniCartStore from '@/lib/store/useMiniCartStore';
import { Calendar, Sparkles, SquarePen, Trash2, User } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { actualDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
const MiniCartProductCard = ({ productName, howMany, dateRange, productImage, itemId, itemType, onClose, addons = [] }) => {
  const { adults, children } = howMany ?? {};
  const { from } = dateRange ?? {};
  return (
    <div className="flex flex-col gap-2 px-6 py-4 items-center border rounded-lg shadow-sm justify-between bg-white">
      <div className="flex justify-between w-full p-4 py-2">
        <h3 className="text-wrap font-medium capitalize text-Blueish text-lg">{itemType}</h3>
        <div className="flex gap-4 justify-between">
          <DeleteItem id={itemId} name={productName} onClose={onClose} />
          <SquarePen size={18} className="text-[#5a5a5a]" />
        </div>
      </div>
      <div className="flex w-full justify-between border rounded-lg p-4">
        <div className="flex flex-col">
          <h3 className="text-wrap font-medium capitalize text-Blueish text-lg">{productName ?? 'Melaka Wonderland Water Theme'}</h3>
          <span className="flex gap-2 capitalize text-[#5a5a5a] text-sm mt-2 font-medium">
            <User size={20} className="text-[#5a5a5a] capitalize" />
            {`${adults ?? 0} adults ${children ? ', ' + children + ' children ' : ''}  `}
          </span>

          <span className="flex gap-2 capitalize text-[#5a5a5a] text-sm mt-2 font-medium">
            <Calendar size={20} className="text-[#5a5a5a]" />
            {from && actualDate(from)}
          </span>
          {addons.length > 0 && (
            <div className="flex flex-col mt-2 gap-1">
              {addons.map((addon, i) => (
                <span key={i} className="flex gap-2 capitalize text-[#5a5a5a] text-sm font-medium">
                  <Sparkles size={20} className="text-[#5a5a5a]" />
                  {addon.addon_name}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex">
          <img src={productImage || '/assets/images/placeholder.png'} className="max-w-32 min-h-28 object-cover w-full h-full rounded-md" alt={productName || 'product'} />
        </div>
      </div>
    </div>
  );
};

export default MiniCartProductCard;

// display popup for item deletion
export function DeleteItem({ id, name, onClose }) {
  const { removeItem } = useMiniCartStore();
  const { toast } = useToast();

  // remove item from modal action
  const removeItemAlertAction = () => {
    removeItem(id);
    if (onClose) onClose();

    // display notice
    toast({
      title: 'Item Remove from Cart',
      duration: 1000,
    });
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Trash2 size={18} className="text-[#5a5a5a]" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure to remove item ?</AlertDialogTitle>
          <AlertDialogDescription>
            <b>{'Name: ' + name ?? ''}</b>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction className={'bg-secondaryDark'} onClick={removeItemAlertAction}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
