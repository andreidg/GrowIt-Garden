import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
interface Step3Props {
  onComplete: () => void;
}
export const Step3Alerts: React.FC<Step3Props> = ({ onComplete }) => {
  const [alerts, setAlerts] = useState({
    frost: true,
    hail: true,
    planting: false,
    watering: true
  });
  const toggleAlert = (key: keyof typeof alerts) => {
    setAlerts((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  return (
    <div className="flex flex-col h-full px-6 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="font-serif text-3xl font-semibold text-forest mb-2">
        Set your alerts
      </h1>
      <p className="font-sans text-forest/80 mb-8">
        We'll only notify you when it matters.
      </p>

      <div className="space-y-6 flex-1">
        {[
        {
          id: 'frost',
          label: 'Frost Warnings',
          desc: 'Alerts when temps drop below 2°C'
        },
        {
          id: 'hail',
          label: 'Hail Alerts',
          desc: 'Summer storm warnings for your area'
        },
        {
          id: 'planting',
          label: 'Planting Reminders',
          desc: 'Weekly tips based on your calendar'
        },
        {
          id: 'watering',
          label: 'Watering Days',
          desc: 'Optimal days based on rainfall'
        }].
        map((alert) =>
        <div
          key={alert.id}
          className="flex items-start justify-between gap-4">
          
            <div>
              <h3 className="font-medium text-forest text-lg">{alert.label}</h3>
              <p className="text-sm text-forest/60 mt-1">{alert.desc}</p>
            </div>
            <button
            onClick={() => toggleAlert(alert.id as keyof typeof alerts)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors mt-1 ${alerts[alert.id as keyof typeof alerts] ? 'bg-forest' : 'bg-cream-dark'}`}>
            
              <span
              className={`inline-block h-5 w-5 transform rounded-full bg-cream transition-transform ${alerts[alert.id as keyof typeof alerts] ? 'translate-x-6' : 'translate-x-1'}`} />
            
            </button>
          </div>
        )}

        <div className="pt-6 border-t border-cream-dark mt-6">
          <h3 className="font-medium text-forest mb-4">
            Preferred notification time
          </h3>
          <div className="flex items-center justify-center gap-4 bg-cream-light rounded-2xl py-4 border border-cream-dark">
            <div className="flex flex-col items-center">
              <button className="text-forest/50 hover:text-forest p-1">
                <ChevronUp size={20} />
              </button>
              <span className="text-2xl font-serif font-medium text-forest">
                07
              </span>
              <button className="text-forest/50 hover:text-forest p-1">
                <ChevronDown size={20} />
              </button>
            </div>
            <span className="text-2xl font-serif font-medium text-forest pb-1">
              :
            </span>
            <div className="flex flex-col items-center">
              <button className="text-forest/50 hover:text-forest p-1">
                <ChevronUp size={20} />
              </button>
              <span className="text-2xl font-serif font-medium text-forest">
                00
              </span>
              <button className="text-forest/50 hover:text-forest p-1">
                <ChevronDown size={20} />
              </button>
            </div>
            <div className="flex flex-col items-center ml-2">
              <button className="text-forest/50 hover:text-forest p-1">
                <ChevronUp size={20} />
              </button>
              <span className="text-xl font-medium text-forest">AM</span>
              <button className="text-forest/50 hover:text-forest p-1">
                <ChevronDown size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onComplete}
        className="w-full bg-terracotta text-cream py-4 rounded-full font-semibold text-lg mt-8 shadow-lg shadow-terracotta/20">
        
        Start Growing →
      </button>
    </div>);

};