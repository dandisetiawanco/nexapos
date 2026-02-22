# NEXA POS - Premium Store Management System

NEXA POS is a modern, fast, and feature-rich Point of Sale application built with Laravel 12 and React. It features a premium UI, dark mode support, and comprehensive management tools for small to medium businesses.

## 🚀 Tech Stack

- **Backend**: Laravel 12 (REST API), MySQL (configured for SQLite by default for easy setup), Laravel Sanctum
- **Frontend**: React 18, Vite, TailwindCSS, React Router, TanStack Query, Lucide Icons
- **Design**: Modern, Premium, Dark Mode ready

## ✨ Features

- **🔐 Authentication**: Secure login/logout with role-based access (ADMIN, CASHIER).
- **📊 Dashboard**: Real-time sales stats, transaction tracking, and low stock alerts.
- **📦 Inventory**: Complete Product CRUD with SKU management, categories, and image uploads.
- **🛒 POS (Point of Sale)**:
  - Real-time product search & barcode scanning support.
  - Cart management (add/remove/update qty).
  - Discounting and multi-payment methods (Cash, Transfer, E-Wallet).
  - Automated invoice generation and stock deduction.
  - HTML Receipt printing.
- **📜 History**: Detailed transaction logs and filters.
- **⚙️ Settings**: Customizable company name, currency, and address.
- **🌓 UI/UX**: Professional layout, dark mode, toast notifications, and smooth animations.

## 🛠️ Installation & Setup

### Prerequisites
- PHP 8.2+
- Node.js 18+
- Composer
- SQLite (or MySQL)

### 1. Clone & Setup Backend
```bash
cd backend
composer install
cp .env.example .env
touch database/database.sqlite
php artisan migrate:fresh --seed
php artisan storage:link
php artisan serve
```

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Access
Open your browser and navigate to the frontend URL (usually `http://localhost:5173`).
The API will be running at `http://localhost:8000/api/v1`.

### 🔑 Demo Accounts
- **Admin**: `admin@nexapos.com` / `password`
- **Cashier**: `cashier@nexapos.com` / `password`

## 📁 Project Structure
```text
/backend          # Laravel 12 API
/frontend         # React + Vite + Tailwind
```

## 📝 License
MIT
