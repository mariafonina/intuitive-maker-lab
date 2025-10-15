import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    <div className="my-8 sm:my-12 p-6 sm:p-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border border-primary/20">
      <h3 className="text-xl sm:text-2xl font-bold mb-6 text-center">
        {question}
      </h3>

      <div className="space-y-3">
        {options.map((option) => {
          const percentage = getPercentage(option.id);
          const isSelected = selectedOption === option.id;

          return (
            <div key={option.id} className="relative">
              <Button
                onClick={() => handleVote(option.id)}
                disabled={voted}
                className={cn(
                  "w-full h-auto py-4 px-6 text-left justify-start relative overflow-hidden transition-all",
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
                <span className="relative z-10 flex items-center justify-between w-full gap-4">
                  <span className="text-sm sm:text-base font-medium flex-1">
                    {option.text}
                  </span>
                  {voted && (
                    <span className="text-sm font-bold text-primary whitespace-nowrap">
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
        <p className="text-sm text-muted-foreground text-center mt-4">
          Спасибо за участие! Всего голосов: {totalVotes}
        </p>
      )}
    </div>
  );
};
