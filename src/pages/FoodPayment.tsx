import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Banknote, CreditCard, Smartphone } from 'lucide-react';
import { useFoodPayment } from '../contexts/FoodPaymentContext';
import { useFoodOrderSession } from '../contexts/FoodOrderSession';

export function FoodPayment() {
  const navigate = useNavigate();
  const { paymentStatus, startPaymentAuthorization, savedCards, selectedCardId, selectCard } = useFoodPayment();
  const { deliveryModeFee } = useFoodOrderSession();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectPaymentMethod = async (method: string) => {
    setSelectedMethod(method);

    if (method === 'cash') {
      setIsProcessing(true);
      await startPaymentAuthorization('cash', deliveryModeFee);
      setIsProcessing(false);
      navigate('/food-delivery');
      return;
    }

    if (method === 'add-card') {
      navigate('/food-add-card');
      return;
    }

    if (method === 'mobile-money') {
      navigate('/food-mobile-money');
      return;
    }

    if (method.startsWith('card-')) {
      setIsProcessing(true);
      await startPaymentAuthorization('card', deliveryModeFee);
      setIsProcessing(false);
      navigate('/food-delivery');
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
            onClick={() => navigate('/food-delivery')}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-800" />
          </motion.button>
          <h1 className="text-2xl font-bold text-gray-900">Payment</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 mt-20">
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Bolt balance</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">R 0</p>
                <p className="text-xs text-blue-600 mt-1">Bolt balance is not available with this payment method</p>
              </div>
              <div className="text-right text-xs text-blue-600 space-y-2">
                <button className="underline hover:no-underline">What is Bolt balance?</button>
                <button className="block underline hover:no-underline">See Bolt balance transactions</button>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Payment methods</h2>
            </div>

            <div className="space-y-3 mb-8">
              <button
                onClick={() => handleSelectPaymentMethod('cash')}
                disabled={isProcessing}
                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  selectedMethod === 'cash'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex-1 flex items-center gap-3 text-left">
                  <Banknote size={24} className="text-green-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Cash</h3>
                    <p className="text-xs text-gray-500">Pay when delivered</p>
                  </div>
                </div>
                {selectedMethod === 'cash' && (
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                )}
              </button>

              {savedCards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleSelectPaymentMethod(card.id)}
                  disabled={isProcessing}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    selectedMethod === card.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex-1 flex items-center gap-3 text-left">
                    <CreditCard size={24} className="text-gray-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{card.brand} •••• {card.lastFour}</h3>
                      <p className="text-xs text-gray-500">Expires {card.expiryDate}</p>
                    </div>
                  </div>
                  {selectedMethod === card.id && (
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  )}
                </button>
              ))}

              <button
                onClick={() => handleSelectPaymentMethod('add-card')}
                disabled={isProcessing}
                className="w-full p-4 rounded-xl border-2 border-dashed border-gray-300 transition-all flex items-center gap-3 text-left hover:border-gray-400"
              >
                <Plus size={24} className="text-gray-500 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Add debit/credit card</h3>
                  <p className="text-xs text-gray-500">Secure payment</p>
                </div>
              </button>

              <button
                onClick={() => handleSelectPaymentMethod('mobile-money')}
                disabled={isProcessing}
                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  selectedMethod === 'mobile-money'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex-1 flex items-center gap-3 text-left">
                  <Smartphone size={24} className="text-orange-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Mobile Money</h3>
                    <p className="text-xs text-gray-500">Quick and easy</p>
                  </div>
                </div>
                <Plus size={20} className="text-gray-500 flex-shrink-0" />
              </button>

              <button className="w-full p-4 rounded-xl hover:bg-gray-50 transition-colors text-left">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">Manage work profile</h3>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-20">
        <motion.button
          onClick={() => {
            if (selectedMethod === 'cash') {
              handleSelectPaymentMethod('cash');
            }
          }}
          disabled={!selectedMethod || isProcessing || selectedMethod === 'add-card' || selectedMethod === 'mobile-money'}
          className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold text-lg disabled:bg-gray-300 disabled:text-gray-500 hover:bg-green-700 transition-colors"
          whileTap={{ scale: 0.98 }}
        >
          {isProcessing ? 'Authorizing payment...' : 'Continue'}
        </motion.button>
      </div>

      <div className="h-20" />
    </motion.div>
  );
}
