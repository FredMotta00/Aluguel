import { Link } from 'react-router-dom';
import { Produto } from '@/lib/database.types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight, CheckCircle, Clock, Wrench } from 'lucide-react';

interface ProdutoCardProps {
  produto: Produto;
}

const statusConfig = {
  disponivel: { 
    label: 'Disponível', 
    variant: 'default' as const,
    icon: CheckCircle,
    className: 'bg-primary/10 text-primary border-primary/20'
  },
  alugado: { 
    label: 'Alugado', 
    variant: 'secondary' as const,
    icon: Clock,
    className: 'bg-warning/10 text-warning border-warning/20'
  },
  manutencao: { 
    label: 'Manutenção', 
    variant: 'destructive' as const,
    icon: Wrench,
    className: 'bg-destructive/10 text-destructive border-destructive/20'
  }
};

const ProdutoCard = ({ produto }: ProdutoCardProps) => {
  const status = statusConfig[produto.status];
  const StatusIcon = status.icon;

  return (
    <Card className="group overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg gradient-card">
      <div className="aspect-[16/10] overflow-hidden bg-muted relative">
        <img
          src={produto.imagem || '/placeholder.svg'}
          alt={produto.nome}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <Badge 
          className={`absolute top-3 right-3 gap-1.5 ${status.className} border backdrop-blur-sm`}
        >
          <StatusIcon className="h-3 w-3" />
          {status.label}
        </Badge>
      </div>
      
      <CardContent className="p-5">
        <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
          {produto.nome}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
          {produto.descricao}
        </p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-gradient">
            R$ {Number(produto.preco_diario).toLocaleString('pt-BR')}
          </span>
          <span className="text-sm text-muted-foreground font-medium">/dia</span>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Link to={`/produto/${produto.id}`} className="w-full">
          <Button className="w-full gap-2 group/btn shadow-sm hover:shadow-md transition-all">
            <Calendar className="h-4 w-4" />
            Ver Disponibilidade
            <ArrowRight className="h-4 w-4 opacity-0 -ml-6 group-hover/btn:opacity-100 group-hover/btn:ml-0 transition-all duration-200" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ProdutoCard;