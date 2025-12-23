import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface PasswordStrengthIndicatorProps {
  password: string;
}

const getPasswordStrength = (password: string) => {
  let score = 0;
  
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  
  return score;
};

const getStrengthLabel = (score: number) => {
  switch (score) {
    case 0:
    case 1:
      return { label: "Fraca", color: "bg-destructive" };
    case 2:
      return { label: "Regular", color: "bg-orange-500" };
    case 3:
      return { label: "Boa", color: "bg-yellow-500" };
    case 4:
      return { label: "Forte", color: "bg-green-500" };
    case 5:
      return { label: "Muito forte", color: "bg-green-600" };
    default:
      return { label: "", color: "bg-muted" };
  }
};

export const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const { label, color } = getStrengthLabel(strength);

  if (!password) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors duration-200",
              strength >= level ? color : "bg-muted"
            )}
          />
        ))}
      </div>
      <p className={cn("text-xs", strength <= 1 ? "text-destructive" : strength <= 2 ? "text-orange-500" : "text-green-600")}>
        Força da senha: {label}
      </p>
    </div>
  );
};
