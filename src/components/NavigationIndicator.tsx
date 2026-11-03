import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const NavigationIndicator = () => {
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Show loading indicator when route changes
    setIsNavigating(true);

    // Hide after a short delay (smooth transition)
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!isNavigating) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <img 
          src="/favicon/favicon.svg" 
          alt="Kibegi" 
          className="h-16 w-16 animate-pulse"
        />
        <div className="h-1 w-32 bg-primary/20 rounded-full overflow-hidden">
          <div className="h-full bg-primary animate-[loading_1s_ease-in-out_infinite] rounded-full" 
               style={{
                 width: '60%',
                 animation: 'loading 1s ease-in-out infinite'
               }}
          />
        </div>
      </div>
      <style>{`
        @keyframes loading {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default NavigationIndicator;

