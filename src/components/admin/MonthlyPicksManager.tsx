import { useState } from "react";
import { useMonthlyPicks } from "@/hooks/useMonthlyPicks";
import { useBooks } from "@/hooks/useBooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, Calendar, BookOpen } from "lucide-react";
import { toast } from "sonner";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const MonthlyPicksManager = () => {
  const { picks, loading, addPick, removePick, updateDescription } = useMonthlyPicks();
  const { books, loading: booksLoading } = useBooks();
  const [selectedBook, setSelectedBook] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [description, setDescription] = useState("");
  const [adding, setAdding] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear + i);

  const handleAddPick = async () => {
    if (!selectedBook) {
      toast.error("Selecione um livro");
      return;
    }

    setAdding(true);
    const success = await addPick(
      selectedBook,
      parseInt(selectedMonth),
      parseInt(selectedYear),
      description || undefined
    );

    if (success) {
      toast.success("Livro indicado adicionado!");
      setSelectedBook("");
      setDescription("");
    } else {
      toast.error("Erro ao adicionar. Talvez este livro já esteja indicado para este mês.");
    }
    setAdding(false);
  };

  const handleRemove = async (id: string) => {
    const success = await removePick(id);
    if (success) {
      toast.success("Indicação removida");
    } else {
      toast.error("Erro ao remover indicação");
    }
  };

  const getBookById = (bookId: string) => books.find((b) => b.id === bookId);

  // Group picks by month/year
  const groupedPicks = picks.reduce((acc, pick) => {
    const key = `${pick.year}-${pick.month}`;
    if (!acc[key]) {
      acc[key] = {
        month: pick.month,
        year: pick.year,
        items: [],
      };
    }
    acc[key].items.push(pick);
    return acc;
  }, {} as Record<string, { month: number; year: number; items: typeof picks }>);

  if (loading || booksLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add New Pick */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Adicionar Indicado do Mês
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Mês</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_NAMES.map((name, idx) => (
                    <SelectItem key={idx} value={String(idx + 1)}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Ano</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Livro</Label>
              <Select value={selectedBook} onValueChange={setSelectedBook}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um livro" />
                </SelectTrigger>
                <SelectContent>
                  {books.map((book) => (
                    <SelectItem key={book.id} value={book.id}>
                      {book.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Descrição (opcional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Por que este livro é indicado..."
              rows={2}
            />
          </div>

          <Button onClick={handleAddPick} disabled={adding}>
            {adding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            Adicionar Indicação
          </Button>
        </CardContent>
      </Card>

      {/* Current Picks by Month */}
      {Object.entries(groupedPicks).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma indicação cadastrada ainda</p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedPicks)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([key, group]) => (
            <Card key={key}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {MONTH_NAMES[group.month - 1]} {group.year}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {group.items.map((pick) => {
                    const book = getBookById(pick.book_id);
                    if (!book) return null;

                    return (
                      <div
                        key={pick.id}
                        className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg"
                      >
                        {book.image_url && (
                          <img
                            src={book.image_url}
                            alt={book.title}
                            className="w-12 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{book.title}</p>
                          <p className="text-sm text-muted-foreground">{book.author}</p>
                          {pick.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {pick.description}
                            </p>
                          )}
                        </div>
                        <Badge variant="secondary">
                          R$ {book.price.toFixed(2).replace(".", ",")}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemove(pick.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))
      )}
    </div>
  );
};

export default MonthlyPicksManager;
