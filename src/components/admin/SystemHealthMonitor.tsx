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

export default function SystemHealthMonitor() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const checkHealth = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/health', {
        method: 'GET',
        cache: 'no-cache'
      });
      
      const data = await response.json();
      setHealthStatus(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Health check failed:', error);
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
          api: 'error'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const resetCircuitBreaker = async () => {
    try {
      const adminKey = prompt('Enter admin key to reset circuit breaker:');
      if (!adminKey) return;
      
      const response = await fetch('/api/health', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'reset-circuit-breaker',
          adminKey
        })
      });
      
      if (response.ok) {
        alert('Circuit breaker reset successfully!');
        checkHealth(); // Refresh status
      } else {
        const error = await response.json();
        alert(`Failed to reset: ${error.error}`);
      }
    } catch (error) {
      alert('Error resetting circuit breaker');
      console.error(error);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'unhealthy':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getServiceStatusColor = (status: string) => {
    switch (status) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getCircuitBreakerColor = (state: string) => {
    switch (state) {
      case 'CLOSED':
        return 'text-green-600';
      case 'OPEN':
        return 'text-red-600';
      case 'HALF_OPEN':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">System Health Monitor</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1 text-sm rounded ${
              autoRefresh 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={checkHealth}
            disabled={loading}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200 disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Check Now'}
          </button>
        </div>
      </div>

      {healthStatus && (
        <div className="space-y-4">
          {/* Overall Status */}
          <div className={`p-4 rounded-lg border ${getStatusColor(healthStatus.status)}`}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg">
                  System Status: {healthStatus.status.toUpperCase()}
                </h3>
                <p className="text-sm">
                  Response Time: {healthStatus.responseTime}
                </p>
              </div>
              <div className="text-sm text-right">
                <p>Last Check: {new Date(healthStatus.timestamp).toLocaleTimeString()}</p>
                {lastUpdated && (
                  <p>Updated: {lastUpdated.toLocaleTimeString()}</p>
                )}
              </div>
            </div>
          </div>

          {/* Circuit Breaker Status */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Circuit Breaker Status</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">State:</p>
                <p className={`font-semibold ${getCircuitBreakerColor(healthStatus.database.circuitBreaker.state)}`}>
                  {healthStatus.database.circuitBreaker.state}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Failures:</p>
                <p className="font-semibold">
                  {healthStatus.database.circuitBreaker.failures}
                </p>
              </div>
            </div>
            {healthStatus.database.circuitBreaker.lastFailureTime && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">Last Failure:</p>
                <p className="text-sm">
                  {new Date(healthStatus.database.circuitBreaker.lastFailureTime).toLocaleString()}
                </p>
              </div>
            )}
            {healthStatus.database.circuitBreaker.state === 'OPEN' && (
              <button
                onClick={resetCircuitBreaker}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Reset Circuit Breaker (Admin)
              </button>
            )}
          </div>

          {/* Services Status */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Services Status</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">MongoDB:</p>
                <p className={`font-semibold ${getServiceStatusColor(healthStatus.services.mongodb)}`}>
                  {healthStatus.services.mongodb.toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">UploadThing:</p>
                <p className={`font-semibold ${getServiceStatusColor(healthStatus.services.uploadthing)}`}>
                  {healthStatus.services.uploadthing.toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">API:</p>
                <p className={`font-semibold ${getServiceStatusColor(healthStatus.services.api)}`}>
                  {healthStatus.services.api.toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Database Details */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Database Connection</h4>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${
                healthStatus.database.connected ? 'bg-green-500' : 'bg-red-500'
              }`}></span>
              <span className={healthStatus.database.connected ? 'text-green-600' : 'text-red-600'}>
                {healthStatus.database.connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      )}

      {loading && !healthStatus && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Checking system health...</p>
        </div>
      )}
    </div>
  );
}