<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'invoice_no' => $this->invoice_no,
            'user_name' => $this->user->name ?? 'System',
            'total_amount' => (float) $this->total_amount,
            'discount_amount' => (float) $this->discount_amount,
            'payable_amount' => (float) $this->payable_amount,
            'payment_method' => $this->payment_method,
            'payment_status' => $this->payment_status,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'items' => $this->items->map(fn($item) => [
                'id' => $item->id,
                'name' => $item->name,
                'price' => (float) $item->price,
                'quantity' => $item->quantity,
                'subtotal' => (float) $item->subtotal,
            ]),
        ];
    }
}
