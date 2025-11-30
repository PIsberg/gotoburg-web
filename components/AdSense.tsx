import React from 'react';
import { AdUnitProps } from '../types';

const AdSense: React.FC<AdUnitProps> = ({ slot, format = 'auto', className = '', label = 'Annons' }) => {
  return (
    <div className={`w-full my-6 flex flex-col items-center justify-center ${className}`}>
      <span className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">{label}</span>
      <div 
        className="w-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 text-sm font-medium p-4 rounded-sm"
        style={{ minHeight: format === 'rectangle' ? '250px' : '100px' }}
      >
        {/* In a real deployment, the Google AdSense <ins> tag would go here */}
        <div className="text-center">
          <p className="font-mono text-xs mb-2">Google AdSense Slot: {slot}</p>
          <p className="text-xs opacity-50">(Annonsinnehåll laddas dynamiskt)</p>
        </div>
      </div>
    </div>
  );
};

export default AdSense;