  import { CarType, RecentSearch } from '../types';

export const carTypes: CarType[] = [
  {
    id: 'bolt',
    name: 'Bolt',
    description: 'Mid-size cars',
    eta: '1 min',
    price: 0,
    originalPrice: 0,
    capacity: 3,
    badge: 'FASTER',
    icon: '🚗'
  },
  {
    id: 'economy',
    name: 'Economy',
    description: 'Affordable rides',
    eta: '2 min',
    price: 0,
    originalPrice: 0,
    capacity: 2,
    badge: 'CHEAPER',
    icon: '🚙'
  },
  {
    id: 'comfort',
    name: 'Comfort',
    description: 'Premium cars',
    eta: '3 min',
    price: 0,
    originalPrice: 0,
    capacity: 4,
    badge: 'LUXURY',
    icon: '🚖'
  },
  {
    id: 'xl',
    name: 'Bolt XL',
    description: 'Extra space',
    eta: '4 min',
    price: 0,
    originalPrice: 0,
    capacity: 6,
    badge: 'SPACIOUS',
    icon: '🚐'
  }
];

export const recentSearches: RecentSearch[] = [
  {
    id: '1',
    address: '78 Eastwood Street',
    description: 'West Turffontein, Johannesburg'
  },
  {
    id: '2',
    address: 'KFC Gandhi Square',
    description: 'Umnutho House, Eloff Street, Marshalltown...'
  },
  {
    id: '3',
    address: 'Johannesburg Park Station',
    description: 'Rissik Street, Johannesburg Central'
  },
  {
    id: '4',
    address: 'Mall of Africa',
    description: 'Lone Creek Crescent, Waterfall City'
  },
  {
    id: '5',
    address: 'OR Tambo International Airport',
    description: 'O.R. Tambo Airport Rd, Kempton Park'
  }
];

export interface Shop {
  id: number;
  name: string;
  distance_km: number;
  rating?: number;
  deliveryTime?: string;
  image?: string;
}

export const shops: Shop[] = [
  {
    id: 1,
    name: 'My Oyster House',
    distance_km: 0.9,
    rating: 4.6,
    deliveryTime: '25-40 min',
    image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 2,
    name: 'Hungry Lion',
    distance_km: 1.2,
    rating: 4.8,
    deliveryTime: '15-25 min',
    image: 'https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 3,
    name: 'The Asian Kitchen',
    distance_km: 1.5,
    rating: 4.5,
    deliveryTime: '30-45 min',
    image: 'https://images.pexels.com/photos/3656307/pexels-photo-3656307.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 4,
    name: 'Legana Food Heist',
    distance_km: 2.1,
    rating: 4.3,
    deliveryTime: '20-35 min',
    image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 5,
    name: 'Urban Bistro',
    distance_km: 2.8,
    rating: 4.7,
    deliveryTime: '25-40 min',
    image: 'https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 6,
    name: 'Premium Deli',
    distance_km: 3.2,
    rating: 4.4,
    deliveryTime: '30-50 min',
    image: 'https://images.pexels.com/photos/3656307/pexels-photo-3656307.jpeg?auto=compress&cs=tinysrgb&w=400'
  }
];