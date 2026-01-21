import { Wallet, Award, PiggyBank } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OverviewCardsProps {
    balance: number;
    loyaltyTier: string;
    totalSavings: number;
}

export const OverviewCards = ({ balance, loyaltyTier, totalSavings }: OverviewCardsProps) => {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                        }).format(balance)}
                    </div>
                    <p className="text-xs text-muted-foreground">Disponível para uso</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Nível de Fidelidade</CardTitle>
                    <Award className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-primary">{loyaltyTier}</div>
                    <p className="text-xs text-muted-foreground">Aproveite benefícios exclusivos</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Economia Acumulada</CardTitle>
                    <PiggyBank className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                        {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                        }).format(totalSavings)}
                    </div>
                    <p className="text-xs text-muted-foreground">Total economizado com a EXS</p>
                </CardContent>
            </Card>
        </div>
    );
};
