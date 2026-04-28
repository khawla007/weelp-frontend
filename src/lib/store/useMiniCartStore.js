import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const safeAmount = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) && num >= 0 ? num : fallback;
};

const round2 = (value) => Math.round(safeAmount(value) * 100) / 100;

const sumLinePrices = (items) => round2(items.reduce((acc, item) => acc + safeAmount(item.price), 0));

const recomputeTransferLine = (item, patch) => {
  const bagCount = Math.max(0, Math.trunc(safeAmount(patch.bag_count ?? item.bag_count)));
  const waitingMinutes = Math.max(0, Math.trunc(safeAmount(patch.waiting_minutes ?? item.waiting_minutes)));

  const luggageRate = safeAmount(item.luggage_per_bag_rate);
  const waitingRate = safeAmount(item.waiting_per_minute_rate);
  const basePrice = safeAmount(item.base_price ?? item.price);

  const luggageAmount = round2(luggageRate * bagCount);
  const waitingAmount = round2(waitingRate * waitingMinutes);
  const price = round2(basePrice + luggageAmount + waitingAmount);

  return {
    ...item,
    bag_count: bagCount,
    waiting_minutes: waitingMinutes,
    luggage_amount: luggageAmount,
    waiting_amount: waitingAmount,
    price,
  };
};

const useMiniCartStore = create(
  persist(
    (set) => ({
      isMiniCartOpen: false,
      cartItems: [],
      totalPrice: 0,

      toggleMiniCart: () => set((state) => ({ isMiniCartOpen: !state.isMiniCartOpen })),
      setMiniCartOpen: (value) => set({ isMiniCartOpen: value }),

      addItem: (newItem) =>
        set((state) => {
          if (!Number.isFinite(Number(newItem?.price)) || Number(newItem.price) < 0) {
            return state;
          }

          const normalized = { ...newItem, price: round2(newItem.price) };
          const existingItemIndex = state.cartItems.findIndex((item) => item.id === normalized.id);

          let updatedCart;
          if (existingItemIndex !== -1) {
            updatedCart = [...state.cartItems];
            updatedCart[existingItemIndex] = {
              ...updatedCart[existingItemIndex],
              ...normalized,
              price: updatedCart[existingItemIndex].price,
            };
          } else {
            updatedCart = [...state.cartItems, normalized];
          }

          return { cartItems: updatedCart, totalPrice: sumLinePrices(updatedCart) };
        }),

      // Update fields on an existing cart line. For transfers, accepts only
      // { bag_count, waiting_minutes } and recomputes price from stored rates so
      // the caller cannot inject arbitrary amounts. For other types, performs a
      // plain merge (price-driving logic lives in the relevant product flow).
      updateItem: (id, patch = {}) =>
        set((state) => {
          const index = state.cartItems.findIndex((item) => item.id === id);
          if (index === -1) return state;

          const existing = state.cartItems[index];
          let updated;

          if (existing.type === 'transfer') {
            updated = recomputeTransferLine(existing, patch);
          } else {
            const merged = { ...existing, ...patch };
            updated = { ...merged, price: round2(merged.price) };
          }

          if (!Number.isFinite(updated.price) || updated.price < 0) {
            return state;
          }

          const updatedCart = [...state.cartItems];
          updatedCart[index] = updated;
          return { cartItems: updatedCart, totalPrice: sumLinePrices(updatedCart) };
        }),

      removeItem: (id) =>
        set((state) => {
          const updatedCart = state.cartItems.filter((item) => item.id !== id);
          return { cartItems: updatedCart, totalPrice: sumLinePrices(updatedCart) };
        }),

      clearCart: () => set({ cartItems: [], totalPrice: 0 }),
    }),
    {
      name: 'cart-store',
    },
  ),
);

export default useMiniCartStore;
