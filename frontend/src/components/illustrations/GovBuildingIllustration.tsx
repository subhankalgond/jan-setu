import React from 'react';

export const GovBuildingIllustration: React.FC<{ className?: string }> = ({ className = 'w-full h-auto' }) => {
  return (
    <svg
      viewBox="0 0 460 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Government Institution Architecture"
    >
      {/* Background Soft Sky Arc */}
      <circle cx="270" cy="190" r="140" fill="#F0F0EE" />

      {/* Trees Left */}
      <g>
        {/* Rear lighter tree */}
        <ellipse cx="140" cy="180" rx="22" ry="32" fill="#737373" />
        <rect x="138" y="200" width="4" height="25" fill="#262626" />
        {/* Front darker tree */}
        <ellipse cx="158" cy="188" rx="18" ry="26" fill="#383838" />
        <rect x="156" y="205" width="4" height="20" fill="#171717" />
      </g>

      {/* Trees Right */}
      <g>
        {/* Rear lighter tree */}
        <ellipse cx="385" cy="180" rx="22" ry="32" fill="#737373" />
        <rect x="383" y="200" width="4" height="25" fill="#262626" />
        {/* Front darker tree */}
        <ellipse cx="368" cy="188" rx="18" ry="26" fill="#383838" />
        <rect x="366" y="205" width="4" height="20" fill="#171717" />
      </g>

      {/* Base Foundation & Ground */}
      <rect x="80" y="222" width="370" height="4" rx="2" fill="#D4D4D4" />
      <rect x="150" y="214" width="225" height="8" rx="1" fill="#E5E5E5" />
      <rect x="160" y="208" width="205" height="6" fill="#F5F5F4" stroke="#D4D4D4" strokeWidth="1" />

      {/* Left Wing */}
      <g>
        <rect x="165" y="142" width="60" height="66" fill="#EAEAEA" stroke="#D4D4D4" strokeWidth="1.2" />
        {/* Roof Balustrade */}
        <rect x="163" y="138" width="64" height="4" fill="#D4D4D4" />
        {/* Left Wing Windows Row 1 */}
        <rect x="173" y="150" width="10" height="15" rx="1" fill="#262626" />
        <rect x="190" y="150" width="10" height="15" rx="1" fill="#262626" />
        <rect x="207" y="150" width="10" height="15" rx="1" fill="#262626" />
        {/* Left Wing Windows Row 2 */}
        <rect x="173" y="174" width="10" height="18" rx="1" fill="#262626" />
        <rect x="190" y="174" width="10" height="18" rx="1" fill="#262626" />
        <rect x="207" y="174" width="10" height="18" rx="1" fill="#262626" />
      </g>

      {/* Right Wing */}
      <g>
        <rect x="300" y="142" width="60" height="66" fill="#EAEAEA" stroke="#D4D4D4" strokeWidth="1.2" />
        {/* Roof Balustrade */}
        <rect x="298" y="138" width="64" height="4" fill="#D4D4D4" />
        {/* Right Wing Windows Row 1 */}
        <rect x="308" y="150" width="10" height="15" rx="1" fill="#262626" />
        <rect x="325" y="150" width="10" height="15" rx="1" fill="#262626" />
        <rect x="342" y="150" width="10" height="15" rx="1" fill="#262626" />
        {/* Right Wing Windows Row 2 */}
        <rect x="308" y="174" width="10" height="18" rx="1" fill="#262626" />
        <rect x="325" y="174" width="10" height="18" rx="1" fill="#262626" />
        <rect x="342" y="174" width="10" height="18" rx="1" fill="#262626" />
      </g>

      {/* Central Classical Portico Background */}
      <rect x="220" y="132" width="85" height="76" fill="#F2F2F0" stroke="#D4D4D4" strokeWidth="1.2" />

      {/* Main Entrance Recess & Arched Door */}
      <path d="M250 208V175c0-6.6 5.4-12 12-12s12 5.4 12 12v33h-24z" fill="#171717" />

      {/* Columns (6 Neoclassical Fluted Columns) */}
      <g fill="#FFFFFF" stroke="#C4C4C4" strokeWidth="1">
        {/* Col 1 */}
        <rect x="223" y="132" width="7" height="76" />
        {/* Col 2 */}
        <rect x="236" y="132" width="7" height="76" />
        {/* Col 3 */}
        <rect x="249" y="132" width="7" height="76" />
        {/* Col 4 */}
        <rect x="268" y="132" width="7" height="76" />
        {/* Col 5 */}
        <rect x="281" y="132" width="7" height="76" />
        {/* Col 6 */}
        <rect x="294" y="132" width="7" height="76" />
      </g>

      {/* Portico Entablature */}
      <rect x="217" y="124" width="91" height="8" fill="#E5E5E5" stroke="#D4D4D4" strokeWidth="1" />

      {/* Portico Triangular Pediment */}
      <polygon points="214,124 311,124 262.5,96" fill="#F7F7F6" stroke="#D4D4D4" strokeWidth="1.2" />
      {/* Pediment Tympanum Relief */}
      <circle cx="262.5" cy="113" r="4.5" fill="#D4D4D4" />

      {/* Central Dome Drum (Rotunda) */}
      <g>
        <rect x="233" y="70" width="60" height="26" fill="#E5E5E5" stroke="#C4C4C4" strokeWidth="1" />
        {/* Drum Arched Windows */}
        <rect x="238" y="75" width="5" height="15" rx="2.5" fill="#404040" />
        <rect x="248" y="75" width="5" height="15" rx="2.5" fill="#404040" />
        <rect x="260" y="75" width="5" height="15" rx="2.5" fill="#404040" />
        <rect x="272" y="75" width="5" height="15" rx="2.5" fill="#404040" />
        <rect x="282" y="75" width="5" height="15" rx="2.5" fill="#404040" />
      </g>

      {/* Great Dome */}
      <path
        d="M230 70C230 40 244 32 262.5 32C281 32 295 40 295 70H230Z"
        fill="#D4D4D4"
        stroke="#B8B8B8"
        strokeWidth="1.2"
      />
      {/* Dome Ribs for classical depth */}
      <path d="M262.5 32V70" stroke="#EAEAEA" strokeWidth="1.5" />
      <path d="M246 38C244 48 244 60 245 70" stroke="#B8B8B8" strokeWidth="1" />
      <path d="M279 38C281 48 281 60 280 70" stroke="#A3A3A3" strokeWidth="1" />

      {/* Lantern / Cupola */}
      <rect x="259.5" y="24" width="6" height="8" fill="#F5F5F4" stroke="#A3A3A3" strokeWidth="0.8" />
      <path d="M258 24C258 21 262.5 19 262.5 19C262.5 19 267 21 267 24H258Z" fill="#737373" />

      {/* Flagpole & Flag */}
      <line x1="262.5" y1="19" x2="262.5" y2="7" stroke="#171717" strokeWidth="1.5" />
      <polygon points="262.5,7 274,10 262.5,13" fill="#171717" />

      {/* Steps (Staircase) */}
      <polygon points="230,208 295,208 303,218 222,218" fill="#EAEAEA" stroke="#D4D4D4" strokeWidth="0.8" />
      <line x1="226" y1="213" x2="299" y2="213" stroke="#D4D4D4" strokeWidth="0.8" />
    </svg>
  );
};

