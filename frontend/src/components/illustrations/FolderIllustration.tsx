import React from 'react';

export const FolderIllustration: React.FC<{ className?: string }> = ({ className = 'w-24 h-24' }) => {
  return (
    <svg
      viewBox="0 0 140 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Application Document Folder"
    >
      {/* Motion / action rays above */}
      <line x1="90" y1="20" x2="90" y2="12" stroke="#171717" strokeWidth="2" strokeLinecap="round" />
      <line x1="102" y1="25" x2="108" y2="19" stroke="#171717" strokeWidth="2" strokeLinecap="round" />
      <line x1="78" y1="25" x2="72" y2="19" stroke="#171717" strokeWidth="2" strokeLinecap="round" />

      {/* Rear Folder Flap */}
      <path
        d="M25 40C25 36.6863 27.6863 34 31 34H55L65 44H115C118.314 44 121 46.6863 121 50V98C121 101.314 118.314 104 115 104H31C27.6863 104 25 101.314 25 98V40Z"
        fill="#525252"
      />

      {/* Back Document Sheet */}
      <rect x="42" y="30" width="56" height="60" rx="3" fill="#E5E5E5" />

      {/* Front Document Sheet */}
      <rect x="36" y="24" width="56" height="60" rx="3" fill="#FFFFFF" stroke="#E5E5E5" strokeWidth="1" />
      {/* Text placeholder lines on document */}
      <rect x="44" y="34" width="28" height="4" rx="2" fill="#D4D4D4" />
      <rect x="44" y="44" width="40" height="3" rx="1.5" fill="#E5E5E5" />
      <rect x="44" y="51" width="36" height="3" rx="1.5" fill="#E5E5E5" />

      {/* Front Folder Body (Open Pocket) */}
      <path
        d="M23 54H123L115 106H31L23 54Z"
        fill="#737373"
      />
      {/* Folder Pocket Top Bevel */}
      <path
        d="M23 54H123"
        stroke="#8A8A8A"
        strokeWidth="2"
      />
    </svg>
  );
};

