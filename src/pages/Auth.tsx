import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BookOpen, Eye, EyeOff, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Senha deve ter no mínimo 6 caracteres" }),
});

const signUpSchema = loginSchema.extend({
  fullName: z.string().trim().min(2, { message: "Nome deve ter no mínimo 2 caracteres" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

const resetSchema = z.object({
  email: z.string().trim().email({ message: "Email inválido" }),
});

type AuthMode = "login" | "signup" | "reset";

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const validateForm = () => {
    setErrors({});
    
    try {
      if (mode === "login") {
        loginSchema.parse({ email, password });
      } else if (mode === "signup") {
        signUpSchema.parse({ email, password, fullName, confirmPassword });
      } else {
        resetSchema.parse({ email });
      }
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Email ou senha incorretos");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Login realizado com sucesso!");
          navigate("/");
        }
      } else if (mode === "signup") {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes("User already registered")) {
            toast.error("Este email já está cadastrado");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Conta criada com sucesso!");
          navigate("/");
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Email de recuperação enviado!", {
            description: "Verifique sua caixa de entrada.",
          });
          setMode("login");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrors({});
    setPassword("");
    setConfirmPassword("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getTitle = () => {
    switch (mode) {
      case "login": return "Bem-vinda de volta!";
      case "signup": return "Crie sua conta";
      case "reset": return "Recuperar senha";
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case "login": return "Entre para continuar sua jornada literária";
      case "signup": return "Junte-se a milhares de leitoras apaixonadas";
      case "reset": return "Digite seu email para receber o link de recuperação";
    }
  };

  return (
    <>
      <Helmet>
        <title>{mode === "login" ? "Entrar" : mode === "signup" ? "Criar Conta" : "Recuperar Senha"} | Orbe Livros</title>
        <meta name="description" content="Acesse sua conta na Orbe Livros e descubra livros incríveis." />
      </Helmet>

      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-background p-4">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <BookOpen className="h-8 w-8 text-primary" />
          <span className="font-serif text-3xl font-semibold text-foreground">
            Orbe <span className="text-primary">Livros</span>
          </span>
        </Link>

        <div className="w-full max-w-md bg-card rounded-2xl shadow-card p-8">
          <h1 className="font-serif text-2xl font-bold text-center text-foreground mb-2">
            {getTitle()}
          </h1>
          <p className="text-muted-foreground text-center mb-6">
            {getSubtitle()}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome completo</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Seu nome"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={errors.fullName ? "border-destructive" : ""}
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive">{errors.fullName}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            {mode !== "reset" && (
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={errors.password ? "border-destructive pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>
            )}

            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={errors.confirmPassword ? "border-destructive" : ""}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {mode === "login" && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => switchMode("reset")}
                  className="text-sm text-primary hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {mode === "login" ? "Entrando..." : mode === "signup" ? "Criando conta..." : "Enviando..."}
                </>
              ) : (
                mode === "login" ? "Entrar" : mode === "signup" ? "Criar conta" : "Enviar link"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            {mode === "reset" ? (
              <p className="text-muted-foreground">
                Lembrou a senha?
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="ml-1 text-primary hover:underline font-medium"
                >
                  Voltar ao login
                </button>
              </p>
            ) : (
              <p className="text-muted-foreground">
                {mode === "login" ? "Não tem uma conta?" : "Já tem uma conta?"}
                <button
                  type="button"
                  onClick={() => switchMode(mode === "login" ? "signup" : "login")}
                  className="ml-1 text-primary hover:underline font-medium"
                >
                  {mode === "login" ? "Criar conta" : "Entrar"}
                </button>
              </p>
            )}
          </div>
        </div>

        <Link 
          to="/" 
          className="mt-6 text-muted-foreground hover:text-primary transition-colors"
        >
          ← Voltar para a loja
        </Link>
      </div>
    </>
  );
};

export default Auth;
