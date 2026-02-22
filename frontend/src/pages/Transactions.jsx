import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import {
    Search,
    Eye,
    FileText,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Download,
    Printer
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/format';

export default function Transactions() {
    const [page, setPage] = useState(1);
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [selectedTx, setSelectedTx] = useState(null);

    const { data, isLoading } = useQuery({
        queryKey: ['transactions', page, from, to],
        queryFn: async () => {
            const res = await api.get(`/transactions?page=${page}&from=${from}&to=${to}`);
            return res.data;
        },
    });

    if (isLoading) return <div>Loading Transactions...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Transactions</h1>
                    <p className="text-slate-500">View and manage history</p>
                </div>
                <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" /> Export CSV
                </Button>
            </div>

            <Card>
                <CardHeader className="border-b dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <Input
                            label="From"
                            type="date"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                        />
                        <Input
                            label="To"
                            type="date"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                        />
                        <Button variant="secondary" onClick={() => { setFrom(''); setTo(''); }}>Clear</Button>
                    </div>
                </CardHeader>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                <th className="p-4 font-semibold text-sm">Invoice No</th>
                                <th className="p-4 font-semibold text-sm">Date</th>
                                <th className="p-4 font-semibold text-sm">Cashier</th>
                                <th className="p-4 font-semibold text-sm">Method</th>
                                <th className="p-4 font-semibold text-sm">Amount</th>
                                <th className="p-4 font-semibold text-sm text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-slate-800">
                            {data.data.map((tx) => (
                                <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="p-4">
                                        <p className="font-bold text-sm">{tx.invoice_no}</p>
                                    </td>
                                    <td className="p-4">
                                        <p className="text-sm">{formatDate(tx.created_at)}</p>
                                    </td>
                                    <td className="p-4">
                                        <p className="text-sm">{tx.user_name}</p>
                                    </td>
                                    <td className="p-4">
                                        <Badge variant="secondary">{tx.payment_method}</Badge>
                                    </td>
                                    <td className="p-4">
                                        <p className="font-bold">{formatCurrency(tx.payable_amount)}</p>
                                    </td>
                                    <td className="p-4 text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedTx(tx)}
                                            className="gap-2"
                                        >
                                            <Eye className="h-4 w-4" /> View Details
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t dark:border-slate-800 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        Showing {data.meta.from} to {data.meta.to} of {data.meta.total} transactions
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === data.meta.last_page}
                            onClick={() => setPage(p => p + 1)}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Transaction Detail Modal */}
            <Modal
                isOpen={!!selectedTx}
                onClose={() => setSelectedTx(null)}
                title={`Transaction Details - ${selectedTx?.invoice_no}`}
                size="lg"
            >
                {selectedTx && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-slate-500 uppercase text-[10px] font-bold">Customer Info</p>
                                <p className="font-bold">General Customer</p>
                                <p className="text-slate-500">Date: {formatDate(selectedTx.created_at)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-slate-500 uppercase text-[10px] font-bold">Payment Method</p>
                                <p className="font-bold">{selectedTx.payment_method}</p>
                                <Badge variant="success">{selectedTx.payment_status}</Badge>
                            </div>
                        </div>

                        <div className="border rounded-xl overflow-hidden dark:border-slate-800">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-bold text-slate-500">
                                    <tr>
                                        <th className="p-3">Item</th>
                                        <th className="p-3 text-center">Qty</th>
                                        <th className="p-3 text-right">Price</th>
                                        <th className="p-3 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y dark:divide-slate-800">
                                    {selectedTx.items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="p-3">{item.name}</td>
                                            <td className="p-3 text-center">{item.quantity}</td>
                                            <td className="p-3 text-right">{formatCurrency(item.price)}</td>
                                            <td className="p-3 text-right font-bold">{formatCurrency(item.subtotal)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-slate-50/50 dark:bg-slate-800/20 font-bold">
                                    <tr>
                                        <td colSpan="3" className="p-3 text-right">Subtotal</td>
                                        <td className="p-3 text-right">{formatCurrency(selectedTx.total_amount)}</td>
                                    </tr>
                                    {selectedTx.discount_amount > 0 && (
                                        <tr className="text-red-500">
                                            <td colSpan="3" className="p-3 text-right">Discount</td>
                                            <td className="p-3 text-right">-{formatCurrency(selectedTx.discount_amount)}</td>
                                        </tr>
                                    )}
                                    <tr className="text-lg text-primary-600">
                                        <td colSpan="3" className="p-3 text-right">Total Payable</td>
                                        <td className="p-3 text-right">{formatCurrency(selectedTx.payable_amount)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <div className="flex justify-end pt-4 border-t dark:border-slate-800">
                            <Button onClick={() => window.print()} className="gap-2">
                                <Printer className="h-4 w-4" /> Print Invoice
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
