import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState("enter");

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage("exit");
    }
  }, [location, displayLocation]);

  useEffect(() => {
    if (transitionStage === "exit") {
      const timeout = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage("enter");
      }, 250);
      return () => clearTimeout(timeout);
    }
  }, [transitionStage, location]);

  return (
    <div
      className={
        transitionStage === "enter"
          ? "page-transition-enter"
          : "page-transition-exit"
      }
    >
      {children}
    </div>
  );
}

// Animated container for page content with stagger effect
interface AnimatedContainerProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedContainer({ children, className = "", delay = 0 }: AnimatedContainerProps) {
  return (
    <div
      className={`animate-fade-in-up ${className}`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
    >
      {children}
    </div>
  );
}

// Stagger children animation wrapper
interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerContainer({ children, className = "", staggerDelay = 100 }: StaggerContainerProps) {
  return (
    <div className={`stagger-container ${className}`} style={{ "--stagger-delay": `${staggerDelay}ms` } as React.CSSProperties}>
      {children}
    </div>
  );
}

// Card with hover lift and scale effect
interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function AnimatedCard({ children, className = "", onClick }: AnimatedCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-card border border-border rounded-xl
        transition-all duration-300 ease-out
        hover:-translate-y-1 hover:shadow-lg hover:border-primary/20
        active:scale-[0.98]
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// Button with ripple effect
interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function AnimatedButton({ 
  children, 
  variant = "primary", 
  size = "md",
  className = "",
  ...props 
}: AnimatedButtonProps) {
  const baseStyles = "relative overflow-hidden transition-all duration-200 ease-out active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";
  
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border border-border bg-background hover:bg-muted hover:border-primary/30",
    ghost: "hover:bg-muted hover:text-foreground"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded-md",
    md: "px-4 py-2 text-sm rounded-lg",
    lg: "px-6 py-3 text-base rounded-xl"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
}
