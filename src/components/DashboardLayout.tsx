"use client";

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import TunityLogo from "./TunityLogo";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

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
                <>
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center ring-2 ring-white/20">
                      <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-sm text-white">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-blue-200 text-xs">{user.roles.join(", ")}</p>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Sign out
                  </button>
                </>
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
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    isActive
                      ? "border-tunity-blue text-tunity-blue"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
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
