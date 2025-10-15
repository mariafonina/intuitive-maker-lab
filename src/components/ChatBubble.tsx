interface ChatBubbleProps {
  type: "user" | "other" | "forwarded";
  children: React.ReactNode;
  forwardedFrom?: string;
}

export const ChatBubble = ({ type, children, forwardedFrom }: ChatBubbleProps) => {
  const baseClasses = "p-3 sm:p-4 rounded-2xl max-w-[85%] sm:max-w-[80%] mb-2 sm:mb-3 leading-relaxed text-sm sm:text-base";

  if (type === "user") {
    return (
      <div className={`${baseClasses} bg-blue-50 rounded-br-sm self-end text-right`}>
        {children}
      </div>
    );
  }

  if (type === "forwarded") {
    return (
      <div className={`${baseClasses} bg-muted border border-border rounded-bl-sm self-start`}>
        {forwardedFrom && (
          <span className="font-semibold text-primary block mb-1">
            Переслано от: <span className="blur-sm select-none">{forwardedFrom}</span>
          </span>
        )}
        {children}
      </div>
    );
  }

  return (
    <div className={`${baseClasses} bg-muted rounded-bl-sm self-start`}>
      {children}
    </div>
  );
};
