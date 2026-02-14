 export interface TripLeg {
  from: string;
  to: string;
  distance: number; // in km
}

export interface PriceCalculationResult {
  totalDistance: number;
  totalPrice: number;
  baseFare: number;
  distanceFare: number;
  legs: TripLeg[];
}

/**
 * Placeholder function to calculate trip price with stops
 * Each trip leg is assumed to be 5km for now
 * Later this will be replaced with Google Directions API
 */
export const calculatePriceWithStops = (
  pickup: string,
  destination: string,
  stops: string[] = [],
  baseFare: number = 15,
  perKmRate: number = 2.5
): PriceCalculationResult => {
  const legs: TripLeg[] = [];
  let totalDistance = 0;

  // Create trip legs
  const waypoints = [pickup, ...stops, destination];
  
  for (let i = 0; i < waypoints.length - 1; i++) {
    const leg: TripLeg = {
      from: waypoints[i],
      to: waypoints[i + 1],
      distance: 5 // Placeholder: 5km per leg
    };
    legs.push(leg);
    totalDistance += leg.distance;
  }

  // Calculate price
  const distanceFare = totalDistance * perKmRate;
  const totalPrice = baseFare + distanceFare;

  return {
    totalDistance,
    totalPrice: Math.round(totalPrice), // Round to nearest rand
    baseFare,
    distanceFare,
    legs
  };
};

/**
 * Get adjusted price for specific car type
 * Different car types have different multipliers
 */
export const getCarTypePrice = (
  basePrice: number,
  carType: string
): number => {
  const multipliers: Record<string, number> = {
    'Economy': 0.9,
    'Bolt': 1.0,
    'Comfort': 1.2,
    'Bolt XL': 1.5
  };

  const multiplier = multipliers[carType] || 1.0;
  return Math.round(basePrice * multiplier);
};

