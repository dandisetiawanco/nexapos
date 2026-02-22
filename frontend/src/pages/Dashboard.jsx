import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import {
    TrendingUp,
    ShoppingCart,
    Package,
    AlertTriangle,
    ArrowRight,
    User as UserIcon
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Badge } from '../components/ui/Badge';
import { formatCurrency } from '../utils/format';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function Dashboard() {
    const { data, isLoading } = useQuery({
        queryKey: ['dashboard'],
        queryFn: async () => {
            const res = await api.get('/dashboard');
            return res.data;
        },
    });

    if (isLoading) return <div>Loading Dashboard...</div>;

    const stats = [
        {
            label: 'Sales Today',
            value: formatCurrency(data.stats.sales_today),
            icon: TrendingUp,
            color: 'text-emerald-500',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20'
        },
        {
            label: 'Transactions',
            value: data.stats.transactions_today,
            icon: ShoppingCart,
            color: 'text-primary-500',
            bg: 'bg-primary-50 dark:bg-primary-900/20'
        },
        {
            label: 'Total Products',
            value: data.stats.total_products,
            icon: Package,
            color: 'text-indigo-500',
            bg: 'bg-indigo-50 dark:bg-indigo-900/20'
        },
        {
            label: 'Low Stock',
            value: data.stats.low_stock,
            icon: AlertTriangle,
            color: 'text-amber-500',
            bg: 'bg-amber-50 dark:bg-amber-900/20'
        },
    ];

    const chartData = {
        labels: data.sales_chart.map(s => s.date),
        datasets: [
            {
                label: 'Daily Sales',
                data: data.sales_chart.map(s => s.total),
                fill: true,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
        },
        scales: {
            y: { beginAtZero: true },
        },
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-slate-500">Welcome to your store overview</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.label}>
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                <p className="text-2xl font-bold">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sales Chart */}
                <Card className="lg:col-span-2">
                    <CardHeader title="Sales Over Period" subtitle="Last 7 days performance" />
                    <CardContent className="h-[300px]">
                        <Line data={chartData} options={chartOptions} />
                    </CardContent>
                </Card>

                {/* Recent Transactions */}
                <Card>
                    <CardHeader title="Recent Transactions" subtitle="Latest store activities" />
                    <CardContent className="space-y-4">
                        {data.recent_transactions.map((tx) => (
                            <div key={tx.id} className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <UserIcon className="h-5 w-5 text-slate-500" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-sm font-bold truncate">{tx.invoice_no}</p>
                                    <p className="text-xs text-slate-500 capitalize">{tx.payment_method}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold">{formatCurrency(tx.payable_amount)}</p>
                                    <p className="text-xs text-slate-500">{new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        ))}
                        <button className="w-full flex items-center justify-center gap-2 py-2 text-sm text-primary-600 font-medium hover:text-primary-700">
                            View All Transactions <ArrowRight className="h-4 w-4" />
                        </button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
