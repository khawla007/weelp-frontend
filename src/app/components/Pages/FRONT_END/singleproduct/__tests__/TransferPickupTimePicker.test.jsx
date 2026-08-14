import { fireEvent, render, screen, within } from '@testing-library/react';

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
    expect(within(screen.getByLabelText('Pickup hour')).getByRole('option', { name: '01' })).toBeInTheDocument();
    expect(within(screen.getByLabelText('Pickup hour')).getByRole('option', { name: '12' })).toBeInTheDocument();
    expect(within(screen.getByLabelText('Pickup minute')).getByRole('option', { name: '00' })).toBeInTheDocument();
    expect(within(screen.getByLabelText('Pickup minute')).getByRole('option', { name: '59' })).toBeInTheDocument();
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
