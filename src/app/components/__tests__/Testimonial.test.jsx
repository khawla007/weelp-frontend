import { render, screen } from '@testing-library/react';
import Testimonial from '../Testimonial';

describe('Testimonial', () => {
  it('groups metadata above a full-width identity block for long names', () => {
    const { container } = render(
      <Testimonial
        username="Gurmeet Singh With A Long Traveler Name"
        itemName="Burj Khalifa At The Top Experience with Sky Views and Dinner"
        title="The entry timing was clear and the view was exactly what we hoped for."
        rating={5}
        date="2026-07-04"
      />,
    );

    const metadataGroup = screen.getByRole('group', { name: 'Review metadata' });
    const identityGroup = screen.getByRole('group', {
      name: 'Traveler and reviewed item',
    });
    const avatar = screen.getByRole('img', {
      name: 'Gurmeet Singh With A Long Traveler Name avatar',
    });
    const travelerName = screen.getByRole('heading', {
      name: /Gurmeet Singh With A Long Traveler Name/i,
    });
    const itemName = screen.getByText('Burj Khalifa At The Top Experience with Sky Views and Dinner');
    const reviewText = screen.getByText('The entry timing was clear and the view was exactly what we hoped for.');
    const ratingMetadata = screen.getByRole('img', { name: '5 out of 5 stars' });
    const reviewDate = screen.getByText('2026-07-04');

    expect(metadataGroup).toHaveClass('justify-between');
    expect(metadataGroup).toContainElement(avatar);
    expect(metadataGroup).toContainElement(ratingMetadata);
    expect(metadataGroup).toContainElement(reviewDate);
    expect(reviewDate).toHaveClass('whitespace-nowrap');
    expect(ratingMetadata.parentElement).toHaveClass('shrink-0');
    expect(metadataGroup).not.toContainElement(travelerName);
    expect(identityGroup).toContainElement(travelerName);
    expect(identityGroup).toContainElement(itemName);
    expect(identityGroup).toHaveClass('w-full', 'min-w-0');
    expect(metadataGroup.nextElementSibling).toBe(identityGroup);
    expect(travelerName).toHaveClass('break-words');
    expect(travelerName).not.toHaveClass('line-clamp-1');
    expect(travelerName).not.toHaveClass('line-clamp-2');
    expect(itemName).toHaveClass('break-words');
    expect(itemName).not.toHaveClass('line-clamp-1');
    expect(itemName).not.toHaveClass('line-clamp-2');
    expect(reviewText).toHaveClass('line-clamp-3');
    expect(container.querySelector('[data-public-card="testimonial"]')).toHaveClass('rounded-[24px]');
  });

  it('keeps fallback content usable when optional metadata is missing', () => {
    render(<Testimonial />);

    expect(screen.getByRole('img', { name: 'Anonymous avatar' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Anonymous/i })).toBeInTheDocument();
    expect(screen.getByText('Great experience!')).toHaveClass('line-clamp-3');
    expect(screen.queryByRole('img', { name: /out of 5 stars/i })).not.toBeInTheDocument();
  });

  it('normalizes ratings before rendering the label and filled stars', () => {
    const { rerender } = render(<Testimonial rating={4.5} />);

    const roundedRating = screen.getByRole('img', { name: '5 out of 5 stars' });
    expect(roundedRating.querySelectorAll('svg')).toHaveLength(5);

    rerender(<Testimonial rating={3.2} />);
    const standardRating = screen.getByRole('img', { name: '3 out of 5 stars' });
    expect(standardRating.querySelectorAll('svg')).toHaveLength(3);

    rerender(<Testimonial rating="4" />);
    const numericStringRating = screen.getByRole('img', { name: '4 out of 5 stars' });
    expect(numericStringRating.querySelectorAll('svg')).toHaveLength(4);

    rerender(<Testimonial rating={12} />);
    const cappedRating = screen.getByRole('img', { name: '5 out of 5 stars' });
    expect(cappedRating.querySelectorAll('svg')).toHaveLength(5);

    rerender(<Testimonial rating="not-a-rating" />);
    expect(screen.queryByRole('img', { name: /out of 5 stars/i })).not.toBeInTheDocument();

    rerender(<Testimonial rating={-2} />);
    expect(screen.queryByRole('img', { name: /out of 5 stars/i })).not.toBeInTheDocument();
  });
});
