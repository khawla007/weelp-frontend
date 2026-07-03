'use client';

import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';

import { cn } from '@/lib/utils';

const Switch = React.forwardRef(({ className, children: _children, ...props }, ref) => (
  <SwitchPrimitives.Root className={cn('neumorphism-switch-root peer shrink-0 disabled:cursor-not-allowed disabled:opacity-50', className)} {...props} ref={ref}>
    <SwitchPrimitives.Thumb className="neumorphism-switch-toggle">
      <span className="neumorphism-switch-led" />
    </SwitchPrimitives.Thumb>
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
