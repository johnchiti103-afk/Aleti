import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface FoodItem {
  id: string;
  name: string;
  price: number;
  image: string;
  storeId: string;
  storeName: string;
}

export interface Stop {
  id: string;
  address: string;
  description?: string;
  foodIds: string[];
}

interface FoodOrderSessionState {
  cartItems: FoodItem[];
  currentLocationFoodIds: string[];
  stops: Stop[];
  selectedDeliveryMode: string | null;
  deliveryModeFee: number;
  deliveryLocation: string;
  addToCart: (item: FoodItem) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  isItemInCart: (itemId: string) => boolean;
  getCartCount: () => number;
  addStop: (stop: Stop) => void;
  removeStop: (stopId: string) => void;
  updateStop: (stopId: string, updates: Partial<Stop>) => void;
  assignFoodToStop: (stopId: string, foodIds: string[]) => void;
  removeFoodFromStop: (stopId: string, foodId: string) => void;
  getCurrentLocationFoods: () => FoodItem[];
  getStopFoods: (stopId: string) => FoodItem[];
  getUnassignedFoods: () => FoodItem[];
  canAddStop: () => boolean;
  getAvailableFoodsForStop: (stopId: string) => FoodItem[];
  removeStopsWithoutFoodOrAddress: () => void;
  setDeliveryMode: (mode: string, fee: number) => void;
  setDeliveryLocation: (location: string) => void;
}

const FoodOrderSessionContext = createContext<FoodOrderSessionState | undefined>(undefined);

const STORAGE_KEY = 'foodOrderSession';

export function FoodOrderSessionProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<FoodItem[]>([]);
  const [currentLocationFoodIds, setCurrentLocationFoodIds] = useState<string[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [selectedDeliveryMode, setSelectedDeliveryModeState] = useState<string | null>(null);
  const [deliveryModeFee, setDeliveryModeFee] = useState<number>(0);
  const [deliveryLocation, setDeliveryLocationState] = useState<string>('');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCartItems(parsed.cartItems || []);
        setCurrentLocationFoodIds(parsed.currentLocationFoodIds || []);
        setStops(parsed.stops || []);
        setSelectedDeliveryModeState(parsed.selectedDeliveryMode || null);
        setDeliveryModeFee(parsed.deliveryModeFee || 0);
        setDeliveryLocationState(parsed.deliveryLocation || '');
      } catch (error) {
        console.error('Error loading order session:', error);
      }
    }
  }, []);

  useEffect(() => {
    const data = {
      cartItems,
      currentLocationFoodIds,
      stops,
      selectedDeliveryMode,
      deliveryModeFee,
      deliveryLocation
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [cartItems, currentLocationFoodIds, stops, selectedDeliveryMode, deliveryModeFee, deliveryLocation]);

  const addToCart = useCallback((item: FoodItem) => {
    setCartItems(prev => {
      const existingItem = prev.find(i => i.id === item.id);
      if (existingItem) {
        return prev.filter(i => i.id !== item.id);
      }
      const newItems = [...prev, item];
      setCurrentLocationFoodIds(prevIds => [...prevIds, item.id]);
      return newItems;
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCartItems(prev => prev.filter(i => i.id !== itemId));
    setCurrentLocationFoodIds(prev => prev.filter(id => id !== itemId));
    setStops(prev => prev.map(stop => ({
      ...stop,
      foodIds: stop.foodIds.filter(id => id !== itemId)
    })));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setCurrentLocationFoodIds([]);
    setStops([]);
    setSelectedDeliveryModeState(null);
    setDeliveryModeFee(0);
    setDeliveryLocationState('');
  }, []);

  const isItemInCart = useCallback((itemId: string) => {
    return cartItems.some(i => i.id === itemId);
  }, [cartItems]);

  const getCartCount = useCallback(() => {
    return cartItems.length;
  }, [cartItems]);

  const addStop = useCallback((stop: Stop) => {
    if (stops.length >= 3) return;
    setStops(prev => [...prev, stop]);
  }, [stops.length]);

  const removeStop = useCallback((stopId: string) => {
    const stop = stops.find(s => s.id === stopId);
    if (stop) {
      setCurrentLocationFoodIds(prev => [...prev, ...stop.foodIds]);
    }
    setStops(prev => prev.filter(s => s.id !== stopId));
  }, [stops]);

  const updateStop = useCallback((stopId: string, updates: Partial<Stop>) => {
    setStops(prev => prev.map(s => s.id === stopId ? { ...s, ...updates } : s));
  }, []);

  const assignFoodToStop = useCallback((stopId: string, foodIds: string[]) => {
    const stop = stops.find(s => s.id === stopId);
    if (!stop) return;

    const previousFoodIds = stop.foodIds;
    const removedFoodIds = previousFoodIds.filter(id => !foodIds.includes(id));

    setCurrentLocationFoodIds(prev => {
      let updated = prev.filter(id => !foodIds.includes(id));
      updated = [...updated, ...removedFoodIds];
      return updated;
    });

    setStops(prev => prev.map(s =>
      s.id === stopId ? { ...s, foodIds } : s
    ));
  }, [stops]);

  const removeFoodFromStop = useCallback((stopId: string, foodId: string) => {
    setStops(prev => prev.map(s =>
      s.id === stopId
        ? { ...s, foodIds: s.foodIds.filter(id => id !== foodId) }
        : s
    ));
    setCurrentLocationFoodIds(prev => [...prev, foodId]);
  }, []);

  const getCurrentLocationFoods = useCallback(() => {
    return cartItems.filter(item => currentLocationFoodIds.includes(item.id));
  }, [cartItems, currentLocationFoodIds]);

  const getStopFoods = useCallback((stopId: string) => {
    const stop = stops.find(s => s.id === stopId);
    if (!stop) return [];
    return cartItems.filter(item => stop.foodIds.includes(item.id));
  }, [cartItems, stops]);

  const getUnassignedFoods = useCallback(() => {
    const assignedIds = new Set(currentLocationFoodIds);
    stops.forEach(stop => {
      stop.foodIds.forEach(id => assignedIds.add(id));
    });
    return cartItems.filter(item => !assignedIds.has(item.id));
  }, [cartItems, currentLocationFoodIds, stops]);

  const canAddStop = useCallback(() => {
    if (stops.length >= 3) return false;
    if (cartItems.length < 2) return false;
    const unassignedCount = getUnassignedFoods().length + currentLocationFoodIds.length;
    return unassignedCount > 1;
  }, [stops.length, cartItems.length, getUnassignedFoods, currentLocationFoodIds.length]);

  const getAvailableFoodsForStop = useCallback((stopId: string) => {
    return cartItems;
  }, [cartItems]);

  const removeStopsWithoutFoodOrAddress = useCallback(() => {
    setStops(prev => {
      const validStops = prev.filter(stop =>
        stop.foodIds.length > 0 && stop.address && stop.address.trim() !== ''
      );
      const removedStops = prev.filter(stop =>
        stop.foodIds.length === 0 || !stop.address || stop.address.trim() === ''
      );
      removedStops.forEach(stop => {
        setCurrentLocationFoodIds(prevIds => [...prevIds, ...stop.foodIds]);
      });
      return validStops;
    });
  }, []);

  const setDeliveryMode = useCallback((mode: string, fee: number) => {
    setSelectedDeliveryModeState(mode);
    setDeliveryModeFee(fee);
  }, []);

  const setDeliveryLocation = useCallback((location: string) => {
    setDeliveryLocationState(location);
  }, []);

  return (
    <FoodOrderSessionContext.Provider
      value={{
        cartItems,
        currentLocationFoodIds,
        stops,
        selectedDeliveryMode,
        deliveryModeFee,
        deliveryLocation,
        addToCart,
        removeFromCart,
        clearCart,
        isItemInCart,
        getCartCount,
        addStop,
        removeStop,
        updateStop,
        assignFoodToStop,
        removeFoodFromStop,
        getCurrentLocationFoods,
        getStopFoods,
        getUnassignedFoods,
        canAddStop,
        getAvailableFoodsForStop,
        removeStopsWithoutFoodOrAddress,
        setDeliveryMode,
        setDeliveryLocation
      }}
    >
      {children}
    </FoodOrderSessionContext.Provider>
  );
}

export function useFoodOrderSession() {
  const context = useContext(FoodOrderSessionContext);
  if (!context) {
    throw new Error('useFoodOrderSession must be used within FoodOrderSessionProvider');
  }
  return context;
}
