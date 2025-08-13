import React from 'react';
import Image from 'next/image';

interface ChannelsIconProps {
  className?: string;
  size?: number;
}

export default function ChannelsIcon({ className = "", size = 24 }: ChannelsIconProps) {
  return (
    <Image
      src="/channel.svg"
      alt="Channels"
      width={size}
      height={size}
      className={className}
    />
  );
}
