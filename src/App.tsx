import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import AllBooks from "./pages/AllBooks";
import CategoriesPage from "./pages/CategoriesPage";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Contact from "./pages/Contact";
import Bestsellers from "./pages/Bestsellers";
import Policies from "./pages/Policies";
import Subscribers from "./pages/Subscribers";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/livros" element={<AllBooks />} />
              <Route path="/categorias" element={<CategoriesPage />} />
              <Route path="/produto/:handle" element={<ProductDetail />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/perfil" element={<Profile />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/contato" element={<Contact />} />
              <Route path="/destaques" element={<Bestsellers />} />
              <Route path="/politicas/:policy" element={<Policies />} />
              <Route path="/assinantes" element={<Subscribers />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
