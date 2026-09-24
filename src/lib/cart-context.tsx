'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from './types';

export interface CartItem {
  product: Product;
  quantity: number;
  payDownPaymentOnly: boolean; // Se true, o cliente paga apenas o valor da entrada agora
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, payDownPaymentOnly?: boolean) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  toggleDownPayment: (productId: string, payDownPaymentOnly: boolean) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  totalPaidNow: number;
  totalBalanceLater: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('rl_diecast_cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('rl_diecast_cart', JSON.stringify(items));
      } catch (e) {
        console.error(e);
      }
    }
  }, [items, isLoaded]);

  const addToCart = (product: Product, quantity = 1, payDownPaymentOnly = true) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { product, quantity, payDownPaymentOnly: product.isPreOrder ? payDownPaymentOnly : false }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const toggleDownPayment = (productId: string, payDownPaymentOnly: boolean) => {
    setItems((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, payDownPaymentOnly } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = items.reduce((acc, item) => acc + item.product.salePrice * item.quantity, 0);

  const totalPaidNow = items.reduce((acc, item) => {
    if (item.product.isPreOrder && item.payDownPaymentOnly) {
      return acc + (item.product.downPaymentValue || 15) * item.quantity;
    }
    return acc + item.product.salePrice * item.quantity;
  }, 0);

  const totalBalanceLater = items.reduce((acc, item) => {
    if (item.product.isPreOrder && item.payDownPaymentOnly) {
      const balance = item.product.salePrice - (item.product.downPaymentValue || 15);
      return acc + balance * item.quantity;
    }
    return acc;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleDownPayment,
        clearCart,
        totalItems,
        subtotal,
        totalPaidNow,
        totalBalanceLater,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
