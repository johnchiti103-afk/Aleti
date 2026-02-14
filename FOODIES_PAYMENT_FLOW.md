# Foodies Delivery - Payment Flow & Professional Implementation

Complete implementation of professional payment, confirmation, and delivery driver flow for the Foodies delivery system.

## 1. Layout Fixes

### FoodiesRoute Page
- **Fixed bottom "Go to delivery" button**: No longer moves with page content
- **Fixed header**: Back button, title, address inputs always visible at top
- **Scrollable middle content**: Recent addresses scroll while header/footer stay fixed
- **Layout structure**: `flex flex-col h-screen` with proper flex-shrink properties
- **Address editing**: Users can edit addresses after auto-fill

### FoodConfirmOrder Page
- **Fixed bottom confirm button**: No longer moves
- **Scrollable order details**: Only the delivery details section scrolls
- **Proper layout**: Content above, confirm button fixed at bottom

### FoodiesRoute Address Input
- **Fully editable**: Users can modify auto-filled addresses
- **Real-time updates**: Changes immediately persist to state
- **Shared recent addresses**: All inputs use the same address list

## 2. Payment Infrastructure

### Payment Context (FoodPaymentContext)
Manages all payment state and operations:
- **Payment Status**: `idle` → `authorizing` → `authorized` → `captured` or `released`
- **Payment Methods**: Cash, Card, Mobile Money
- **Saved Cards**: Mock card storage with CRUD operations
- **Mock Authorization**: Simulates PIN/processing with 1.5s delay
- **Payment Isolation**: Completely separate from ride payment system

### Payment Flow States
```
User taps Cash button → Payment Page
  ↓
User selects payment method (Cash/Card/Mobile Money)
  ↓
Authorization page (PIN pad for cards, phone for mobile money)
  ↓
Payment status → "authorized"
  ↓
Return to Delivery Page
  ↓
"Select" button now enabled
  ↓
Tap "Select" → Confirm Order Page
  ↓
Tap "Confirm" → Create delivery order
  ↓
Wait for driver (mock 3s delay)
  ↓
Driver found → Driver Coming Page
  ↓
Payment captured (when driver accepts)
  ↓
Rating modal → Dashboard
```

## 3. Payment Pages

### FoodPayment Page
- **Bolt Balance**: Informational display (R 0)
- **Payment Methods**:
  - Cash (selected by default, green highlight)
  - Saved cards with last 4 digits and expiry
  - "Add debit/credit card" button (dashed border)
  - Mobile Money option with (+) sign
  - "Manage work profile" option
- **Continue Button**: Enabled only when method selected
- **Integration**: Navigates back to FoodDelivery on selection

### FoodAddCard Page
- **PIN Pad UI**: Visual keyboard (numbers 0-9, *, #)
- **Card Fields**:
  - Cardholder name
  - Card number (auto-formatted: "4242 4242 4242 4242")
  - Expiry (MM/YY)
  - CVV (3 digits)
- **Mock Authorization**: Auto-processes and navigates back to Delivery Page
- **Card Detection**: Detects Visa/Mastercard from first digit

### FoodMobileMoneyPage
- **Phone Input**: +254 country code + phone number
- **Provider Selection**: M-Pesa, Airtel Money, MTN Money
- **How It Works**: Step-by-step instructions
- **Mock Process**: Simulates provider selection and PIN confirmation

## 4. Delivery Mode Selection & Payment

### FoodDelivery Page Changes
- **Cash Button**: Green-highlighted at bottom panel
  - Tapping navigates to Payment Page
  - Persists payment context
  - Returns to FoodDelivery when payment authorized
- **Select Button**: Disabled until `paymentStatus === "authorized"`
  - Only enabled after successful payment authorization
  - On tap → Creates delivery order → Waiting for Driver page

### Delivery Modes
- **Motorbike**: R 80 (15-25 min) - Fast delivery
- **Car**: R 140 (20-35 min) - Standard delivery
- **Bicycle**: R 105 (25-40 min) - Eco-friendly

### Pricing Logic (CRITICAL)
```
Food Subtotal: Sum of all food items
+ Delivery Fee: Selected mode price (80, 105, or 140)
= Total: Displayed on all pages consistently
```

## 5. Order Confirmation & Driver Flow

### FoodConfirmOrder Page
- **Order Summary**: Lists all food items with prices
- **Payment Details**: Shows food subtotal + delivery fee
- **Delivery Details**: Location + selected delivery mode
- **Confirm Button**: Creates delivery order and navigates to waiting
- **Order Creation**: Saves to localStorage with:
  - Order ID (timestamp-based)
  - Food items
  - Pricing breakdown
  - Delivery location
  - Selected delivery mode
  - Status: "pending"

### FoodWaitingDriver Page
- **Delivery-Specific Copy**:
  - Car: "Waiting for driver…"
  - Motorbike/Bicycle: "Waiting for cyclist…"
- **Mock Driver Search**: 3-second delay then driver appears
- **Driver Card**:
  - Profile photo
  - Name
  - Rating (⭐⭐⭐⭐⭐ format)
  - Vehicle/Bike info
  - Plate number
- **Order Summary**: Shows items being delivered
- **Payment Capture**: Triggered when driver accepts (mock)
- **Continue Button**: Navigates to Driver Coming page

### FoodDriverComing Page
- **Completion Status**: "Delivery Complete!" after 5 seconds
- **Driver Information**:
  - Photo
  - Name and rating
  - Vehicle details
- **Call/Message Buttons**: Available for driver contact
- **Items Being Delivered**: Full order summary
- **Rating Modal**: Appears on completion
- **Post-Rating**: Navigates to dashboard

## 6. Architecture & Isolation

### Separate from Ride System
- **Payment Context**: `FoodPaymentContext` (not shared with rides)
- **Order System**: Food delivery orders separate from ride orders
- **Driver Logic**: Delivery driver matching separate from ride matching
- **Status**: Independent status tracking and UI copy

### Reusable Components
- **RatingModal**: Same component for both rides and deliveries
- **UI Pages**: New food-specific pages, not modifications of ride pages

### State Management
- **FoodPaymentContext**: Payment state only
- **FoodOrderSession**: Food items, addresses, delivery mode, location
- **localStorage**: Delivery orders persisted for offline access

## 7. Payment States & Behavior

### Authorization Hold
- When user selects any payment method:
  - Status changes to `authorizing`
  - Mock 1.5s processing delay
  - On success: `authorized`
  - User can proceed with delivery selection
- **No Real Transfers**: All transfers are mocked
- **Temporary Hold**: Clearly labeled as authorization

### Payment Capture
- Triggered when delivery driver accepts
- Status changes to `captured`
- Ready for real implementation of:
  - Payment split between store, driver, platform
  - Actual fund transfers

### Payment Release
- If no driver found within timeout:
  - Status changes to `released`
  - Authorization voided
  - User charged nothing
  - Message: "We couldn't find a delivery driver. No money was charged."

## 8. Navigation Stack

### Complete Flow
```
Order Foodies
  ↓ [Complete Order button]
Foodies Route
  ↓ [Go to delivery button]
Food Delivery
  ↓ [Cash button OR directly to confirm if pre-authorized]
Food Payment (if tapped Cash)
  ↓ [Select method]
Food Add Card / Mobile Money (optional)
  ↓ [Process payment]
← Back to Food Delivery (payment authorized)
  ↓ [Select button now enabled]
Food Confirm Order
  ↓ [Confirm order]
Food Waiting Driver
  ↓ [Driver found after mock 3s]
Food Driver Coming
  ↓ [After 5s auto-complete OR manual completion]
Rating Modal
  ↓ [Submit rating]
Dashboard
```

### Back Navigation
- Payment Page → Food Delivery (preserves payment state)
- Add Card → Payment (adds card, returns authorized)
- Mobile Money → Payment (after authorization)
- Confirm Order → Food Delivery
- Waiting Driver → Dashboard (Cancel button)
- Driver Coming → Dashboard (after completion)

## 9. Files Created

1. `/src/contexts/FoodPaymentContext.tsx` - Payment state management
2. `/src/pages/FoodPayment.tsx` - Payment method selection
3. `/src/pages/FoodAddCard.tsx` - Card entry with PIN pad
4. `/src/pages/FoodMobileMoneyPage.tsx` - Mobile money provider selection
5. `/src/pages/FoodWaitingDriver.tsx` - Waiting for delivery driver
6. `/src/pages/FoodDriverComing.tsx` - Driver en route & completion

## 10. Files Modified

1. `/src/pages/FoodiesRoute.tsx` - Fixed bottom panel, editable addresses
2. `/src/pages/FoodDelivery.tsx` - Added Cash button, payment integration
3. `/src/pages/FoodConfirmOrder.tsx` - Fixed bottom button, order creation
4. `/src/contexts/FoodOrderSession.tsx` - Already had delivery mode & location
5. `/src/App.tsx` - Added routes and FoodPaymentProvider wrapper

## 11. Mock Features & Future Integration Points

### Mock Payment Processing
```typescript
paymentStatus: 'idle' | 'authorizing' | 'authorized' | 'failed' | 'released' | 'captured'
```

### Placeholder Implementations
1. **Card Validation**: Detects brand from first digit (4=Visa, 5=Mastercard)
2. **PIN Confirmation**: Visual keyboard (no actual validation)
3. **Driver Matching**: Mock 3-second delay + random driver
4. **Payment Capture**: Triggered on driver acceptance (no transfer yet)

### Real Implementation Hooks
1. **Replace mock payment authorization** with actual payment gateway
2. **Replace card storage** with secure vault (Stripe, etc.)
3. **Replace mock driver matching** with real distance + rating algorithm
4. **Replace payment capture** with actual fund transfers
5. **Add payment split logic** (store, driver, platform percentages)

## 12. Build Status

✅ Build successful with no errors
✅ All routes registered
✅ All components integrated
✅ Context providers properly nested
✅ Payment state persists across navigation
✅ Delivery orders saved to localStorage

## Testing Checklist

- [ ] Cash button navigates to Payment Page
- [ ] Payment authorization works for all methods
- [ ] Select button disabled until authorized
- [ ] Confirm Order creates delivery order
- [ ] Waiting for Driver shows mock driver after 3s
- [ ] Driver Coming shows completion after 5s
- [ ] Rating modal appears on completion
- [ ] Back navigation preserves all state
- [ ] Address editing works on Foodies Route
- [ ] Bottom panels fixed on all pages
- [ ] Delivery-specific copy shows correctly
