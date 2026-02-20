import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useMiniCartStore = create(
  persist(
    (set) => ({
      isMiniCartOpen: false,
      cartItems: [], // Store cart items
      totalPrice: 0, // Store total price

      // Toggle MiniCart
      toggleMiniCart: () => set((state) => ({ isMiniCartOpen: !state.isMiniCartOpen })),
      setMiniCartOpen: (value) => set({ isMiniCartOpen: value }),

      // Add item to cart with quantity handling
      addItem: (newItem) =>
        set((state) => {
          const existingItemIndex = state.cartItems.findIndex((item) => item.id === newItem.id);

          let updatedCart;

          if (existingItemIndex !== -1) {
            // Merge variations (adults, children, etc.), but do not change price
            updatedCart = [...state.cartItems];
            updatedCart[existingItemIndex] = {
              ...updatedCart[existingItemIndex],
              ...newItem, // Merge new data
              price: updatedCart[existingItemIndex].price, // Keep original price
            };
          } else {
            // Add new item to cart
            updatedCart = [...state.cartItems, { ...newItem }];
          }

          // Calculate new total price correctly by converting price to a number
          const updatedTotalPrice = updatedCart.reduce(
            (acc, item) => acc + Number(item.price), // Convert to number before adding
            0,
          );

          return { cartItems: updatedCart, totalPrice: updatedTotalPrice };
        }),

      // Remove item from cart
      removeItem: (id) =>
        set((state) => {
          const updatedCart = state.cartItems.filter((item) => item.id !== id);
          // Calculate new total price correctly by converting price to a number
          const updatedTotalPrice = updatedCart.reduce(
            (acc, item) => acc + Number(item.price), // Convert to number before adding
            0,
          );

          return { cartItems: updatedCart, totalPrice: updatedTotalPrice };
        }),

      // Clear cart
      clearCart: () => set({ cartItems: [], totalPrice: 0 }),
    }),
    {
      name: 'cart-store',
    },
  ),
);

export default useMiniCartStore;
