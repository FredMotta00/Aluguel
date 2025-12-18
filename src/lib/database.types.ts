export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  especificacoes: string[];
  preco_diario: number;
  imagem: string | null;
  status: 'disponivel' | 'alugado' | 'manutencao';
  created_at: string;
  updated_at: string;
}

export interface Reserva {
  id: string;
  produto_id: string;
  cliente_nome: string;
  cliente_email: string;
  cliente_telefone: string | null;
  data_inicio: string;
  data_fim: string;
  valor_total: number;
  observacoes: string | null;
  status: 'pendente' | 'confirmada' | 'finalizada' | 'cancelada';
  created_at: string;
  updated_at: string;
}

export interface ReservaWithProduto extends Reserva {
  produtos: Produto;
}