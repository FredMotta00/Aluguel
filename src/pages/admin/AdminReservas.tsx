import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Search, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Flag,
  CalendarCheck,
  Phone,
  Mail
} from 'lucide-react';

type ReservaStatus = 'pendente' | 'confirmada' | 'finalizada' | 'cancelada';

export default function AdminReservas() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'confirmar' | 'cancelar' | 'finalizar';
    reservaId: string;
  }>({ open: false, type: 'confirmar', reservaId: '' });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reservas, isLoading } = useQuery({
    queryKey: ['admin-reservas', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('reservas')
        .select(`
          *,
          produtos (nome, imagem)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ReservaStatus }) => {
      const { error } = await supabase
        .from('reservas')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reservas'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-recent-reservas'] });
      
      const actionLabels = {
        confirmar: 'confirmada',
        cancelar: 'cancelada',
        finalizar: 'finalizada'
      };
      
      toast({
        title: 'Sucesso',
        description: `Reserva ${actionLabels[actionDialog.type]} com sucesso`,
      });
      setActionDialog({ open: false, type: 'confirmar', reservaId: '' });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar reserva: ' + error.message,
        variant: 'destructive',
      });
    }
  });

  const handleAction = () => {
    const statusMap: Record<string, ReservaStatus> = {
      confirmar: 'confirmada',
      cancelar: 'cancelada',
      finalizar: 'finalizada'
    };

    updateStatusMutation.mutate({
      id: actionDialog.reservaId,
      status: statusMap[actionDialog.type]
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendente</Badge>;
      case 'confirmada':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Confirmada</Badge>;
      case 'finalizada':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Finalizada</Badge>;
      case 'cancelada':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredReservas = reservas?.filter(r => 
    r.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.cliente_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const actionDialogContent = {
    confirmar: {
      title: 'Confirmar Reserva',
      description: 'Tem certeza que deseja confirmar esta reserva? O cliente será notificado.',
      action: 'Confirmar'
    },
    cancelar: {
      title: 'Cancelar Reserva',
      description: 'Tem certeza que deseja cancelar esta reserva? Esta ação não pode ser desfeita.',
      action: 'Cancelar'
    },
    finalizar: {
      title: 'Finalizar Reserva',
      description: 'Confirma que o equipamento foi devolvido e a reserva pode ser finalizada?',
      action: 'Finalizar'
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gestão de Reservas</h1>
        <p className="text-muted-foreground">Gerencie todas as reservas de equipamentos</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="confirmada">Confirmada</SelectItem>
                <SelectItem value="finalizada">Finalizada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reservations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reservas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filteredReservas && filteredReservas.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReservas.map((reserva) => (
                    <TableRow key={reserva.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{reserva.cliente_nome}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {reserva.cliente_email}
                          </div>
                          {reserva.cliente_telefone && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {reserva.cliente_telefone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{(reserva.produtos as any)?.nome}</span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(reserva.data_inicio), "dd/MM/yyyy", { locale: ptBR })}
                          <span className="text-muted-foreground"> até </span>
                          {format(new Date(reserva.data_fim), "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          R$ {Number(reserva.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(reserva.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {reserva.status === 'pendente' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => setActionDialog({
                                  open: true,
                                  type: 'confirmar',
                                  reservaId: reserva.id
                                })}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => setActionDialog({
                                  open: true,
                                  type: 'cancelar',
                                  reservaId: reserva.id
                                })}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {reserva.status === 'confirmada' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() => setActionDialog({
                                open: true,
                                type: 'finalizar',
                                reservaId: reserva.id
                              })}
                            >
                              <Flag className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <CalendarCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma reserva encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Confirmation Dialog */}
      <AlertDialog 
        open={actionDialog.open} 
        onOpenChange={(open) => setActionDialog(prev => ({ ...prev, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionDialogContent[actionDialog.type].title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionDialogContent[actionDialog.type].description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              disabled={updateStatusMutation.isPending}
              className={actionDialog.type === 'cancelar' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {updateStatusMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                actionDialogContent[actionDialog.type].action
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
