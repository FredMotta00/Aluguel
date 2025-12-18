import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Package, Search, Loader2, CheckCircle, Clock, XCircle, AlertCircle, ArrowRight } from 'lucide-react';

interface Produto {
  id: string;
  nome: string;
  imagem: string | null;
}

interface ReservaWithProduto {
  id: string;
  produto_id: string;
  cliente_nome: string;
  cliente_email: string;
  data_inicio: string;
  data_fim: string;
  valor_total: number;
  status: 'pendente' | 'confirmada' | 'finalizada' | 'cancelada';
  produtos: Produto | null;
}

const statusConfig = {
  pendente: { label: 'Pendente', icon: Clock, className: 'bg-warning/10 text-warning border-warning/20' },
  confirmada: { label: 'Confirmada', icon: CheckCircle, className: 'bg-primary/10 text-primary border-primary/20' },
  finalizada: { label: 'Finalizada', icon: CheckCircle, className: 'bg-muted text-muted-foreground border-border' },
  cancelada: { label: 'Cancelada', icon: XCircle, className: 'bg-destructive/10 text-destructive border-destructive/20' }
};

const MinhasReservas = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [searchedEmail, setSearchedEmail] = useState('');

  const { data: reservas = [], isLoading } = useQuery({
    queryKey: ['minhas-reservas', searchedEmail],
    queryFn: async () => {
      if (!searchedEmail) return [];
      
      const { data, error } = await supabase
        .from('reservas')
        .select('*, produtos(*)')
        .eq('cliente_email', searchedEmail)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ReservaWithProduto[];
    },
    enabled: !!searchedEmail
  });

  const cancelMutation = useMutation({
    mutationFn: async (reservaId: string) => {
      const { error } = await supabase
        .from('reservas')
        .update({ status: 'cancelada' })
        .eq('id', reservaId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['minhas-reservas'] });
      toast({
        title: 'Reserva cancelada',
        description: 'A reserva foi cancelada com sucesso.'
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Não foi possível cancelar a reserva.',
        variant: 'destructive'
      });
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchedEmail(email.trim());
  };

  const reservasAtivas = useMemo(() => 
    reservas.filter(r => ['pendente', 'confirmada'].includes(r.status)), [reservas]);
  const reservasFinalizadas = useMemo(() => 
    reservas.filter(r => r.status === 'finalizada'), [reservas]);
  const reservasCanceladas = useMemo(() => 
    reservas.filter(r => r.status === 'cancelada'), [reservas]);

  const ReservaCard = ({ reserva }: { reserva: ReservaWithProduto }) => {
    const status = statusConfig[reserva.status];
    const StatusIcon = status.icon;
    const dias = differenceInDays(parseISO(reserva.data_fim), parseISO(reserva.data_inicio)) + 1;

    return (
      <Card className="border-border/50 hover:border-primary/30 transition-all duration-200 hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex gap-4">
            <img 
              src={reserva.produtos?.imagem || '/placeholder.svg'} 
              alt={reserva.produtos?.nome}
              className="w-20 h-20 rounded-lg object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-foreground truncate">{reserva.produtos?.nome}</h3>
                <Badge className={`shrink-0 gap-1 ${status.className} border`}>
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(parseISO(reserva.data_inicio), "dd/MM/yy", { locale: ptBR })} - {format(parseISO(reserva.data_fim), "dd/MM/yy", { locale: ptBR })}
                </div>
                <div className="text-right">
                  {dias} {dias === 1 ? 'dia' : 'dias'}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gradient">
                  R$ {Number(reserva.valor_total).toLocaleString('pt-BR')}
                </span>
                {['pendente', 'confirmada'].includes(reserva.status) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => cancelMutation.mutate(reserva.id)}
                    disabled={cancelMutation.isPending}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
      <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
      <p className="text-muted-foreground mb-4">{message}</p>
      <Link to="/">
        <Button variant="outline" className="gap-2">
          Ver produtos
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Minhas Reservas</h1>
        <p className="text-muted-foreground">Gerencie suas locações de equipamentos</p>
      </div>

      {/* Busca por email */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" />
            Buscar Reservas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="email"
              placeholder="Digite seu email para buscar reservas..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={!email.trim()}>
              Buscar
            </Button>
          </form>
        </CardContent>
      </Card>

      {!searchedEmail ? (
        <div className="text-center py-16 bg-muted/30 rounded-xl border border-dashed border-border">
          <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">
            Digite seu email acima para visualizar suas reservas.
          </p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <Tabs defaultValue="ativas" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-12">
            <TabsTrigger value="ativas" className="gap-2">
              <Clock className="h-4 w-4" />
              Ativas ({reservasAtivas.length})
            </TabsTrigger>
            <TabsTrigger value="finalizadas" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Finalizadas ({reservasFinalizadas.length})
            </TabsTrigger>
            <TabsTrigger value="canceladas" className="gap-2">
              <XCircle className="h-4 w-4" />
              Canceladas ({reservasCanceladas.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ativas" className="space-y-4">
            {reservasAtivas.length === 0 ? (
              <EmptyState message="Você não possui reservas ativas." />
            ) : (
              reservasAtivas.map((reserva) => (
                <ReservaCard key={reserva.id} reserva={reserva} />
              ))
            )}
          </TabsContent>

          <TabsContent value="finalizadas" className="space-y-4">
            {reservasFinalizadas.length === 0 ? (
              <EmptyState message="Nenhuma reserva finalizada." />
            ) : (
              reservasFinalizadas.map((reserva) => (
                <ReservaCard key={reserva.id} reserva={reserva} />
              ))
            )}
          </TabsContent>

          <TabsContent value="canceladas" className="space-y-4">
            {reservasCanceladas.length === 0 ? (
              <EmptyState message="Nenhuma reserva cancelada." />
            ) : (
              reservasCanceladas.map((reserva) => (
                <ReservaCard key={reserva.id} reserva={reserva} />
              ))
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default MinhasReservas;