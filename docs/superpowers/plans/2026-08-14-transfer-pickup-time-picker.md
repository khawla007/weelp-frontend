# Transfer Pickup Time Picker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the customer transfer modal's native time input with the approved Weelp-themed hour, minute, and AM/PM picker while preserving its existing `HH:mm` submission contract.

**Architecture:** Add one focused controlled picker beside the existing public itinerary transfer modal. The picker owns partial 12-hour selection state and conversion; the modal continues to own the complete transfer form and receives either an empty string or a normalized 24-hour time.

**Tech Stack:** Next.js 16, React 19, JavaScript, Tailwind CSS, Radix Select through the shared shadcn-style wrapper, Jest, React Testing Library

---

## File structure

- Create `src/app/components/Pages/FRONT_END/singleproduct/TransferPickupTimePicker.jsx` for option generation, time conversion, partial selection state, accessibility, and themed rendering.
- Create `src/app/components/Pages/FRONT_END/singleproduct/__tests__/TransferPickupTimePicker.test.jsx` for focused conversion and interaction coverage.
- Modify `src/app/components/Pages/FRONT_END/singleproduct/TransferSearchModalPublic.jsx` only where the native pickup-time field is imported and rendered.
- Modify `src/app/components/Pages/FRONT_END/singleproduct/__tests__/TransferSearchModalPublic.test.jsx` so the full customer flow selects all three time parts and verifies the normalized submitted value.

Task-level commits are intentionally omitted because repository instructions require the complete code-review, simplify, and verification gates before committing code. One final frontend commit will be created only after those gates pass.

All commands in this plan run from the frontend repository:

```bash
cd frontend
git rev-parse --show-toplevel
```

Expected repository root: `/run/media/ashish-khawla/Website data/Fanatic Developement/weelp/frontend`.

Every UI check uses this concrete visible session command (close and restart the same session first if it is not already headed):

```bash
agent-browser --session weelp-transfer-time --headed open http://localhost:3000
```

### Task 0: Load the required implementation guidance

**Files:**

- Read-only review of the approved spec and files listed above.

- [ ] **Step 1: Invoke required Next.js and React skills before code**

Read and apply `next-best-practices`, `vercel-react-best-practices`, and `vercel-composition-patterns`. Confirm that the client boundary is necessary, the picker remains a focused leaf component, state synchronization does not create effect loops, and no boolean-prop or abstraction expansion is introduced.

### Task 1: Specify the picker contract with failing tests

**Files:**

- Create: `src/app/components/Pages/FRONT_END/singleproduct/__tests__/TransferPickupTimePicker.test.jsx`
- Test: `src/app/components/Pages/FRONT_END/singleproduct/__tests__/TransferPickupTimePicker.test.jsx`

- [ ] **Step 1: Add the Select adapter and contract tests**

Create the test file below. Its local mock turns the composed Radix controls into native selects while retaining each trigger's accessible name.

```jsx
import { fireEvent, render, screen } from '@testing-library/react';

import TransferPickupTimePicker, { parse24HourTime, to24HourTime } from '../TransferPickupTimePicker';

jest.mock('@/components/ui/select', () => {
  const React = require('react');
  const SelectTrigger = () => null;
  const SelectContent = () => null;
  const SelectValue = () => null;
  const SelectItem = () => null;

  const Select = ({ value, onValueChange, children }) => {
    const parts = React.Children.toArray(children);
    const trigger = parts.find((child) => child.type === SelectTrigger);
    const content = parts.find((child) => child.type === SelectContent);
    const items = React.Children.toArray(content?.props.children);
    const { children: _triggerChildren, ...triggerProps } = trigger?.props || {};

    return (
      <select {...triggerProps} value={value} onChange={(event) => onValueChange(event.target.value)}>
        <option value="">Select</option>
        {items.map((item) => (
          <option key={item.props.value} value={item.props.value}>
            {item.props.children}
          </option>
        ))}
      </select>
    );
  };

  return { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
});

describe('TransferPickupTimePicker', () => {
  it('converts between HH:mm and 12-hour picker parts', () => {
    expect(parse24HourTime('00:00')).toEqual({ hour: '12', minute: '00', period: 'AM' });
    expect(parse24HourTime('12:00')).toEqual({ hour: '12', minute: '00', period: 'PM' });
    expect(parse24HourTime('21:30')).toEqual({ hour: '09', minute: '30', period: 'PM' });
    expect(parse24HourTime('invalid')).toEqual({ hour: '', minute: '', period: '' });
    expect(to24HourTime({ hour: '12', minute: '00', period: 'AM' })).toBe('00:00');
    expect(to24HourTime({ hour: '12', minute: '00', period: 'PM' })).toBe('12:00');
    expect(to24HourTime({ hour: '09', minute: '30', period: 'PM' })).toBe('21:30');
    expect(to24HourTime({ hour: '09', minute: '', period: 'PM' })).toBe('');
  });

  it('starts empty and stays incomplete until all three parts are selected', () => {
    const onChange = jest.fn();
    render(<TransferPickupTimePicker value="" onChange={onChange} />);
    expect(screen.getByLabelText('Pickup hour')).toHaveValue('');
    expect(screen.getByLabelText('Pickup minute')).toHaveValue('');
    expect(screen.getByLabelText('Pickup period')).toHaveValue('');
    expect(screen.getByLabelText('Pickup hour')).toHaveAttribute('aria-required', 'true');
    expect(screen.getByLabelText('Pickup minute')).toHaveAttribute('aria-required', 'true');
    expect(screen.getByLabelText('Pickup period')).toHaveAttribute('aria-required', 'true');
    fireEvent.change(screen.getByLabelText('Pickup hour'), { target: { value: '09' } });
    expect(onChange).toHaveBeenLastCalledWith('');
    expect(onChange).toHaveBeenCalledTimes(1);
    fireEvent.change(screen.getByLabelText('Pickup minute'), { target: { value: '30' } });
    expect(onChange).toHaveBeenLastCalledWith('');
    expect(onChange).toHaveBeenCalledTimes(2);
    fireEvent.change(screen.getByLabelText('Pickup period'), { target: { value: 'PM' } });
    expect(onChange).toHaveBeenLastCalledWith('21:30');
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it('updates a completed choice and synchronizes external values and resets', () => {
    const onChange = jest.fn();
    const { rerender } = render(<TransferPickupTimePicker value="21:30" onChange={onChange} />);
    expect(screen.getByLabelText('Pickup hour')).toHaveValue('09');
    expect(screen.getByLabelText('Pickup minute')).toHaveValue('30');
    expect(screen.getByLabelText('Pickup period')).toHaveValue('PM');

    fireEvent.change(screen.getByLabelText('Pickup hour'), { target: { value: '10' } });
    expect(onChange).toHaveBeenLastCalledWith('22:30');
    expect(onChange).toHaveBeenCalledTimes(1);
    fireEvent.change(screen.getByLabelText('Pickup period'), { target: { value: 'AM' } });
    expect(onChange).toHaveBeenLastCalledWith('10:30');
    expect(onChange).toHaveBeenCalledTimes(2);

    rerender(<TransferPickupTimePicker value="12:00" onChange={onChange} />);
    expect(screen.getByLabelText('Pickup hour')).toHaveValue('12');
    expect(screen.getByLabelText('Pickup minute')).toHaveValue('00');
    expect(screen.getByLabelText('Pickup period')).toHaveValue('PM');

    rerender(<TransferPickupTimePicker value="" onChange={onChange} />);
    expect(screen.getByLabelText('Pickup hour')).toHaveValue('');
    expect(screen.getByLabelText('Pickup minute')).toHaveValue('');
    expect(screen.getByLabelText('Pickup period')).toHaveValue('');

    rerender(<TransferPickupTimePicker value="not-a-time" onChange={onChange} />);
    expect(screen.getByLabelText('Pickup hour')).toHaveValue('');
    expect(screen.getByLabelText('Pickup minute')).toHaveValue('');
    expect(screen.getByLabelText('Pickup period')).toHaveValue('');
  });
});
```

- [ ] **Step 2: Verify the focused test is red**

Run:

```bash
npx jest src/app/components/Pages/FRONT_END/singleproduct/__tests__/TransferPickupTimePicker.test.jsx --runInBand
```

Expected: FAIL because `../TransferPickupTimePicker` does not exist.

### Task 2: Build the themed segmented picker

**Files:**

- Create: `src/app/components/Pages/FRONT_END/singleproduct/TransferPickupTimePicker.jsx`
- Test: `src/app/components/Pages/FRONT_END/singleproduct/__tests__/TransferPickupTimePicker.test.jsx`

- [ ] **Step 1: Implement the picker**

Create the component below. It implements the empty state, full minute range, AM/PM edge cases, controlled synchronization, accessible trigger names, semantic theme tokens, and sage focus/selection treatment.

```jsx
'use client';

import { useEffect, useState } from 'react';
import { Clock3 } from 'lucide-react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const pad2 = (value) => String(value).padStart(2, '0');
const EMPTY_PARTS = { hour: '', minute: '', period: '' };
const HOURS = Array.from({ length: 12 }, (_, index) => pad2(index + 1));
const MINUTES = Array.from({ length: 60 }, (_, index) => pad2(index));
const PERIODS = ['AM', 'PM'];
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function parse24HourTime(value) {
  const match = typeof value === 'string' ? value.match(TIME_PATTERN) : null;
  if (!match) return { ...EMPTY_PARTS };
  const hour24 = Number(match[1]);
  return {
    hour: pad2(((hour24 + 11) % 12) + 1),
    minute: match[2],
    period: hour24 >= 12 ? 'PM' : 'AM',
  };
}

export function to24HourTime({ hour, minute, period }) {
  if (!hour || !minute || !period) return '';
  let hour24 = Number(hour) % 12;
  if (period === 'PM') hour24 += 12;
  return `${pad2(hour24)}:${minute}`;
}

export default function TransferPickupTimePicker({ value, onChange }) {
  const [parts, setParts] = useState(() => parse24HourTime(value));

  useEffect(() => {
    setParts(parse24HourTime(value));
  }, [value]);

  const updatePart = (key, nextValue) => {
    const next = { ...parts, [key]: nextValue };
    setParts(next);
    onChange(to24HourTime(next));
  };

  const triggerClassName =
    'h-11 min-w-0 rounded-xl border-border bg-background px-3 text-sm font-semibold text-foreground shadow-sm transition-colors hover:border-weelp-sage-deep/50 focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/30 dark:shadow-none';
  const itemClassName = 'text-sm focus:bg-weelp-sage-deep focus:text-white data-[state=checked]:bg-weelp-sage-deep data-[state=checked]:text-white';
  const controls = [
    { key: 'hour', label: 'Pickup hour', placeholder: 'Hour', options: HOURS },
    { key: 'minute', label: 'Pickup minute', placeholder: 'Min', options: MINUTES },
    { key: 'period', label: 'Pickup period', placeholder: 'AM/PM', options: PERIODS },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-weelp-sage-deep/10 text-weelp-sage-text dark:bg-weelp-sage-deep/20">
          <Clock3 aria-hidden="true" className="h-4 w-4" />
        </span>
        <span>
          Pickup Time{' '}
          <span aria-hidden="true" className="text-red-500">
            *
          </span>
          <span className="sr-only"> required</span>
        </span>
      </div>

      <div role="group" aria-label="Pickup time" className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_minmax(0,1.1fr)] items-center gap-2 rounded-2xl border border-border bg-muted/30 p-2">
        {controls.map((control, index) => (
          <div key={control.key} className="contents">
            {index === 1 && (
              <span aria-hidden="true" className="font-semibold text-muted-foreground">
                :
              </span>
            )}
            <Select value={parts[control.key]} onValueChange={(nextValue) => updatePart(control.key, nextValue)}>
              <SelectTrigger aria-label={control.label} aria-required="true" className={triggerClassName}>
                <SelectValue placeholder={control.placeholder} />
              </SelectTrigger>
              <SelectContent className="z-[200] max-h-60 min-w-[5rem]">
                {control.options.map((option) => (
                  <SelectItem key={option} value={option} className={itemClassName}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">Your driver will arrive at the selected pickup time.</p>
    </div>
  );
}
```

- [ ] **Step 2: Verify the focused test is green**

Run the Task 1 Jest command again. Expected: PASS with 3 tests.

- [ ] **Step 3: Run the required post-change sequence for the new component**

Invoke `error-handling-patterns`, then run:

```bash
npm run type-check
npm run lint
npx jest src/app/components/Pages/FRONT_END/singleproduct/__tests__/TransferPickupTimePicker.test.jsx src/app/__tests__/deepForestTheme.test.js --runInBand
```

Expected: all commands pass and the semantic sage text token adds no theme allowlist regression. Because the new component is not yet mounted by a route, use the headed local browser to confirm the existing itinerary configure flow still renders its unchanged native field without a runtime overlay; the new control itself is visually verified immediately after Task 3 mounts it.

### Task 3: Integrate the picker into the customer transfer modal

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/singleproduct/TransferSearchModalPublic.jsx:3-10`
- Modify: `src/app/components/Pages/FRONT_END/singleproduct/TransferSearchModalPublic.jsx:234-240`
- Modify: `src/app/components/Pages/FRONT_END/singleproduct/__tests__/TransferSearchModalPublic.test.jsx:20-70`

- [ ] **Step 1: Update the modal test first**

Replace its Select mock with the native adapter from Task 1. After selecting the two locations, replace the native time-input interaction with:

```jsx
const confirmButton = screen.getByRole('button', { name: /confirm transfer/i });
expect(confirmButton).toBeDisabled();
fireEvent.change(screen.getByLabelText('Pickup hour'), { target: { value: '09' } });
fireEvent.change(screen.getByLabelText('Pickup minute'), { target: { value: '30' } });
expect(confirmButton).toBeDisabled();
fireEvent.change(screen.getByLabelText('Pickup period'), { target: { value: 'PM' } });
expect(confirmButton).toBeEnabled();
fireEvent.click(confirmButton);
```

Change the submitted expectation to:

```jsx
start_time: '21:30',
```

- [ ] **Step 2: Verify the modal test is red**

Run:

```bash
npx jest src/app/components/Pages/FRONT_END/singleproduct/__tests__/TransferSearchModalPublic.test.jsx --runInBand
```

Expected: FAIL because the modal still renders the native time input.

- [ ] **Step 3: Replace only the native input**

Add:

```jsx
import TransferPickupTimePicker from './TransferPickupTimePicker';
```

Replace the `Pickup Time` label and native input with:

```jsx
{
  /* Pickup Time */
}
<TransferPickupTimePicker value={pickupTime} onChange={setPickupTime} />;
```

Keep `Input` imported for search. Keep the existing `pickupTime` state, reset paths, validation expression, and `start_time` payload unchanged.

- [ ] **Step 4: Verify both suites are green**

Run:

```bash
npx jest src/app/components/Pages/FRONT_END/singleproduct/__tests__/TransferPickupTimePicker.test.jsx src/app/components/Pages/FRONT_END/singleproduct/__tests__/TransferSearchModalPublic.test.jsx --runInBand
```

Expected: PASS with both suites and all tests.

- [ ] **Step 5: Run the required post-change sequence for modal integration**

Invoke `error-handling-patterns`, then run type-check, lint, the two focused suites, and `src/app/__tests__/deepForestTheme.test.js`. Open the actual Configure Transfer stage in the headed local browser and verify the control loads, each real Radix menu opens, confirmation remains disabled for partial time, and there is no desktop or mobile overflow. Do not defer any integration finding to the final gate.

### Task 4: Complete quality, review, browser, and delivery gates

**Files:**

- Verify all four implementation and test files from Tasks 1-3.

- [ ] **Step 1: Apply the error-handling review**

Invoke `error-handling-patterns`. Confirm there is no new asynchronous failure path, malformed external values return the empty state, and incomplete parts cannot produce a submit-ready value. Make only findings-driven changes.

- [ ] **Step 2: Run static verification**

Run:

```bash
npm run type-check
npm run lint
git diff --check
```

Expected: all commands exit 0 without type, lint, dark-mode guard, or whitespace errors.

- [ ] **Step 3: Run relevant automated tests**

Run:

```bash
npx jest src/app/components/Pages/FRONT_END/singleproduct/__tests__/TransferPickupTimePicker.test.jsx src/app/components/Pages/FRONT_END/singleproduct/__tests__/TransferSearchModalPublic.test.jsx src/app/components/Pages/FRONT_END/singleproduct/__tests__/ItineraryPanel.test.jsx src/app/__tests__/deepForestTheme.test.js --runInBand
```

Expected: all selected suites pass.

- [ ] **Step 4: Verify the real customer flow in the visible local browser**

Use the headed named browser session at `http://localhost:3000`. Authenticate through the configured safe test session, open a public itinerary, choose Customize, add a transfer, and enter Configure Transfer. Check desktop, narrow mobile, light, and dark states for:

- no native time input;
- themed hour, minute, and AM/PM triggers without horizontal overflow;
- menus contained within the dialog viewport;
- visible keyboard focus;
- disabled confirmation until all time parts are selected;
- `09`, `30`, `PM` enabling confirmation and adding `21:30`;
- closing and Back resetting the picker.

- [ ] **Step 5: Run the mandatory review and simplify loop**

Dispatch the code-reviewer agent against the diff and approved spec. Address every blocking finding, document any explicitly rejected non-blocking suggestion with technical reasoning, rerun tests, and re-review the complete updated diff until the reviewer approves it. Then invoke `simplify` if available; because it is absent from the current catalog, otherwise perform and document the closest clarity/reuse/efficiency review without expanding scope. If either review changes UI code or behavior, repeat the headed desktop/mobile/light/dark browser verification before final verification.

- [ ] **Step 6: Re-run final verification**

Run:

```bash
npm run type-check
npm run lint
npx jest src/app/components/Pages/FRONT_END/singleproduct/__tests__/TransferPickupTimePicker.test.jsx src/app/components/Pages/FRONT_END/singleproduct/__tests__/TransferSearchModalPublic.test.jsx src/app/components/Pages/FRONT_END/singleproduct/__tests__/ItineraryPanel.test.jsx src/app/__tests__/deepForestTheme.test.js --runInBand
git diff --check
git status --short
```

Expected: checks pass and only the intended picker, modal, tests, and plan are changed.

- [ ] **Step 7: Commit and push the verified frontend change to main**

Confirm the branch is `main`, stage only intended files, then run:

```bash
git commit -m "feat: theme transfer pickup time picker"
git status --short
git rev-parse HEAD
git push origin main
git ls-remote origin refs/heads/main
```

Expected: the worktree is clean after commit hooks before any push occurs, the implementation commit is present on frontend `main`, and the local HEAD SHA matches the SHA reported for remote `refs/heads/main`. If hooks change files, stop before pushing, inspect and stage only intended changes, rerun the final verification commands, and recommit before rechecking cleanliness.
