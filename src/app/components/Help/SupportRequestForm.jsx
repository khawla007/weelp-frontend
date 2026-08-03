'use client';

import { useEffect, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { HELP_TOPICS } from './helpTopics';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { submitSupportRequest } from '@/lib/services/supportRequests';
import { supportRequestSchema } from '@/lib/validation/supportRequestSchema';

const FIELD_ORDER = ['name', 'email', 'topic', 'message', 'website'];
const RATE_LIMIT_MESSAGE = 'Too many support requests. Please wait and try again.';
const FALLBACK_MESSAGE = 'We could not send your request. Please try again.';

const fieldDescription = (errorId, hasError) => (hasError ? errorId : undefined);

const createRequestId = () => {
  const cryptoApi = globalThis.crypto;

  if (typeof cryptoApi?.randomUUID === 'function') {
    return cryptoApi.randomUUID();
  }

  const bytes = new Uint8Array(16);
  if (typeof cryptoApi?.getRandomValues === 'function') {
    cryptoApi.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0'));
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10).join('')}`;
};

const safeFailureMessage = (message) => (typeof message === 'string' && message.trim() ? message.trim() : FALLBACK_MESSAGE);

export function SupportRequestForm({ context, selectedTopic, session, onBack, onSuccess, active = true }) {
  const requestIdRef = useRef(null);
  requestIdRef.current ??= createRequestId();
  const activeRef = useRef(active);
  const attemptRef = useRef(0);
  const headingRef = useRef(null);
  const identityEditedRef = useRef({ name: false, email: false });
  activeRef.current = active;

  const [failure, setFailure] = useState('');
  const [failureDetails, setFailureDetails] = useState([]);
  const {
    register,
    handleSubmit,
    getValues,
    setError,
    setFocus,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(supportRequestSchema),
    defaultValues: {
      name: session?.user?.name ?? '',
      email: session?.user?.email ?? '',
      topic: selectedTopic,
      message: '',
      website: '',
    },
  });
  const nameRegistration = register('name');
  const emailRegistration = register('email');

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  useEffect(() => {
    const identityFields = [
      ['name', session?.user?.name],
      ['email', session?.user?.email],
    ];

    identityFields.forEach(([field, value]) => {
      if (typeof value === 'string' && value && getValues(field) === '' && !identityEditedRef.current[field]) {
        setValue(field, value, { shouldDirty: false });
      }
    });
  }, [getValues, session?.user?.email, session?.user?.name, setValue]);

  useEffect(() => {
    if (!active) {
      attemptRef.current += 1;
    }
  }, [active]);

  useEffect(
    () => () => {
      activeRef.current = false;
      attemptRef.current += 1;
    },
    [],
  );

  const onSubmit = async (values) => {
    const attempt = attemptRef.current + 1;
    attemptRef.current = attempt;
    setFailure('');
    setFailureDetails([]);

    try {
      const result = await submitSupportRequest({
        ...values,
        item_type: context.itemType,
        item_id: context.itemId,
        item_title: context.itemTitle,
        city_slug: context.citySlug,
        item_slug: context.itemSlug,
        page_url: new URL(context.pagePath, window.location.origin).toString(),
        client_request_id: requestIdRef.current,
      });

      if (!activeRef.current || attempt !== attemptRef.current) {
        return;
      }

      const reference = result?.data?.reference;
      if (result?.success && typeof reference === 'string' && reference.trim()) {
        onSuccess(reference.trim());
        return;
      }

      const serverErrors = result?.errors && typeof result.errors === 'object' ? result.errors : {};
      const announcedErrors = [];
      let firstInvalidField = null;

      FIELD_ORDER.forEach((field) => {
        const messages = Array.isArray(serverErrors[field]) ? serverErrors[field].filter((message) => typeof message === 'string' && message.trim()) : [];

        if (messages.length === 0) {
          return;
        }

        firstInvalidField ??= field;
        announcedErrors.push(...messages);
        setError(field, { type: 'server', message: messages[0] });
      });

      const message = result?.status === 429 ? RATE_LIMIT_MESSAGE : safeFailureMessage(result?.message);
      setFailure(message);
      setFailureDetails(announcedErrors);

      if (firstInvalidField) {
        setFocus(firstInvalidField);
      }
    } catch {
      if (activeRef.current && attempt === attemptRef.current) {
        setFailure(FALLBACK_MESSAGE);
      }
    }
  };

  const renderError = (field) =>
    errors[field] ? (
      <p id={`support-${field}-error`} className="mt-1.5 text-sm text-destructive">
        {errors[field].message}
      </p>
    ) : null;

  return (
    <div className="px-5 py-6 sm:px-7">
      <button
        type="button"
        className="mb-5 inline-flex min-h-10 items-center gap-2 rounded-md text-sm font-medium text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onClick={onBack}
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Back to help
      </button>

      <div>
        <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-semibold tracking-tight text-foreground focus:outline-none">
          Tell us what you need
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">We’ll send your question with the experience details, so you do not need to repeat them.</p>
      </div>

      <form className="mt-6 space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="support-name" className="text-sm font-medium text-foreground">
            Your name
          </label>
          <Input
            id="support-name"
            autoComplete="name"
            className="mt-2"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={fieldDescription('support-name-error', errors.name)}
            {...nameRegistration}
            onChange={(event) => {
              identityEditedRef.current.name = true;
              nameRegistration.onChange(event);
            }}
          />
          {renderError('name')}
        </div>

        <div>
          <label htmlFor="support-email" className="text-sm font-medium text-foreground">
            Email address
          </label>
          <Input
            id="support-email"
            type="email"
            autoComplete="email"
            className="mt-2"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={fieldDescription('support-email-error', errors.email)}
            {...emailRegistration}
            onChange={(event) => {
              identityEditedRef.current.email = true;
              emailRegistration.onChange(event);
            }}
          />
          {renderError('email')}
        </div>

        <div>
          <label htmlFor="support-topic" className="text-sm font-medium text-foreground">
            What do you need help with?
          </label>
          <select
            id="support-topic"
            className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-invalid={Boolean(errors.topic)}
            aria-describedby={fieldDescription('support-topic-error', errors.topic)}
            {...register('topic')}
          >
            <option value="">Choose a topic</option>
            {HELP_TOPICS.map((topic) => (
              <option key={topic.value} value={topic.value}>
                {topic.label}
              </option>
            ))}
          </select>
          {renderError('topic')}
        </div>

        <div>
          <label htmlFor="support-message" className="text-sm font-medium text-foreground">
            Message
          </label>
          <Textarea
            id="support-message"
            rows={6}
            className="mt-2 resize-y"
            aria-invalid={Boolean(errors.message)}
            aria-describedby={fieldDescription('support-message-error', errors.message)}
            {...register('message')}
          />
          {renderError('message')}
        </div>

        <div className="sr-only" aria-hidden="true">
          <label htmlFor="support-website">Website</label>
          <Input id="support-website" type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
        </div>

        {failure ? (
          <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <p>{failure}</p>
            {failureDetails.length > 0 ? <p className="mt-1">{failureDetails.join(' ')}</p> : null}
          </div>
        ) : null}

        <div aria-live="polite" className="min-h-5 text-sm text-muted-foreground">
          {isSubmitting ? 'Sending your request…' : ''}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          <Send aria-hidden="true" className="h-4 w-4" />
          {isSubmitting ? 'Sending…' : 'Send request'}
        </Button>
      </form>
    </div>
  );
}
