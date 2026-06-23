import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import '@/app/styles/date-picker.css';

// export type CalendarProps = ComponentProps;

function Calendar({ className, classNames, showOutsideDays = true, ...props }) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        month: 'space-y-4',
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-y-0 relative gap-2',
        month_caption: 'flex justify-center pt-1 relative items-center',
        month_grid: 'w-full border-collapse space-y-1',
        caption_label: 'text-sm font-medium',
        nav: 'flex items-center justify-between absolute inset-x-0',
        button_previous: cn(buttonVariants({ variant: 'outline' }), 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 z-10'),
        button_next: cn(buttonVariants({ variant: 'outline' }), 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 z-10'),
        weeks: 'w-full border-collapse',
        weekdays: 'flex',
        weekday: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
        week: 'flex w-full mt-2',
        day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-none first:aria-selected:rounded-l-md last:aria-selected:rounded-r-md',
        day_button: cn(buttonVariants({ variant: 'ghost' }), 'h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20'),
        range_start:
          'day-range-start !bg-transparent [&>button]:mx-0.5 [&>button]:h-8 [&>button]:w-8 [&>button]:justify-start [&>button]:pl-2.5 [&>button]:!text-foreground [&>button]:hover:!text-foreground',
        range_end:
          'day-range-end !bg-transparent [&>button]:mx-0.5 [&>button]:h-8 [&>button]:w-8 [&>button]:justify-end [&>button]:pr-2.5 [&>button]:!text-foreground [&>button]:hover:!text-foreground',
        range_middle:
          'day-range-middle aria-selected:!bg-transparent aria-selected:!text-foreground [&>button]:mx-0.5 [&>button]:h-8 [&>button]:w-8 [&>button]:rounded-none [&>button]:!bg-weelp-sage-tint [&>button]:hover:!bg-weelp-sage-tint',
        selected: cn(props.mode === 'range' ? 'day-selected' : '[&>button]:!bg-muted [&>button]:!text-foreground [&>button]:focus:!bg-muted [&>button]:focus:!text-foreground'),
        today: 'bg-accent text-accent-foreground !rounded-md',
        outside: 'day-outside text-muted-foreground opacity-50 !aria-selected:bg-accent/50 !aria-selected:text-muted-foreground !aria-selected:opacity-30',
        disabled: 'text-muted-foreground opacity-50',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ ...props }) => (props.orientation === 'left' ? <ChevronLeft {...props} className="h-4 w-4" /> : <ChevronRight {...props} className="h-4 w-4" />),
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
