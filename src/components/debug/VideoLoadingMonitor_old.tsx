'use client';

import { useLoading } from '@/contexts/LoadingContext';
import { useEffect, useState } from 'react';

export const VideoLoadingMonitor = () => {
  const { loadingTasks, isLoading } = useLoading();
  const [videoPreloadStatus, setVideoPreloadStatus] = useState<string>('Not started');
  const [preloadStartTime, setPreloadStartTime] = useState<number | null>(null);
  const [preloadDuration, setPreloadDuration] = useState<number | null>(null);

  useEffect(() => {
    const hasVideoPreload = loadingTasks.includes('hero-video-preload');
    const hasHeroVideo = loadingTasks.includes('hero-video');
    const hasAnyVideoTask = loadingTasks.some(task => task.includes('video'));
    
    if (hasVideoPreload && hasHeroVideo && !preloadStartTime) {
      setVideoPreloadStatus('� Loading & preloading video...');
      setPreloadStartTime(Date.now());
    } else if (hasVideoPreload && !preloadStartTime) {
      setVideoPreloadStatus('📦 Preloading video data...');
      setPreloadStartTime(Date.now());
    } else if (hasHeroVideo && !hasVideoPreload) {
      setVideoPreloadStatus('🎬 Video element loading...');
    } else if (!hasVideoPreload && !hasHeroVideo && preloadStartTime && !preloadDuration) {
      const duration = Date.now() - preloadStartTime;
      setPreloadDuration(duration);
      setVideoPreloadStatus(`� Video is PLAYING! (${duration}ms total)`);
    } else if (!hasAnyVideoTask && preloadDuration) {
      setVideoPreloadStatus(`✅ Complete (${preloadDuration}ms) - Video playing!`);
    } else if (!hasAnyVideoTask && !preloadDuration) {
      setVideoPreloadStatus('⚡ No video tasks - Using fallback');
    }
  }, [loadingTasks, preloadStartTime, preloadDuration]);

  // Only show during loading
  if (!isLoading) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] bg-black/90 text-white p-3 rounded-lg text-sm max-w-xs">
      <div className="font-semibold mb-2">Video Loading Monitor</div>
      <div className="space-y-1">
        <div>Status: {videoPreloadStatus}</div>
        <div>Loading Tasks: {loadingTasks.length}</div>
        <div className="text-xs opacity-75">
          Tasks: {loadingTasks.join(', ') || 'None'}
        </div>
        {preloadStartTime && (
          <div className="text-xs opacity-75">
            Preload Time: {Date.now() - preloadStartTime}ms
          </div>
        )}
      </div>
    </div>
  );
};