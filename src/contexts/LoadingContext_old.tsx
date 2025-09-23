'use client';

import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  loadingTasks: string[];
  setIsLoading: (loading: boolean) => void;
  addLoadingTask: (taskId: string) => void;
  removeLoadingTask: (taskId: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [loadingTasks, setLoadingTasks] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true); // Start as loading
  const [criticalResourcesLoaded, setCriticalResourcesLoaded] = useState(false);
  const [initialTasksAdded, setInitialTasksAdded] = useState(false);
  const [startTime] = useState(Date.now());
  const [minimumLoadingTimeMet, setMinimumLoadingTimeMet] = useState(false);

  // Ensure minimum loading time for smooth UX and complete website loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinimumLoadingTimeMet(true);
      console.log('⏱️ Minimum loading time met (3s) - website should be fully loaded');
    }, 3000); // Increased to 3 seconds for full website loading

    return () => clearTimeout(timer);
  }, []);

  // Track individual loading tasks
  const addLoadingTask = useCallback((taskId: string) => {
    console.log(`🔄 Adding loading task: ${taskId}`);
    setLoadingTasks(prev => {
      // Defensive check - don't add if already exists
      if (prev.has(taskId)) {
        return prev; // Silently ignore duplicate additions
      }
      const newSet = new Set(prev);
      newSet.add(taskId);
      return newSet;
    });
  }, []);

  const removeLoadingTask = useCallback((taskId: string) => {
    console.log(`✅ Removing loading task: ${taskId}`);
    setLoadingTasks(prev => {
      // Defensive check - don't modify if task doesn't exist
      if (!prev.has(taskId)) {
        return prev; // Silently ignore non-existent task removal
      }
      const newTasks = new Set(prev);
      newTasks.delete(taskId);
      return newTasks;
    });
  }, []);

  // Update main loading state based on tasks - STRICT video-first priority
  useEffect(() => {
    const taskArray = Array.from(loadingTasks);
    
    // Check for critical video loading tasks
    const hasHeroVideo = taskArray.includes('hero-video');
    const hasHeroVideoPreload = taskArray.includes('hero-video-preload');
    const hasHeroContent = taskArray.includes('hero-content');
    
    // Video tasks that MUST complete before showing content
    const videoTasks = ['hero-video', 'hero-video-preload'];
    const hasAnyVideoTasks = videoTasks.some(task => taskArray.includes(task));
    
    // Other critical tasks
    const criticalTasksRemaining = taskArray.filter(task => 
      !['document-ready', 'fonts-loaded'].includes(task)
    );
    
    // STRICT RULE: If ANY video task is active, keep loading regardless of timing
    // This ensures no gap between spinner disappearing and video playing
    const shouldBeLoading = hasAnyVideoTasks || 
                          (criticalTasksRemaining.length > 0) || 
                          (!hasAnyVideoTasks && !minimumLoadingTimeMet);
    
    console.log(`📊 Loading tasks: ${loadingTasks.size} total`, taskArray);
    console.log('🎬 Hero video loading:', hasHeroVideo);
    console.log('� Hero video preload:', hasHeroVideoPreload);
    console.log('📄 Hero content loading:', hasHeroContent);
    console.log('🎥 ANY video tasks active:', hasAnyVideoTasks);
    console.log('⏱️ Minimum time met:', minimumLoadingTimeMet);
    console.log('🔄 Should keep loading:', shouldBeLoading);
    
    // Only update loading state if it's different to prevent unnecessary re-renders
    if (isLoading !== shouldBeLoading) {
      if (!shouldBeLoading) {
        // NO delay when video is done - immediate transition for seamless experience
        console.log('🎯 All video tasks complete - hiding spinner IMMEDIATELY');
        setIsLoading(false);
        if (!criticalResourcesLoaded) {
          setCriticalResourcesLoaded(true);
          console.log('🎉 Video playing - content fully loaded!');
        }
      } else {
        setIsLoading(true);
      }
    }
  }, [loadingTasks, criticalResourcesLoaded, isLoading, minimumLoadingTimeMet]);

  // Enhanced resource tracking
  useEffect(() => {
    if (initialTasksAdded) return; // Prevent duplicate initialization
    
    // Add all critical loading tasks for full website
    addLoadingTask('document-ready');
    addLoadingTask('fonts-loaded');
    addLoadingTask('website-initialization');
    addLoadingTask('core-components');
    setInitialTasksAdded(true);
    
    const checkCriticalResources = async () => {
      // Check document ready state
      const checkDocumentReady = () => {
        if (document.readyState === 'complete') {
          setTimeout(() => removeLoadingTask('document-ready'), 200);
        } else {
          window.addEventListener('load', () => {
            setTimeout(() => removeLoadingTask('document-ready'), 200);
          }, { once: true });
        }
      };

      // Check fonts loaded
      const checkFontsLoaded = () => {
        if (document.fonts) {
          document.fonts.ready.then(() => {
            setTimeout(() => removeLoadingTask('fonts-loaded'), 200);
          });
        } else {
          // Fallback for older browsers
          setTimeout(() => {
            removeLoadingTask('fonts-loaded');
          }, 1500);
        }
      };

      // Check core website initialization
      const checkWebsiteInit = () => {
        // Wait for basic DOM and styles to be ready
        setTimeout(() => {
          removeLoadingTask('website-initialization');
        }, 1000);
      };

      // Check core components loaded
      const checkCoreComponents = () => {
        // Wait for React hydration and core components
        setTimeout(() => {
          removeLoadingTask('core-components');
        }, 1500);
      };

      checkDocumentReady();
      checkFontsLoaded();
      checkWebsiteInit();
      checkCoreComponents();
    };

    checkCriticalResources();

    // Cleanup
    return () => {
      // Clear all tasks on unmount without warnings
      setLoadingTasks(new Set());
    };
  }, [initialTasksAdded, addLoadingTask, removeLoadingTask]);

  const contextValue: LoadingContextType = {
    isLoading,
    loadingTasks: Array.from(loadingTasks),
    setIsLoading,
    addLoadingTask,
    removeLoadingTask,
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
    </LoadingContext.Provider>
  );
};