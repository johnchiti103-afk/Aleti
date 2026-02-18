 import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, X, Plus, MapPin } from 'lucide-react';
import { BottomNavigation } from '../components/BottomNavigation';
import { DraggablePanel } from '../components/DraggablePanel';
import { ScrollableSection } from '../components/ScrollableSection';
import { MapBackground } from '../components/MapBackground';
import { useFirebaseRide } from '../hooks/useFirebaseRide';
import { useUserProfile } from '../hooks/useUserProfile';
import { calculatePriceWithStops, getCarTypePrice } from '../utils/priceCalculation';
import { useNavigate, useLocation } from 'react-router-dom';
import { firebaseService } from '../services/firebaseService';

interface WaitingForDriverProps {
  destination: string;
  pickup: string;
  stops: string[];
  carType: string;
  price: number;
  currentRideId: string | null;
  onCancel: () => void;
  onDriverFound: () => void;
  requestType?: 'ride' | 'food';
  deliveryMode?: 'car' | 'motorbike' | 'bicycle';
  foodItems?: any[];
  foodSubtotal?: number;
  deliveryFee?: number;
}

export const WaitingForDriver: React.FC<WaitingForDriverProps> = ({
  destination,
  pickup,
  stops,
  carType,
  price,
  currentRideId,
  onCancel,
  onDriverFound,
  requestType = 'ride',
  deliveryMode,
  foodItems = [],
  foodSubtotal = 0,
  deliveryFee = 0
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [showNoDriverPopup, setShowNoDriverPopup] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [isScanning, setIsScanning] = useState(true);

  const stateData = (location.state as any) || {};
  const finalRequestType = stateData.requestType || requestType;
  const finalCurrentRideId = stateData.currentRideId || currentRideId;
  const finalFoodItems = stateData.foodItems || foodItems;
  const finalFoodSubtotal = stateData.foodSubtotal || foodSubtotal;
  const finalDeliveryFee = stateData.deliveryFee || deliveryFee;
  const finalDeliveryMode = stateData.deliveryMode || deliveryMode;
  const finalPickup = stateData.pickup || pickup;
  const finalDestination = stateData.destination || destination;
  const finalStops = stateData.stops || stops;
  const finalCarType = stateData.carType || carType;
  const finalPrice = stateData.price || price;

  const { createRide, currentRide, isLoading, isAccepted } = useFirebaseRide(finalCurrentRideId);
  const { profile } = useUserProfile();

  const isFood = finalRequestType === 'food';

  console.log('WaitingForDriver DEBUG:', {
    requestType: finalRequestType,
    currentRideId: finalCurrentRideId,
    currentRide,
    isAccepted,
    isScanning,
    foodItems: finalFoodItems
  });

  // NOTE: Removed the auto-create useEffect that ran on mount.
  // The ConfirmOrder page is responsible for creating the initial ride request.
  // WaitingForDriver only handles scanning, showing 'no driver' popup and "Request again".

  useEffect(() => {
    if (!isScanning) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIsScanning(false);
          setShowNoDriverPopup(true);
          return 100;
        }
        return prev + (100 / 30); // 30 seconds total
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isScanning]);

  useEffect(() => {
    if (isAccepted) {
      console.log('Driver accepted! Stopping scan and navigating...');
      setIsScanning(false);
      setProgress(100);
      setTimeout(() => {
        onDriverFound();
      }, 500);
    }
  }, [isAccepted, onDriverFound]);

  const handleRequestAgain = async () => {
    if (isLoading) return;

    setShowNoDriverPopup(false);
    setProgress(0);
    setIsScanning(true);

    const rideRequest = {
      destination: finalDestination,
      pickup: finalPickup,
      stops: finalStops || [],
      carType: finalCarType,
      price: finalPrice,
      status: 'pending' as const,
      userId: profile?.id || 'user123',
      userName: profile?.name || 'Unknown User',
    };

    try {
      const rideId = await createRide(rideRequest);
      console.log('Request again created:', rideId);
    } catch (error) {
      console.error('Failed to request again:', error);
    }
  };

  const handleCancelClick = () => {
    setShowCancelConfirmation(true);
  };

  const handleConfirmCancel = async () => {
    try {
      let rideIdToCancel = currentRide?.id || finalCurrentRideId || null;

      if (!rideIdToCancel && profile?.id) {
        rideIdToCancel = await firebaseService.findActiveRideByUser(profile.id);
      }

      if (!rideIdToCancel) {
        console.error('No rideId available to cancel. Aborting.');
        setShowCancelConfirmation(false);
        return;
      }

      await firebaseService.updateRideStatus(rideIdToCancel, 'cancelled');

      setShowCancelConfirmation(false);

      navigate('/what-went-wrong', {
        state: {
          rideId: rideIdToCancel,
          userId: profile?.id || 'user123',
          userName: profile?.name || 'Unknown User',
          destination: finalDestination,
          pickup: finalPickup,
          stops: finalStops,
          carType: finalCarType,
          price: finalPrice
        }
      });
    } catch (error) {
      console.error('Error cancelling ride:', error);
      setShowCancelConfirmation(false);
      navigate('/what-went-wrong', {
        state: {
          rideId: currentRide?.id || finalCurrentRideId || null,
          userId: profile?.id || 'user123',
          userName: profile?.name || 'Unknown User',
          destination: finalDestination,
          pickup: finalPickup,
          stops: finalStops,
          carType: finalCarType,
          price: finalPrice
        }
      });
    }
  };

  const handleWaitForDriver = () => {
    setShowCancelConfirmation(false);
  };

  const handleCancelRequest = async () => {
    if (currentRide?.id || finalCurrentRideId) {
      try {
        const rideIdToCancel = currentRide?.id || finalCurrentRideId!;
        await firebaseService.updateRideStatus(rideIdToCancel, 'cancelled');
      } catch (error) {
        console.error('Error cancelling ride:', error);
      }
    }
    onCancel();
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <MapBackground />
      
      <DraggablePanel initialHeight={450} maxHeight={680} minHeight={300}>
        <div className="space-y-6">
          {/* Status header */}
          <motion.div 
            className="text-center pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {isFood ? 'Waiting for delivery driver' : 'Waiting for driver to confirm the order'}
            </h2>
            {isAccepted && (
              <p className="text-green-600 font-semibold">Driver accepted your request!</p>
            )}
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-1 mb-6">
              <motion.div 
                className="bg-green-500 h-1 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />
            </div>
          </motion.div>

          {/* Action buttons */}
          <motion.div 
            className="flex justify-center space-x-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <button className="flex flex-col items-center space-y-2 p-4 hover:bg-gray-50 rounded-xl transition-colors">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Edit className="text-gray-600" size={20} />
              </div>
              <span className="text-sm text-gray-600">Edit pickup</span>
            </button>
            
            <button 
              onClick={handleCancelClick}
              className="flex flex-col items-center space-y-2 p-4 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <X className="text-gray-600" size={20} />
              </div>
              <span className="text-sm text-gray-600">Cancel ride</span>
            </button>
          </motion.div>

          {/* Scrollable content including News & highlights */}
          <ScrollableSection maxHeight="max-h-[420px]">
            <div className="space-y-6 pb-4">
              {/* News & insights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h3 className="font-semibold text-gray-900 mb-3">News & highlights</h3>
                <div className="bg-blue-50 rounded-2xl p-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">🎧</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Learn how the audio recording safety feature works</p>
                    </div>
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  </div>
                </div>
              </motion.div>
              {/* Route info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <h3 className="font-semibold text-gray-900 mb-3">My route</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="flex-1 text-gray-700">{finalPickup}</span>
                    <Edit className="text-gray-400" size={16} />
                  </div>

                  {finalStops.map((stop, index) => (
                    <div key={index} className="flex items-center space-x-3 ml-6">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="flex-1 text-gray-700">{stop}</span>
                      <Edit className="text-gray-400" size={16} />
                    </div>
                  ))}

                  <div className="flex items-center space-x-3 ml-6">
                    <Plus className="text-blue-600" size={16} />
                    <span className="text-blue-600 font-medium">Add stop</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="text-blue-600" size={12} />
                    <span className="flex-1 text-gray-700">{finalDestination}</span>
                    <Edit className="text-gray-400" size={16} />
                  </div>

                  <div className="flex items-center space-x-3 ml-6">
                    <MapPin className="text-gray-500" size={12} />
                    <span className="text-gray-500">Edit destinations</span>
                  </div>
                </div>
              </motion.div>

              {/* Food items (if food) */}
              {isFood && finalFoodItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <h3 className="font-semibold text-gray-900 mb-3">Your Order</h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    {finalFoodItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">{item.name}</span>
                        <span className="font-medium text-gray-900">R {item.price}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Food pricing breakdown (if food) */}
              {isFood && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.85 }}
                >
                  <h3 className="font-semibold text-gray-900 mb-3">Pricing</h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Food subtotal</span>
                      <span className="font-medium text-gray-900">R {finalFoodSubtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery fee ({finalDeliveryMode})</span>
                      <span className="font-medium text-gray-900">R {finalDeliveryFee}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="font-bold text-green-600">R {finalPrice}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Payment method */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: isFood ? 0.9 : 0.8 }}
              >
                <h3 className="font-semibold text-gray-900 mb-3">Payment method</h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-5 bg-green-600 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">💳</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Cash</p>
                        <p className="text-sm text-gray-500">{isFood ? `Delivery • ${finalDeliveryMode}` : `Fare • ${finalCarType}`}</p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900">R {finalPrice}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </ScrollableSection>
        </div>
      </DraggablePanel>


      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {showCancelConfirmation && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="bg-white rounded-3xl p-6 max-w-sm w-full relative"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              {/* Close button */}
              <button
                onClick={handleWaitForDriver}
                className="absolute top-4 right-4 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>

              {/* Driver illustration */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-4xl">👨🏽‍💼</span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <X size={16} className="text-white" />
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                Are you sure?
              </h3>
              <p className="text-gray-600 text-center mb-8 leading-relaxed">
                Do you really want to cancel the ride?
                Rebooking may not get you to your
                destination more quickly.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={handleConfirmCancel}
                  className="w-full bg-red-500 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-red-600 transition-colors"
                >
                  Cancel ride
                </button>
                <button
                  onClick={handleWaitForDriver}
                  className="w-full bg-gray-100 text-gray-800 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-200 transition-colors"
                >
                  Wait for driver
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No driver found popup */}
      <AnimatePresence>
        {showNoDriverPopup && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-2xl p-6 max-w-sm w-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                Driver not found
              </h3>
              <p className="text-gray-600 text-center mb-6">
                No drivers are available right now. Would you like to try again?
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleRequestAgain}
                  disabled={isLoading}
                  className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                    isLoading ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isLoading ? 'Requesting...' : 'Request again'}
                </button>
                <button
                  onClick={handleCancelRequest}
                  className="w-full bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel request
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
