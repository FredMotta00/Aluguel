// New Unified Inventory Schema
export interface Categoria {
  id: string;
  nome: string;
  slug: string;
}

export interface CommercialData {
  isForRent: boolean;
  isForSale: boolean;
  dailyRate: number | null;
  salePrice: number | null;
  monthlyRate: number | null;
  cashbackRate: number; // e.g., 0.05 for 5%
}

export interface TechnicalData {
  model: string;
  weight?: string;
  specs: Record<string, any>; // Flexible JSON for specs (kv pairs)
  calibrationValidUntil?: string; // ISO Date
  manufacturer?: string;
}

export type ItemStatus = 'available' | 'rented' | 'maintenance' | 'sold';

export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  imagem: string | null;
  status: ItemStatus;

  // New Nested Fields
  sku?: string;
  type: 'equipment' | 'accessory';
  commercial: CommercialData;
  technical: TechnicalData;
  category?: string; // Slug or ID of the category

  // Legacy compatibility (calculated or mapped)
  preco_diario?: number; // legacy: mapped from commercial.dailyRate
  especificacoes?: string[]; // legacy: mapped from technical.specs

  created_at: string;
  updated_at: string;
}

export interface Reserva {
  id: string;
  produto_id: string;
  company_id: string | null;
  cliente_nome: string;
  cliente_email: string;
  cliente_telefone: string | null;
  data_inicio: string;
  data_fim: string;
  valor_total: number;
  cashback_amount: number;
  wallet_discount: number;
  observacoes: string | null;
  status: 'pendente' | 'confirmada' | 'finalizada' | 'cancelada';
  created_at: string;
  updated_at: string;
}

export interface ReservaWithProduto extends Reserva {
  produtos: Produto;
}

export type CompanyTier = 'silver' | 'gold' | 'platinum';

export interface Company {
  id: string;
  nome: string;
  cnpj: string | null;
  email: string;
  telefone: string | null;
  endereco: string | null;
  wallet_balance: number;
  pending_balance: number;
  loyalty_points: number;
  tier: CompanyTier;
  total_locacoes_ano: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export type WalletTransactionType = 'earn' | 'burn' | 'adjustment';
export type WalletTransactionStatus = 'pending' | 'available' | 'used' | 'cancelled';

export interface WalletTransaction {
  id: string;
  company_id: string;
  reserva_id: string | null;
  type: WalletTransactionType;
  status: WalletTransactionStatus;
  amount: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// Tier configuration
export const TIER_CONFIG = {
  silver: {
    name: 'Silver',
    minAmount: 0,
    cashbackPercentage: 0.02, // 2%
    color: 'bg-gray-400',
    textColor: 'text-gray-600',
    icon: '🥈'
  },
  gold: {
    name: 'Gold',
    minAmount: 50000,
    cashbackPercentage: 0.03, // 3%
    color: 'bg-yellow-400',
    textColor: 'text-yellow-600',
    icon: '🥇'
  },
  platinum: {
    name: 'Platinum',
    minAmount: 150000,
    cashbackPercentage: 0.05, // 5%
    color: 'bg-purple-400',
    textColor: 'text-purple-600',
    icon: '💎'
  }
} as const;
