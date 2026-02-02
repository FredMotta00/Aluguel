import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
    Plus,
    Pencil,
    Trash2,
    Loader2,
    Package as PackageIcon,
    Search,
    Upload,
    CheckCircle,
    Image as ImageIcon,
    X
} from 'lucide-react';

interface PackageItem {
    id: string;                    // UUID único para o item
    type: 'product' | 'custom';    // Tipo do item

    // Para produtos (type = 'product')
    productId?: string;            // ID do produto no Firestore
    productName?: string;          // Nome do produto
    productPrice?: number;         // Preço do produto (cached)

    // Para itens customizados (type = 'custom')
    customName?: string;           // Nome customizado
    customPrice?: number;          // Preço customizado

    // Comum a ambos
    quantity: number;              // Quantidade
    subtotal: number;              // Preço × Quantidade
}

// Legacy support for old packages
interface PackageProduct {
    productId: string;
    productName: string;
    quantity: number;
}

interface Package {
    id: string;
    name: string;
    description: string;
    items?: PackageItem[];          // New format
    products?: PackageProduct[];    // Legacy support
    pricing: {
        individualTotal: number;
        packagePrice: number;
        discount: number;
        savings: number;
    };
    image: string;
    status: 'active' | 'inactive';
    rentalType: 'daily' | 'monthly' | 'both';
    createdAt?: string;
    updatedAt?: string;
}

interface PackageForm {
    name: string;
    description: string;
    items: PackageItem[];           // Changed from products to items
    individualTotal: string;
    packagePrice: string;
    discount: string;
    imageUrl: string;
    status: 'active' | 'inactive';
    rentalType: 'daily' | 'monthly' | 'both';
}

const initialForm: PackageForm = {
    name: '',
    description: '',
    items: [],              // Changed from products to items
    individualTotal: '0',
    packagePrice: '0',
    discount: '0',
    imageUrl: '',
    status: 'active',
    rentalType: 'daily'
};

export default function AdminPacotes() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<PackageForm>(initialForm);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string }>({ open: false, id: '' });
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');

    // Product selection states
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [productQuantity, setProductQuantity] = useState<number>(1);

    // Custom item states
    const [itemType, setItemType] = useState<'product' | 'custom'>('product');
    const [customItemName, setCustomItemName] = useState<string>('');
    const [customItemPrice, setCustomItemPrice] = useState<string>('');
    const [customItemQuantity, setCustomItemQuantity] = useState<number>(1);

    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch all products for selection
    const { data: availableProducts = [] } = useQuery({
        queryKey: ['admin-products-for-packages'],
        queryFn: async () => {
            const querySnapshot = await getDocs(collection(db, 'rental_equipments'));
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.nome || data.name,
                    preco_diario: data.commercial?.dailyRate || data.preco_diario || 0
                };
            });
        }
    });

    const { data: packages, isLoading } = useQuery<Package[]>({
        queryKey: ['admin-packages'],
        queryFn: async () => {
            const querySnapshot = await getDocs(collection(db, 'packages'));
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Package));
        }
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddItem = () => {
        let newItem: PackageItem | null = null;

        if (itemType === 'product') {
            // Adding a product from catalog
            if (!selectedProductId) {
                toast({ title: 'Erro', description: 'Selecione um produto', variant: 'destructive' });
                return;
            }

            const product = availableProducts.find(p => p.id === selectedProductId);
            if (!product) return;

            // Check if product already added
            if (form.items.some(item => item.type === 'product' && item.productId === selectedProductId)) {
                toast({
                    title: 'Produto já adicionado',
                    description: 'Este produto já está no pacote',
                    variant: 'destructive'
                });
                return;
            }

            const price = product.preco_diario || 0;
            newItem = {
                id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: 'product',
                productId: product.id,
                productName: product.name,
                productPrice: price,
                quantity: productQuantity,
                subtotal: price * productQuantity
            };

        } else {
            // Adding a custom item
            if (!customItemName.trim()) {
                toast({ title: 'Erro', description: 'Digite o nome do item', variant: 'destructive' });
                return;
            }
            if (!customItemPrice || parseFloat(customItemPrice) <= 0) {
                toast({ title: 'Erro', description: 'Digite um preço válido', variant: 'destructive' });
                return;
            }

            const price = parseFloat(customItemPrice);
            newItem = {
                id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: 'custom',
                customName: customItemName,
                customPrice: price,
                quantity: customItemQuantity,
                subtotal: price * customItemQuantity
            };
        }

        const newItems = [...form.items, newItem];

        // Recalculate individual total
        const individualTotal = newItems.reduce((sum, item) => sum + item.subtotal, 0);

        setForm(prev => ({
            ...prev,
            items: newItems,
            individualTotal: individualTotal.toString()
        }));

        // Reset form
        setSelectedProductId('');
        setProductQuantity(1);
        setCustomItemName('');
        setCustomItemPrice('');
        setCustomItemQuantity(1);
    };

    const handleRemoveItem = (itemId: string) => {
        const newItems = form.items.filter(item => item.id !== itemId);

        const individualTotal = newItems.reduce((sum, item) => sum + item.subtotal, 0);

        setForm(prev => ({
            ...prev,
            items: newItems,
            individualTotal: individualTotal.toString()
        }));
    };

    const calculateDiscount = () => {
        const individual = parseFloat(form.individualTotal) || 0;
        const packagePrice = parseFloat(form.packagePrice) || 0;
        if (individual === 0) return 0;
        return Math.round(((individual - packagePrice) / individual) * 100);
    };

    const saveMutation = useMutation({
        mutationFn: async (data: PackageForm) => {
            let finalImageUrl = data.imageUrl;
            if (selectedImage) {
                const storageRef = ref(storage, `packages/${Date.now()}_${selectedImage.name}`);
                const snapshot = await uploadBytes(storageRef, selectedImage);
                finalImageUrl = await getDownloadURL(snapshot.ref);
            }

            const discount = calculateDiscount();
            const savings = parseFloat(data.individualTotal) - parseFloat(data.packagePrice);

            const payload: any = {
                name: data.name,
                description: data.description,
                items: data.items,
                pricing: {
                    individualTotal: parseFloat(data.individualTotal),
                    packagePrice: parseFloat(data.packagePrice),
                    discount: discount,
                    savings: savings
                },
                image: finalImageUrl,
                status: data.status,
                rentalType: data.rentalType,
                updatedAt: new Date().toISOString()
            };

            if (editingId) {
                const docRef = doc(db, 'packages', editingId);
                await updateDoc(docRef, payload);
            } else {
                payload.createdAt = new Date().toISOString();
                await addDoc(collection(db, 'packages'), payload);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-packages'] });
            toast({
                title: 'Sucesso',
                description: editingId ? 'Pacote atualizado' : 'Pacote criado',
            });
            closeDialog();
        },
        onError: (error: any) => {
            console.error(error);
            toast({
                title: 'Erro ao salvar',
                description: error.message || 'Verifique o console para mais detalhes.',
                variant: 'destructive',
            });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await deleteDoc(doc(db, 'packages', id));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-packages'] });
            toast({ title: 'Sucesso', description: 'Pacote removido' });
            setDeleteDialog({ open: false, id: '' });
        },
        onError: () => {
            toast({ title: 'Erro', description: 'Erro ao remover.', variant: 'destructive' });
        }
    });

    const openEditDialog = (pkg: any) => {
        setEditingId(pkg.id);
        setForm({
            name: pkg.name,
            description: pkg.description,
            items: pkg.items || pkg.products || [],  // Support legacy format
            individualTotal: String(pkg.pricing?.individualTotal || 0),
            packagePrice: String(pkg.pricing?.packagePrice || 0),
            discount: String(pkg.pricing?.discount || 0),
            imageUrl: pkg.image || '',
            status: pkg.status,
            rentalType: pkg.rentalType || 'daily'
        });
        setImagePreview(pkg.image || '');
        setIsDialogOpen(true);
    };

    const openNewDialog = () => {
        setEditingId(null);
        setForm(initialForm);
        setSelectedImage(null);
        setImagePreview('');
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingId(null);
        setForm(initialForm);
        setSelectedImage(null);
        setImagePreview('');
        setSelectedProductId('');
        setProductQuantity(1);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name) {
            toast({ title: 'Erro', description: 'O nome é obrigatório', variant: 'destructive' });
            return;
        }
        if (form.items.length === 0) {
            toast({ title: 'Erro', description: 'Adicione pelo menos 1 item', variant: 'destructive' });
            return;
        }
        if (!form.packagePrice || parseFloat(form.packagePrice) === 0) {
            toast({ title: 'Erro', description: 'Defina o preço do pacote', variant: 'destructive' });
            return;
        }
        saveMutation.mutate(form);
    };

    const getStatusBadge = (status: string) => {
        return status === 'active' ? (
            <Badge className="bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20">Ativo</Badge>
        ) : (
            <Badge className="bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 border-slate-500/20">Inativo</Badge>
        );
    };

    const filteredPackages = packages?.filter(p =>
        (p.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 p-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white glow-text">Gestão de Pacotes</h1>
                    <p className="text-slate-400">Crie combos e ofertas especiais</p>
                </div>
                <Button onClick={openNewDialog} className="gap-2 shadow-[0_0_15px_rgba(34,197,94,0.3)] bg-primary hover:bg-primary/90 text-black font-semibold border-none">
                    <Plus className="h-4 w-4" />
                    Novo Pacote
                </Button>
            </div>

            <Card className="border-white/5 bg-[#0f1729]/60 backdrop-blur-md shadow-xl rounded-none">
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Buscar pacotes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 bg-slate-950/50 border-white/10 text-white placeholder:text-slate-500 focus:border-primary/50 focus:ring-primary/20"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-white/5 bg-[#0f1729]/60 backdrop-blur-md shadow-xl overflow-hidden rounded-none">
                <CardHeader className="bg-white/5 border-b border-white/5 py-4 rounded-none">
                    <CardTitle className="text-lg text-white">Pacotes Cadastrados</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : filteredPackages && filteredPackages.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-white/5">
                                        <TableHead className="text-slate-400">Pacote</TableHead>
                                        <TableHead className="text-slate-400">Produtos</TableHead>
                                        <TableHead className="text-slate-400">Preço</TableHead>
                                        <TableHead className="text-slate-400">Economia</TableHead>
                                        <TableHead className="text-slate-400">Status</TableHead>
                                        <TableHead className="text-right text-slate-400">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPackages.map((pkg: any) => (
                                        <TableRow key={pkg.id} className="hover:bg-white/5 border-white/5 transition-colors">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    {pkg.image ? (
                                                        <img
                                                            src={pkg.image}
                                                            alt={pkg.name}
                                                            className="h-12 w-12 rounded-none object-cover border border-white/10 bg-slate-950"
                                                        />
                                                    ) : (
                                                        <div className="h-12 w-12 rounded-none bg-slate-900 flex items-center justify-center border border-white/10">
                                                            <PackageIcon className="h-6 w-6 text-slate-600" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-semibold text-white">{pkg.name}</p>
                                                        <p className="text-xs text-slate-400 line-clamp-1 max-w-[200px]">
                                                            {pkg.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-slate-200">{pkg.products?.length || 0} itens</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium text-slate-200">
                                                    R$ {Number(pkg.pricing?.packagePrice || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                                                    {pkg.pricing?.discount || 0}% OFF
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(pkg.status)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10"
                                                        onClick={() => openEditDialog(pkg)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                                                        onClick={() => setDeleteDialog({ open: true, id: pkg.id })}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-16 text-slate-500">
                            <PackageIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p>Nenhum pacote encontrado</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingId ? 'Editar Pacote' : 'Novo Pacote'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome do Pacote *</Label>
                                <Input
                                    id="name"
                                    value={form.name}
                                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Ex: Combo UTS 500 + UTS 600"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={form.status}
                                    onValueChange={(v: any) => setForm(prev => ({ ...prev, status: v }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Ativo</SelectItem>
                                        <SelectItem value="inactive">Inativo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea
                                id="description"
                                value={form.description}
                                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Descrição do pacote"
                                rows={3}
                            />
                        </div>

                        {/* Product Selection */}
                        <div className="space-y-2 border border-white/10 p-4 rounded-none bg-white/5">
                            <h4 className="text-sm font-semibold text-white mb-3">Items do Pacote</h4>

                            {/* Item Type Toggle */}
                            <div className="flex gap-2 mb-4">
                                <Button
                                    type="button"
                                    variant={itemType === 'product' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setItemType('product')}
                                    className="flex-1"
                                >
                                    📦 Produto
                                </Button>
                                <Button
                                    type="button"
                                    variant={itemType === 'custom' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setItemType('custom')}
                                    className="flex-1"
                                >
                                    ⚙️ Item Customizado
                                </Button>
                            </div>

                            {/* Custom Item Form */}
                            {itemType === 'custom' && (
                                <div className="space-y-3 mb-4">
                                    <Input
                                        placeholder="Nome do item (ex: Cabo USB, Treinamento)"
                                        value={customItemName}
                                        onChange={(e) => setCustomItemName(e.target.value)}
                                    />
                                    <div className="grid grid-cols-3 gap-2">
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="Preço (R$)"
                                            value={customItemPrice}
                                            onChange={(e) => setCustomItemPrice(e.target.value)}
                                            className="col-span-2"
                                        />
                                        <div className="flex gap-2">
                                            <Input
                                                type="number"
                                                min="1"
                                                value={customItemQuantity}
                                                onChange={(e) => setCustomItemQuantity(parseInt(e.target.value) || 1)}
                                                placeholder="Qtd"
                                                className="w-20"
                                            />
                                            <Button type="button" onClick={handleAddItem} size="sm">
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Product Selection Form */}
                            {itemType === 'product' && (
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                                        <SelectTrigger className="col-span-2">
                                            <SelectValue placeholder="Selecione um produto" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableProducts.map((prod: any) => (
                                                <SelectItem key={prod.id} value={prod.id}>
                                                    {prod.name} - R$ {prod.preco_diario}/dia
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            min="1"
                                            value={productQuantity}
                                            onChange={(e) => setProductQuantity(parseInt(e.target.value) || 1)}
                                            placeholder="Qtd"
                                            className="w-20"
                                        />
                                        <Button type="button" onClick={handleAddItem} size="sm">
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Selected Products List */}
                            {form.items.length > 0 ? (
                                <div className="space-y-2">
                                    {form.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-slate-900/50 p-2 rounded">
                                            <div className="flex items-center gap-2">
                                                {item.type === 'product' ? (
                                                    <span className="text-xs">📦</span>
                                                ) : (
                                                    <span className="text-xs">⚙️</span>
                                                )}
                                                <span className="text-sm text-white">
                                                    {item.type === 'product' ? item.productName : item.customName} x {item.quantity}
                                                </span>
                                            </div>
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="ghost"
                                                className="h-6 w-6"
                                                onClick={() => handleRemoveItem(item.id)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 italic">Nenhum produto adicionado</p>
                            )}
                        </div>

                        {/* Pricing */}
                        <div className="grid grid-cols-3 gap-4 border border-white/10 p-4 rounded-none bg-white/5">
                            <div className="space-y-2">
                                <Label>Total Individual</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={form.individualTotal}
                                    disabled
                                    className="bg-slate-800/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Preço do Pacote *</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={form.packagePrice}
                                    onChange={(e) => setForm(prev => ({ ...prev, packagePrice: e.target.value }))}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Desconto (%)</Label>
                                <Input
                                    type="number"
                                    value={calculateDiscount()}
                                    disabled
                                    className="bg-slate-800/50 font-bold text-green-400"
                                />
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-2">
                            <Label>Imagem do Pacote</Label>
                            <div className="border-2 border-dashed border-slate-200 rounded-none p-4 hover:bg-slate-50 transition-colors text-center relative cursor-pointer">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {imagePreview ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="h-20 w-auto rounded-none border shadow-sm"
                                        />
                                        <div className="text-green-600 font-medium text-xs flex items-center">
                                            <CheckCircle className="w-3 h-3 mr-1" /> Imagem selecionada
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-slate-500 flex flex-col items-center">
                                        <ImageIcon className="w-6 h-6 mb-1 text-slate-400" />
                                        <span className="text-sm">Clique para selecionar foto</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={closeDialog}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={saveMutation.isPending}>
                                {saveMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Salvando...
                                    </>
                                ) : editingId ? (
                                    'Salvar Alterações'
                                ) : (
                                    'Criar Pacote'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remover Pacote</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja remover este pacote?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteMutation.mutate(deleteDialog.id)}
                            disabled={deleteMutation.isPending}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {deleteMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                'Remover'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
