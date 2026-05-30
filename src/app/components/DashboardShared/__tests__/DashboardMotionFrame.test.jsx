import { render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DashboardMotionFrame } from '../DashboardMotionFrame';

describe('DashboardMotionFrame', () => {
  it('renders children and applies the frame class', () => {
    render(<DashboardMotionFrame>hello</DashboardMotionFrame>);
    const el = screen.getByText('hello');
    expect(el).toHaveClass('weelp-dashboard-frame');
  });

  it('merges custom className and sets duration/delay CSS vars', () => {
    render(
      <DashboardMotionFrame className="p-4 space-y-6" duration="160ms" delay="40ms">
        body
      </DashboardMotionFrame>,
    );
    const el = screen.getByText('body');
    expect(el).toHaveClass('weelp-dashboard-frame', 'p-4', 'space-y-6');
    expect(el.style.getPropertyValue('--weelp-motion-duration')).toBe('160ms');
    expect(el.style.getPropertyValue('--weelp-motion-delay')).toBe('40ms');
  });

  it('renders the requested element via `as`', () => {
    render(<DashboardMotionFrame as="section">sec</DashboardMotionFrame>);
    expect(screen.getByText('sec').tagName).toBe('SECTION');
  });

  it('is SSR-safe (renders markup on the server without throwing)', () => {
    const html = renderToStaticMarkup(<DashboardMotionFrame>ssr</DashboardMotionFrame>);
    expect(html).toContain('weelp-dashboard-frame');
    expect(html).toContain('ssr');
  });
});
