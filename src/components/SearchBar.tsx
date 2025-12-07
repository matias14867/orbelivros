import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchBar = ({ isOpen, onClose }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/livros?busca=${encodeURIComponent(query.trim())}`);
      setQuery("");
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-foreground/50 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="container pt-24">
        <div className="bg-card rounded-2xl shadow-2xl max-w-2xl mx-auto overflow-hidden">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Buscar livros por título ou autor... (pressione Enter)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-full pl-12 pr-12 py-6 text-lg border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </form>
          
          <div className="p-4 text-center text-muted-foreground text-sm border-t">
            Pressione <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd> para buscar
          </div>
        </div>
      </div>
    </div>
  );
};
