import useMiniCartStore from './useMiniCartStore';

const resetCartStore = () => {
  localStorage.clear();
  useMiniCartStore.setState({
    isMiniCartOpen: false,
    cartItems: [],
    totalPrice: 0,
  });
};

describe('useMiniCartStore', () => {
  beforeEach(() => {
    resetCartStore();
  });

  it('keeps only the latest booking when adding a new valid item', () => {
    const firstItem = {
      id: 101,
      type: 'activity',
      name: 'Dubai Desert Safari',
      price: 240,
    };
    const secondItem = {
      id: 202,
      type: 'itinerary',
      name: 'Marseille Food Walk',
      price: 315.456,
    };

    useMiniCartStore.getState().addItem(firstItem);
    useMiniCartStore.getState().addItem(secondItem);

    expect(useMiniCartStore.getState().cartItems).toEqual([
      {
        ...secondItem,
        price: 315.46,
      },
    ]);
    expect(useMiniCartStore.getState().totalPrice).toBe(315.46);
  });
});
