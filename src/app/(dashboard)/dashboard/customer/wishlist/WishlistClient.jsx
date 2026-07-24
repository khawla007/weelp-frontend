'use client';

import { useState } from 'react';
import { Heart, Trash2 } from 'lucide-react';

import Image from '@/app/components/Image';
import NavigationLink from '@/app/components/Navigation/NavigationLink';
import { DashboardMotionFrame } from '@/app/components/DashboardShared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useWishlistItems } from '@/hooks/api/customer/wishlist';
import { getWishlistItemHref } from '@/lib/wishlist/normalizeWishlistItem';

function formatType(type) {
  if (!type) return 'Item';

  return String(type)
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatPrice(item) {
  if (item?.price === undefined || item?.price === null || item?.price === '') return null;

  const currency = item.currency ? `${item.currency} ` : '';
  return `${currency}${item.price}`;
}

function itemTitle(item) {
  return item?.title || item?.name || 'Saved item';
}

function LoadingState() {
  return (
    <div className="space-y-3" aria-label="Loading wishlist">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 rounded-lg border border-border bg-background p-4">
          <Skeleton className="h-16 w-20 rounded-md" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-weelp-sage/50 bg-background px-4 py-14 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-weelp-sage/15 text-weelp-sage-text">
        <Heart className="size-5" />
      </div>
      <p className="mt-4 text-lg font-semibold text-foreground">Your wishlist is empty</p>
      <p className="mt-2 text-sm text-muted-foreground">Save activities, packages, and itineraries you want to revisit.</p>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="rounded-lg border border-destructive/30 bg-background px-4 py-10 text-center">
      <p className="text-lg font-semibold text-foreground">Wishlist could not load</p>
      <p className="mt-2 text-sm text-muted-foreground">{message || 'Please refresh the page and try again.'}</p>
    </div>
  );
}

function WishlistRow({ item, removing, onRemove }) {
  const href = getWishlistItemHref(item);
  const title = itemTitle(item);
  const price = formatPrice(item);
  const type = formatType(item?.item_type || item?.type);

  return (
    <article className="flex flex-col gap-4 rounded-lg border border-border bg-background p-4 sm:flex-row sm:items-center">
      <div className="relative h-36 w-full overflow-hidden rounded-md bg-muted sm:h-20 sm:w-28">
        {item?.image_url ? (
          <Image src={item.image_url} alt="" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-weelp-sage-text">
            <Heart className="size-5" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-base font-semibold text-foreground">{title}</h2>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span>{type}</span>
          {item?.city_name && <span>{item.city_name}</span>}
          {price && <span>{price}</span>}
        </div>
      </div>

      <div className="flex shrink-0 gap-2 sm:justify-end">
        {href && (
          <NavigationLink
            href={href}
            className="inline-flex h-9 items-center justify-center rounded-md border border-border px-3 text-sm font-medium text-copy transition-colors hover:bg-muted hover:text-foreground"
          >
            View
          </NavigationLink>
        )}
        <Button type="button" variant="outline" size="sm" onClick={() => onRemove(item.id)} disabled={removing} className="border-border text-copy hover:bg-muted">
          <Trash2 className="mr-2 size-4" />
          {removing ? 'Removing' : 'Remove'}
        </Button>
      </div>
    </article>
  );
}

export default function WishlistClient() {
  const { items = [], isLoading, error, removeItem } = useWishlistItems();
  const { toast } = useToast();
  const [removingId, setRemovingId] = useState(null);

  const handleRemove = async (id) => {
    if (!id) return;

    setRemovingId(id);
    try {
      await removeItem(id);
      toast({
        title: 'Removed from wishlist',
        description: 'The item was removed from your saved list.',
      });
    } catch (removeError) {
      toast({
        title: 'Could not remove item',
        description: removeError?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <DashboardMotionFrame className="p-4 sm:p-6 lg:p-8">
      <Card className="overflow-hidden border-border shadow-none">
        <CardHeader className="border-b border-border bg-background">
          <CardTitle className="text-2xl sm:text-3xl">Wishlist</CardTitle>
          <CardDescription>Items you saved for later.</CardDescription>
        </CardHeader>
        <CardContent className="bg-weelp-sage/10 p-4 sm:p-6">
          {isLoading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error.message} />
          ) : items.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <WishlistRow key={item.id} item={item} removing={removingId === item.id} onRemove={handleRemove} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardMotionFrame>
  );
}
