import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const BasilIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <path d="M12 22V10M12 10C12 10 9 4 5 5C5 5 6 11 12 10ZM12 10C12 10 15 4 19 5C19 5 18 11 12 10ZM12 15C12 15 9 11 6 12C6 12 7 16 12 15ZM12 15C12 15 15 11 18 12C18 12 17 16 12 15Z" fill="#2A5C47" fillOpacity="0.3" stroke="#1A3C2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const TomatoIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <path d="M12 21C16.4183 21 20 17.866 20 14C20 10.134 16.4183 7 12 7C7.58172 7 4 10.134 4 14C4 17.866 7.58172 21 12 21Z" fill="#C4622D" fillOpacity="0.8" stroke="#C4622D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 7V4M12 4C10.5 4 9 5 9 5M12 4C13.5 4 15 5 15 5M12 7C10.5 8 9 7 9 7M12 7C13.5 8 15 7 15 7" stroke="#1A3C2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 12C10.5 11.5 11 11.5 11 12" stroke="#F5F0E8" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const DahliaIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <path d="M12 12C12 12 10 5 12 3C14 5 12 12 12 12ZM12 12C12 12 19 10 21 12C19 14 12 12 12 12ZM12 12C12 12 14 19 12 21C10 19 12 12 12 12ZM12 12C12 12 5 14 3 12C5 10 12 12 12 12Z" fill="#D4A853" fillOpacity="0.4" stroke="#D4A853" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="2" fill="#C4622D"/>
    <path d="M12 21V24" stroke="#1A3C2E" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const KaleIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <path d="M12 22V12M12 12C12 12 8 6 5 8C5 8 6 13 12 12ZM12 12C12 12 16 6 19 8C19 8 18 13 12 12ZM12 16C12 16 7 12 4 14C4 14 6 18 12 16ZM12 16C12 16 17 12 20 14C20 14 18 18 12 16Z" fill="#1A3C2E" fillOpacity="0.6" stroke="#1A3C2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const CarrotIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <path d="M15 9C15 9 14 18 12 22C10 18 9 9 9 9C9 9 12 7 15 9Z" fill="#C4622D" fillOpacity="0.9" stroke="#C4622D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 8V3M12 8C10 7 9 5 9 5M12 8C14 7 15 5 15 5" stroke="#1A3C2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 12H13M11 15H14M10 18H12" stroke="#F5F0E8" strokeWidth="1" strokeLinecap="round"/>
  </svg>
);

export const FrostCrystalIcon: React.FC<IconProps> = ({ size = 48, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <path d="M24 4V44M4 24H44M10 10L38 38M10 38L38 10" stroke="#A8C4D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M24 12L20 8M24 12L28 8M24 36L20 40M24 36L28 40M12 24L8 20M12 24L8 28M36 24L40 20M36 24L40 28M16 16L12 12M16 16L12 20M32 32L36 36M32 32L36 28M16 32L12 36M16 32L12 28M32 16L36 12M32 16L36 20" stroke="#A8C4D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="24" cy="24" r="4" fill="#F5F0E8" stroke="#D4A853" strokeWidth="2"/>
  </svg>
);

export const GardenPlotIcon: React.FC<IconProps> = ({ size = 120, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <rect x="10" y="10" width="100" height="100" rx="8" fill="#F5F0E8" stroke="#1A3C2E" strokeWidth="2" strokeDasharray="4 4"/>
    <path d="M40 40C40 40 45 30 50 40C55 50 60 40 60 40" stroke="#2A5C47" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M60 70C60 70 65 60 70 70C75 80 80 70 80 70" stroke="#2A5C47" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="60" cy="60" r="15" fill="#1A3C2E" fillOpacity="0.1"/>
    <path d="M60 45V75M45 60H75" stroke="#1A3C2E" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
