 import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Calendar, Users, ArrowRight } from 'lucide-react';
import { DraggablePanel } from '../components/DraggablePanel';
import { ScrollableSection } from '../components/ScrollableSection';
import { MapBackground } from '../components/MapBackground';
import { BottomNavigation } from '../components/BottomNavigation';
import { carTypes } from '../data/mockData';
import { calculatePriceWithStops, getCarTypePrice } from '../utils/priceCalculation';
import { useRideContext } from '../contexts/RideContext';

interface SelectRideProps {
  destination: string;
  pickup: string;
  stops: string[];
  onBack: () => void;
  onSelectRide: (carType: string, price: number) => void;
}

export const SelectRide: React.FC<SelectRideProps> = ({
  destination,
  pickup,
  stops,
  onBack,
  onSelectRide
}) => {
  const navigate = useNavigate();
  const { isRideActive, rideStatus } = useRideContext();
  
  // Calculate base price for the trip
  const priceCalculation = calculatePriceWithStops(pickup, destination, stops);
  
  // Create car types with calculated prices
  const carsWithPrices = carTypes.map(car => ({
    ...car,
    price: getCarTypePrice(priceCalculation.totalPrice, car.name),
    originalPrice: Math.round(getCarTypePrice(priceCalculation.totalPrice, car.name) * 1.25) // 25% higher for original price
  }));
  
  const [selectedCar, setSelectedCar] = useState(carsWithPrices[0]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <MapBackground />
      
      {/* Header */}
      <motion.div 
        className="absolute top-0 left-0 right-0 z-10 p-4"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {/* Route Display Panel */}
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <div className="flex items-center space-x-3">
            <button 
              onClick={onBack}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>
            
            <button
              onClick={() => navigate('/your-route', { 
                state: { 
                  highlightDestination: true, 
                  prefilledDestination: destination,
                  prefilledPickup: pickup 
                } 
              })}
              className="flex-1 flex items-center space-x-2 text-left hover:bg-gray-50 rounded-lg p-2 transition-colors"
            >
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-900 truncate">{pickup}</span>
                <ArrowRight size={16} className="text-gray-400 flex-shrink-0" />
                <span className="text-sm font-medium text-green-600 truncate">{destination}</span>
              </div>
            </button>
            
            <button 
              onClick={() => navigate('/your-route', { 
                state: { 
                  highlightAddStop: true, 
                  prefilledDestination: destination,
                  prefilledPickup: pickup 
                } 
              })}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
            >
              <Plus size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* ETA Badge */}
      <motion.div
        className="absolute top-24 left-1/2 transform -translate-x-1/2 z-10 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring" }}
      >
        <span className="font-medium">Arrive by 20:38</span>
      </motion.div>

      {/* Promo Banner */}
      <motion.div
        className="absolute top-36 left-4 right-4 z-10 bg-blue-600 text-white rounded-xl p-3 shadow-lg"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-center space-x-2">
          <span className="text-white font-medium">✓ 20% promo applied</span>
        </div>
      </motion.div>

      <DraggablePanel initialHeight={400} maxHeight={550} minHeight={250}>
        <div className="space-y-4">
          {/* Car selection */}
          <ScrollableSection maxHeight="max-h-80">
            <div className="space-y-3">
              {carsWithPrices.map((car, index) => (
                <motion.button
                  key={car.id}
                  onClick={() => setSelectedCar(car)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all ${
                    selectedCar.id === car.id 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{car.icon}</div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-900">{car.name}</h3>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">R {car.price}</p>
                          {car.originalPrice && (
                            <p className="text-sm text-gray-500 line-through">R {car.originalPrice}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-600">{car.eta}</span>
                        <div className="flex items-center space-x-1">
                          <Users size={14} className="text-gray-500" />
                          <span className="text-sm text-gray-600">{car.capacity}</span>
                        </div>
                        <span className="text-sm text-gray-600">{car.description}</span>
                      </div>
                      {/* Show trip details */}
                      <div className="mt-2 text-xs text-gray-500">
                        {priceCalculation.totalDistance}km • {stops.length > 0 ? `${stops.length + 1} stops` : 'Direct'}
                      </div>
                      {car.badge && (
                        <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-bold ${
                          car.badge === 'FASTER' ? 'bg-green-100 text-green-800' :
                          car.badge === 'CHEAPER' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {car.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </ScrollableSection>

          {/* Payment method */}
          <motion.div 
            className="border-t border-gray-200 pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-8 h-5 bg-green-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">💳</span>
              </div>
              <span className="font-medium text-gray-900">Cash</span>
              <span className="text-gray-500">▼</span>
            </div>
          </motion.div>
        </div>
      </DraggablePanel>

      {/* Bottom action panel */}
      <motion.div 
        className="fixed bottom-20 left-4 right-4 z-30"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex space-x-3">
          <motion.button
            onClick={() => {
              if (isRideActive) {
                alert('You already have an active ride.');
                return;
              }
              onSelectRide(selectedCar.name, selectedCar.price);
            }}
            disabled={isRideActive}
            className={`flex-1 py-4 rounded-xl font-semibold text-lg shadow-lg transition-colors ${
              isRideActive
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
            whileTap={{ scale: isRideActive ? 1 : 0.98 }}
          >
            {isRideActive ? 'Ride Active' : `Select ${selectedCar.name}`}
          </motion.button>
          <motion.button
            onClick={() => navigate('/schedule-ride')}
            className="bg-gray-100 p-4 rounded-xl hover:bg-gray-200 transition-colors shadow-lg"
            whileTap={{ scale: 0.95 }}
          >
            <Calendar className="text-gray-600" size={24} />
          </motion.button>
        </div>
        {isRideActive && (
          <p className="text-gray-500 text-center text-sm mt-2">
            Finish current ride before booking another
          </p>
        )}
      </motion.div>

      <BottomNavigation activeTab="home" />
    </div>
  );
};

