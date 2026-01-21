import { useQuery } from '@tanstack/react-query';
import { db } from '@/integrations/firebase/client';
import { collection, getDocs, query, where } from 'firebase/firestore';
import PackageCard from '@/components/packages/PackageCard';
import { Button } from '@/components/ui/button';
import { Loader2, Package as PackageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Pacotes() {
    const { data: packages, isLoading } = useQuery({
        queryKey: ['public-packages'],
        queryFn: async () => {
            const q = query(
                collection(db, 'packages'),
                where('status', '==', 'active')
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        }
    });

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <PackageIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900">Pacotes e Combos</h1>
                    </div>
                    <p className="text-slate-500 max-w-2xl">
                        Economize alugando combinações especiais de equipamentos.
                        Pacotes criados para oferecer melhor custo-benefício em seus projetos.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : packages && packages.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {packages.map((pkg: any) => (
                            <PackageCard
                                key={pkg.id}
                                id={pkg.id}
                                name={pkg.name}
                                description={pkg.description}
                                products={pkg.products || []}
                                pricing={pkg.pricing}
                                image={pkg.image}
                                rentalType={pkg.rentalType}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
                        <PackageIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Nenhum pacote disponível</h3>
                        <p className="text-slate-500 max-w-md mx-auto mb-6">
                            No momento não temos pacotes cadastrados. Confira nosso catálogo de locação individual.
                        </p>
                        <Link to="/">
                            <Button>Ver Catálogo Completo</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
