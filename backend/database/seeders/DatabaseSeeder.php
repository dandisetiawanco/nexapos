<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Users
        User::create([
            'name' => 'Admin Nexa',
            'email' => 'admin@nexapos.com',
            'password' => Hash::make('password'),
            'role' => 'ADMIN',
        ]);

        User::create([
            'name' => 'Cashier Nexa',
            'email' => 'cashier@nexapos.com',
            'password' => Hash::make('password'),
            'role' => 'CASHIER',
        ]);

        // Categories
        $electronics = Category::create(['name' => 'Electronics', 'slug' => 'electronics']);
        $food = Category::create(['name' => 'Food', 'slug' => 'food']);
        $beverages = Category::create(['name' => 'Beverages', 'slug' => 'beverages']);

        // Products
        Product::create([
            'category_id' => $electronics->id,
            'name' => 'Keyboard Mechanical',
            'sku' => 'E-KB-01',
            'price' => 500000,
            'cost' => 350000,
            'stock' => 20,
            'min_stock' => 5,
            'description' => 'Premium mechanical keyboard',
        ]);

        Product::create([
            'category_id' => $food->id,
            'name' => 'Original Burger',
            'sku' => 'F-BG-01',
            'price' => 25000,
            'cost' => 15000,
            'stock' => 50,
            'min_stock' => 10,
            'description' => 'Delicious classic burger',
        ]);

        Product::create([
            'category_id' => $beverages->id,
            'name' => 'Iced Coffee',
            'sku' => 'B-CF-01',
            'price' => 15000,
            'cost' => 5000,
            'stock' => 100,
            'min_stock' => 20,
            'description' => 'Fresh iced coffee',
        ]);

        // Settings
        Setting::create(['key' => 'company_name', 'value' => 'NEXA POS']);
        Setting::create(['key' => 'currency', 'value' => 'IDR']);
        Setting::create(['key' => 'address', 'value' => 'Jl. Digital No. 123']);
    }
}
