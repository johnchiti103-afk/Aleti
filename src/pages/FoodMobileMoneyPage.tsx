import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone } from 'lucide-react';
import { useFoodPayment } from '../contexts/FoodPaymentContext';
import { useFoodOrderSession } from '../contexts/FoodOrderSession';

export function FoodMobileMoneyPage() {
  const navigate = useNavigate();
  const { startPaymentAuthorization } = useFoodPayment();
  const { deliveryModeFee } = useFoodOrderSession();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const mobileMoney = [
    { id: 'vodacom', name: 'M-Pesa', country: 'Kenya' },
    { id: 'airtel', name: 'Airtel Money', country: 'Airtel' },
    { id: 'mtn', name: 'MTN Money', country: 'MTN' }
  ];

  const handleMobileMoneyAuth = async (provider: string) => {
    if (!phoneNumber) {
      alert('Please enter your phone number');
      return;
    }

    setIsProcessing(true);

    try {
      await startPaymentAuthorization('mobile-money', deliveryModeFee);
      setIsProcessing(false);
      navigate('/food-delivery');
    } catch (error) {
      setIsProcessing(false);
      alert('Error processing mobile money payment. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-screen bg-gray-50"
    >
      <div className="fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-100 p-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => navigate('/food-payment')}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-800" />
          </motion.button>
          <h1 className="text-2xl font-bold text-gray-900">Mobile Money</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 mt-20">
        <div className="space-y-4">
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
            <h3 className="font-semibold text-orange-900 mb-2">Enter your phone number</h3>
            <div className="flex gap-2">
              <div className="flex items-center px-4 py-3 rounded-xl bg-white border-2 border-gray-200 font-semibold text-gray-700">
                +254
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 9))}
                placeholder="712345678"
                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-gray-900"
              />
            </div>
          </div>

          <div className="mt-8">
            <h3 className="font-semibold text-gray-900 mb-4">Select payment provider</h3>
            <div className="space-y-3">
              {mobileMoney.map((provider) => (
                <motion.button
                  key={provider.id}
                  onClick={() => handleMobileMoneyAuth(provider.id)}
                  disabled={isProcessing}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-4 rounded-xl border-2 border-gray-200 bg-white hover:border-orange-400 hover:bg-orange-50 transition-all flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone size={24} className="text-orange-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                    <p className="text-xs text-gray-500">{provider.country}</p>
                  </div>
                  <div className="text-gray-400">›</div>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 mt-8">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">How it works</h4>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Select your mobile money provider</li>
              <li>2. Enter your phone number</li>
              <li>3. Confirm the payment on your phone</li>
              <li>4. Your delivery will be confirmed</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-20">
        <motion.button
          onClick={() => handleMobileMoneyAuth('vodacom')}
          disabled={isProcessing || !phoneNumber}
          className="w-full bg-orange-600 text-white py-4 rounded-xl font-semibold text-lg disabled:bg-gray-300 disabled:text-gray-500 hover:bg-orange-700 transition-colors"
          whileTap={{ scale: 0.98 }}
        >
          {isProcessing ? 'Processing...' : 'Continue'}
        </motion.button>
      </div>

      <div className="h-20" />
    </motion.div>
  );
}
