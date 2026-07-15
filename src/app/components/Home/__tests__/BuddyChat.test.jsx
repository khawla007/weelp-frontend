import { fireEvent, render, screen, within } from '@testing-library/react';
import { useState } from 'react';

import BuddyChat from '../BuddyChat';

const PRESETS = ['Weekend in Paris', '3 days in Tokyo', 'Iceland ring road'];

const renderBuddyChat = (props = {}) => {
  const sendMessage = jest.fn();

  render(<BuddyChat messages={[]} isThinking={false} sendMessage={sendMessage} presets={PRESETS} {...props} />);

  return { sendMessage };
};

const BuddyChatHarness = () => {
  const [messages, setMessages] = useState([]);

  const sendMessage = (text) => {
    setMessages((current) => [...current, { id: current.length + 1, role: 'user', text: text.trim() }]);
  };

  return <BuddyChat messages={messages} isThinking={false} sendMessage={sendMessage} presets={PRESETS} />;
};

describe('BuddyChat', () => {
  it('submits direct free text with Enter and clears the textbox', () => {
    const { sendMessage } = renderBuddyChat();
    const input = screen.getByRole('textbox', { name: 'Message Buddy' });
    const submit = screen.getByRole('button', { name: 'Send message' });

    expect(submit).toBeDisabled();

    fireEvent.change(input, { target: { value: 'Plan a relaxed weekend in Lisbon' } });
    expect(submit).toBeEnabled();

    fireEvent.keyDown(input, { key: 'Enter' });

    expect(sendMessage).toHaveBeenCalledWith('Plan a relaxed weekend in Lisbon');
    expect(input).toHaveValue('');
    expect(submit).toBeDisabled();
  });

  it('keeps the labeled textbox usable after a preset prompt rerenders the conversation', () => {
    render(<BuddyChatHarness />);

    fireEvent.click(screen.getByRole('button', { name: 'Weekend in Paris' }));

    const log = screen.getByRole('log', { name: 'Conversation with Buddy' });
    expect(within(log).getByText('Weekend in Paris')).toBeInTheDocument();

    const input = screen.getByRole('textbox', { name: 'Message Buddy' });
    fireEvent.change(input, { target: { value: 'Draft to replace' } });
    expect(input).toHaveValue('Draft to replace');

    fireEvent.change(input, { target: { value: '' } });
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled();

    fireEvent.change(input, { target: { value: 'Replace that with a custom Kyoto food walk' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));

    expect(within(log).getByText('Replace that with a custom Kyoto food walk')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Message Buddy' })).toHaveValue('');
  });

  it('exposes loading state and blocks submit while Buddy is thinking', () => {
    const { sendMessage } = renderBuddyChat({
      messages: [{ id: 1, role: 'user', text: 'Weekend in Paris' }],
      isThinking: true,
    });

    const log = screen.getByRole('log', { name: 'Conversation with Buddy' });
    expect(log).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByLabelText('Buddy is thinking')).toBeInTheDocument();

    const input = screen.getByRole('textbox', { name: 'Message Buddy' });
    fireEvent.change(input, { target: { value: 'Custom message while loading' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));

    expect(sendMessage).not.toHaveBeenCalled();
  });
});
