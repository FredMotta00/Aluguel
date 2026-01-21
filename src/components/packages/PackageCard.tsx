import { Check, Package as PackageIcon } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface PackageProduct {
    productId: string;
    productName: string;
    quantity: number;
}

interface PackageCardProps {
    id: string;
    name: string;
    description: string;
    products: PackageProduct[];
    pricing: {
        individualTotal: number;
        packagePrice: number;
        discount: number;
        savings: number;
    };
    image: string;
    rentalType: 'daily' | 'monthly' | 'both';
}

export default function PackageCard({ id, name, description, products, pricing, image, rentalType }: PackageCardProps) {
    return (
        <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-primary/20 rounded-none">
            <div className="relative h-48 bg-slate-100">
                {image ? (
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                        <PackageIcon className="w-16 h-16 text-primary/30" />
                    </div>
                )}

                {/* Discount Badge */}
                {pricing.discount > 0 && (
                    <div className="absolute top-3 right-3">
                        <Badge className="bg-destructive text-destructive-foreground font-black text-sm px-3 py-1 rounded-none shadow-lg">
                            {pricing.discount}% OFF
                        </Badge>
                    </div>
                )}

                {/* Package Badge */}
                <div className="absolute top-3 left-3">
                    <Badge className="bg-primary/90 text-black font-black text-xs px-2 py-1 rounded-none shadow-lg">
                        PACOTE
                    </Badge>
                </div>
            </div>

            <CardContent className="p-4 space-y-3">
                <div>
                    <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                        {name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {description}
                    </p>
                </div>

                {/* Included Products */}
                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                        Produtos Inclusos:
                    </p>
                    <ul className="space-y-1">
                        {products.slice(0, 3).map((product, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs">
                                <div className="mt-0.5 p-0.5 rounded-full bg-primary/10">
                                    <Check className="w-3 h-3 text-primary" />
                                </div>
                                <span className="flex-1">
                                    {product.productName} {product.quantity > 1 && `x${product.quantity}`}
                                </span>
                            </li>
                        ))}
                        {products.length > 3 && (
                            <li className="text-xs text-muted-foreground italic ml-5">
                                +{products.length - 3} outro(s)
                            </li>
                        )}
                    </ul>
                </div>

                {/* Pricing Comparison */}
                <div className="pt-3 border-t border-border/50 space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Preço Individual:</span>
                        <span className="text-sm line-through text-muted-foreground">
                            R$ {pricing.individualTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold">Preço do Pacote:</span>
                        <span className="text-2xl font-black text-primary">
                            R$ {pricing.packagePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    {pricing.savings > 0 && (
                        <div className="bg-green-500/10 border border-green-500/20 p-2 rounded text-center">
                            <p className="text-xs font-bold text-green-600">
                                Economize R$ {pricing.savings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
                <Link to={`/pacote/${id}`} className="w-full">
                    <Button className="w-full gap-2 rounded-none font-bold shadow-md hover:shadow-xl transition-all">
                        <PackageIcon className="w-4 h-4" />
                        Ver Detalhes do Pacote
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
