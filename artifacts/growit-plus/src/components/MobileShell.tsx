// Wraps the entire app in a centered phone-like container
// On desktop: shows a 430px-wide centered "phone" with shadow and rounded corners
// On mobile (< 640px): fills the full viewport

import React from 'react';

export default function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh bg-cream-dark flex items-start justify-center sm:h-auto sm:min-h-dvh sm:py-8">
      <div className="relative w-full sm:w-[430px] h-dvh sm:min-h-0 sm:h-[900px] sm:rounded-[3rem] overflow-hidden sm:shadow-2xl bg-cream flex flex-col">
        {children}
      </div>
    </div>
  );
}
