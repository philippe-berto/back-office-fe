"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import QuickActionCard from "@/components/QuickActionCard";
import { TvIcon, ChannelsIcon, SessionsIcon, RedisIcon } from "@/components/icons";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { QuickAction } from "@/types/dashboard";

export default function DashboardPage() {
  const { user } = useAuth();
  const { stats } = useDashboardStats(30000); // Refresh every 30 seconds

  const quickActions: QuickAction[] = [
    {
      name: "Viewer",
      description: "Watch live streams",
      href: "/dashboard/viewer",
      icon: <TvIcon />,
      color: "from-purple-400 to-purple-600",
      roles: null
    },
    // {
    //   name: "Channels", 
    //   description: "Manage streaming channels",
    //   href: "/dashboard/channels",
    //   icon: <ChannelsIcon />,
    //   color: "from-blue-400 to-blue-600",
    //   roles: ["admin", "developer"]
    // },
    {
      name: "Sessions",
      description: "View session details", 
      href: "/dashboard/sessions",
      icon: <SessionsIcon />,
      color: "from-green-400 to-green-600",
      roles: ["admin", "qa", "developer"]
    },
    // {
    //   name: "Redis Data",
    //   description: "QA debugging tools",
    //   href: "/dashboard/redis", 
    //   icon: <RedisIcon />,
    //   color: "from-red-400 to-red-600",
    //   roles: ["admin", "qa"]
    // }
  ];

  const filteredActions = quickActions.filter((action) => {
    if (!action.roles) return true;
    return user?.roles.some((role) => action.roles!.includes(role));
  });

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          {/* <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600">
              Welcome to the Tunity Back Office system
            </p>
          </div> */}

          {/* Stats Cards */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-200">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                      <span className="text-2xl"><ChannelsIcon /></span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Online Channels
                      </dt>
                      <dd className="flex items-baseline">
                        {stats.loading ? (
                          <div className="animate-pulse h-8 w-16 bg-gray-200 rounded"></div>
                        ) : stats.error ? (
                          <span className="text-red-500 text-sm">Error</span>
                        ) : (
                          <span className="text-3xl font-bold text-gray-900">{stats.onlineChannels}</span>
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3">
                <div className="text-sm text-gray-500">
                  Currently broadcasting live
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-200">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-2xl"><SessionsIcon /></span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Sessions (Last Hour)
                      </dt>
                      <dd className="flex items-baseline">
                        {stats.loading ? (
                          <div className="animate-pulse h-8 w-16 bg-gray-200 rounded"></div>
                        ) : stats.error ? (
                          <span className="text-red-500 text-sm">Error</span>
                        ) : (
                          <span className="text-3xl font-bold text-gray-900">{stats.sessionsLastHour}</span>
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3">
                <div className="text-sm text-gray-500">
                  Active in the past 60 minutes
                </div>
              </div>
            </div>
          </div> */}

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {filteredActions.map((action) => (
                <QuickActionCard
                  key={action.name}
                  name={action.name}
                  description={action.description}
                  href={action.href}
                  icon={action.icon}
                  color={action.color}
                />
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
