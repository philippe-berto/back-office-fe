import Image from 'next/image';
import React from 'react';

interface RedisIconProps {
  className?: string;
  size?: number;
}

export default function RedisIcon({ className = "", size = 24 }: RedisIconProps) {
  return (
    <Image
      src="/database-cloud-circle.svg"
      alt="Redis"
      width={size}
      height={size}
      className={className}
    />
  );
}
