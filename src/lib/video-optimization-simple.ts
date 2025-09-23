/**
 * Simple Video Optimization Utilities
 * Lightweight version to avoid import issues
 */

/**
 * Optimizes video element for fast loading
 */
export function optimizeVideoElement(video: HTMLVideoElement): void {
  if (!video) return;
  
  // Set optimization attributes
  video.setAttribute('preload', 'auto');
  video.setAttribute('playsinline', 'true');
  video.setAttribute('webkit-playsinline', 'true');
  video.muted = true; // Required for autoplay on most browsers
  
  // Enable hardware acceleration
  video.style.transform = 'translateZ(0)';
  video.style.backfaceVisibility = 'hidden';
  video.style.perspective = '1000px';
}

/**
 * Simple video loader class
 */
export class VideoLoader {
  private video: HTMLVideoElement;
  
  constructor(video: HTMLVideoElement, config?: any) {
    this.video = video;
    this.optimize();
  }
  
  private optimize(): void {
    optimizeVideoElement(this.video);
  }
  
  public async load(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.video.readyState >= 4) {
        resolve();
        return;
      }
      
      const onCanPlay = () => {
        this.video.removeEventListener('canplaythrough', onCanPlay);
        this.video.removeEventListener('error', onError);
        resolve();
      };
      
      const onError = () => {
        this.video.removeEventListener('canplaythrough', onCanPlay);
        this.video.removeEventListener('error', onError);
        reject(new Error('Video loading failed'));
      };
      
      this.video.addEventListener('canplaythrough', onCanPlay);
      this.video.addEventListener('error', onError);
    });
  }
}