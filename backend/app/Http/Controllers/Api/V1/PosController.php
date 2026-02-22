<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PosController extends Controller
{
    public function checkout(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'discount_amount' => 'required|numeric|min:0',
            'payment_method' => 'required|string',
        ]);

        return DB::transaction(function () use ($request) {
            $totalAmount = 0;
            $items = [];

            foreach ($request->items as $itemData) {
                $product = Product::lockForUpdate()->find($itemData['product_id']);
                
                if ($product->stock < $itemData['quantity']) {
                    throw new \Exception("Insufficient stock for product: {$product->name}");
                }

                $subtotal = $product->price * $itemData['quantity'];
                $totalAmount += $subtotal;

                $items[] = [
                    'product_id' => $product->id,
                    'name' => $product->name,
                    'price' => $product->price,
                    'quantity' => $itemData['quantity'],
                    'subtotal' => $subtotal,
                ];

                // Decrease stock
                $product->decrement('stock', $itemData['quantity']);
            }

            $payableAmount = $totalAmount - $request->discount_amount;

            $transaction = Transaction::create([
                'invoice_no' => 'INV-' . strtoupper(Str::random(10)),
                'user_id' => $request->user()->id,
                'total_amount' => $totalAmount,
                'discount_amount' => $request->discount_amount,
                'payable_amount' => $payableAmount,
                'payment_method' => $request->payment_method,
            ]);

            foreach ($items as $item) {
                $transaction->items()->create($item);
            }

            return response()->json([
                'message' => 'Checkout successful',
                'data' => $transaction->load(['items', 'user'])
            ]);
        });
    }
}
