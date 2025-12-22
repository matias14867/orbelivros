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
import { ScrollArea } from "@/components/ui/scroll-area";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Senha deve ter no mínimo 6 caracteres" }),
});

const signUpSchema = loginSchema.extend({
  fullName: z.string().trim().min(2, { message: "Nome deve ter no mínimo 2 caracteres" }),
  confirmPassword: z.string(),
  phone: z.string().trim().min(10, { message: "Telefone deve ter no mínimo 10 dígitos" }),
  addressStreet: z.string().trim().min(3, { message: "Rua é obrigatória" }),
  addressNumber: z.string().trim().min(1, { message: "Número é obrigatório" }),
  addressComplement: z.string().optional(),
  addressNeighborhood: z.string().trim().min(2, { message: "Bairro é obrigatório" }),
  addressCity: z.string().trim().min(2, { message: "Cidade é obrigatória" }),
  addressState: z.string().trim().length(2, { message: "Estado deve ter 2 letras (ex: SP)" }),
  addressZip: z.string().trim().min(8, { message: "CEP deve ter 8 dígitos" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

const resetSchema = z.object({
  email: z.string().trim().email({ message: "Email inválido" }),
});

type AuthMode = "login" | "signup" | "reset";

interface AddressData {
  phone: string;
  addressStreet: string;
  addressNumber: string;
  addressComplement: string;
  addressNeighborhood: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
}

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressStreet, setAddressStreet] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [addressComplement, setAddressComplement] = useState("");
  const [addressNeighborhood, setAddressNeighborhood] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressState, setAddressState] = useState("");
  const [addressZip, setAddressZip] = useState("");
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
        signUpSchema.parse({ 
          email, 
          password, 
          fullName, 
          confirmPassword,
          phone,
          addressStreet,
          addressNumber,
          addressComplement,
          addressNeighborhood,
          addressCity,
          addressState,
          addressZip,
        });
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
        const addressData: AddressData = {
          phone,
          addressStreet,
          addressNumber,
          addressComplement,
          addressNeighborhood,
          addressCity,
          addressState,
          addressZip,
        };
        const { error } = await signUp(email, password, fullName, addressData);
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
      case "signup": return "Preencha seus dados para começar";
      case "reset": return "Digite seu email para receber o link de recuperação";
    }
  };

  const renderSignupFields = () => (
    <>
      {/* Nome e Telefone */}
      <div className="space-y-2">
        <Label htmlFor="fullName">Nome completo *</Label>
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

      <div className="space-y-2">
        <Label htmlFor="phone">Telefone *</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="(00) 00000-0000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={errors.phone ? "border-destructive" : ""}
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone}</p>
        )}
      </div>

      {/* Endereço */}
      <div className="pt-4 border-t border-border">
        <h3 className="font-medium text-foreground mb-3">Endereço de entrega</h3>
        
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="addressZip">CEP *</Label>
            <Input
              id="addressZip"
              type="text"
              placeholder="00000-000"
              value={addressZip}
              onChange={(e) => setAddressZip(e.target.value)}
              className={errors.addressZip ? "border-destructive" : ""}
            />
            {errors.addressZip && (
              <p className="text-sm text-destructive">{errors.addressZip}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="addressStreet">Rua *</Label>
              <Input
                id="addressStreet"
                type="text"
                placeholder="Nome da rua"
                value={addressStreet}
                onChange={(e) => setAddressStreet(e.target.value)}
                className={errors.addressStreet ? "border-destructive" : ""}
              />
              {errors.addressStreet && (
                <p className="text-sm text-destructive">{errors.addressStreet}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressNumber">Nº *</Label>
              <Input
                id="addressNumber"
                type="text"
                placeholder="123"
                value={addressNumber}
                onChange={(e) => setAddressNumber(e.target.value)}
                className={errors.addressNumber ? "border-destructive" : ""}
              />
              {errors.addressNumber && (
                <p className="text-sm text-destructive">{errors.addressNumber}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressComplement">Complemento</Label>
            <Input
              id="addressComplement"
              type="text"
              placeholder="Apto, bloco, etc."
              value={addressComplement}
              onChange={(e) => setAddressComplement(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressNeighborhood">Bairro *</Label>
            <Input
              id="addressNeighborhood"
              type="text"
              placeholder="Seu bairro"
              value={addressNeighborhood}
              onChange={(e) => setAddressNeighborhood(e.target.value)}
              className={errors.addressNeighborhood ? "border-destructive" : ""}
            />
            {errors.addressNeighborhood && (
              <p className="text-sm text-destructive">{errors.addressNeighborhood}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="addressCity">Cidade *</Label>
              <Input
                id="addressCity"
                type="text"
                placeholder="Sua cidade"
                value={addressCity}
                onChange={(e) => setAddressCity(e.target.value)}
                className={errors.addressCity ? "border-destructive" : ""}
              />
              {errors.addressCity && (
                <p className="text-sm text-destructive">{errors.addressCity}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressState">UF *</Label>
              <Input
                id="addressState"
                type="text"
                placeholder="SP"
                maxLength={2}
                value={addressState}
                onChange={(e) => setAddressState(e.target.value.toUpperCase())}
                className={errors.addressState ? "border-destructive" : ""}
              />
              {errors.addressState && (
                <p className="text-sm text-destructive">{errors.addressState}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Helmet>
        <title>{mode === "login" ? "Entrar" : mode === "signup" ? "Criar Conta" : "Recuperar Senha"} | Orbe Livros</title>
        <meta name="description" content="Acesse sua conta na Orbe Livros e descubra livros incríveis." />
      </Helmet>

      <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-b from-primary/5 to-background p-4 py-8">
        <Link to="/" className="flex items-center gap-2 mb-6">
          <BookOpen className="h-8 w-8 text-primary" />
          <span className="font-serif text-3xl font-semibold text-foreground">
            Orbe <span className="text-primary">Livros</span>
          </span>
        </Link>

        <div className={`w-full bg-card rounded-2xl shadow-card p-6 md:p-8 ${mode === "signup" ? "max-w-xl" : "max-w-md"}`}>
          <h1 className="font-serif text-2xl font-bold text-center text-foreground mb-2">
            {getTitle()}
          </h1>
          <p className="text-muted-foreground text-center mb-4">
            {getSubtitle()}
          </p>

          {mode === "signup" ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <ScrollArea className="max-h-[65vh] pr-4">
                <div className="space-y-4 pb-2">
                  {renderSignupFields()}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
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

                  <div className="space-y-2">
                    <Label htmlFor="password">Senha *</Label>
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

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar senha *</Label>
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
                </div>
              </ScrollArea>

              <Button type="submit" className="w-full mt-4" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  "Criar conta"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    {mode === "login" ? "Entrando..." : "Enviando..."}
                  </>
                ) : (
                  mode === "login" ? "Entrar" : "Enviar link"
                )}
              </Button>
            </form>
          )}

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
