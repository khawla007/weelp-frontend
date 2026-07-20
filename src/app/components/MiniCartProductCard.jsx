'use client';
import React from 'react';
import NavigationLink from '@/app/components/Navigation/NavigationLink';
import { Calendar, Sparkles, SquarePen, Trash2, User } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import useMiniCartStore from '@/lib/store/useMiniCartStore';
import { actualDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const EDITABLE_ITEM_SEGMENTS = {
  activity: 'activities',
  itinerary: 'itineraries',
};

const buildEditHref = ({ itemId, itemType, citySlug, itemSlug }) => {
  const segment = EDITABLE_ITEM_SEGMENTS[itemType];
  if (!segment || !citySlug || !itemSlug || itemId === null || itemId === undefined) return null;

  return `/cities/${encodeURIComponent(citySlug)}/${segment}/${encodeURIComponent(itemSlug)}?editCartItem=${encodeURIComponent(itemId)}`;
};

const toValidDate = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatShortDate = (value, includeYear = false) => {
  const date = toValidDate(value);
  if (!date) return '';

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(includeYear ? { year: 'numeric' } : {}),
  });
};

const formatCartDateRange = (dateRange) => {
  const from = toValidDate(dateRange?.from);
  if (!from) return '';

  const to = toValidDate(dateRange?.to);
  if (!to || actualDate(from) === actualDate(to)) return formatShortDate(from);

  const crossesYear = from.getFullYear() !== to.getFullYear();
  return `${formatShortDate(from, crossesYear)} - ${formatShortDate(to, crossesYear)}`;
};

const MiniCartProductCard = ({ productName, howMany, dateRange, productImage, itemId, itemType, onClose, addons = [], citySlug, itemSlug }) => {
  const { adults, children } = howMany ?? {};
  const travelDate = formatCartDateRange(dateRange);
  const editHref = buildEditHref({ itemId, itemType, citySlug, itemSlug });
  const itemName = productName || 'this booking';
  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-background px-3 py-3 shadow-sm sm:px-6 sm:py-4">
      <div className="flex w-full items-center justify-between gap-3 px-1 py-1 sm:p-4 sm:py-2">
        <h3 className="text-base font-medium capitalize text-Blueish sm:text-lg">{itemType}</h3>
        <div className="flex shrink-0 justify-between gap-3 sm:gap-4">
          <DeleteItem id={itemId} name={productName} onClose={onClose} />
          {editHref && (
            <NavigationLink
              href={editHref}
              onClick={onClose}
              aria-label={`Edit ${itemName} booking`}
              className="inline-flex size-8 items-center justify-center rounded-md text-copy transition-colors hover:bg-muted-foreground/10 hover:text-weelp-sage-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <SquarePen size={18} aria-hidden="true" />
            </NavigationLink>
          )}
        </div>
      </div>
      <div className="flex w-full gap-3 rounded-lg border p-3 sm:justify-between sm:p-4">
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="line-clamp-2 text-base font-medium capitalize text-Blueish sm:text-lg">{productName ?? 'Melaka Wonderland Water Theme'}</h3>
          <span className="mt-2 flex items-start gap-2 text-sm font-medium capitalize text-copy">
            <User size={18} className="mt-0.5 shrink-0 text-copy capitalize sm:size-5" />
            {`${adults ?? 0} adults ${children ? ', ' + children + ' children ' : ''}  `}
          </span>

          <span className="mt-2 flex items-start gap-2 text-sm font-medium capitalize text-copy">
            <Calendar size={18} className="mt-0.5 shrink-0 text-copy sm:size-5" />
            {travelDate}
          </span>
          {addons.length > 0 && (
            <div className="flex flex-col mt-2 gap-1">
              {addons.map((addon, i) => (
                <span key={i} className="flex items-start gap-2 text-sm font-medium capitalize text-copy">
                  <Sparkles size={18} className="mt-0.5 shrink-0 text-copy sm:size-5" />+ {addon.addon_name}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex shrink-0">
          <img
            src={productImage || '/assets/fallback-image.png'}
            className="h-24 w-24 rounded-md object-cover sm:h-28 sm:w-32"
            alt={productName || 'product'}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = '/assets/fallback-image.png';
            }}
          />
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
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const itemName = name || 'this item';

  // remove item from modal action
  const removeItemAlertAction = () => {
    removeItem(id);
    setConfirmOpen(false);
    if (onClose) onClose();

    // display notice
    toast({
      title: 'Item removed from cart',
      duration: 1000,
    });
  };
  return (
    <>
      <button
        type="button"
        className="inline-flex size-8 items-center justify-center rounded-md text-copy transition-colors hover:bg-muted-foreground/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Remove ${itemName} from cart`}
        onClick={() => setConfirmOpen(true)}
      >
        <Trash2 size={18} aria-hidden="true" />
      </button>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this item from your cart?</AlertDialogTitle>
            <AlertDialogDescription>
              <b>{`Name: ${itemName}`}</b>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className={'bg-weelp-sage-deep'} onClick={removeItemAlertAction}>
              Remove item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
