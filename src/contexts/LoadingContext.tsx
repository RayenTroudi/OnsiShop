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

  // Ensure minimum loading time of 3 seconds for smooth UX and video loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinimumLoadingTimeMet(true);
      console.log('⏱️ Minimum loading time met (3s)');
    }, 3000);

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

  // Update main loading state based on tasks - prioritize video loading
  useEffect(() => {
    const taskArray = Array.from(loadingTasks);
    
    // Check for critical video loading tasks
    const hasHeroVideo = taskArray.includes('hero-video');
    const hasHeroContent = taskArray.includes('hero-content');
    
    // Priority loading tasks that MUST complete before hiding spinner
    const priorityTasks = ['hero-video', 'hero-content'];
    const hasPriorityTasks = priorityTasks.some(task => taskArray.includes(task));
    
    // If we have priority tasks (especially hero video), keep loading
    // Only consider non-priority tasks if no priority tasks remain
    const criticalTasksRemaining = taskArray.filter(task => 
      !['document-ready', 'fonts-loaded'].includes(task)
    );
    
    // Must also wait for minimum loading time to prevent flash
    const shouldBeLoading = (hasPriorityTasks || criticalTasksRemaining.length > 0) || !minimumLoadingTimeMet;
    
    console.log(`📊 Loading tasks remaining: ${loadingTasks.size} (${criticalTasksRemaining.length} critical)`, taskArray);
    console.log('🎬 Hero video loading:', hasHeroVideo);
    console.log('📄 Hero content loading:', hasHeroContent);
    console.log('⚡ Priority tasks active:', hasPriorityTasks);
    console.log('⏱️ Minimum time met:', minimumLoadingTimeMet);
    console.log('🔄 Should be loading:', shouldBeLoading);
    
    // Only update loading state if it's different to prevent unnecessary re-renders
    if (isLoading !== shouldBeLoading) {
      if (!shouldBeLoading) {
        // Add a longer delay before hiding the spinner for smooth UX
        setTimeout(() => {
          console.log('🎯 Final check before hiding spinner');
          setIsLoading(false);
          if (!criticalResourcesLoaded) {
            setCriticalResourcesLoaded(true);
            console.log('🎉 All critical resources loaded - hiding global spinner!');
          }
        }, 800); // 800ms delay for smooth transition
      } else {
        setIsLoading(true);
      }
    }
  }, [loadingTasks, criticalResourcesLoaded, isLoading, minimumLoadingTimeMet]);

  // Enhanced resource tracking
  useEffect(() => {
    if (initialTasksAdded) return; // Prevent duplicate initialization
    
    // Add critical loading tasks immediately
    addLoadingTask('document-ready');
    addLoadingTask('fonts-loaded');
    setInitialTasksAdded(true);
    
    const checkCriticalResources = async () => {
      // Check document ready state
      const checkDocumentReady = () => {
        if (document.readyState === 'complete') {
          setTimeout(() => removeLoadingTask('document-ready'), 100);
        } else {
          window.addEventListener('load', () => {
            setTimeout(() => removeLoadingTask('document-ready'), 100);
          }, { once: true });
        }
      };

      // Check fonts loaded
      const checkFontsLoaded = () => {
        if (document.fonts) {
          document.fonts.ready.then(() => {
            setTimeout(() => removeLoadingTask('fonts-loaded'), 100);
          });
        } else {
          // Fallback for older browsers
          setTimeout(() => {
            removeLoadingTask('fonts-loaded');
          }, 1000);
        }
      };

      checkDocumentReady();
      checkFontsLoaded();
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