export interface DeliveryAddress {
  id: string;
  name: string;
  address: string;
  description: string;
  distance?: string;
  latitude?: number;
  longitude?: number;
}

export const mockDeliveryAddresses: DeliveryAddress[] = [
  {
    id: '1',
    name: 'KFC Gandhi Square',
    address: 'KFC Gandhi Square',
    description: 'Umnutho House, Eloff Street, Marshalltown',
    distance: '3.7 km',
    latitude: -26.2041,
    longitude: 28.0473
  },
  {
    id: '2',
    name: '108 Eloff Street',
    address: '108 Eloff Street',
    description: 'Marshalltown, Johannesburg',
    distance: '3.6 km',
    latitude: -26.2051,
    longitude: 28.0463
  },
  {
    id: '3',
    name: 'Builders Warehouse Glen Eagles',
    address: 'Builders Warehouse Glen Eagles',
    description: 'Lois Avenue, Glenanda, Johannesburg',
    distance: '4.1 km',
    latitude: -26.2141,
    longitude: 28.0573
  },
  {
    id: '4',
    name: '5A Lois Avenue',
    address: '5A Lois Avenue',
    description: 'Glenanda, Johannesburg',
    distance: '4.1 km',
    latitude: -26.2151,
    longitude: 28.0583
  },
  {
    id: '5',
    name: 'home',
    address: 'home',
    description: 'Honchos Hillbrow, 54 Kotze Street',
    distance: '5.5 km',
    latitude: -26.1841,
    longitude: 28.0373
  },
  {
    id: '6',
    name: '65 Saint Frusquin Street',
    address: '65 Saint Frusquin Street',
    description: 'Malvern, Johannesburg',
    distance: '8.2 km',
    latitude: -26.2341,
    longitude: 28.0773
  },
  {
    id: '7',
    name: '130 Main Street',
    address: '130 Main Street',
    description: 'Marshalltown, Johannesburg',
    distance: '3.8 km',
    latitude: -26.2061,
    longitude: 28.0483
  },
  {
    id: '8',
    name: '78 Eastwood Street',
    address: '78 Eastwood Street',
    description: 'West Turffontein, Johannesburg',
    distance: '<1 km',
    latitude: -26.2241,
    longitude: 28.0273
  },
  {
    id: '9',
    name: '8 Turf Street',
    address: '8 Turf Street',
    description: 'Forest Hill, Johannesburg',
    distance: '3.2 km',
    latitude: -26.2121,
    longitude: 28.0523
  },
  {
    id: '10',
    name: 'Johannesburg Park Station',
    address: 'Johannesburg Park Station',
    description: 'Rissik Street, Johannesburg',
    distance: '2.1 km',
    latitude: -26.1941,
    longitude: 28.0423
  }
];

export const getDeliveryAddressSuggestions = (query: string): DeliveryAddress[] => {
  if (!query.trim()) return mockDeliveryAddresses;

  return mockDeliveryAddresses.filter(
    addr =>
      addr.name.toLowerCase().includes(query.toLowerCase()) ||
      addr.address.toLowerCase().includes(query.toLowerCase()) ||
      addr.description.toLowerCase().includes(query.toLowerCase())
  );
};
