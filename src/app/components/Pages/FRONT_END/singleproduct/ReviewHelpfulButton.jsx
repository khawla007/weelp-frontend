'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { ThumbsUp } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import useAuthModalStore from '@/lib/store/useAuthModalStore';

function getErrorMessage(error) {
  return error?.response?.data?.message || 'Please try again.';
}

export default function ReviewHelpfulButton({ reviewId, count, isMarked, isPending, isStatusReady, onChange }) {
  const { data: session, status } = useSession();
  const { openAuthModal } = useAuthModalStore();
  const { toast } = useToast();
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const runChange = useCallback(
    async (nextMarked) => {
      try {
        await onChangeRef.current(nextMarked);
      } catch (error) {
        toast({
          title: 'Unable to update helpful vote',
          description: getErrorMessage(error),
          variant: 'destructive',
        });
      }
    },
    [toast],
  );

  const handleClick = () => {
    if (status === 'loading' || isPending || (status === 'authenticated' && !isStatusReady)) return;

    if (!session?.user) {
      openAuthModal({ onSuccess: () => runChange(true) });
      return;
    }

    void runChange(!isMarked);
  };

  const isDisabled = status === 'loading' || isPending || (status === 'authenticated' && !isStatusReady);

  return (
    <button
      data-review-id={reviewId}
      type="button"
      aria-label={isMarked ? 'Remove helpful vote from review' : 'Mark review as helpful'}
      aria-pressed={isMarked}
      disabled={isDisabled}
      onClick={handleClick}
      className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:text-copy disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <ThumbsUp data-testid="helpful-thumb" aria-hidden="true" className={`size-4 ${isMarked ? 'fill-weelp-sage-deep text-weelp-sage-deep' : ''}`} />
      <span>{count > 0 ? `Helpful · ${count}` : 'Helpful'}</span>
    </button>
  );
}
