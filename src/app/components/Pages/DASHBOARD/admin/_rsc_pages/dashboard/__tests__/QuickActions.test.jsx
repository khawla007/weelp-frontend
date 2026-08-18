import React from 'react';
import { render, screen } from '@testing-library/react';

import { QuickActions } from '../quick-actions';

describe('QuickActions', () => {
  it('renders each compact Open cue as plain text instead of a button', () => {
    render(<QuickActions />);

    expect(screen.getByRole('region', { name: 'Quick actions' }).firstChild).toHaveClass('rounded-[15px]', 'border', 'border-border', 'bg-card', 'p-[15px]');
    expect(screen.getByTestId('quick-actions-grid')).toHaveClass('grid-cols-3');
    expect(screen.getByTestId('quick-actions-grid')).not.toHaveClass('sm:grid-cols-3');
    expect(screen.getByText('Manage →')).toBeInTheDocument();
    const cues = screen.getAllByText('Open →');

    expect(cues).toHaveLength(3);
    for (const cue of cues) {
      expect(cue.tagName).toBe('SPAN');
      expect(cue.closest('a')).toHaveClass('rounded-[11px]', 'p-[11px]');
    }
    expect(screen.queryByRole('button', { name: 'Open →' })).not.toBeInTheDocument();

    const expectedActions = [
      ['Add Activity', '/dashboard/admin/activities'],
      ['Manage Users', '/dashboard/admin/users'],
      ['Settings', '/dashboard/admin/settings'],
    ];

    for (const [title, href] of expectedActions) {
      expect(screen.getByText(title).closest('a')).toHaveAttribute('href', href);
    }
    expect(screen.getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual(expectedActions.map(([, href]) => href));
  });
});
