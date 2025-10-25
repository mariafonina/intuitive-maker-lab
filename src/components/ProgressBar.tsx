import { useEffect, useState } from "react";

export const ProgressBar = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTotal = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (window.scrollY / scrollTotal) * 100;
      setProgress(scrolled);
    };

    window.addEventListener("scroll", updateProgress);
    updateProgress();

    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <div className="fixed top-16 left-0 w-full h-2.5 z-50 bg-muted">
      <div
        className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};
