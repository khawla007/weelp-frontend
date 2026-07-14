import { buildCheckoutSelection } from './selection';

describe('buildCheckoutSelection', () => {
  it('returns only server-priceable selection fields', () => {
    const selection = buildCheckoutSelection({
      id: 7,
      type: 'activity',
      price: 1,
      base_price: 1,
      name: 'Client-only title',
      currency: 'USD',
      dateRange: { from: new Date(2030, 4, 10) },
      howMany: { adults: 3, children: 1 },
      addons: [
        { addon_id: 4, addon_name: 'Client name', price: 0.01 },
        { addon_id: null, addon_name: 'Ignored' },
      ],
    });

    expect(selection).toEqual({
      order_type: 'activity',
      orderable_id: 7,
      travel_date: '2030-05-10',
      preferred_time: '09:00:00',
      number_of_adults: 3,
      number_of_children: 1,
      variation_id: undefined,
      addon_ids: [4],
      bag_count: undefined,
      waiting_minutes: undefined,
      currency: 'usd',
    });
    expect(selection).not.toHaveProperty('price');
    expect(selection).not.toHaveProperty('base_amount');
    expect(selection).not.toHaveProperty('addon_name');
  });

  it('includes transfer quantities without trusting stored rates', () => {
    const selection = buildCheckoutSelection({
      id: 9,
      type: 'transfer',
      dateRange: { from: '2030-08-20T09:30:00' },
      howMany: { adults: 2, children: 0 },
      bag_count: 3,
      waiting_minutes: 15,
      luggage_per_bag_rate: 999,
    });

    expect(selection).toEqual(expect.objectContaining({ bag_count: 3, waiting_minutes: 15 }));
    expect(selection).not.toHaveProperty('luggage_per_bag_rate');
  });
});
