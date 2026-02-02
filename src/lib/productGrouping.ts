/**
 * Helper para agrupar produtos duplicados (múltiplas unidades físicas do mesmo modelo)
 * Consulta o Firestore para contar quantas unidades de cada produto existem
 */

export interface GroupedProduct {
    id: string; // ID do primeiro produto do grupo (para navegação)
    nome: string;
    descricao: string;
    imagem: string | null;
    preco_diario: number;
    preco_mensal?: number | null;
    status: string;
    especificacoes?: string[];
    category?: string;
    created_at?: string;
    updated_at?: string;

    // Dados comerciais (para compatibilidade com ProdutoCard)
    commercial?: {
        isForRent: boolean;
        isForSale: boolean;
        dailyRate: number | null;
        salePrice: number | null;
        monthlyRate: number | null;
    };

    // Informações de agrupamento
    totalUnits: number; // Total de unidades deste modelo
    availableUnits: number; // Unidades disponíveis agora
    unitIds: string[]; // IDs de todas as unidades físicas
    availableUnitIds: string[]; // IDs das unidades disponíveis
}

export interface RawProduct {
    id: string;
    nome: string;
    descricao: string;
    imagem: string | null;
    preco_diario: number;
    preco_mensal?: number | null;
    status: string;
    especificacoes?: string[];
    category?: string;
    created_at?: string;
    updated_at?: string;
}

/**
 * Agrupa produtos por nome (modelo)
 * Produtos com o mesmo nome são considerados unidades do mesmo equipamento
 * 
 * @example
 * Input: [
 *   { id: '1', nome: 'UTS 500', status: 'available' },
 *   { id: '2', nome: 'UTS 500', status: 'available' },
 *   { id: '3', nome: 'UTS 500', status: 'unavailable' },
 *   { id: '4', nome: 'Outro', status: 'available' }
 * ]
 * 
 * Output: [
 *   { 
 *     id: '1', 
 *     nome: 'UTS 500', 
 *     totalUnits: 3, 
 *     availableUnits: 2,
 *     unitIds: ['1', '2', '3'],
 *     availableUnitIds: ['1', '2']
 *   },
 *   { 
 *     id: '4', 
 *     nome: 'Outro', 
 *     totalUnits: 1, 
 *     availableUnits: 1,
 *     unitIds: ['4'],
 *     availableUnitIds: ['4']
 *   }
 * ]
 */
export function groupProductsByName(products: RawProduct[]): GroupedProduct[] {
    if (!products || products.length === 0) {
        return [];
    }

    // Agrupar por nome (case-insensitive, trim)
    const groups = new Map<string, RawProduct[]>();

    products.forEach(product => {
        // Normalizar nome: lowercase e trim
        const normalizedName = product.nome.toLowerCase().trim();

        if (!groups.has(normalizedName)) {
            groups.set(normalizedName, []);
        }
        groups.get(normalizedName)!.push(product);
    });

    // Transformar cada grupo em 1 GroupedProduct
    const groupedProducts: GroupedProduct[] = Array.from(groups.values()).map(units => {
        // Usar dados do primeiro produto como base
        const firstUnit = units[0];

        // Filtrar unidades disponíveis
        const availableUnits = units.filter(unit =>
            unit.status === 'available' ||
            unit.status === 'disponivel' ||
            unit.status === 'AVAILABLE'
        );

        // Determinar status geral do grupo
        let groupStatus: string;
        if (availableUnits.length === 0) {
            groupStatus = 'unavailable'; // Todas indisponíveis
        } else if (availableUnits.length === units.length) {
            groupStatus = 'available'; // Todas disponíveis
        } else {
            groupStatus = 'partial'; // Algumas disponíveis
        }

        return {
            // Dados base (do primeiro produto)
            id: firstUnit.id,
            nome: firstUnit.nome, // Nome original (com capitalização correta)
            descricao: firstUnit.descricao,
            imagem: firstUnit.imagem,
            preco_diario: firstUnit.preco_diario,
            preco_mensal: firstUnit.preco_mensal,
            especificacoes: firstUnit.especificacoes,
            category: firstUnit.category,
            created_at: firstUnit.created_at,
            updated_at: firstUnit.updated_at,

            // Status do grupo
            status: groupStatus,

            // Campo commercial não existe em RawProduct, mas incluímos para compatibilidade
            commercial: undefined,

            // Informações de agrupamento
            totalUnits: units.length,
            availableUnits: availableUnits.length,
            unitIds: units.map(u => u.id),
            availableUnitIds: availableUnits.map(u => u.id)
        };
    });

    // Ordenar por nome para consistência
    return groupedProducts.sort((a, b) =>
        a.nome.localeCompare(b.nome, 'pt-BR')
    );
}

/**
 * Verifica se um produto agrupado tem múltiplas unidades
 */
export function isGroupedProduct(product: GroupedProduct): boolean {
    return product.totalUnits > 1;
}

/**
 * Retorna label de disponibilidade amigável
 * NOTA: Não mostra quantidades específicas para clientes (apenas para sistema)
 */
export function getAvailabilityLabel(product: GroupedProduct): string {
    // Produto único
    if (product.totalUnits === 1) {
        return product.availableUnits === 1 ? 'Disponível' : 'Indisponível';
    }

    // Produtos agrupados - mostrar apenas status geral sem quantidades
    if (product.availableUnits === 0) {
        return 'Todas as unidades ocupadas';
    }

    if (product.availableUnits === product.totalUnits) {
        return 'Disponível';
    }

    // Disponibilidade parcial - criar sensação de escassez
    return 'Poucas unidades disponíveis';
}
