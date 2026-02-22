import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Package,
    Image as ImageIcon,
    MoreVertical,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../utils/format';

export default function Products() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const queryClient = useQueryClient();

    // Fetch Products
    const { data, isLoading } = useQuery({
        queryKey: ['products', page, search],
        queryFn: async () => {
            const res = await api.get(`/products?page=${page}&search=${search}`);
            return res.data;
        },
    });

    // Fetch Categories for dropdown
    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await api.get('/categories');
            return res.data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/products/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
            toast.success('Product deleted');
        },
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        try {
            if (editingProduct) {
                // Laravel PUT with file requires _method: PUT
                formData.append('_method', 'PUT');
                await api.post(`/products/${editingProduct.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Product updated');
            } else {
                await api.post('/products', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Product created');
            }
            setIsModalOpen(false);
            setEditingProduct(null);
            queryClient.invalidateQueries(['products']);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong');
        }
    };

    if (isLoading) return <div>Loading Products...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Products</h1>
                    <p className="text-slate-500">Manage your product catalog</p>
                </div>
                <Button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} className="gap-2">
                    <Plus className="h-5 w-5" /> Add Product
                </Button>
            </div>

            <Card>
                <CardHeader className="border-b dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search products by name or SKU..."
                                className="w-full pl-10 pr-4 h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                <th className="p-4 font-semibold text-sm">Product</th>
                                <th className="p-4 font-semibold text-sm">Category</th>
                                <th className="p-4 font-semibold text-sm">Price/Cost</th>
                                <th className="p-4 font-semibold text-sm">Stock</th>
                                <th className="p-4 font-semibold text-sm">Status</th>
                                <th className="p-4 font-semibold text-sm text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-slate-800">
                            {data.data.map((product) => (
                                <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border dark:border-slate-700">
                                                {product.image_url ? (
                                                    <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <ImageIcon className="h-6 w-6 text-slate-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{product.name}</p>
                                                <p className="text-xs text-slate-500">{product.sku}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <Badge variant="secondary">{product.category_name}</Badge>
                                    </td>
                                    <td className="p-4">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(product.price)}</p>
                                        <p className="text-xs text-slate-500">Cost: {formatCurrency(product.cost)}</p>
                                    </td>
                                    <td className="p-4">
                                        <p className={`text-sm font-bold ${product.stock <= product.min_stock ? 'text-red-500' : ''}`}>
                                            {product.stock}
                                        </p>
                                        <p className="text-xs text-slate-500">Min: {product.min_stock}</p>
                                    </td>
                                    <td className="p-4">
                                        <Badge variant={product.is_active ? 'success' : 'danger'}>
                                            {product.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            onClick={() => window.confirm('Are you sure?') && deleteMutation.mutate(product.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t dark:border-slate-800 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        Showing {data.meta.from} to {data.meta.to} of {data.meta.total} products
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

            {/* Product Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingProduct ? 'Edit Product' : 'Add New Product'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Product Name"
                            name="name"
                            defaultValue={editingProduct?.name}
                            required
                        />
                        <Input
                            label="SKU"
                            name="sku"
                            defaultValue={editingProduct?.sku}
                            required
                        />
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                            <select
                                name="category_id"
                                className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-950"
                                defaultValue={editingProduct?.category_id}
                                required
                            >
                                <option value="">Select Category</option>
                                {categories?.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <Input
                            label="Sale Price"
                            name="price"
                            type="number"
                            defaultValue={editingProduct?.price}
                            required
                        />
                        <Input
                            label="Cost Price"
                            name="cost"
                            type="number"
                            defaultValue={editingProduct?.cost}
                            required
                        />
                        <Input
                            label="Stock"
                            name="stock"
                            type="number"
                            defaultValue={editingProduct?.stock}
                            required
                        />
                        <Input
                            label="Min Stock Alert"
                            name="min_stock"
                            type="number"
                            defaultValue={editingProduct?.min_stock}
                            required
                        />
                        <Input
                            label="Product Image"
                            name="image"
                            type="file"
                            accept="image/*"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                        <textarea
                            name="description"
                            className="w-full rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950"
                            rows="3"
                            defaultValue={editingProduct?.description}
                        ></textarea>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="is_active"
                            id="is_active"
                            value="1"
                            defaultChecked={editingProduct ? editingProduct.is_active : true}
                        />
                        <label htmlFor="is_active" className="text-sm">Active product</label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-800">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Save Product</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
