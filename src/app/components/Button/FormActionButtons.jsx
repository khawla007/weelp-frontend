'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * FormActionButtons - Shared form action buttons component
 *
 * Renders Cancel + (Create|Update) buttons with consistent styling
 *
 * @param {Object} props
 * @param {'create' | 'update'} props.mode - Form mode (create or update)
 * @param {string} props.submitText - Custom submit button text (optional, auto-generated if not provided)
 * @param {string} props.cancelText - Custom cancel button text (default: 'Cancel')
 * @param {Function} props.onCancel - Cancel callback (default: router.back())
 * @param {boolean} props.isSubmitting - Disable buttons and show loading state
 * @param {boolean} props.isDisabled - Additional disabled state
 * @param {string} props.cancelHref - Optional href for cancel button (uses Link instead of onClick)
 * @param {string} props.className - Additional container classes
 * @param {'row' | 'row-reverse'} props.layout - Button layout (default: 'row')
 * @param {'div' | 'p' | 'none'} props.containerType - Container type (default: 'p')
 * @param {boolean} props.showCancel - Show cancel button (default: true)
 * @param {boolean} props.showSubmit - Show submit button (default: true)
 * @param {boolean} props.cancelAlwaysEnabled - When true, Cancel button is never disabled (default: false)
 */
export function FormActionButtons({
  mode = 'create',
  submitText,
  cancelText = 'Cancel',
  onCancel,
  isSubmitting = false,
  isDisabled = false,
  cancelHref,
  className = '',
  layout = 'row',
  containerType = 'p',
  showSubmit = true,
  showCancel = true,
  cancelAlwaysEnabled = false,
}) {
  const router = useRouter();

  // Derive submit text from mode if not provided
  const defaultSubmitText = mode === 'create' ? 'Create' : 'Update';

  const finalSubmitText = submitText ? `${defaultSubmitText} ${submitText}` : defaultSubmitText;
  const loadingText = mode === 'create' ? `Creating ${submitText || ''}...` : `Updating ${submitText || ''}...`;

  // Handle cancel action
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  // Container styles
  const containerStyles = {
    div: 'flex gap-4',
    p: 'flex gap-2',
    none: '',
  };

  const Container = containerType === 'none' ? 'div' : containerType;

  const cancelButton = cancelHref ? (
    <Button type="button" variant="outline" className="border text-black hover:bg-inherit min-w-[100px]" disabled={cancelAlwaysEnabled ? false : isSubmitting || isDisabled} asChild>
      <Link href={cancelHref}>{cancelText}</Link>
    </Button>
  ) : (
    <Button type="button" variant="outline" className="border text-black hover:bg-inherit min-w-[100px]" onClick={handleCancel} disabled={cancelAlwaysEnabled ? false : isSubmitting || isDisabled}>
      {cancelText}
    </Button>
  );

  const submitButton = (
    <Button type="submit" className="bg-secondaryDark hover:bg-secondaryDark/90 text-white min-w-[100px] relative" disabled={isSubmitting || isDisabled}>
      {isSubmitting ? (
        <>
          <Loader2 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
          <span className="opacity-0">{finalSubmitText}</span>
        </>
      ) : (
        finalSubmitText
      )}
    </Button>
  );

  if (containerType === 'none') {
    return (
      <div className={`flex ${layout === 'row-reverse' ? 'flex-row-reverse' : ''} gap-4 ${className}`}>
        {showCancel && cancelButton}
        {showSubmit && submitButton}
      </div>
    );
  }

  return (
    <Container className={`${containerStyles[containerType]} ${layout === 'row-reverse' ? 'flex-row-reverse' : ''} ${className}`}>
      {showCancel && cancelButton}
      {showSubmit && submitButton}
    </Container>
  );
}

// For convenience, export specific mode components
export function CreateFormActionButtons(props) {
  return <FormActionButtons mode="create" {...props} />;
}

export function UpdateFormActionButtons(props) {
  return <FormActionButtons mode="update" {...props} />;
}
