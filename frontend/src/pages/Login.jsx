import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Package, ArrowRight } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            toast.success('Login Successful!');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
            <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

            <div className="max-w-md w-full relative">
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <div className="p-8 pb-10 text-center space-y-4">
                        <div className="inline-flex items-center justify-center p-4 bg-primary-600 rounded-2xl shadow-xl shadow-primary-500/20 mb-2">
                            <Package className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome Back</h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-2">Login to manage your store</p>
                        </div>
                    </div>

                    <div className="px-8 pb-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Input
                                label="Email Address"
                                placeholder="admin@nexapos.com"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <Input
                                label="Password"
                                placeholder="••••••••"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                                    <span className="text-sm text-slate-500 group-hover:text-slate-700 transition-colors">Remember me</span>
                                </label>
                                <a href="#" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Forgot password?</a>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 text-base"
                                disabled={loading}
                            >
                                {loading ? 'Logging in...' : (
                                    <>
                                        Sign In
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="mt-8 pt-8 border-t dark:border-slate-800 text-center">
                            <p className="text-sm text-slate-500">
                                Demo Accounts:
                                <br />
                                <span className="font-bold">admin@nexapos.com</span> / password
                                <br />
                                <span className="font-bold">cashier@nexapos.com</span> / password
                            </p>
                        </div>
                    </div>
                </div>

                <p className="text-center mt-8 text-sm text-slate-500">
                    &copy; {new Date().getFullYear()} NEXA POS. Premium Store Management.
                </p>
            </div>
        </div>
    );
}
