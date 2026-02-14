import React, { createContext, useContext, useState, useCallback } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface FoodOrderContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  isItemInCart: (itemId: string) => boolean;
  getCartCount: () => number;
}

const FoodOrderContext = createContext<FoodOrderContextType | undefined>(undefined);

export function FoodOrderProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = useCallback((item: CartItem) => {
    setCartItems(prev => {
      const existingItem = prev.find(i => i.id === item.id);
      if (existingItem) {
        return prev.filter(i => i.id !== item.id);
      }
      return [...prev, item];
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCartItems(prev => prev.filter(i => i.id !== itemId));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const isItemInCart = useCallback((itemId: string) => {
    return cartItems.some(i => i.id === itemId);
  }, [cartItems]);

  const getCartCount = useCallback(() => {
    return cartItems.length;
  }, [cartItems]);

  return (
    <FoodOrderContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        isItemInCart,
        getCartCount,
      }}
    >
      {children}
    </FoodOrderContext.Provider>
  );
}

export function useFoodOrder() {
  const context = useContext(FoodOrderContext);
  if (!context) {
    throw new Error('useFoodOrder must be used within FoodOrderProvider');
  }
  return context;
}
