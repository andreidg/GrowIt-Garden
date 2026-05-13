import React, { useState } from 'react';
import { PhoneFrame } from './components/shared/PhoneFrame';
import { BottomNav, Screen } from './components/shared/BottomNav';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { Dashboard } from './components/screens/Dashboard';
import { Calendar } from './components/screens/Calendar';
import { FrostAlert } from './components/screens/FrostAlert';
import { GardenAnalysis } from './components/screens/GardenAnalysis';
import { PlantDetail } from './components/screens/PlantDetail';
export function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [previousScreen, setPreviousScreen] = useState<Screen>('dashboard');
  const handleNavigate = (screen: Screen) => {
    if (
    currentScreen !== 'plant-detail' &&
    currentScreen !== 'alerts' &&
    currentScreen !== 'scan')
    {
      setPreviousScreen(currentScreen);
    }
    setCurrentScreen(screen);
  };
  const handleBack = () => {
    setCurrentScreen(previousScreen);
  };
  return (
    <PhoneFrame>
      <div className="flex-1 relative overflow-hidden bg-cream font-sans text-forest">
        {currentScreen === 'onboarding' &&
        <OnboardingFlow onComplete={() => setCurrentScreen('dashboard')} />
        }

        {currentScreen === 'dashboard' &&
        <Dashboard onNavigate={handleNavigate} />
        }

        {currentScreen === 'calendar' && <Calendar />}

        {currentScreen === 'alerts' && <FrostAlert onClose={handleNavigate} />}

        {currentScreen === 'scan' &&
        <GardenAnalysis
          onBack={handleNavigate}
          onPlantSelect={() => handleNavigate('plant-detail')} />

        }

        {currentScreen === 'plant-detail' &&
        <PlantDetail onBack={handleBack} />
        }
      </div>

      <BottomNav
        currentScreen={currentScreen}
        setCurrentScreen={handleNavigate} />
      
    </PhoneFrame>);

}