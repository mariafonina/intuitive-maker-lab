import { useEffect, useState } from "react";

interface ProgressBarProps {
  topOffset?: string;
}

export const ProgressBar = ({ topOffset = "top-16" }: ProgressBarProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTotal = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (scrollTotal <= 0) {
        setProgress(0);
        return;
      }
      const scrolled = Math.min(Math.max((window.scrollY / scrollTotal) * 100, 0), 100);
      setProgress(scrolled);
    };

    window.addEventListener("scroll", updateProgress);
    window.addEventListener("resize", updateProgress);
    updateProgress();

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return (
    <div className={`fixed ${topOffset} left-0 w-full h-1.5 z-50 bg-muted`}>
      <div
        className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};
