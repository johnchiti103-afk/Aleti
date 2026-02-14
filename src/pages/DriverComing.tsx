import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MapPin, Edit, Phone, Share, CreditCard, X, MessageCircle } from 'lucide-react';
import { DraggablePanel } from '../components/DraggablePanel';
import { ScrollableSection } from '../components/ScrollableSection';
import { MapBackground } from '../components/MapBackground';
import { MessagePanel } from '../components/MessagePanel';
import { RatingModal } from '../components/RatingModal';
import { calculatePriceWithStops, getCarTypePrice } from '../utils/priceCalculation';
import { getETA } from '../utils/etaCalculation';
import { firebaseService } from '../services/firebaseService';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../hooks/useUserProfile';
import { useFirebaseRide } from '../hooks/useFirebaseRide';
import { useMessageContext } from '../contexts/MessageContext';
import { DriverLocation } from '../types';

interface DriverComingProps {
  destination: string;
  pickup: string;
  stops: string[];
  carType: string;
  price: number;
  currentRideId: string | null;
  onBack: () => void;
  requestType?: 'ride' | 'food';
  deliveryMode?: 'car' | 'motorbike' | 'bicycle';
  foodItems?: any[];
  foodSubtotal?: number;
  deliveryFee?: number;
}

interface DriverInfo {
  id: string;
  name: string;
  rating: number;
  plateNumber: string;
  carModel: string;
  eta: string;
  photo: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export const DriverComing: React.FC<DriverComingProps> = ({
  destination,
  pickup,
  stops,
  carType,
  price,
  currentRideId,
  onBack,
  requestType = 'ride',
  deliveryMode,
  foodItems = [],
  foodSubtotal = 0,
  deliveryFee = 0
}) => {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const { currentRide } = useFirebaseRide(currentRideId);
  const { unreadMessageCount, markMessagesAsRead } = useMessageContext();

  const isFood = requestType === 'food';

  const [driverInfo, setDriverInfo] = useState<DriverInfo | null>(null);
  const [rideStatus, setRideStatus] = useState<string>('accepted');
  const [eta, setEta] = useState('3 mins');
  const [statusText, setStatusText] = useState('Arriving in 3 mins');
  const [showArrivalAlert, setShowArrivalAlert] = useState(false);
  const [hasShownArrivalAlert, setHasShownArrivalAlert] = useState(false);
  const [isMessagePanelOpen, setIsMessagePanelOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

  const priceCalculation = calculatePriceWithStops(pickup, destination, stops);
  const finalPrice = getCarTypePrice(priceCalculation.totalPrice, carType);

  const mockDriverInfo: DriverInfo = {
    id: 'driver123',
    name: 'Allen',
    rating: 4.8,
    plateNumber: 'KW14CKGP',
    carModel: 'Silver • Honda Amaze',
    eta: '3 mins',
    photo: '👨🏽‍💼',
    location: { latitude: -26.2041, longitude: 28.0473 }
  };

  // Fetch driver info
  useEffect(() => {
    const fetchDriverInfo = async () => {
      if (currentRide?.driverId) {
        try {
          const fetchedDriver = await firebaseService.getDriverInfo(currentRide.driverId);
          if (fetchedDriver) {
            setDriverInfo(fetchedDriver);
            setEta(fetchedDriver.eta || '3 mins');
            return;
          }
        } catch (error) {
          console.error('Error fetching driver info:', error);
        }
      }
      setDriverInfo(mockDriverInfo);
    };
    fetchDriverInfo();
  }, [currentRide]);

  // Listen to ride status
  useEffect(() => {
    if (!currentRideId) return;

    const unsubscribeStatus = firebaseService.listenToRideStatus(currentRideId, (statusData) => {
      if (statusData) {
        const newStatus = statusData.status;
        setRideStatus(newStatus);

        if (newStatus === 'arrived' && !hasShownArrivalAlert) {
          setShowArrivalAlert(true);
          setHasShownArrivalAlert(true);
          setTimeout(() => setShowArrivalAlert(false), 5000);
        }
        if (newStatus === 'completed') setIsRatingModalOpen(true);
      }
    });

    return () => unsubscribeStatus();
  }, [currentRideId, hasShownArrivalAlert]);

  // Listen to driver location
  useEffect(() => {
    if (!currentRide?.driverId) return;

    const unsubscribeLocation = firebaseService.listenToDriverLocation(
      currentRide.driverId,
      (location) => {
        if (location) {
          setDriverLocation(location);
          const pickupLoc = currentRide.pickupLocation || { latitude: -26.2041, longitude: 28.0473 };
          const destinationLoc = currentRide.destinationLocation || { latitude: -26.195, longitude: 28.04 };

          if (rideStatus === 'accepted') {
            const calculatedEta = getETA(location.lat, location.lng, pickupLoc.latitude, pickupLoc.longitude);
            setEta(calculatedEta);
            setStatusText(`Arriving in ${calculatedEta}`);
          } else if (rideStatus === 'started') {
            const calculatedEta = getETA(location.lat, location.lng, destinationLoc.latitude, destinationLoc.longitude);
            setEta(calculatedEta);
            setStatusText(`On trip — ETA ${calculatedEta}`);
          }
        }
      }
    );

    return () => unsubscribeLocation();
  }, [currentRide, rideStatus]);

  useEffect(() => {
    if (rideStatus === 'arrived') setStatusText('Your driver has arrived');
    else if (rideStatus === 'completed') setStatusText("You've arrived at your destination");
  }, [rideStatus]);

  const handleMessageDriver = async () => {
    setIsMessagePanelOpen(true);
    await markMessagesAsRead();
  };

  const handleCancelClick = () => setShowCancelConfirmation(true);
  const handleWaitForDriver = () => setShowCancelConfirmation(false);

  const handleConfirmCancel = async () => {
    try {
      const rideIdToCancel = currentRide?.id || currentRideId;
      if (!rideIdToCancel) return;

      await firebaseService.updateRideStatus(rideIdToCancel, 'cancelled');
      setShowCancelConfirmation(false);

      navigate('/what-went-wrong', {
        state: {
          rideId: rideIdToCancel,
          userId: profile?.id || 'user123',
          userName: profile?.name || 'Unknown User',
          destination,
          pickup,
          stops,
          carType,
          price: finalPrice
        }
      });
    } catch (error) {
      console.error('Error cancelling ride:', error);
      setShowCancelConfirmation(false);
    }
  };

  const handleSubmitRating = async (rating: number, feedback: string) => {
    if (!currentRideId || !currentRide?.driverId || !profile?.id) return;

    try {
      await firebaseService.submitRating(currentRide.driverId, currentRideId, rating, feedback, profile.id);
      setIsRatingModalOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  if (!driverInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading driver information...</p>
        </div>
      </div>
    );
  }

  const isMessageDisabled = rideStatus === 'pending' || rideStatus === 'completed';

  return (
    <div className="min-h-screen relative overflow-hidden">
      <MapBackground />

      <DraggablePanel initialHeight={500} maxHeight={680} minHeight={350}>
        <div className="space-y-6 pb-6">
          <motion.div className="text-center pt-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{statusText}</h2>
          </motion.div>

          <motion.div className="bg-gray-50 rounded-2xl p-4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-2xl">
                  {driverInfo.photo}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900">{driverInfo.plateNumber}</h3>
                <p className="text-gray-600">{driverInfo.carModel}</p>
                <p className="text-gray-900 font-medium">{driverInfo.name}</p>
              </div>
              <div className="text-3xl">🚗</div>
            </div>
          </motion.div>

          {/* Cancel + Message Row */}
          <motion.div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              {rideStatus !== 'arrived' && rideStatus !== 'started' && (
                <button onClick={handleCancelClick} className="text-sm text-red-600 font-medium hover:text-red-700 transition-colors">
                  Cancel ride
                </button>
              )}
              <motion.p
                animate={{
                  scale: [1, 1.05, 1],
                  textShadow: [
                    '0 0 0px rgba(147, 51, 234, 0)',
                    '0 0 20px rgba(147, 51, 234, 0.8)',
                    '0 0 0px rgba(147, 51, 234, 0)'
                  ]
                }}
                transition={{ repeat: Infinity, duration: 1, repeatDelay: 4 }}
                className={`text-sm text-gray-700 text-center ${rideStatus === 'arrived' || rideStatus === 'started' ? 'flex-1 text-left' : 'flex-1'}`}
              >
                Tap the message icon to chat with your driver
              </motion.p>
              <motion.button
                onClick={handleMessageDriver}
                disabled={isMessageDisabled}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                className={`relative p-2 rounded-full transition-colors ${isMessageDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
              >
                <MessageCircle className={`${isMessageDisabled ? 'text-gray-400' : 'text-gray-700'}`} size={24} />
                {unreadMessageCount > 0 && !isMessageDisabled && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-lg"
                  >
                    {unreadMessageCount}
                  </motion.span>
                )}
              </motion.button>
            </div>
          </motion.div>

          <ScrollableSection maxHeight="max-h-[420px]">
            <div className="space-y-6 pb-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h3 className="font-semibold text-gray-900 mb-3">My route</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="flex-1 text-gray-700">{pickup}</span>
                    <Edit className="text-gray-400" size={16} />
                  </div>

                  {stops.map((stop, index) => (
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
                    <span className="flex-1 text-gray-700">{destination}</span>
                    <Edit className="text-gray-400" size={16} />
                  </div>
                </div>
              </motion.div>

              {/* Food items (if food) */}
              {isFood && foodItems.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <h3 className="font-semibold text-gray-900 mb-3">Your Order</h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    {foodItems.map((item, index) => (
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
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <h3 className="font-semibold text-gray-900 mb-3">Pricing</h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Food subtotal</span>
                      <span className="font-medium text-gray-900">R {foodSubtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery fee ({deliveryMode})</span>
                      <span className="font-medium text-gray-900">R {deliveryFee}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="font-bold text-green-600">R {price}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h3 className="font-semibold text-gray-900 mb-3">Payment method</h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="text-green-600" size={20} />
                      <div>
                        <p className="font-medium text-gray-900">Cash</p>
                        <p className="text-sm text-gray-500">{isFood ? `Delivery • ${deliveryMode}` : `Fare • ${carType}`}</p>
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
          >
            <motion.div
              className="bg-white rounded-3xl p-6 max-w-sm w-full relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <button
                onClick={handleWaitForDriver}
                className="absolute top-4 right-4 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
              >
                <X size={20} className="text-gray-600" />
              </button>

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

              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Are you sure?</h3>
              <p className="text-gray-600 text-center mb-8 leading-relaxed">
                Do you really want to cancel the ride? Rebooking may not get you there faster.
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleConfirmCancel}
                  className="w-full bg-red-500 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-red-600"
                >
                  Cancel ride
                </button>
                <button
                  onClick={handleWaitForDriver}
                  className="w-full bg-gray-100 text-gray-800 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-200"
                >
                  Wait for driver
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <MessagePanel
        isOpen={isMessagePanelOpen}
        onClose={() => setIsMessagePanelOpen(false)}
        rideId={currentRideId || ''}
        currentUserId={profile?.id || 'user123'}
        driverId={currentRide?.driverId || 'driver123'}
        driverName={driverInfo.name}
        isRideActive
      />

      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => {}}
        driverName={driverInfo.name}
        driverPhoto={driverInfo.photo}
        onSubmitRating={handleSubmitRating}
        requestType={requestType}
      />
    </div>
  );
};
