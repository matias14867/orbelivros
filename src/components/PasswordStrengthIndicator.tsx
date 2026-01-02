import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Check, X, Shield } from "lucide-react";

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface PasswordRequirement {
  label: string;
  regex: RegExp;
}

const requirements: PasswordRequirement[] = [
  { label: "Mínimo 8 caracteres", regex: /.{8,}/ },
  { label: "Letra minúscula (a-z)", regex: /[a-z]/ },
  { label: "Letra maiúscula (A-Z)", regex: /[A-Z]/ },
  { label: "Número (0-9)", regex: /[0-9]/ },
  { label: "Caractere especial (!@#$%^&*)", regex: /[^a-zA-Z0-9]/ },
];

const getPasswordStrength = (password: string): number => {
  return requirements.filter(req => req.regex.test(password)).length;
};

const getStrengthInfo = (score: number) => {
  if (score === 5) return { label: "Muito forte", color: "text-green-600", bgColor: "bg-green-500" };
  if (score === 4) return { label: "Forte", color: "text-green-500", bgColor: "bg-green-500" };
  if (score === 3) return { label: "Boa", color: "text-yellow-500", bgColor: "bg-yellow-500" };
  if (score === 2) return { label: "Regular", color: "text-orange-500", bgColor: "bg-orange-500" };
  return { label: "Fraca", color: "text-destructive", bgColor: "bg-destructive" };
};

export const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const { label, color, bgColor } = getStrengthInfo(strength);

  const checkedRequirements = useMemo(() => {
    return requirements.map(req => ({
      ...req,
      met: req.regex.test(password),
    }));
  }, [password]);

  if (!password) return null;

  return (
    <div className="space-y-3 mt-2 p-3 bg-muted/50 rounded-lg border border-border">
      {/* Strength bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Força da senha:</span>
          </div>
          <span className={cn("text-xs font-medium", color)}>{label}</span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors duration-200",
                strength >= level ? bgColor : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      {/* Requirements checklist */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground mb-1.5">Requisitos:</p>
        {checkedRequirements.map((req, index) => (
          <div key={index} className="flex items-center gap-2">
            {req.met ? (
              <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
            ) : (
              <X className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            )}
            <span className={cn(
              "text-xs transition-colors",
              req.met ? "text-green-600" : "text-muted-foreground"
            )}>
              {req.label}
            </span>
          </div>
        ))}
      </div>

      {/* Security tip */}
      {strength < 5 && (
        <p className="text-xs text-muted-foreground italic">
          Dica: Use uma combinação única de letras, números e símbolos para maior segurança.
        </p>
      )}
    </div>
  );
};
