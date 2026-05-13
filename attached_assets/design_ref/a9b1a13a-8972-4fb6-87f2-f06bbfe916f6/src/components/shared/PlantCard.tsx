import React from 'react';
interface PlantCardProps {
  name: string;
  action: string;
  actionColor: 'frost' | 'gold' | 'terracotta' | 'forest';
  icon: React.ReactNode;
  onClick?: () => void;
}
export const PlantCard: React.FC<PlantCardProps> = ({
  name,
  action,
  actionColor,
  icon,
  onClick
}) => {
  const colorMap = {
    frost: 'bg-frost/20 text-forest',
    gold: 'bg-gold/20 text-forest',
    terracotta: 'bg-terracotta/20 text-terracotta-dark',
    forest: 'bg-forest/10 text-forest'
  };
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 bg-cream-light border border-cream-dark p-4 rounded-2xl hover:border-forest/30 transition-colors text-left">
      
      <div className="w-16 h-16 rounded-xl bg-cream flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-serif text-lg font-semibold text-forest mb-1">
          {name}
        </h3>
        <span
          className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium ${colorMap[actionColor]}`}>
          
          {action}
        </span>
      </div>
    </button>);

};