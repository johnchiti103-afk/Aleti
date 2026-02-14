import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useFoodPayment } from '../contexts/FoodPaymentContext';
import { useFoodOrderSession } from '../contexts/FoodOrderSession';

export function FoodAddCard() {
  const navigate = useNavigate();
  const { addCard, startPaymentAuthorization } = useFoodPayment();
  const { deliveryModeFee } = useFoodOrderSession();

  const [cardData, setCardData] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'cardNumber') {
      const cleaned = value.replace(/\s/g, '').slice(0, 16);
      const formatted = cleaned.replace(/(\d{4})/g, '$1 ').trim();
      setCardData(prev => ({ ...prev, [name]: formatted }));
      return;
    }

    if (name === 'expiryMonth') {
      const val = value.slice(0, 2);
      setCardData(prev => ({ ...prev, [name]: val }));
      return;
    }

    if (name === 'expiryYear') {
      const val = value.slice(0, 2);
      setCardData(prev => ({ ...prev, [name]: val }));
      return;
    }

    if (name === 'cvv') {
      const val = value.slice(0, 3);
      setCardData(prev => ({ ...prev, [name]: val }));
      return;
    }

    setCardData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddCard = async () => {
    if (!cardData.cardholderName || !cardData.cardNumber || !cardData.expiryMonth || !cardData.expiryYear || !cardData.cvv) {
      alert('Please fill in all card details');
      return;
    }

    setIsProcessing(true);

    try {
      const cleanCardNumber = cardData.cardNumber.replace(/\s/g, '');
      const cardBrand = cleanCardNumber.startsWith('4') ? 'Visa' : 'Mastercard';

      const newCard = {
        cardholderName: cardData.cardholderName,
        cardNumber: cleanCardNumber,
        cardBrand,
        expiryMonth: cardData.expiryMonth,
        expiryYear: cardData.expiryYear
      };

      addCard(newCard);

      await startPaymentAuthorization('card', deliveryModeFee);

      setIsProcessing(false);
      navigate('/food-delivery');
    } catch (error) {
      setIsProcessing(false);
      alert('Error adding card. Please try again.');
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
          <h1 className="text-2xl font-bold text-gray-900">Add card</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 mt-20">
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <h3 className="font-semibold text-blue-900 mb-2">PIN Code</h3>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((num) => (
                <div
                  key={num}
                  className="aspect-square flex items-center justify-center bg-white rounded-lg border border-blue-200 text-gray-900 font-semibold text-lg cursor-pointer hover:bg-blue-100 transition-colors"
                >
                  {num}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder name</label>
              <input
                type="text"
                name="cardholderName"
                value={cardData.cardholderName}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Card number</label>
              <input
                type="text"
                name="cardNumber"
                value={cardData.cardNumber}
                onChange={handleInputChange}
                placeholder="4242 4242 4242 4242"
                maxLength={19}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-gray-900 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">MM</label>
                <input
                  type="text"
                  name="expiryMonth"
                  value={cardData.expiryMonth}
                  onChange={handleInputChange}
                  placeholder="12"
                  maxLength={2}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-gray-900 text-center"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">YY</label>
                <input
                  type="text"
                  name="expiryYear"
                  value={cardData.expiryYear}
                  onChange={handleInputChange}
                  placeholder="25"
                  maxLength={2}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-gray-900 text-center"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
              <input
                type="text"
                name="cvv"
                value={cardData.cvv}
                onChange={handleInputChange}
                placeholder="123"
                maxLength={3}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-gray-900 text-center font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-20">
        <motion.button
          onClick={handleAddCard}
          disabled={isProcessing}
          className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold text-lg disabled:bg-gray-300 disabled:text-gray-500 hover:bg-green-700 transition-colors"
          whileTap={{ scale: 0.98 }}
        >
          {isProcessing ? 'Processing...' : 'Add card'}
        </motion.button>
      </div>

      <div className="h-20" />
    </motion.div>
  );
}
