<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'category_name' => $this->category->name ?? null,
            'name' => $this->name,
            'sku' => $this->sku,
            'price' => (float) $this->price,
            'cost' => (float) $this->cost,
            'stock' => $this->stock,
            'min_stock' => $this->min_stock,
            'image_url' => $this->image ? asset('storage/' . $this->image) : null,
            'description' => $this->description,
            'is_active' => (bool) $this->is_active,
            'created_at' => $this->created_at,
        ];
    }
}
