import { useState, useEffect } from "react";
import logo from "@/assets/stockflow-logo.png";

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out after 2.5 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2500);

    // Call onComplete after fade animation (0.5s)
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-primary/80 transition-opacity duration-500 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className={`transition-all duration-700 ${fadeOut ? "scale-90 opacity-0" : "scale-100 opacity-100"}`}>
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full" />
          <img
            src={logo}
            alt="StockFlow Logo"
            className="relative h-32 w-32 object-contain animate-pulse"
          />
        </div>
        
        <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
          StockFlow
        </h1>
        <p className="text-xl text-white/90 font-light mb-2">
          Point of Sale System
        </p>
        <p className="text-sm text-white/70">
          Streamline Your Business
        </p>
      </div>

      {/* Loading indicator */}
      <div className={`absolute bottom-20 transition-opacity duration-500 ${fadeOut ? "opacity-0" : "opacity-100"}`}>
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
