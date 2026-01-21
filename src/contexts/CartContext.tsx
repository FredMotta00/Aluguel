import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type CartItemType = 'rent' | 'sale';

export interface CartItem {
    id: string; // Unique ID for cart entry (e.g. productId + timestamp or just uuid)
    productId: string;
    productName: string;
    image: string | null;
    type: CartItemType;
    price: number; // Daily rate for rent, Unit price for sale

    // Rent specifics
    rentalPeriod?: {
        start: Date;
        end: Date;
        days: number;
        monthlyPlan?: boolean;
    };

    // Common
    quantity?: number;

    // Package specifics
    isPackage?: boolean;
    packageId?: string;
    packageProducts?: Array<{
        productId: string;
        productName: string;
        quantity: number;
    }>;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (itemId: string) => void;
    clearCart: () => void;
    total: number;
    itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<CartItem[]>(() => {
        const savedCart = localStorage.getItem('exs_cart');
        if (savedCart) {
            try {
                const parsed = JSON.parse(savedCart);
                return parsed.map((item: any) => ({
                    ...item,
                    rentalPeriod: item.rentalPeriod ? {
                        ...item.rentalPeriod,
                        start: new Date(item.rentalPeriod.start),
                        end: new Date(item.rentalPeriod.end)
                    } : undefined
                }));
            } catch (e) {
                console.error("Failed to parse cart from local storage", e);
                return [];
            }
        }
        return [];
    });

    // Save to LocalStorage on change
    useEffect(() => {
        localStorage.setItem('exs_cart', JSON.stringify(items));
    }, [items]);

    const addToCart = (newItem: CartItem) => {
        setItems(prev => {
            // Logic: 
            // For RENTals: usually we treat each date range as unique, so we just add.
            // For SALES: if same product, increment quantity? Or just add separate line?
            // MVP: Let's treat everything as separate line items for simplicity unless exact duplicate.
            return [...prev, newItem];
        });
    };

    const removeFromCart = (itemId: string) => {
        setItems(prev => prev.filter(item => item.id !== itemId));
    };

    const clearCart = () => {
        setItems([]);
    };

    const total = items.reduce((acc, item) => {
        const qty = item.quantity || 1;
        if (item.type === 'rent' && item.rentalPeriod) {
            if (item.rentalPeriod.monthlyPlan) {
                return acc + (item.price * qty);
            }
            return acc + (item.price * item.rentalPeriod.days * qty);
        } else if (item.type === 'sale') {
            return acc + (item.price * qty);
        }
        return acc;
    }, 0);

    const itemCount = items.length;

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, total, itemCount }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
