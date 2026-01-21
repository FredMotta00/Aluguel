import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Tag, ExternalLink } from "lucide-react";

export interface ProdutoProps {
  produto: {
    id: string;
    nome: string;
    descricao: string;
    imagem: string | null;
    status: string;
    especificacoes?: string[];
    // Hybrid Data Support
    preco_diario?: number; // Legacy or explicit
    preco_mensal?: number | null;
    commercial?: {
      isForRent: boolean;
      isForSale: boolean;
      dailyRate: number | null;
      salePrice: number | null;
      monthlyRate: number | null;
    };
  };
}

const ProdutoCard = ({ produto }: ProdutoProps) => {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "available":
      case "disponivel":
        return { color: "bg-green-500", label: "Disponível", icon: CheckCircle2 };
      case "rented":
      case "alugado":
        return { color: "bg-amber-500", label: "Alugado", icon: AlertCircle };
      case "maintenance":
      case "manutencao":
        return { color: "bg-red-500", label: "Manutenção", icon: AlertCircle };
      case "sold":
      case "vendido":
        return { color: "bg-slate-700", label: "Vendido", icon: Tag };
      default:
        return { color: "bg-slate-500", label: "Indisponível", icon: AlertCircle };
    }
  };

  const statusInfo = getStatusInfo(produto.status);
  const Icon = statusInfo.icon;

  // Pricing Logic
  const isForRent = produto.commercial?.isForRent ?? true; // Default to true if missing (legacy)
  const isForSale = produto.commercial?.isForSale ?? false;

  const dailyRate = produto.commercial?.dailyRate ?? produto.preco_diario ?? 0;
  const precoMensal = produto.commercial?.monthlyRate ?? produto.preco_mensal ?? null;
  const salePrice = produto.commercial?.salePrice ?? 0;

  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300 border-slate-200 bg-white group relative">
      <div className="relative h-48 bg-slate-100 overflow-hidden">
        {produto.imagem ? (
          <img
            src={produto.imagem}
            alt={produto.nome}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <span className="text-sm">Sem imagem</span>
          </div>
        )}

        <div className="absolute top-2 right-2 flex gap-1">
          {/* Sale Badge */}
          {isForSale && (
            <Badge className="bg-blue-600 text-white border-none shadow-sm">
              <Tag className="w-3 h-3 mr-1" />
              Venda
            </Badge>
          )}
          {/* Status Badge */}
          <Badge className={`${statusInfo.color} text-white border-none shadow-sm`}>
            <Icon className="w-3 h-3 mr-1" />
            {statusInfo.label}
          </Badge>
        </div>
      </div>

      <CardContent className="flex-1 p-4 space-y-2">
        <h3 className="font-bold text-lg text-slate-900 line-clamp-1" title={produto.nome}>
          {produto.nome}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2 min-h-[2.5rem]">
          {produto.descricao}
        </p>

        {produto.especificacoes && produto.especificacoes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {produto.especificacoes.slice(0, 2).map((spec, i) => (
              <span key={i} className="text-[10px] px-2 py-1 bg-slate-100 rounded text-slate-600 font-medium">
                {spec}
              </span>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between border-t border-slate-100 mt-auto bg-slate-50/50">
        <div className="flex flex-col mt-3">
          {/* Hybrid Pricing Display */}
          {isForSale && (
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 font-medium">Venda</span>
              <span className="text-lg font-bold text-blue-600">
                R$ {salePrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          {isForRent && !isForSale && (
            <div className="flex flex-col">
              {precoMensal ? (
                <>
                  <span className="text-xs text-slate-500 font-medium">Mensal a partir de</span>
                  <span className="text-lg font-bold text-primary">
                    R$ {precoMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-xs text-slate-500 font-medium">Diária a partir de</span>
                  <span className="text-lg font-bold text-primary">
                    R$ {dailyRate.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        <Link to={`/produto/${produto.id}`} className="mt-3">
          <Button size="sm" className="shadow-sm hover:shadow-md transition-shadow">
            Ver Detalhes
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ProdutoCard;