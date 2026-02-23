
import React, { useState } from 'react';
import { MessMenu } from '../types';
import { Utensils, Coffee, Leaf, Bone, Star } from 'lucide-react';

type MessCategory = 'Veg' | 'Non-Veg' | 'Special';

export const MessManager: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<MessCategory>('Veg');

  const menus: Record<MessCategory, MessMenu> = {
    'Veg': {
      breakfast: "Idli, Sambar, Coconut Chutney, Bread-Butter, Masala Chai",
      lunch: "Jeera Rice, Dal Tadka, Paneer Butter Masala, Chapati, Salad, Curd",
      snacks: "Samosa, Mint Chutney, Coffee/Tea",
      dinner: "Veg Pulao, Gobi Manchurian, Tawa Roti, Papad, Gulab Jamun"
    },
    'Non-Veg': {
      breakfast: "Omelette, Toasted Bread, Chicken Sausages, Masala Chai, Fruit Bowl",
      lunch: "Chicken Biryani, Onion Raita, Egg Curry, Chapati, Salad, Curd",
      snacks: "Chicken Cutlet, Mint Chutney, Coffee/Tea",
      dinner: "Mutton Rogan Josh, Tawa Roti, Steamed Rice, Salad, Kheer"
    },
    'Special': {
      breakfast: "Puri Bhaji, Kesari Bath, Bread Omelette, Masala Chai, Fresh Juice",
      lunch: "Butter Chicken, Paneer Tikka, Veg Fried Rice, Garlic Naan, Salad, Ice Cream",
      snacks: "Paneer Pakora, Peri Peri Fries, Coffee/Tea",
      dinner: "Dum Biryani (Veg/Chicken), Malai Kofta, Butter Naan, Cold Drinks, Brownie"
    }
  };

  const currentMenu = menus[activeCategory];

  const getCategoryStyles = (cat: MessCategory) => {
    switch (cat) {
      case 'Veg': return activeCategory === 'Veg' ? 'bg-green-600 text-white shadow-green-100' : 'text-gray-400 hover:text-green-600';
      case 'Non-Veg': return activeCategory === 'Non-Veg' ? 'bg-red-700 text-white shadow-red-100' : 'text-gray-400 hover:text-red-700';
      case 'Special': return activeCategory === 'Special' ? 'bg-amber-500 text-white shadow-amber-100' : 'text-gray-400 hover:text-amber-500';
    }
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-black tracking-tight">Mess Hall</h2>
          <p className="text-xs md:text-sm text-gray-500 font-bold">Daily nourishment tracking for VIT Hostels</p>
        </div>
        
        {/* Category Selector */}
        <div className="flex bg-white p-1.5 rounded-[1.5rem] border-2 border-gray-100 shadow-sm w-full md:w-fit overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveCategory('Veg')}
            className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 whitespace-nowrap ${getCategoryStyles('Veg')}`}
          >
            <Leaf size={14} /> Veg
          </button>
          <button 
            onClick={() => setActiveCategory('Non-Veg')}
            className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 whitespace-nowrap ${getCategoryStyles('Non-Veg')}`}
          >
            <Bone size={14} /> Non-Veg
          </button>
          <button 
            onClick={() => setActiveCategory('Special')}
            className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 whitespace-nowrap ${getCategoryStyles('Special')}`}
          >
            <Star size={14} /> Special
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MenuCard 
          icon={<Utensils className="text-orange-500" />} 
          label="Breakfast" 
          items={currentMenu.breakfast} 
          time="07:30 AM - 09:00 AM" 
          color="border-orange-100" 
        />
        <MenuCard 
          icon={<Utensils className="text-blue-500" />} 
          label="Lunch" 
          items={currentMenu.lunch} 
          time="12:30 PM - 02:00 PM" 
          color="border-blue-100" 
        />
        <MenuCard 
          icon={<Coffee className="text-amber-500" />} 
          label="Snacks" 
          items={currentMenu.snacks} 
          time="04:30 PM - 05:30 PM" 
          color="border-amber-100" 
        />
        <MenuCard 
          icon={<Utensils className="text-indigo-500" />} 
          label="Dinner" 
          items={currentMenu.dinner} 
          time="07:30 PM - 09:00 PM" 
          color="border-indigo-100" 
        />
      </div>
    </div>
  );
};

const MenuCard: React.FC<{ icon: React.ReactNode, label: string, items: string, time: string, color: string }> = ({ icon, label, items, time, color }) => (
  <div className={`bg-white p-6 md:p-8 rounded-[2.5rem] border-2 shadow-sm transition-all hover:shadow-xl ${color} group`}>
    <div className="flex items-center gap-3 mb-6">
      <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-gray-100 transition-colors">{icon}</div>
      <div>
        <h4 className="font-black text-gray-900 leading-tight">{label}</h4>
        <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">{time}</p>
      </div>
    </div>
    <div className="space-y-2.5">
      {items.split(', ').map((item, i) => (
        <div key={i} className="flex items-start gap-2 text-sm font-bold text-gray-700 leading-snug">
          <div className="w-1.5 h-1.5 bg-gray-200 rounded-full mt-1.5 flex-shrink-0"></div>
          {item}
        </div>
      ))}
    </div>
  </div>
);
