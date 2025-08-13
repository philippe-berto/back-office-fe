"use client";

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { DashboardStats } from '@/types/dashboard';

export function useDashboardStats(refreshInterval: number = 30000) {
  const [stats, setStats] = useState<DashboardStats>({
    onlineChannels: 0,
    sessionsLastHour: 0,
    loading: true,
    error: null
  });

  const fetchStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: null }));
      
      // For now, using mock data since API endpoints might not be ready
      // In production, uncomment the following lines:
      // const dashboardStats = await apiClient.getDashboardStats();
      // setStats({
      //   onlineChannels: dashboardStats.onlineChannels,
      //   sessionsLastHour: dashboardStats.sessionsLastHour,
      //   loading: false,
      //   error: null
      // });

      // Mock data with simulated API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setStats({
        onlineChannels: 1,
        sessionsLastHour: 0,
        loading: false,
        error: null
      });
    } catch (error) {
      setStats(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load dashboard statistics'
      }));
    }
  };

  useEffect(() => {
    fetchStats();
    
    if (refreshInterval > 0) {
      const interval = setInterval(fetchStats, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  return { stats, refetch: fetchStats };
}
