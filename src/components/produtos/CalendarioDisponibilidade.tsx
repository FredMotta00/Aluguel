import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  isWithinInterval,
  isBefore,
  startOfDay,
  parseISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDays } from 'lucide-react';

interface ReservaBasic {
  data_inicio: string;
  data_fim: string;
  status: string;
}

interface CalendarioDisponibilidadeProps {
  reservas: ReservaBasic[];
  dataInicio: Date | null;
  dataFim: Date | null;
  onSelectData: (data: Date) => void;
}

const CalendarioDisponibilidade = ({
  reservas,
  dataInicio,
  dataFim,
  onSelectData
}: CalendarioDisponibilidadeProps) => {
  const [mesAtual, setMesAtual] = useState(new Date());
  const hoje = startOfDay(new Date());

  const diasDoMes = useMemo(() => {
    const inicio = startOfMonth(mesAtual);
    const fim = endOfMonth(mesAtual);
    return eachDayOfInterval({ start: inicio, end: fim });
  }, [mesAtual]);

  const primeiroDiaSemana = useMemo(() => {
    return startOfMonth(mesAtual).getDay();
  }, [mesAtual]);

  const verificarOcupado = (data: Date): boolean => {
    return reservas.some((r) => {
      if (r.status !== 'confirmada' && r.status !== 'pendente') return false;
      const inicio = parseISO(r.data_inicio);
      const fim = parseISO(r.data_fim);
      return isWithinInterval(data, { start: inicio, end: fim });
    });
  };

  const verificarSelecionado = (data: Date): 'inicio' | 'fim' | 'meio' | null => {
    if (dataInicio && isSameDay(data, dataInicio)) return 'inicio';
    if (dataFim && isSameDay(data, dataFim)) return 'fim';
    if (
      dataInicio &&
      dataFim &&
      isWithinInterval(data, { start: dataInicio, end: dataFim })
    )
      return 'meio';
    return null;
  };

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <Card className="border-border/50 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          Calendário de Disponibilidade
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Header do Calendário */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMesAtual(subMonths(mesAtual, 1))}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h3 className="text-base font-semibold capitalize">
            {format(mesAtual, 'MMMM yyyy', { locale: ptBR })}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMesAtual(addMonths(mesAtual, 1))}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Dias da Semana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {diasSemana.map((dia) => (
            <div
              key={dia}
              className="text-center text-xs font-medium text-muted-foreground py-2"
            >
              {dia}
            </div>
          ))}
        </div>

        {/* Dias do Mês */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: primeiroDiaSemana }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {diasDoMes.map((dia) => {
            const ocupado = verificarOcupado(dia);
            const selecionado = verificarSelecionado(dia);
            const passado = isBefore(dia, hoje);
            const desabilitado = ocupado || passado;

            return (
              <button
                key={dia.toISOString()}
                onClick={() => !desabilitado && onSelectData(dia)}
                disabled={desabilitado}
                className={cn(
                  'aspect-square rounded-lg text-sm font-medium transition-all',
                  'flex items-center justify-center',
                  'hover:bg-accent disabled:hover:bg-transparent',
                  {
                    'bg-destructive/20 text-destructive cursor-not-allowed': ocupado,
                    'text-muted-foreground/40 cursor-not-allowed': passado && !ocupado,
                    'bg-primary text-primary-foreground': selecionado === 'inicio' || selecionado === 'fim',
                    'bg-primary/20 text-primary': selecionado === 'meio',
                    'text-foreground': !desabilitado && !selecionado
                  }
                )}
              >
                {format(dia, 'd')}
              </button>
            );
          })}
        </div>

        {/* Legenda */}
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary" />
            <span className="text-xs text-muted-foreground">Selecionado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-destructive/20" />
            <span className="text-xs text-muted-foreground">Ocupado</span>
          </div>
        </div>

        {dataInicio && !dataFim && (
          <div className="mt-4 p-3 bg-primary/10 rounded-lg flex items-start gap-2">
            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-primary">
              Selecione a data de término.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CalendarioDisponibilidade;