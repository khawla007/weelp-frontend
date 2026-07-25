import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import GalleryLightbox from '../GalleryLightbox';

const images = [
  { src: '/api/media/1', alt: 'Dubai skyline' },
  { src: '/api/media/2', alt: 'Dubai creek' },
  { src: '/api/media/3', alt: 'Dubai desert' },
];

describe('GalleryLightbox', () => {
  it('opens on the requested image and returns focus to its trigger', async () => {
    render(<GalleryLightbox images={images} initialIndex={1} />);

    const trigger = screen.getByRole('button', { name: 'See all 3 photos' });
    fireEvent.click(trigger);

    expect(screen.getByRole('dialog', { name: 'Photo gallery' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Dubai creek' })).toBeInTheDocument();
    expect(screen.getByText('2 of 3')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('renders its overlay and content above the sticky site header', () => {
    render(<GalleryLightbox images={images} initialIndex={0} />);
    fireEvent.click(screen.getByRole('button', { name: 'See all 3 photos' }));

    expect(document.querySelector('[data-state="open"].fixed.inset-0')).toHaveClass('!z-[100000]');
    expect(screen.getByRole('dialog', { name: 'Photo gallery' })).toHaveClass('!z-[100001]');
  });

  it('closes with Escape and returns focus to its trigger', async () => {
    render(<GalleryLightbox images={images} initialIndex={0} />);
    const trigger = screen.getByRole('button', { name: 'See all 3 photos' });
    fireEvent.click(trigger);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('dialog', { name: 'Photo gallery' })).not.toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('closes when the modal overlay is selected', async () => {
    render(<GalleryLightbox images={images} initialIndex={0} />);
    fireEvent.click(screen.getByRole('button', { name: 'See all 3 photos' }));

    const overlay = document.querySelector('[data-state="open"].fixed.inset-0');
    await new Promise((resolve) => setTimeout(resolve, 0));
    fireEvent.pointerDown(overlay, { pointerType: 'mouse' });
    fireEvent.click(overlay);

    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Photo gallery' })).not.toBeInTheDocument());
  });

  it('wraps previous and next navigation and supports Arrow keys', () => {
    render(<GalleryLightbox images={images} initialIndex={0} />);
    fireEvent.click(screen.getByRole('button', { name: 'See all 3 photos' }));

    fireEvent.click(screen.getByRole('button', { name: 'Previous photo' }));
    expect(screen.getByRole('img', { name: 'Dubai desert' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Next photo' }));
    expect(screen.getByRole('img', { name: 'Dubai skyline' })).toBeInTheDocument();

    const dialog = screen.getByRole('dialog', { name: 'Photo gallery' });
    fireEvent.keyDown(dialog, { key: 'ArrowLeft' });
    expect(screen.getByRole('img', { name: 'Dubai desert' })).toBeInTheDocument();

    fireEvent.keyDown(dialog, { key: 'ArrowRight' });
    expect(screen.getByRole('img', { name: 'Dubai skyline' })).toBeInTheDocument();
  });

  it('selects a photo from the thumbnail rail', () => {
    render(<GalleryLightbox images={images} initialIndex={0} />);
    fireEvent.click(screen.getByRole('button', { name: 'See all 3 photos' }));
    fireEvent.click(screen.getByRole('button', { name: 'View photo 3' }));

    expect(screen.getByRole('img', { name: 'Dubai desert' })).toBeInTheDocument();
    expect(screen.getByText('3 of 3')).toBeInTheDocument();
  });

  it.each([
    [-4, 'Dubai skyline'],
    [99, 'Dubai desert'],
    [Number.NaN, 'Dubai skyline'],
  ])('clamps an invalid initial index %s', (initialIndex, expectedAlt) => {
    render(<GalleryLightbox images={images} initialIndex={initialIndex} />);
    fireEvent.click(screen.getByRole('button', { name: 'See all 3 photos' }));
    expect(screen.getByRole('img', { name: expectedAlt })).toBeInTheDocument();
  });
});
