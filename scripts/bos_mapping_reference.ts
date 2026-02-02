// Mapeamento correto de rental_equipments do BOS
// Colar isso dentro do queryFn de useQuery(['produtos'])

const produtosFormatados: Produto[] = querySnapshot.docs.map(doc => {
    const data = doc.data();

    // BOS: accessories array com [{name, imageUrl, id}]
    const accessories = data.accessories || [];
    const firstAccessory = accessories[0] || {};

    // NOME: usar tags[0] (ex: "UTS 500 - UNIVERSAL")
    let nome = "Equipamento";
    if (data.tags && data.tags.length > 0) {
        nome = data.tags[0];
    } else if (firstAccessory.name) {
        nome = firstAccessory.name;
    }

    // PREÇO: campo 'rentPrice' na raiz do documento
    const dailyRate = data.rentPrice || 0;

    // Status: assumir available se não tiver ou for active
    let status = 'available';
    if (data.status && data.status !== 'active') {
        status = data.status;
    }

    return {
        id: doc.id,
        nome: nome,
        descricao: data.description || data.notes || "",
        imagem: firstAccessory.imageUrl || null,
        preco_diario: dailyRate,
        preco_mensal: data.monthlyRate || null,
        status: status,
        especificacoes: data.specifications || [],
        created_at: data.createdAt?.toString() || new Date().toISOString(),
        category: data.category || '',
        updated_at: new Date().toISOString()
    };
});
