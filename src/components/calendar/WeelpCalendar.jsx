'use client';

import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import 'react-day-picker/dist/style.css';
import '@/app/styles/date-picker.css';

export const EMPTY_DATE_RANGE = { from: null, to: null };

const FORMAT_WEEKDAY = (date, options) =>
  date.toLocaleDateString(options?.locale?.code || 'en-US', { weekday: 'short' }).slice(0, 2);

const FORMATTERS = { formatWeekdayName: FORMAT_WEEKDAY };

function Chevron({ orientation = 'left', ...rest }) {
  const Icon = orientation === 'left' ? ChevronLeft : ChevronRight;
  return <Icon aria-hidden="true" {...rest} className="h-4 w-4" />;
}

const DEFAULT_COMPONENTS = { Chevron };

const DEFAULT_CLASSNAMES = {
  months: 'rdp-months flex flex-col sm:flex-row relative',
};

const WeelpCalendar = React.forwardRef(function WeelpCalendar(
  {
    mode = 'range',
    months: monthsProp = 2,
    showClear = false,
    onSelect,
    disablePast = false,
    disabled,
    className,
    footer,
    classNames,
    components,
    showOutsideDays = false,
    weekStartsOn = 1,
    ...rest
  },
  ref,
) {
  const isMobile = useIsMobile();
  const numberOfMonths = isMobile ? 1 : monthsProp;

  const effectiveDisabled = disablePast ? (disabled ? [disabled, { before: new Date() }] : { before: new Date() }) : disabled;

  const clearButton =
    showClear && onSelect ? (
      <button type="button" onClick={() => onSelect(mode === 'range' ? EMPTY_DATE_RANGE : null)} className="weelp-cal-clear">
        Clear
      </button>
    ) : null;

  const composedFooter = clearButton ? (
    <>
      {clearButton}
      {footer}
    </>
  ) : (
    footer
  );

  const mergedComponents = components ? { ...DEFAULT_COMPONENTS, ...components } : DEFAULT_COMPONENTS;
  const mergedClassNames = classNames ? { ...DEFAULT_CLASSNAMES, ...classNames } : DEFAULT_CLASSNAMES;

  return (
    <div ref={ref} role="group" aria-label="Calendar" className={cn('weelp-calendar', className)}>
      <DayPicker
        mode={mode}
        numberOfMonths={numberOfMonths}
        showOutsideDays={showOutsideDays}
        weekStartsOn={weekStartsOn}
        pagedNavigation
        formatters={FORMATTERS}
        components={mergedComponents}
        classNames={mergedClassNames}
        disabled={effectiveDisabled}
        onSelect={onSelect}
        footer={composedFooter}
        {...rest}
      />
    </div>
  );
});

export { WeelpCalendar };
