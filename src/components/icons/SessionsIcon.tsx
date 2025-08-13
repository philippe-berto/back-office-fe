import Image from 'next/image';
import React from 'react';

interface SessionsIconProps {
  className?: string;
  size?: number;
}

export default function SessionsIcon({ className = "", size = 24 }: SessionsIconProps) {
  return (
    <Image
      src="/session.svg"
      alt="Session"
      width={size}
      height={size}
      className={className}
    />  );
}
