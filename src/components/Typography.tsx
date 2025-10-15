import { preventOrphans } from "@/lib/typography";

interface TypographyProps {
  children: string;
  className?: string;
  as?: "p" | "span" | "div" | "li";
}

/**
 * Typography component that automatically prevents orphans in Russian text
 */
export const Typography = ({ children, className = "", as: Component = "p" }: TypographyProps) => {
  const processedText = preventOrphans(children);
  
  return <Component className={className} dangerouslySetInnerHTML={{ __html: processedText }} />;
};
