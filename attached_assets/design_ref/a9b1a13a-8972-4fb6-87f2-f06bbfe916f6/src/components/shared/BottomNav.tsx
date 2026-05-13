import React from 'react';
import { Home, Calendar, Camera, Bell } from 'lucide-react';
export type Screen =
'onboarding' |
'dashboard' |
'calendar' |
'scan' |
'alerts' |
'plant-detail';
interface BottomNavProps {
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
}
export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  setCurrentScreen
}) => {
  if (currentScreen === 'onboarding') return null;
  const navItems = [
  {
    id: 'dashboard' as Screen,
    label: 'Home',
    icon: Home
  },
  {
    id: 'calendar' as Screen,
    label: 'Calendar',
    icon: Calendar
  },
  {
    id: 'scan' as Screen,
    label: 'Scan',
    icon: Camera
  },
  {
    id: 'alerts' as Screen,
    label: 'Alerts',
    icon: Bell
  }];

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-cream border-t border-cream-dark px-6 py-4 pb-8 flex justify-between items-center z-50">
      {navItems.map((item) => {
        const isActive =
        currentScreen === item.id ||
        currentScreen === 'plant-detail' && item.id === 'dashboard';
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => setCurrentScreen(item.id)}
            className="flex flex-col items-center gap-1 relative">
            
            <div
              className={`p-2 rounded-full transition-colors ${isActive ? 'bg-forest text-cream' : 'text-forest'}`}>
              
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span
              className={`text-[10px] font-medium ${isActive ? 'text-forest' : 'text-forest/70'}`}>
              
              {item.label}
            </span>
            {isActive &&
            <div className="absolute -bottom-2 w-1 h-1 bg-gold rounded-full" />
            }
          </button>);

      })}
    </div>);

};