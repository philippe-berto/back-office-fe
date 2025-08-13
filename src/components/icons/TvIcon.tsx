import Image from 'next/image';
import React from 'react';

interface TvIconProps {
  className?: string;
  size?: number;
}

export default function TvIcon({ className = "", size = 24 }: TvIconProps) {
  return (
        <Image
          src="/tv-retro.svg"
          alt="Viewer"
          width={size}
          height={size}
          className={className}
        />
  );
}
