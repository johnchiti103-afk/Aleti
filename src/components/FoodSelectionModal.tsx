import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useFoodOrderSession, FoodItem } from '../contexts/FoodOrderSession';

interface FoodSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  stopId: string;
  mode: 'current-location' | 'stop';
}

export function FoodSelectionModal({
  isOpen,
  onClose,
  title,
  stopId,
  mode
}: FoodSelectionModalProps) {
  const {
    cartItems,
    currentLocationFoodIds,
    stops,
    removeFromCart,
    assignFoodToStop,
    getCurrentLocationFoods,
    getStopFoods
  } = useFoodOrderSession();

  const [selectedFoodIds, setSelectedFoodIds] = useState<string[]>([]);

  useEffect(() => {
    if (mode === 'current-location') {
      setSelectedFoodIds(currentLocationFoodIds);
    } else {
      const stop = stops.find(s => s.id === stopId);
      setSelectedFoodIds(stop?.foodIds || []);
    }
  }, [mode, stopId, currentLocationFoodIds, stops]);

  const getAssignedStopName = (foodId: string): string | null => {
    if (mode === 'current-location') return null;

    const currentStop = stops.find(s => s.id === stopId);
    if (currentStop?.foodIds.includes(foodId)) return null;

    const assignedStop = stops.find(s => s.foodIds.includes(foodId));
    return assignedStop ? 'another stop' : null;
  };

  const isAssignedToAnotherStop = (foodId: string): boolean => {
    if (mode === 'current-location') return false;
    return getAssignedStopName(foodId) !== null;
  };

  const isSelected = (foodId: string): boolean => {
    return selectedFoodIds.includes(foodId);
  };

  const canSelectMore = (): boolean => {
    if (mode === 'current-location') return true;

    const totalItems = cartItems.length;
    const currentlySelected = selectedFoodIds.length;
    const assignedToOtherStops = cartItems.filter(item =>
      isAssignedToAnotherStop(item.id) && !selectedFoodIds.includes(item.id)
    ).length;

    const availableForSelection = totalItems - assignedToOtherStops - 1;
    return currentlySelected < availableForSelection;
  };

  const isDisabled = (foodId: string): boolean => {
    if (mode === 'current-location') return false;

    if (isAssignedToAnotherStop(foodId)) return true;

    if (isSelected(foodId)) return false;

    return !canSelectMore();
  };

  const handleToggleFood = (foodId: string) => {
    if (mode === 'current-location') {
      removeFromCart(foodId);
      return;
    }

    if (isDisabled(foodId)) return;

    setSelectedFoodIds(prev => {
      if (prev.includes(foodId)) {
        return prev.filter(id => id !== foodId);
      } else {
        return [...prev, foodId];
      }
    });
  };

  const handleOk = () => {
    if (mode === 'stop') {
      assignFoodToStop(stopId, selectedFoodIds);
    }
    onClose();
  };

  const getFoodById = (id: string): FoodItem | undefined => {
    return cartItems.find(item => item.id === id);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md rounded-t-3xl shadow-2xl max-h-[70vh] flex flex-col"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X size={18} className="text-gray-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cartItems.map((food) => {
                const assigned = isAssignedToAnotherStop(food.id);
                const selected = isSelected(food.id);
                const disabled = isDisabled(food.id);

                return (
                  <motion.button
                    key={food.id}
                    onClick={() => handleToggleFood(food.id)}
                    disabled={disabled && !selected}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      selected
                        ? 'bg-green-100/60 border-2 border-green-600'
                        : assigned || disabled
                        ? 'bg-gray-300/40 border border-gray-400 opacity-60'
                        : 'bg-white border border-gray-200 hover:bg-gray-50'
                    }`}
                    whileTap={{ scale: disabled && !selected ? 1 : 0.98 }}
                  >
                    <img
                      src={food.image}
                      alt={food.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900">{food.name}</p>
                      <p className="text-sm text-gray-600">K{food.price}</p>
                      {assigned && (
                        <p className="text-xs text-gray-500 mt-1">Assigned to another stop</p>
                      )}
                    </div>
                    {selected && mode === 'current-location' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFood(food.id);
                        }}
                        className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                      >
                        <X size={14} className="text-white" />
                      </button>
                    )}
                    {selected && mode === 'stop' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFood(food.id);
                        }}
                        className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                      >
                        <X size={14} className="text-white" />
                      </button>
                    )}
                  </motion.button>
                );
              })}
            </div>

            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleOk}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                OK
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
