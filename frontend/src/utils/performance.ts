// Utilidades de optimización de rendimiento

// Throttle para funciones que se ejecutan frecuentemente
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T => {
  let inThrottle: boolean;
  return ((...args: any[]) => {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  }) as T;
};

// Debounce para funciones que se ejecutan después de un delay
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T => {
  let timeoutId: number;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  }) as T;
};

// Lazy loading para imágenes
export const lazyLoadImage = (img: HTMLImageElement, src: string) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        img.src = src;
        observer.unobserve(img);
      }
    });
  });
  observer.observe(img);
};

// Optimizar scroll events
export const optimizeScroll = (callback: () => void) => {
  let ticking = false;
  
  const update = () => {
    callback();
    ticking = false;
  };
  
  return () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  };
};

// Preload de recursos críticos
export const preloadResource = (href: string, as: string) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
};

// Optimizar resize events
export const optimizeResize = (callback: () => void) => {
  let resizeTimeout: number;
  
  return () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(callback, 100);
  };
};
