import React from 'react';
import { render, screen } from '@testing-library/react';

import { QuickActions } from '../quick-actions';

describe('QuickActions', () => {
  it('renders each Get Started cue as plain text instead of a button', () => {
    render(<QuickActions />);

    const cues = screen.getAllByText('Get Started →');

    expect(cues).toHaveLength(3);
    for (const cue of cues) {
      expect(cue.tagName).toBe('SPAN');
    }
    expect(screen.queryByRole('button', { name: 'Get Started →' })).not.toBeInTheDocument();

    const expectedActions = [
      ['Manage Users', '/dashboard/admin/users'],
      ['System Settings', '/dashboard/admin/settings'],
      ['Add New Activity', '/dashboard/admin/activities'],
    ];

    for (const [title, href] of expectedActions) {
      expect(screen.getByText(title).closest('a')).toHaveAttribute('href', href);
    }
  });
});
