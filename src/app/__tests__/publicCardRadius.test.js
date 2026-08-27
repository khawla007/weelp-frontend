import fs from 'node:fs';
import path from 'node:path';

const publicCardInventory = [
  ['src/app/components/CityCard.jsx', ['weelp-destination-card']],
  ['src/app/components/Testimonial.jsx', ['data-public-card="testimonial"']],
  ['src/app/components/ReviewCard.jsx', ['data-public-card="review"', 'data-public-card="review-gallery"', 'data-public-card="single-review"']],
  ['src/app/components/Faq.jsx', ['data-public-card="faq-item"']],
  ['src/app/components/WhatAbout.jsx', ['data-public-card="city-facts"', 'data-public-card="region-facts"']],
  ['src/app/components/MiniCartProductCard.jsx', ['data-public-card="mini-cart-item"']],
  ['src/app/components/MiniCartReviewCard.jsx', ['data-public-card="mini-cart-recommendation"']],
  [
    'src/app/components/Pages/FRONT_END/checkout/CheckoutCards.jsx',
    ['data-public-card="checkout-total"', 'data-public-card="checkout-transfer"', 'data-public-card="checkout-item"', 'data-public-card="checkout-item-skeleton"'],
  ],
  ['src/app/components/Pages/FRONT_END/checkout/CheckoutResultState.jsx', ['data-public-card="checkout-result"']],
  ['src/app/components/Pages/FRONT_END/transfer/TransferResultCard.jsx', ['data-public-card="transfer-result"']],
  ['src/app/components/Pages/FRONT_END/Global/ReviewSection.jsx', ['data-public-card="city-review-panel"', 'data-public-card="region-review-panel"']],
  [
    'src/app/components/Pages/FRONT_END/singleproduct/SingleProductReview.jsx',
    ['data-public-card="review-summary"', 'data-public-card="review-empty"', 'data-public-card="review-entry"', 'data-public-card="review-skeleton"'],
  ],
  ['src/app/components/Pages/FRONT_END/singleproduct/ProductSidebar.jsx', ['data-public-card="booking-support"']],
  ['src/app/components/Pages/FRONT_END/About/AboutOffer.jsx', ['data-public-card="about-image"', 'data-public-card="about-copy"']],
  ['src/app/components/Pages/FRONT_END/home/AiSection.jsx', ['data-public-card="ai-savings"', 'data-public-card="ai-personalised"']],
  ['src/app/components/Home/TravelBuddyWidget.jsx', ['data-public-card="ai-chat"', 'data-public-card="ai-map"']],
];

test.each(publicCardInventory)('%s marks every inventoried outer public card', (relativePath, surfaceMarkers) => {
  const source = fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
  for (const marker of surfaceMarkers) expect(source).toContain(marker);
  expect(source).toContain('PUBLIC_CARD_RADIUS_CLASS');
});

test('dashboard card primitives are not coupled to the public radius', () => {
  const source = fs.readFileSync(path.join(process.cwd(), 'src/app/components/DashboardShared/ListingCard/ListingCard.jsx'), 'utf8');
  expect(source).not.toContain('PUBLIC_CARD_RADIUS_CLASS');
});
