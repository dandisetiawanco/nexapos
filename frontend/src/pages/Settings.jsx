import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'react-hot-toast';
import { Settings as SettingsIcon, Save, User, Building, Shield } from 'lucide-react';

export default function Settings() {
    const queryClient = useQueryClient();

    const { data: settings, isLoading } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const res = await api.get('/settings');
            return res.data;
        },
    });

    const mutation = useMutation({
        mutationFn: (data) => api.put('/settings', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['settings']);
            toast.success('Settings updated successfully');
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        mutation.mutate(Object.fromEntries(formData));
    };

    if (isLoading) return <div>Loading Settings...</div>;

    return (
        <div className="max-w-4xl space-y-8">
            <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-slate-500">Global application configurations</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <aside className="space-y-1">
                    <Button variant="primary" className="w-full justify-start gap-3 h-11">
                        <Building className="h-4 w-4" /> Company Info
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-3 h-11">
                        <User className="h-4 w-4" /> Account
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-3 h-11">
                        <Shield className="h-4 w-4" /> Security
                    </Button>
                </aside>

                <div className="md:col-span-3">
                    <Card>
                        <CardHeader
                            title="Company Details"
                            subtitle="This information will appear on receipts"
                        />
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <Input
                                        label="Company Name"
                                        name="company_name"
                                        defaultValue={settings?.company_name}
                                        required
                                    />
                                    <Input
                                        label="Currency"
                                        name="currency"
                                        defaultValue={settings?.currency}
                                        placeholder="e.g. IDR, USD"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
                                    <textarea
                                        name="address"
                                        className="w-full rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950"
                                        rows="3"
                                        defaultValue={settings?.address}
                                    ></textarea>
                                </div>

                                <div className="flex justify-end pt-4 border-t dark:border-slate-800">
                                    <Button type="submit" className="gap-2" disabled={mutation.isPending}>
                                        {mutation.isPending ? 'Saving...' : (
                                            <>
                                                <Save className="h-4 w-4" /> Save Changes
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
