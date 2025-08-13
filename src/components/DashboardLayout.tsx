"use client";

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import TunityLogo from "./TunityLogo";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navigation = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Viewer", href: "/dashboard/viewer" },
    { name: "Channels", href: "/dashboard/channels", roles: ["admin", "developer"] },
    { name: "Sessions", href: "/dashboard/sessions", roles: ["admin", "qa", "developer"] },
    { name: "Redis Data", href: "/dashboard/redis", roles: ["admin", "qa"] },
  ];

  const filteredNavigation = navigation.filter((item) => {
    if (!item.roles) return true;
    return user?.roles.some((role) => item.roles!.includes(role));
  });

  return (
    <div className="min-h-screen bg-tunity-gray">
      {/* Header with Tunity branding */}
      <header className="bg-black shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-6">
              <TunityLogo className="h-30 w-30" />
              <div>
                <h1 className="text-lg font-semibold text-white">Back Office</h1>
              </div>
            </div>
            
            {/* User menu */}
            <div className="flex items-center space-x-4">
              {user && (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors duration-200"
                  >
                    <div className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center ring-2 ring-white/20">
                      <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-sm text-white text-left">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-blue-200 text-xs">{user.roles.join(", ")}</p>
                    </div>
                    <svg
                      className={`h-4 w-4 text-white transition-transform duration-200 ${
                        isUserMenuOpen ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                      <div className="p-4">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="h-12 w-12 rounded-full bg-gray-400 flex items-center justify-center">
                            <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-200 pt-4">
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <dt className="font-medium text-gray-500">User ID</dt>
                              <dd className="mt-1 text-gray-900 font-mono">{user.id}</dd>
                            </div>
                            <div>
                              <dt className="font-medium text-gray-500">Roles</dt>
                              <dd className="mt-1">
                                {user.roles.map((role) => (
                                  <span
                                    key={role}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-1 mb-1"
                                  >
                                    {role}
                                  </span>
                                ))}
                              </dd>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-200 pt-4 mt-4">
                          <button
                            onClick={() => {
                              logout();
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Sign out</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`py-4 px-1 border-b-2 font-medium text-medium transition-colors duration-200 ${
                    isActive
                      ? "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  style={isActive ? { 
                    borderBottomColor: '#0693e3', 
                    color: '#0693e3' 
                  } : {}}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  );
}
