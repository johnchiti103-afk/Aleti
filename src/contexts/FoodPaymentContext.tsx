import React, { createContext, useContext, useState, useCallback } from 'react';

export type PaymentStatus = 'idle' | 'authorizing' | 'authorized' | 'failed' | 'released' | 'captured';
export type PaymentMethod = 'cash' | 'card' | 'mobile-money' | null;

interface SavedCard {
  id: string;
  lastFour: string;
  brand: string;
  expiryDate: string;
}

interface FoodPaymentState {
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  savedCards: SavedCard[];
  selectedCardId: string | null;
  totalAmount: number;
  authorizationId: string | null;
  startPaymentAuthorization: (method: PaymentMethod, amount: number) => Promise<void>;
  completeAuthorization: () => void;
  failAuthorization: () => void;
  releaseAuthorization: () => void;
  capturePayment: () => void;
  resetPayment: () => void;
  addCard: (cardData: any) => void;
  selectCard: (cardId: string) => void;
}

const FoodPaymentContext = createContext<FoodPaymentState | undefined>(undefined);

export function FoodPaymentProvider({ children }: { children: React.ReactNode }) {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([
    { id: 'card-1', lastFour: '4242', brand: 'Visa', expiryDate: '12/25' }
  ]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [authorizationId, setAuthorizationId] = useState<string | null>(null);

  const startPaymentAuthorization = useCallback(async (method: PaymentMethod, amount: number) => {
    if (!method) return;

    setPaymentStatus('authorizing');
    setPaymentMethod(method);
    setTotalAmount(amount);

    return new Promise((resolve) => {
      setTimeout(() => {
        const mockAuthId = `auth_${Date.now()}`;
        setAuthorizationId(mockAuthId);
        setPaymentStatus('authorized');
        resolve();
      }, 1500);
    });
  }, []);

  const completeAuthorization = useCallback(() => {
    setPaymentStatus('authorized');
  }, []);

  const failAuthorization = useCallback(() => {
    setPaymentStatus('failed');
    setAuthorizationId(null);
  }, []);

  const releaseAuthorization = useCallback(() => {
    setPaymentStatus('released');
    setPaymentMethod(null);
    setAuthorizationId(null);
  }, []);

  const capturePayment = useCallback(() => {
    setPaymentStatus('captured');
  }, []);

  const resetPayment = useCallback(() => {
    setPaymentStatus('idle');
    setPaymentMethod(null);
    setSelectedCardId(null);
    setTotalAmount(0);
    setAuthorizationId(null);
  }, []);

  const addCard = useCallback((cardData: any) => {
    const newCard: SavedCard = {
      id: `card_${Date.now()}`,
      lastFour: cardData.cardNumber.slice(-4),
      brand: cardData.cardBrand || 'Card',
      expiryDate: `${cardData.expiryMonth}/${cardData.expiryYear}`
    };
    setSavedCards(prev => [...prev, newCard]);
    setSelectedCardId(newCard.id);
  }, []);

  const selectCard = useCallback((cardId: string) => {
    setSelectedCardId(cardId);
  }, []);

  return (
    <FoodPaymentContext.Provider
      value={{
        paymentStatus,
        paymentMethod,
        savedCards,
        selectedCardId,
        totalAmount,
        authorizationId,
        startPaymentAuthorization,
        completeAuthorization,
        failAuthorization,
        releaseAuthorization,
        capturePayment,
        resetPayment,
        addCard,
        selectCard
      }}
    >
      {children}
    </FoodPaymentContext.Provider>
  );
}

export function useFoodPayment() {
  const context = useContext(FoodPaymentContext);
  if (!context) {
    throw new Error('useFoodPayment must be used within FoodPaymentProvider');
  }
  return context;
}
