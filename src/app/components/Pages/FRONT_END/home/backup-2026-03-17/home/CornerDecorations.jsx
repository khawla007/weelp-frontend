'use client';

/**
 * CornerDecorations - Animated corner images for Featured Destinations section
 * Uses PNG images from reference website with CSS animations
 * Hidden on mobile and tablet, visible on xl screens and above
 *
 * Images:
 * - Top Left: Passport (movingX animation)
 * - Top Right: Straw Hat (jump animation)
 * - Bottom Left: Life Preserver (spin animation)
 * - Bottom Right: Compass (movingX animation)
 */

const cornerImages = [
  {
    src: '/assets/images/decorations/shape-passport.png',
    style: { top: '5%', left: '-5%' },
    animation: 'movingX 8s linear infinite',
    className: 'shape-mockup movingX',
  },
  {
    src: '/assets/images/decorations/shape-hat.png',
    style: { top: '8%', right: '-3%' },
    animation: 'jump 7s linear infinite',
    className: 'shape-mockup jump',
  },
  {
    src: '/assets/images/decorations/shape-lifering.png',
    style: { bottom: '0%', left: '-5%' },
    animation: 'spin 10s linear infinite',
    className: 'shape-mockup spin',
  },
  {
    src: '/assets/images/decorations/shape-compass.png',
    style: { right: '-5%', bottom: '-1%' },
    animation: 'movingX 8s linear infinite',
    className: 'shape-mockup movingX',
  },
];

export function CornerDecorations() {
  return (
    <>
      {cornerImages.map((image, index) => (
        <div
          key={index}
          className={`hidden xl:block ${image.className}`}
          style={{
            position: 'absolute',
            ...image.style,
            animation: image.animation,
            width: '80px',
            height: '80px',
          }}
        >
          <img
            src={image.src}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              opacity: '0.7',
            }}
          />
        </div>
      ))}

      {/* CSS Animations matching reference website */}
      <style jsx>{`
        @keyframes movingX {
          0% {
            transform: translateX(0px);
          }
          50% {
            transform: translateX(50px);
          }
          100% {
            transform: translateX(0px);
          }
        }

        @keyframes jump {
          0% {
            transform: translateY(0px);
          }
          40% {
            transform: translateY(-30px);
          }
          100% {
            transform: translateY(0px);
          }
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .shape-mockup {
          pointer-events: none;
          z-index: 10;
        }
      `}</style>
    </>
  );
}
