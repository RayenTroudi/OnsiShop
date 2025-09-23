'use client';

import { useEffect, useState } from 'react';

interface HealthStatus {
  status: string;
  timestamp: string;
  responseTime: string;
  database: {
    connected: boolean;
    circuitBreaker: {
      state: string;
      failures: number;
      lastFailureTime: string | null;
    };
  };
  services: {
    mongodb: string;
    uploadthing: string;
    api: string;
  };
}

export default function HealthMonitor() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchHealthStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/health', {
        cache: 'no-store'
      });
      const data = await response.json();
      setHealthStatus(data);
    } catch (error) {
      console.error('Failed to fetch health status:', error);
      setHealthStatus({
        status: 'error',
        timestamp: new Date().toISOString(),
        responseTime: 'N/A',
        database: {
          connected: false,
          circuitBreaker: {
            state: 'UNKNOWN',
            failures: 0,
            lastFailureTime: null
          }
        },
        services: {
          mongodb: 'down',
          uploadthing: 'unknown',
          api: 'down'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const resetCircuitBreaker = async () => {
    try {
      const response = await fetch('/api/health', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'reset-circuit-breaker',
          adminKey: 'admin-secret' // In production, get this from secure input
        })
      });

      if (response.ok) {
        alert('Circuit breaker reset successfully');
        fetchHealthStatus(); // Refresh status
      } else {
        alert('Failed to reset circuit breaker');
      }
    } catch (error) {
      console.error('Failed to reset circuit breaker:', error);
      alert('Error resetting circuit breaker');
    }
  };

  useEffect(() => {
    fetchHealthStatus();
    
    if (autoRefresh) {
      const interval = setInterval(fetchHealthStatus, 10000); // Every 10 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'up':
      case 'closed':
        return 'text-green-600 bg-green-100';
      case 'unhealthy':
      case 'down':
      case 'open':
        return 'text-red-600 bg-red-100';
      case 'half_open':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (!healthStatus) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">System Health Monitor</h3>
          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Auto-refresh</span>
            </label>
            <button
              onClick={fetchHealthStatus}
              disabled={loading}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Overall Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Overall Status:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(healthStatus.status)}`}>
            {healthStatus.status.toUpperCase()}
          </span>
        </div>

        {/* Response Time */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Response Time:</span>
          <span className="text-sm text-gray-900">{healthStatus.responseTime}</span>
        </div>

        {/* Database Status */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Database</h4>
          <div className="pl-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Connection:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(healthStatus.database.connected ? 'up' : 'down')}`}>
                {healthStatus.database.connected ? 'CONNECTED' : 'DISCONNECTED'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Circuit Breaker:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(healthStatus.database.circuitBreaker.state)}`}>
                {healthStatus.database.circuitBreaker.state}
              </span>
            </div>
            
            {healthStatus.database.circuitBreaker.failures > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Failures:</span>
                <span className="text-sm text-red-600">{healthStatus.database.circuitBreaker.failures}</span>
              </div>
            )}
            
            {healthStatus.database.circuitBreaker.state === 'OPEN' && (
              <div className="mt-2">
                <button
                  onClick={resetCircuitBreaker}
                  className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Reset Circuit Breaker
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Services Status */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Services</h4>
          <div className="pl-4 space-y-2">
            {Object.entries(healthStatus.services).map(([service, status]) => (
              <div key={service} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{service}:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                  {status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Last Updated */}
        <div className="pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Last updated: {new Date(healthStatus.timestamp).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}