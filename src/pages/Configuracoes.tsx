import { useState } from 'react';
import { Calendar, Check, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const Configuracoes = () => {
  const { toast } = useToast();
  const [googleConectado, setGoogleConectado] = useState(false);
  const [notificacoes, setNotificacoes] = useState(true);
  const [lembretes, setLembretes] = useState(true);

  const handleConectarGoogle = () => {
    // Simulação de conexão OAuth
    toast({
      title: 'Conectando ao Google...',
      description: 'Você será redirecionado para autorizar o acesso.'
    });

    // Simular sucesso após 1.5s
    setTimeout(() => {
      setGoogleConectado(true);
      toast({
        title: 'Google Calendar conectado!',
        description: 'Suas reservas serão sincronizadas automaticamente.'
      });
    }, 1500);
  };

  const handleDesconectar = () => {
    setGoogleConectado(false);
    toast({
      title: 'Google Calendar desconectado',
      description: 'Suas reservas não serão mais sincronizadas.'
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas preferências e integrações
        </p>
      </div>

      {/* Google Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Google Calendar</CardTitle>
              <CardDescription>
                Sincronize suas reservas com seu calendário
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {googleConectado ? (
            <>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 text-primary">
                <Check className="h-5 w-5" />
                <span className="font-medium">Conectado</span>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  Reservas sincronizadas automaticamente
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  Lembretes 1 dia e 1 hora antes
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  Eventos em cor verde no calendário
                </li>
              </ul>
              <Button variant="outline" onClick={handleDesconectar}>
                Desconectar
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Conecte seu Google Calendar para ter suas reservas sincronizadas
                automaticamente e receber lembretes.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-muted-foreground/50" />
                  Sincronização automática de reservas
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-muted-foreground/50" />
                  Lembretes antes das locações
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-muted-foreground/50" />
                  Visualização integrada
                </li>
              </ul>
              <Button onClick={handleConectarGoogle} className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Conectar Google Calendar
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notificações</CardTitle>
          <CardDescription>
            Configure como deseja receber atualizações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="notificacoes" className="flex flex-col gap-1">
              <span>Notificações por e-mail</span>
              <span className="text-sm font-normal text-muted-foreground">
                Receba atualizações sobre suas reservas
              </span>
            </Label>
            <Switch
              id="notificacoes"
              checked={notificacoes}
              onCheckedChange={setNotificacoes}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="lembretes" className="flex flex-col gap-1">
              <span>Lembretes</span>
              <span className="text-sm font-normal text-muted-foreground">
                Receba lembretes antes das locações
              </span>
            </Label>
            <Switch
              id="lembretes"
              checked={lembretes}
              onCheckedChange={setLembretes}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Configuracoes;
