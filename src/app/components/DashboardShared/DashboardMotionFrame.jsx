'use client';

/**
 * DashboardMotionFrame — quiet CSS-at-paint fade-up for dashboard content.
 *
 * Applies the shared `weelpFadeUp` keyframe (via `.weelp-dashboard-frame`) at
 * first paint. No IntersectionObserver and no hydration gate, so above-fold
 * dashboard content never blinks in late. Use it to wrap a page's content
 * region. For below-fold scroll reveal use `Reveal` instead.
 *
 * Reduced motion is handled globally by the `.weelp-dashboard-frame` entry in
 * the `prefers-reduced-motion` block in globals.css.
 *
 * @param {React.ElementType} as - element/tag to render (default 'div')
 * @param {string} duration - CSS time for --weelp-motion-duration (default '180ms')
 * @param {string} delay - CSS time for --weelp-motion-delay (default '0ms')
 * @param {string} className - extra classes merged after the frame class
 */
export function DashboardMotionFrame({ as: Tag = 'div', duration = '180ms', delay = '0ms', className = '', style, children, ...props }) {
  return (
    <Tag
      className={`weelp-dashboard-frame ${className}`}
      // Motion vars first, then caller style — a caller can still extend style
      // without clobbering the duration/delay that drive the animation.
      style={{ '--weelp-motion-duration': duration, '--weelp-motion-delay': delay, ...style }}
      {...props}
    >
      {children}
    </Tag>
  );
}

export default DashboardMotionFrame;
