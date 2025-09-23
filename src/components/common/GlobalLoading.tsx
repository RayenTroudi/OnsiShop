'use client';

import { useEffect, useState } from 'react';

interface GlobalLoadingProps {
  isLoading: boolean;
  loadingTasks?: string[];
  onLoadingComplete?: () => void;
}

const GlobalLoading: React.FC<GlobalLoadingProps> = ({ 
  isLoading, 
  loadingTasks = [],
  onLoadingComplete 
}) => {
  const [shouldShow, setShouldShow] = useState(isLoading);
  const [isExiting, setIsExiting] = useState(false);
  const [loadingStage, setLoadingStage] = useState<'initializing' | 'loading-content' | 'loading-video' | 'completing'>('initializing');
  const [mountTime] = useState(Date.now());
  
  // Debug logging
  useEffect(() => {
    console.log('🔄 GlobalLoading state:', {
      isLoading,
      shouldShow,
      isExiting,
      loadingStage,
      loadingTasks,
      timeElapsed: Date.now() - mountTime
    });
  }, [isLoading, shouldShow, isExiting, loadingStage, loadingTasks, mountTime]);

  // Determine current loading stage based on tasks
  useEffect(() => {
    if (loadingTasks.includes('hero-video')) {
      setLoadingStage('loading-video');
    } else if (loadingTasks.includes('hero-content')) {
      setLoadingStage('loading-content');
    } else if (loadingTasks.length > 0) {
      setLoadingStage('initializing');
    } else if (!isLoading) {
      setLoadingStage('completing');
    }
  }, [loadingTasks, isLoading]);

  useEffect(() => {
    if (isLoading) {
      setShouldShow(true);
      setIsExiting(false);
    } else if (shouldShow) {
      // Start exit animation
      setIsExiting(true);
      
      // Hide after animation completes
      const timer = setTimeout(() => {
        setShouldShow(false);
        setIsExiting(false);
        onLoadingComplete?.();
      }, 500); // Match CSS transition duration

      return () => clearTimeout(timer);
    }
  }, [isLoading, shouldShow, onLoadingComplete]);

  if (!shouldShow) return null;

  const getLoadingMessage = () => {
    switch (loadingStage) {
      case 'loading-video':
        return 'Loading video content...';
      case 'loading-content':
        return 'Fetching page content...';
      case 'completing':
        return 'Almost ready...';
      default:
        return 'Preparing your experience...';
    }
  };

  const getVideoLoadingProgress = () => {
    const hasVideoTask = loadingTasks.includes('hero-video');
    const hasContentTask = loadingTasks.includes('hero-content');
    
    if (!hasVideoTask && !hasContentTask) return 100;
    if (!hasVideoTask && hasContentTask) return 75;
    if (hasVideoTask && !hasContentTask) return 50;
    return 25;
  };

  return (
    <div 
      className={`
        global-loading-overlay
        ${isExiting ? 'opacity-0' : 'opacity-100'}
      `}
      data-loading-debug="true"
    >
      <div className="loading-content">
        {/* Main spinner */}
        <div className="loading-spinner mx-auto mb-8"></div>
        
        {/* Brand and loading text */}
        <div className="text-center">
          <h1 className="loading-title">OnsiShop</h1>
          <p className="loading-subtitle">{getLoadingMessage()}</p>
          
          {/* Progress indicator for video loading */}
          {loadingStage === 'loading-video' && (
            <div className="loading-video-status">
              Optimizing video for smooth playback...
            </div>
          )}
          
          {/* Progress bar */}
          <div className="w-64 h-1 bg-gray-200 rounded-full mx-auto mb-4">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${getVideoLoadingProgress()}%` }}
            ></div>
          </div>
          
          {/* Animated dots */}
          <div className="loading-progress">
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalLoading;