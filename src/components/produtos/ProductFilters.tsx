import { useState, useEffect, useMemo } from 'react';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Filter, X } from 'lucide-react';
import { Produto } from '@/pages/Home'; // reusing interface

interface ProductFiltersProps {
    products: Produto[];
    categories?: any[];
    onFilterChange: (filteredProducts: Produto[]) => void;
    className?: string;
}

export const ProductFilters = ({ products, categories = [], onFilterChange, className }: ProductFiltersProps) => {
    // State for filters
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
    const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string[]>>({});
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    // 1. Extract dynamic specs from products
    const { availableSpecs, minMaxPrice } = useMemo(() => {
        const specs: Record<string, Set<string>> = {};
        let minP = Infinity;
        let maxP = -Infinity;

        products.forEach(p => {
            // Price
            if (p.preco_diario < minP) minP = p.preco_diario;
            if (p.preco_diario > maxP) maxP = p.preco_diario;

            // Specs
            if (p.especificacoes) {
                p.especificacoes.forEach(spec => {
                    const [key, val] = spec.split(':').map(s => s.trim());
                    if (key && val) {
                        if (!specs[key]) specs[key] = new Set();
                        specs[key].add(val);
                    }
                });
            }
        });

        if (minP === Infinity) minP = 0;
        if (maxP === -Infinity) maxP = 1000;

        return {
            availableSpecs: Object.entries(specs).map(([key, values]) => ({
                key,
                values: Array.from(values).sort()
            })).sort((a, b) => a.key.localeCompare(b.key)), // Sort keys alphabetically
            minMaxPrice: [minP, maxP] as [number, number]
        };
    }, [products]);

    // Initial Price Set
    useEffect(() => {
        setPriceRange([minMaxPrice[0], minMaxPrice[1]]);
    }, [minMaxPrice]);

    // 2. Apply Filters Logic
    useEffect(() => {
        const filtered = products.filter(p => {
            // Price Check
            if (p.preco_diario < priceRange[0] || p.preco_diario > priceRange[1]) return false;

            // Category Check
            if (selectedCategories.length > 0) {
                if (!p.category || !selectedCategories.includes(p.category)) return false;
            }

            // Spec Check
            // Logic: For each selected spec category (e.g. "Model"), 
            // the product MUST have one of the selected values IF any are selected for that category.
            for (const [key, selectedValues] of Object.entries(selectedSpecs)) {
                if (selectedValues.length === 0) continue;

                // Find product spec value for this key
                const productSpecStr = p.especificacoes?.find(s => s.startsWith(key + ':'));
                if (!productSpecStr) return false; // Product doesn't have this spec at all

                const productValue = productSpecStr.split(':')[1]?.trim();
                if (!selectedValues.includes(productValue)) return false;
            }

            return true;
        });

        onFilterChange(filtered);
    }, [priceRange, selectedSpecs, selectedCategories, products, onFilterChange]);


    const handleSpecToggle = (key: string, value: string) => {
        setSelectedSpecs(prev => {
            const current = prev[key] || [];
            if (current.includes(value)) {
                return { ...prev, [key]: current.filter(v => v !== value) };
            } else {
                return { ...prev, [key]: [...current, value] };
            }
        });
    };

    const handleCategoryToggle = (slug: string) => {
        setSelectedCategories(prev =>
            prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
        );
    };

    const clearFilters = () => {
        setPriceRange([minMaxPrice[0], minMaxPrice[1]]);
        setSelectedSpecs({});
        setSelectedCategories([]);
    };

    return (
        <div className={`space-y-6 ${className}`}>
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filtros
                </h3>
                {(Object.keys(selectedSpecs).some(k => selectedSpecs[k].length > 0) ||
                    selectedCategories.length > 0 ||
                    priceRange[0] !== minMaxPrice[0] || priceRange[1] !== minMaxPrice[1]) && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-muted-foreground">
                            Limpar <X className="w-4 h-4 ml-1" />
                        </Button>
                    )}
            </div>

            {/* Price Filter */}
            <div className="space-y-4">
                <Label>Preço Diário (R$)</Label>
                <Slider
                    defaultValue={[minMaxPrice[0], minMaxPrice[1]]}
                    max={minMaxPrice[1]}
                    min={minMaxPrice[0]}
                    step={50}
                    value={priceRange}
                    onValueChange={(val: any) => setPriceRange(val as [number, number])}
                    className="my-4"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                    <span>R$ {priceRange[0]}</span>
                    <span>R$ {priceRange[1]}</span>
                </div>
            </div>

            {/* Dynamic Specs Filter */}
            <Accordion type="multiple" defaultValue={["categories"]} className="w-full">
                {categories && categories.length > 0 && (
                    <AccordionItem value="categories">
                        <AccordionTrigger className="text-sm font-medium uppercase tracking-wider text-primary">Categorias</AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-2 pt-1">
                                {categories.map(cat => (
                                    <div key={cat.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`cat-${cat.slug}`}
                                            checked={selectedCategories.includes(cat.slug)}
                                            onCheckedChange={() => handleCategoryToggle(cat.slug)}
                                        />
                                        <Label htmlFor={`cat-${cat.slug}`} className="text-sm font-normal cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                                            {cat.nome}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                )}

                {availableSpecs.map((spec) => (
                    <AccordionItem key={spec.key} value={spec.key}>
                        <AccordionTrigger className="text-sm font-medium">{spec.key}</AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-2 pt-1">
                                {spec.values.map(val => (
                                    <div key={val} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`${spec.key}-${val}`}
                                            checked={selectedSpecs[spec.key]?.includes(val) || false}
                                            onCheckedChange={() => handleSpecToggle(spec.key, val)}
                                        />
                                        <Label htmlFor={`${spec.key}-${val}`} className="text-sm font-normal cursor-pointer text-muted-foreground">
                                            {val}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
};
