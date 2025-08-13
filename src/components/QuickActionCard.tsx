"use client";

import Link from "next/link";
import { QuickActionCardProps } from "@/types/dashboard";
import React from "react";

export default function QuickActionCard({
  name,
  description,
  href,
  icon,
  color,
}: QuickActionCardProps) {
  const renderIcon = () => {
    if (typeof icon === 'string') {
      // Emoji string
      return <span className="text-6xl">{icon}</span>;
    } else {
      // React component - render with large size
      return <div className="w-16 h-16 flex items-center justify-center">{icon}</div>;
    }
  };

  const renderBackgroundIcon = () => {
    // Get the main color values as CSS custom properties
    const getIconStyle = () => {
      if (color.includes('purple')) return { color: '#a855f7' }; // purple-500
      if (color.includes('blue')) return { color: '#3b82f6' }; // blue-500
      if (color.includes('green')) return { color: '#10b981' }; // green-500
      if (color.includes('red')) return { color: '#ef4444' }; // red-500
      return { color: '#6b7280' }; // gray-500
    };

    const getHoverStyle = () => {
      if (color.includes('purple')) return { color: '#7c3aed' }; // purple-600
      if (color.includes('blue')) return { color: '#2563eb' }; // blue-600
      if (color.includes('green')) return { color: '#059669' }; // green-600
      if (color.includes('red')) return { color: '#dc2626' }; // red-600
      return { color: '#4b5563' }; // gray-600
    };

    if (typeof icon === 'string') {
      // Emoji string for background
      return <span className="text-7xl opacity-30">{icon}</span>;
    } else {
      // React component for background - use inline styles to force the color
      return (
        <div 
          className="w-20 h-20 flex items-center justify-center opacity-50 [&>*]:w-full [&>*]:h-full transition-colors duration-300 group-hover:[&>*]:opacity-80"
          style={getIconStyle()}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, getHoverStyle())}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, getIconStyle())}
        >
          {icon}
        </div>
      );
    }
  };
  return (
    <Link
      href={href}
      className="group relative overflow-hidden shadow-lg rounded-xl border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* Background gradient - visible by default, stronger on hover */}
      <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-15 group-hover:opacity-15 transition-opacity duration-300`}></div>
      
      {/* Large background icon on the left */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 group-hover:scale-110 transition-transform duration-300">
        {renderBackgroundIcon()}
      </div>

      {/* Content */}
      <div className="relative p-6 pl-28">
        <div className="flex flex-col">
          <dt className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors duration-300 mb-1">
            {name}
          </dt>
          <dd className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
            {description}
          </dd>
        </div>
      </div>
      
      {/* Bottom accent line */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
    </Link>
  );
}
