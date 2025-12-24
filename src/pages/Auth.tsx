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
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";


const loginSchema = z.object({
  email: z.string().trim().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Senha deve ter no mínimo 6 caracteres" }),
});

// CPF validation function
const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
};

const signUpSchema = loginSchema.extend({
  fullName: z.string().trim().min(2, { message: "Nome deve ter no mínimo 2 caracteres" }),
  cpf: z.string().trim().min(14, { message: "CPF deve ter 11 dígitos" }).refine((val) => validateCPF(val), { message: "CPF inválido" }),
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
  const [cpf, setCpf] = useState("");
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
          cpf,
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

  // Funções de máscara
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers.length ? `(${numbers}` : '';
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setCpf(formatted);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const [isLoadingCep, setIsLoadingCep] = useState(false);

  const handleCEPChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value);
    setAddressZip(formatted);
    
    // Auto-fetch address when CEP is complete (8 digits)
    const numbers = formatted.replace(/\D/g, '');
    if (numbers.length === 8) {
      setIsLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${numbers}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setAddressStreet(data.logradouro || '');
          setAddressNeighborhood(data.bairro || '');
          setAddressCity(data.localidade || '');
          setAddressState(data.uf || '');
          toast.success("Endereço preenchido automaticamente!");
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      } finally {
        setIsLoadingCep(false);
      }
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

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="cpf">CPF *</Label>
          <Input
            id="cpf"
            type="text"
            placeholder="000.000.000-00"
            value={cpf}
            onChange={handleCPFChange}
            maxLength={14}
            className={errors.cpf ? "border-destructive" : ""}
          />
          {errors.cpf && (
            <p className="text-sm text-destructive">{errors.cpf}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(00) 00000-0000"
            value={phone}
            onChange={handlePhoneChange}
            maxLength={15}
            className={errors.phone ? "border-destructive" : ""}
          />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone}</p>
          )}
        </div>
      </div>

      {/* Endereço */}
      <div className="pt-4 border-t border-border">
        <h3 className="font-medium text-foreground mb-3">Endereço de entrega</h3>
        
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="addressZip">CEP *</Label>
            <div className="relative">
              <Input
                id="addressZip"
                type="text"
                placeholder="00000-000"
                value={addressZip}
                onChange={handleCEPChange}
                maxLength={9}
                className={errors.addressZip ? "border-destructive" : ""}
              />
              {isLoadingCep && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            {errors.addressZip && (
              <p className="text-sm text-destructive">{errors.addressZip}</p>
            )}
            <p className="text-xs text-muted-foreground">Digite o CEP para preencher automaticamente</p>
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

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="addressComplement">Complemento</Label>
              <Input
                id="addressComplement"
                type="text"
                placeholder="Apto, bloco, casa, etc."
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

      <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-primary/5 to-background p-4 py-8">
        <Link to="/" className="flex items-center gap-2 mb-6">
          <BookOpen className="h-8 w-8 text-primary" />
          <span className="font-serif text-3xl font-semibold text-foreground">
            Orbe <span className="text-primary">Livros</span>
          </span>
        </Link>

        <div className={`w-full bg-card rounded-2xl shadow-card p-6 md:p-8 mb-8 ${mode === "signup" ? "max-w-xl" : "max-w-md"}`}>
          <h1 className="font-serif text-2xl font-bold text-center text-foreground mb-2">
            {getTitle()}
          </h1>
          <p className="text-muted-foreground text-center mb-4">
            {getSubtitle()}
          </p>

          {mode === "signup" ? (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <PasswordStrengthIndicator password={password} />
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
