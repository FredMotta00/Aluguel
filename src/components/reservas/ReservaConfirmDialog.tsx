import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Produto } from '@/lib/database.types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2, CheckCircle2, Calendar, User, Mail, Phone, FileText, CreditCard } from 'lucide-react';

interface ReservaConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produto: Produto;
  dataInicio: Date;
  dataFim: Date;
  diasLocacao: number;
  valorTotal: number;
  onSuccess: () => void;
}

export const ReservaConfirmDialog = ({
  open,
  onOpenChange,
  produto,
  dataInicio,
  dataFim,
  diasLocacao,
  valorTotal,
  onSuccess
}: ReservaConfirmDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    observacoes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.email) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha nome e email.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('reservas').insert({
        produto_id: produto.id,
        cliente_nome: formData.nome,
        cliente_email: formData.email,
        cliente_telefone: formData.telefone || null,
        data_inicio: format(dataInicio, 'yyyy-MM-dd'),
        data_fim: format(dataFim, 'yyyy-MM-dd'),
        valor_total: valorTotal,
        observacoes: formData.observacoes || null,
        status: 'pendente'
      });

      if (error) throw error;

      setSuccess(true);
      
      setTimeout(() => {
        toast({
          title: 'Reserva solicitada com sucesso!',
          description: 'Você receberá uma confirmação por email em breve.'
        });
        onSuccess();
        onOpenChange(false);
        setSuccess(false);
        setFormData({ nome: '', email: '', telefone: '', observacoes: '' });
      }, 2000);

    } catch (error) {
      console.error('Erro ao criar reserva:', error);
      toast({
        title: 'Erro ao criar reserva',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-10 animate-scale-in">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <CheckCircle2 className="h-10 w-10 text-primary animate-bounce" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Reserva Confirmada!</h3>
            <p className="text-muted-foreground text-center">
              Sua solicitação foi enviada com sucesso.<br />
              Aguarde a confirmação por email.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Confirmar Reserva</DialogTitle>
          <DialogDescription>
            Preencha seus dados para finalizar a reserva do equipamento.
          </DialogDescription>
        </DialogHeader>

        {/* Resumo do Produto */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-4">
            <img 
              src={produto.imagem || '/placeholder.svg'} 
              alt={produto.nome}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h4 className="font-semibold text-foreground">{produto.nome}</h4>
              <p className="text-sm text-muted-foreground line-clamp-1">{produto.descricao}</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Início: <strong className="text-foreground">{format(dataInicio, "dd 'de' MMM", { locale: ptBR })}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Fim: <strong className="text-foreground">{format(dataFim, "dd 'de' MMM", { locale: ptBR })}</strong></span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{diasLocacao} dias × R$ {Number(produto.preco_diario).toLocaleString('pt-BR')}</span>
            </div>
            <span className="text-lg font-bold text-primary">
              R$ {valorTotal.toLocaleString('pt-BR')}
            </span>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome" className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Nome completo *
            </Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Seu nome completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone" className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              Telefone
            </Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes" className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Observações
            </Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Alguma observação sobre a reserva?"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1 gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                'Confirmar Reserva'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};