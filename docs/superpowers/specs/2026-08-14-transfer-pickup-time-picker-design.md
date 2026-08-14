# Transfer Pickup Time Picker Design

## What this changes

The customer itinerary “Configure Transfer” dialog will replace its native browser time input with a Weelp-themed segmented picker. Customers will choose an hour, an exact minute, and an AM/PM period from three compact selects beneath the existing “Pickup Time” label.

The control will use the dialog's existing form spacing, Weelp's sage accents, rounded borders, muted supporting text, and visible keyboard focus states. It will fit on one row at typical dialog widths and remain usable without horizontal overflow on narrow mobile screens. Light and dark themes will use the existing semantic color tokens rather than fixed page colors.

## Interaction and value contract

The picker starts empty, matching the current required-field behavior. Its three parts use these option sets:

- Hour: `01` through `12`
- Minute: `00` through `59`
- Period: `AM` and `PM`

The parent form receives an empty string until all three parts are selected. Once complete, the picker converts the choice to the existing 24-hour `HH:mm` value. For example, `09`, `30`, and `PM` becomes `21:30`; `12:00 AM` becomes `00:00`; and `12:00 PM` remains `12:00`.

Changing any completed part immediately emits the newly converted time. Clearing or resetting the transfer dialog clears all three parts. The existing “Confirm Transfer” action remains disabled until pickup location, drop-off location, and a complete pickup time are present. Submission continues to store the converted value in the transfer's `start_time` field; no API or backend contract changes.

## Component boundary

A focused pickup-time component will own the three select controls, their partial selection state, formatting, and 12-to-24-hour conversion. It will accept the current `HH:mm` value and an `onChange` callback, so the transfer dialog remains responsible only for overall form state and submission.

The picker will use the shared Radix-backed `Select` components already used throughout the frontend. Each trigger will have an accessible name that identifies its purpose: pickup hour, pickup minute, and pickup period. The visible clock icon is decorative. This keeps keyboard selection, focus management, and screen-reader behavior aligned with existing Weelp controls.

The standalone Transfers page already contains a similar segmented selector. This change will follow that established interaction and color direction without refactoring the separate search form as part of this task.

## Failure paths worth knowing

There is no network request inside the picker. An incomplete selection remains an empty form value, so it cannot accidentally submit a partial time. If the parent supplies an empty or malformed value, the picker displays its empty placeholders rather than inventing a default time.

The option lists stay inside the shared select popovers and use their existing collision handling. On small screens, the control row may tighten its gaps and trigger widths, but it will not replace the selectors with a native input or horizontal scroller.

## Verification

Component tests will verify that the picker starts empty, does not emit a complete time from a partial selection, converts AM/PM edge cases correctly, and updates an already completed selection. The transfer modal test will continue to exercise the full customer flow and assert that choosing `09:30 PM` submits `start_time: '21:30'`.

After the focused tests pass, the frontend will run type-check and lint. The local customer itinerary flow will then be checked in the named visible browser at desktop and narrow mobile widths. Verification will cover the empty required state, all three menus, keyboard focus, confirmation enablement, submitted value, and light/dark theme presentation.
