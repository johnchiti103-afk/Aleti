 import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Star, MapPin, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { foodStores } from '../data/foodStores';

interface StoreInfo {
  id: string;
  name: string;
  image: string;
  distance: number;
  rating: number;
  deliveryTime: string;
}

export function Shop() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const storesWithInfo: StoreInfo[] = [
    {
      id: 'hungry-lion',
      name: 'Hungry Lion',
      image: 'https://images.pexels.com/photos/3407899/pexels-photo-3407899.jpeg?auto=compress&cs=tinysrgb&w=400',
      distance: 0.9,
      rating: 4.8,
      deliveryTime: '15-25 min'
    },
    {
      id: 'pizza-hub',
      name: 'Pizza Hub',
      image: 'https://images.pexels.com/photos/7974/pexels-photo.jpeg?auto=compress&cs=tinysrgb&w=400',
      distance: 2.1,
      rating: 4.6,
      deliveryTime: '20-30 min'
    },
    {
      id: 'sushi-spot',
      name: 'Sushi Spot',
      image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
      distance: 3.5,
      rating: 4.7,
      deliveryTime: '25-35 min'
    },
    {
      id: 'thai-delight',
      name: 'Thai Delight',
      image: 'https://images.pexels.com/photos/5725721/pexels-photo-5725721.jpeg?auto=compress&cs=tinysrgb&w=400',
      distance: 1.8,
      rating: 4.9,
      deliveryTime: '18-28 min'
    }
  ];

  const filteredStores = useMemo(() => {
    if (!searchQuery.trim()) {
      return storesWithInfo;
    }

    const query = searchQuery.toLowerCase();
    return storesWithInfo
      .filter(store => store.name.toLowerCase().includes(query))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [searchQuery]);

  const handleStoreClick = (storeId: string) => {
    navigate(`/order-foodies/${storeId}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-screen bg-white"
    >
      <div className="fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-100">
        <div className="p-4 pt-6 pb-4">
          <div className="flex items-center gap-4 mb-4">
            <motion.button
              onClick={() => navigate('/aletwende-send')}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0"
            >
              <ArrowLeft size={24} className="text-gray-800" />
            </motion.button>
            <h1 className="text-3xl font-bold text-gray-900">
              Select a Foodies Store
            </h1>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stores..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-100 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 overflow-y-auto px-4 pb-4 space-y-3"
        style={{ marginTop: '160px' }}
      >
        {filteredStores.length > 0 ? (
          filteredStores.map((store) => (
            <motion.button
              key={store.id}
              variants={itemVariants}
              onClick={() => handleStoreClick(store.id)}
              whileTap={{ scale: 0.98 }}
              className="w-full flex gap-4 p-4 bg-white rounded-2xl border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all"
            >
              <div className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={store.image}
                  alt={store.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 flex flex-col justify-between text-left">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">
                    {store.name}
                  </h3>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-1">
                      <MapPin size={14} className="text-gray-400" />
                      <span className="text-xs text-gray-600">
                        {store.distance} km
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-amber-400 fill-amber-400" />
                      <span className="text-xs text-gray-700 font-semibold">
                        {store.rating}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock size={14} className="text-gray-400" />
                  <span className="text-xs">{store.deliveryTime}</span>
                </div>
              </div>

              <div className="flex items-center justify-center flex-shrink-0">
                <ChevronRight size={20} className="text-gray-400" />
              </div>
            </motion.button>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-12"
          >
            <p className="text-gray-500 text-center">
              No stores found matching "{searchQuery}"
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
