'use client';

import { useLoading } from '@/contexts/LoadingContext';
import { useEffect, useState } from 'react';

export const VideoLoadingMonitor = () => {
  const { loadingTasks, isLoading } = useLoading();
  const [loadingStartTime] = useState(Date.now());
  const [websiteStatus, setWebsiteStatus] = useState<string>('Initializing...');

  useEffect(() => {
    const videoTasks = loadingTasks.filter(task => task.includes('video'));
    const contentTasks = loadingTasks.filter(task => task.includes('content') || task.includes('hero-'));
    const componentTasks = loadingTasks.filter(task => 
      task.includes('header') || task.includes('footer') || task.includes('navigation') ||
      task.includes('promotions') || task.includes('bestsellers') || task.includes('newarrivals') ||
      task.includes('aboutus') || task.includes('section') || task.includes('component')
    );
    const coreTasks = loadingTasks.filter(task => 
      ['document-ready', 'fonts-loaded', 'website-initialization', 'core-components', 'layout-ready', 'main-content-ready'].includes(task)
    );

    if (loadingTasks.length === 0) {
      const duration = Date.now() - loadingStartTime;
      setWebsiteStatus(`🎉 Website Fully Loaded! (${duration}ms)`);
    } else if (videoTasks.length > 0) {
      setWebsiteStatus(`🎬 Loading video content... (${videoTasks.length} tasks)`);
    } else if (contentTasks.length > 0) {
      setWebsiteStatus(`📄 Loading page content... (${contentTasks.length} tasks)`);
    } else if (componentTasks.length > 0) {
      setWebsiteStatus(`🧩 Loading components... (${componentTasks.length} tasks)`);
    } else if (coreTasks.length > 0) {
      setWebsiteStatus(`⚙️ Initializing core systems... (${coreTasks.length} tasks)`);
    } else {
      setWebsiteStatus(`🔄 Loading website... (${loadingTasks.length} tasks)`);
    }
  }, [loadingTasks, loadingStartTime]);

  // Only show during loading
  if (!isLoading) return null;

  const elapsedTime = Date.now() - loadingStartTime;

  return (
    <div className="fixed top-4 right-4 z-[9999] bg-black/90 text-white p-3 rounded-lg text-sm max-w-sm">
      <div className="font-semibold mb-2">🌐 Full Website Loading Monitor</div>
      <div className="space-y-1">
        <div className="font-medium">{websiteStatus}</div>
        <div className="text-xs opacity-75">
          Total Loading Time: {elapsedTime}ms
        </div>
        <div className="text-xs opacity-75">
          Remaining Tasks: {loadingTasks.length}
        </div>
        {loadingTasks.length > 0 && (
          <div className="text-xs opacity-60 max-h-20 overflow-y-auto">
            {loadingTasks.map((task, index) => (
              <div key={index}>• {task}</div>
            ))}
          </div>
        )}
        <div className="text-xs opacity-50 border-t border-white/20 pt-1 mt-2">
          Spinner will hide when ALL tasks complete + 3s minimum
        </div>
      </div>
    </div>
  );
};