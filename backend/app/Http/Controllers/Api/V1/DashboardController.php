<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today();
        
        $salesToday = Transaction::whereDate('created_at', $today)->sum('payable_amount');
        $transactionsToday = Transaction::whereDate('created_at', $today)->count();
        $totalProducts = Product::count();
        $lowStock = Product::where('stock', '<=', DB::raw('min_stock'))->count();

        $recentTransactions = Transaction::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // 7 days sales chart
        $salesChart = Transaction::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(payable_amount) as total')
            )
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        return response()->json([
            'stats' => [
                'sales_today' => (float) $salesToday,
                'transactions_today' => $transactionsToday,
                'total_products' => $totalProducts,
                'low_stock' => $lowStock,
            ],
            'recent_transactions' => $recentTransactions,
            'sales_chart' => $salesChart
        ]);
    }
}
