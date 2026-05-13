import React from 'react';
interface PhoneFrameProps {
  children: React.ReactNode;
}
export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-0 md:p-8 bg-cream-dark bg-texture">
      <div className="w-full h-full min-h-screen md:min-h-[850px] md:h-[850px] md:max-w-[420px] bg-cream bg-texture md:rounded-[40px] md:shadow-2xl overflow-hidden relative flex flex-col border-0 md:border-8 border-forest-dark">
        {children}
      </div>
    </div>);

};