export interface FoodItem {
  id: string;
  name: string;
  price: number;
  image: string;
}

export interface FoodStore {
  id: string;
  name: string;
  image: string;
  foods: FoodItem[];
}

export const foodStores: FoodStore[] = [
  {
    id: 'hungry-lion',
    name: 'Hungry Lion',
    image: 'https://images.pexels.com/photos/3407899/pexels-photo-3407899.jpeg?auto=compress&cs=tinysrgb&w=400',
    foods: [
      {
        id: 'hl-fried-chicken',
        name: 'Fried Chicken & Chips',
        price: 90,
        image: 'https://images.pexels.com/photos/5639730/pexels-photo-5639730.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
      {
        id: 'hl-double-cheese',
        name: 'Double Cheese Lion',
        price: 80,
        image: 'https://images.pexels.com/photos/5737368/pexels-photo-5737368.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
      {
        id: 'hl-burger-chips',
        name: 'Lion Burger & Chips',
        price: 65,
        image: 'https://images.pexels.com/photos/5632672/pexels-photo-5632672.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
      {
        id: 'hl-combo',
        name: 'Classic Combo',
        price: 70,
        image: 'https://images.pexels.com/photos/3915857/pexels-photo-3915857.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
    ],
  },
  {
    id: 'pizza-hub',
    name: 'Pizza Hub',
    image: 'https://images.pexels.com/photos/7974/pexels-photo.jpeg?auto=compress&cs=tinysrgb&w=400',
    foods: [
      {
        id: 'ph-margherita',
        name: 'Margherita Pizza',
        price: 120,
        image: 'https://images.pexels.com/photos/3621613/pexels-photo-3621613.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
      {
        id: 'ph-pepperoni',
        name: 'Pepperoni Special',
        price: 140,
        image: 'https://images.pexels.com/photos/4551832/pexels-photo-4551832.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
      {
        id: 'ph-hawaiian',
        name: 'Hawaiian Pizza',
        price: 130,
        image: 'https://images.pexels.com/photos/1997603/pexels-photo-1997603.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
      {
        id: 'ph-quattro',
        name: 'Quattro Formaggi',
        price: 150,
        image: 'https://images.pexels.com/photos/3536236/pexels-photo-3536236.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
    ],
  },
  {
    id: 'sushi-spot',
    name: 'Sushi Spot',
    image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
    foods: [
      {
        id: 'ss-california',
        name: 'California Roll',
        price: 110,
        image: 'https://images.pexels.com/photos/370984/pexels-photo-370984.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
      {
        id: 'ss-spicy-tuna',
        name: 'Spicy Tuna Roll',
        price: 115,
        image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
      {
        id: 'ss-dragon',
        name: 'Dragon Roll',
        price: 140,
        image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
      {
        id: 'ss-assorted',
        name: 'Assorted Platter',
        price: 160,
        image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
    ],
  },
  {
    id: 'thai-delight',
    name: 'Thai Delight',
    image: 'https://images.pexels.com/photos/5725721/pexels-photo-5725721.jpeg?auto=compress&cs=tinysrgb&w=400',
    foods: [
      {
        id: 'td-pad-thai',
        name: 'Pad Thai',
        price: 85,
        image: 'https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
      {
        id: 'td-green-curry',
        name: 'Green Curry',
        price: 95,
        image: 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
      {
        id: 'td-tom-yum',
        name: 'Tom Yum Soup',
        price: 75,
        image: 'https://images.pexels.com/photos/5737368/pexels-photo-5737368.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
      {
        id: 'td-spring-rolls',
        name: 'Spring Rolls',
        price: 55,
        image: 'https://images.pexels.com/photos/5731455/pexels-photo-5731455.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
    ],
  },
];
