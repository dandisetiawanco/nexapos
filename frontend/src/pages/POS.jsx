import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
    Search,
    ShoppingCart,
    Trash2,
    Plus,
    Minus,
    CreditCard,
    Banknote,
    Wallet,
    Printer,
    ChevronRight,
    Package
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../utils/format';
import { Modal } from '../components/ui/Modal';

export default function POS() {
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState([]);
    const [discount, setDiscount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [lastTransaction, setLastTransaction] = useState(null);
    const queryClient = useQueryClient();
    const searchInputRef = useRef(null);

    // Fetch Products
    const { data: productsData } = useQuery({
        queryKey: ['products-pos', search],
        queryFn: async () => {
            const res = await api.get(`/products?search=${search}&per_page=12`);
            return res.data;
        },
    });

    const addToCart = (product) => {
        if (product.stock <= 0) {
            toast.error('Product out of stock');
            return;
        }

        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                if (existing.quantity >= product.stock) {
                    toast.error('Cannot exceed available stock');
                    return prev;
                }
                return prev.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const updateQty = (id, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = item.quantity + delta;
                if (newQty > item.stock) {
                    toast.error('Max stock reached');
                    return item;
                }
                return newQty > 0 ? { ...item, quantity: newQty } : item;
            }
            return item;
        }));
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const total = subtotal - discount;

    const checkoutMutation = useMutation({
        mutationFn: (data) => api.post('/pos/checkout', data),
        onSuccess: (res) => {
            toast.success('Transaction Completed!');
            setLastTransaction(res.data.data);
            setCart([]);
            setDiscount(0);
            setIsCheckoutModalOpen(false);
            queryClient.invalidateQueries(['products']);
            queryClient.invalidateQueries(['dashboard']);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Checkout failed');
        }
    });

    const handleCheckout = () => {
        if (cart.length === 0) {
            toast.error('Cart is empty');
            return;
        }
        setIsCheckoutModalOpen(true);
    };

    const confirmCheckout = () => {
        checkoutMutation.mutate({
            items: cart.map(item => ({
                product_id: item.id,
                quantity: item.quantity
            })),
            discount_amount: discount,
            payment_method: paymentMethod
        });
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="h-[calc(100vh-140px)] flex gap-6 overflow-hidden">
            {/* Product Selection */}
            <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                <header className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search products by name or SKU (Scan barcode)..."
                            className="w-full pl-12 pr-4 h-14 rounded-2xl bg-white dark:bg-slate-900 border-none shadow-sm focus:ring-2 focus:ring-primary-500 transition-all text-lg"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto pr-2">
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                        {productsData?.data.map((product) => (
                            <button
                                key={product.id}
                                onClick={() => addToCart(product)}
                                disabled={product.stock <= 0}
                                className="group relative bg-white dark:bg-slate-900 rounded-2xl p-4 text-left border border-slate-100 dark:border-slate-800 hover:border-primary-500 transition-all hover:shadow-xl hover:shadow-primary-500/10 disabled:opacity-50"
                            >
                                <div className="aspect-square rounded-xl bg-slate-50 dark:bg-slate-800 mb-4 overflow-hidden border dark:border-slate-700">
                                    {product.image_url ? (
                                        <img src={product.image_url} alt={product.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-slate-400">
                                            <Package className="h-10 w-10" />
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-bold text-sm line-clamp-2 mb-1">{product.name}</h3>
                                <p className="text-primary-600 font-bold">{formatCurrency(product.price)}</p>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-[10px] uppercase font-bold text-slate-400">{product.sku}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${product.stock <= 5 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                        STOK: {product.stock}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Cart Sidebar */}
            <aside className="w-[400px] flex flex-col gap-6">
                <Card className="flex-1 flex flex-col overflow-hidden border-none shadow-2xl">
                    <CardHeader className="border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5 text-primary-600" />
                                <h2 className="font-bold">Current Order</h2>
                            </div>
                            <span className="bg-primary-600 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                                {cart.reduce((a, b) => a + b.quantity, 0)} ITEMS
                            </span>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 overflow-y-auto p-0 divide-y dark:divide-slate-800">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
                                <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                    <ShoppingCart className="h-8 w-8" />
                                </div>
                                <p>Your cart is empty</p>
                                <p className="text-xs">Start adding products by clicking on them</p>
                            </div>
                        ) : (
                            cart.map((item) => (
                                <div key={item.id} className="p-4 bg-white dark:bg-slate-900 group">
                                    <div className="flex gap-3 mb-3">
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold line-clamp-1">{item.name}</h4>
                                            <p className="text-xs text-slate-500">{formatCurrency(item.price)}</p>
                                        </div>
                                        <p className="text-sm font-bold">{formatCurrency(item.price * item.quantity)}</p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                                            <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all shadow-sm">
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                                            <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all shadow-sm">
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>

                    <footer className="p-6 bg-slate-50/80 dark:bg-slate-800/80 border-t dark:border-slate-800">
                        <div className="space-y-2 mb-6 text-sm">
                            <div className="flex justify-between text-slate-500">
                                <span>Subtotal</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-500">
                                <span>Discount</span>
                                <input
                                    type="number"
                                    className="w-20 bg-transparent text-right border-b border-dashed border-slate-300 focus:outline-none focus:border-primary-500"
                                    value={discount}
                                    onChange={(e) => setDiscount(Number(e.target.value))}
                                />
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t dark:border-slate-700 pt-2 mt-2">
                                <span>Total</span>
                                <span className="text-primary-600">{formatCurrency(total)}</span>
                            </div>
                        </div>

                        <Button
                            className="w-full h-14 text-lg gap-2"
                            disabled={cart.length === 0}
                            onClick={handleCheckout}
                        >
                            Checkout <ChevronRight className="h-5 w-5" />
                        </Button>
                    </footer>
                </Card>
            </aside>

            {/* Checkout Modal */}
            <Modal
                isOpen={isCheckoutModalOpen}
                onClose={() => setIsCheckoutModalOpen(false)}
                title="Complete Checkout"
            >
                <div className="space-y-6">
                    <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-between">
                        <span className="text-primary-700 dark:text-primary-400 font-medium">Total Payable</span>
                        <span className="text-2xl font-bold text-primary-700 dark:text-primary-400">{formatCurrency(total)}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { id: 'Cash', icon: Banknote },
                            { id: 'Transfer', icon: CreditCard },
                            { id: 'E-Wallet', icon: Wallet }
                        ].map((method) => (
                            <button
                                key={method.id}
                                onClick={() => setPaymentMethod(method.id)}
                                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === method.id
                                    ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-500/20'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                                    }`}
                            >
                                <method.icon className="h-6 w-6" />
                                <span className="text-xs font-bold uppercase">{method.id}</span>
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4 pt-4 border-t dark:border-slate-800">
                        <Button
                            className="w-full h-14"
                            onClick={confirmCheckout}
                            disabled={checkoutMutation.isPending}
                        >
                            {checkoutMutation.isPending ? 'Processing...' : 'Pay Now'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Receipt View (Hidden for UI, used for printing) */}
            <div className="hidden print:block print:fixed print:inset-0 print:bg-white print:z-[9999] p-8">
                <div className="max-w-xs mx-auto text-center font-mono text-sm">
                    <h2 className="text-xl font-bold mb-1">NEXA POS</h2>
                    <p className="mb-4 text-xs text-slate-500">Jl. Digital No. 123, Tech City</p>
                    <div className="border-t border-b border-slate-200 py-2 mb-4 text-left">
                        <p>INV: {lastTransaction?.invoice_no}</p>
                        <p>DATE: {new Date().toLocaleString()}</p>
                        <p>CASHIER: {lastTransaction?.user?.name || 'Admin'}</p>
                    </div>
                    <table className="w-full text-left mb-4">
                        <thead>
                            <tr className="border-b">
                                <th className="py-1">ITEM</th>
                                <th className="py-1 text-center">QTY</th>
                                <th className="py-1 text-right">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(lastTransaction?.items || cart).map((item) => (
                                <tr key={item.id}>
                                    <td className="py-1">{item.name}</td>
                                    <td className="py-1 text-center">{item.quantity}</td>
                                    <td className="py-1 text-right">{formatCurrency(item.price * item.quantity)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="border-t pt-2 text-right">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Discount:</span>
                            <span>-{formatCurrency(discount)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg mt-1 pt-1 border-t">
                            <span>TOTAL:</span>
                            <span>{formatCurrency(total)}</span>
                        </div>
                    </div>
                    <div className="mt-8">
                        <p className="font-bold">PAYMENT: {paymentMethod}</p>
                        <p className="mt-4">Thank you for shopping!</p>
                    </div>
                </div>
            </div>

            {/* Post-Checkout Receipt View */}
            {lastTransaction && (
                <Modal
                    isOpen={!!lastTransaction}
                    onClose={() => setLastTransaction(null)}
                    title="Transaction Success"
                >
                    <div className="text-center space-y-6">
                        <div className="h-20 w-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                            <CreditCard className="h-10 w-10" />
                        </div>
                        <div>
                            <h4 className="text-2xl font-bold">{formatCurrency(lastTransaction.payable_amount)}</h4>
                            <p className="text-slate-500">Invoice: {lastTransaction.invoice_no}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button onClick={handlePrint} variant="outline" className="gap-2">
                                <Printer className="h-4 w-4" /> Print Receipt
                            </Button>
                            <Button onClick={() => setLastTransaction(null)} className="gap-2">
                                Next Order <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
