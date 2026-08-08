'use client';

import React from 'react';

function BookingAction({ ref, formId, primaryPrice, secondaryPrice, isEditing = false, isInCart = false, onShowCart, variant = 'inline' }) {
  const buttonClassName =
    'min-h-11 w-full rounded-md bg-weelp-sage-deep px-6 py-3 text-center font-medium text-white transition-colors hover:bg-weelp-sage-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 min-[360px]:w-auto';

  return (
    <div
      ref={ref}
      data-testid="booking-action"
      className={`flex flex-col items-stretch justify-between gap-4 border border-border bg-background p-5 min-[360px]:flex-row min-[360px]:items-center ${variant === 'mobile' ? 'rounded-none sm:rounded-xl' : 'rounded-xl'}`}
    >
      <div className="min-w-0 break-words">
        {secondaryPrice ? <p className="text-sm font-medium text-weelp-copy">{secondaryPrice}</p> : null}
        <p className="break-words text-lg font-bold text-foreground">{primaryPrice}</p>
      </div>

      {isInCart && !isEditing ? (
        <button type="button" onClick={onShowCart} className={buttonClassName}>
          Show Cart
        </button>
      ) : (
        <button type="submit" form={formId} className={buttonClassName}>
          {isEditing ? 'Update booking' : 'Select'}
        </button>
      )}
    </div>
  );
}

export default BookingAction;
