import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useBookComments } from "@/hooks/useBookComments";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Star, Loader2, Trash2, Send, ThumbsUp, Clock } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BookCommentsProps {
  bookHandle: string;
}

const BookComments = ({ bookHandle }: BookCommentsProps) => {
  const { user } = useAuth();
  const { comments, loading, addComment, deleteComment, toggleLike } = useBookComments(bookHandle);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setSubmitting(true);
    const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuário";
    
    const { error } = await addComment(user.id, userName, newComment.trim(), rating || undefined);
    
    if (error) {
      toast.error("Erro ao enviar comentário");
    } else {
      toast.success("Comentário enviado! Aguardando aprovação.");
      setNewComment("");
      setRating(0);
    }
    setSubmitting(false);
  };

  const handleDelete = async (commentId: string) => {
    const { error } = await deleteComment(commentId);
    if (error) {
      toast.error("Erro ao excluir comentário");
    } else {
      toast.success("Comentário excluído");
    }
  };

  const handleLike = async (commentId: string) => {
    if (!user) {
      toast.error("Faça login para curtir");
      return;
    }
    const { error } = await toggleLike(commentId, user.id);
    if (error) {
      toast.error("Erro ao curtir");
    }
  };

  // Only show approved comments to regular users, show all to comment owners
  const visibleComments = comments.filter(c => 
    c.status === 'approved' || c.user_id === user?.id
  );

  const approvedComments = comments.filter(c => c.status === 'approved');
  const averageRating = approvedComments.length > 0
    ? approvedComments.filter(c => c.rating).reduce((acc, c) => acc + (c.rating || 0), 0) / approvedComments.filter(c => c.rating).length
    : 0;

  return (
    <Card className="mt-12">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <MessageSquare className="h-5 w-5 text-primary" />
          Avaliações dos Leitores
          {approvedComments.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({approvedComments.length} {approvedComments.length === 1 ? "avaliação" : "avaliações"})
              {averageRating > 0 && (
                <span className="ml-2 inline-flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {averageRating.toFixed(1)}
                </span>
              )}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comment Form */}
        {user ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Sua avaliação (opcional)</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star === rating ? 0 : star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Compartilhe sua opinião sobre este livro..."
              rows={3}
              maxLength={500}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {newComment.length}/500 caracteres
              </span>
              <Button type="submit" disabled={!newComment.trim() || submitting}>
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Enviar
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center py-6 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground mb-3">
              Faça login para deixar sua avaliação
            </p>
            <Button asChild variant="outline">
              <Link to="/auth">Entrar</Link>
            </Button>
          </div>
        )}

        {/* Comments List */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : visibleComments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Seja o primeiro a avaliar este livro!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleComments.map((comment) => {
              const initials = comment.user_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              const isPending = comment.status === 'pending';
              const isOwner = user?.id === comment.user_id;

              return (
                <div
                  key={comment.id}
                  className={`flex gap-4 p-4 rounded-lg ${
                    isPending ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-muted/30'
                  }`}
                >
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground">
                        {comment.user_name}
                      </span>
                      {comment.rating && (
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= comment.rating!
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(comment.created_at), "d 'de' MMM 'de' yyyy", {
                          locale: ptBR,
                        })}
                      </span>
                      {isPending && isOwner && (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-500">
                          <Clock className="h-3 w-3 mr-1" />
                          Aguardando aprovação
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mt-1 whitespace-pre-wrap">
                      {comment.comment}
                    </p>
                    
                    {/* Like button */}
                    {comment.status === 'approved' && (
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-8 px-2 ${comment.user_liked ? 'text-primary' : 'text-muted-foreground'}`}
                          onClick={() => handleLike(comment.id)}
                        >
                          <ThumbsUp className={`h-4 w-4 mr-1 ${comment.user_liked ? 'fill-primary' : ''}`} />
                          {comment.likes_count || 0}
                        </Button>
                      </div>
                    )}
                  </div>
                  {isOwner && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(comment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BookComments;
