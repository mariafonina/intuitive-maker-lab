import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Confetti = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: "-10%",
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        >
          {["🎉", "✨", "🎊", "⭐", "💫"][Math.floor(Math.random() * 5)]}
        </div>
      ))}
    </div>
  );
};

interface PollOption {
  id: string;
  text: string;
}

interface PollProps {
  question: string;
  options: PollOption[];
}

export const Poll = ({ question, options }: PollProps) => {
  const [voted, setVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Check if user has already voted
    const hasVoted = localStorage.getItem("poll-voted");
    const savedVote = localStorage.getItem("poll-selected");
    const savedVotes = localStorage.getItem("poll-votes");

    if (hasVoted === "true" && savedVote) {
      setVoted(true);
      setSelectedOption(savedVote);
    }

    if (savedVotes) {
      setVotes(JSON.parse(savedVotes));
    } else {
      // Initialize votes
      const initialVotes: Record<string, number> = {};
      options.forEach((option) => {
        initialVotes[option.id] = 0;
      });
      setVotes(initialVotes);
    }
  }, [options]);

  const handleVote = (optionId: string) => {
    if (voted) return;

    const newVotes = { ...votes };
    newVotes[optionId] = (newVotes[optionId] || 0) + 1;

    setVotes(newVotes);
    setSelectedOption(optionId);
    setVoted(true);

    // Show confetti animation for the first option
    if (optionId === "want-more") {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }

    // Save to localStorage
    localStorage.setItem("poll-voted", "true");
    localStorage.setItem("poll-selected", optionId);
    localStorage.setItem("poll-votes", JSON.stringify(newVotes));
  };

  const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);

  const getPercentage = (optionId: string) => {
    if (totalVotes === 0) return 0;
    return Math.round(((votes[optionId] || 0) / totalVotes) * 100);
  };

  return (
    <>
      {showConfetti && <Confetti />}
      <div className="my-8 sm:my-12 p-4 sm:p-6 md:p-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border border-primary/20">
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 text-center leading-tight">
          {question}
        </h3>

        <div className="space-y-2 sm:space-y-3">
          {options.map((option) => {
            const percentage = getPercentage(option.id);
            const isSelected = selectedOption === option.id;

            return (
              <div key={option.id} className="relative">
                <Button
                  onClick={() => handleVote(option.id)}
                  disabled={voted}
                  className={cn(
                    "w-full h-auto py-3 sm:py-4 px-4 sm:px-6 text-left justify-start relative overflow-hidden transition-all",
                    voted
                      ? "cursor-default"
                      : "hover:scale-[1.02] active:scale-[0.98]",
                    isSelected && voted
                      ? "bg-primary/20 border-2 border-primary"
                      : voted
                      ? "bg-muted/50"
                      : "bg-background hover:bg-primary/10"
                  )}
                  variant={voted ? "outline" : "default"}
                >
                {/* Progress bar background (shown after voting) */}
                {voted && (
                  <div
                    className="absolute inset-0 bg-primary/10 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                )}

                  {/* Content */}
                  <span className="relative z-10 flex items-start sm:items-center justify-between w-full gap-2 sm:gap-4">
                    <span className="text-xs sm:text-sm md:text-base font-medium flex-1 leading-snug">
                      {option.text}
                    </span>
                    {voted && (
                      <span className="text-xs sm:text-sm font-bold text-primary whitespace-nowrap shrink-0">
                        {percentage}% ({votes[option.id] || 0})
                      </span>
                    )}
                  </span>
                </Button>
              </div>
            );
          })}
        </div>

        {voted && (
          <p className="text-xs sm:text-sm text-muted-foreground text-center mt-3 sm:mt-4">
            Спасибо за участие! Всего голосов: {totalVotes}
          </p>
        )}
      </div>
    </>
  );
};
