import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { LogIn, Loader2, User, ShieldCheck, ArrowLeft, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [roleMode, setRoleMode] = useState<'selection' | 'consumer' | 'admin'>('selection');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login({ email: email.trim().toLowerCase(), password });
      toast.success('Successfully logged in!');
      
      // The user object is updated in AuthContext, we can check role from there or just navigate
      // For simplicity, we'll wait a bit or just navigate based on roleMode
      if (roleMode === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  if (roleMode === 'selection') {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-128px)] px-4 py-12">
        <div className="w-full max-w-4xl space-y-8 relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute -top-12 right-0 text-slate-400 hover:text-slate-900 bg-white shadow-sm border"
            onClick={() => navigate('/')}
          >
            <X className="h-5 w-5" />
          </Button>
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">SORECO-1 Portal</h1>
            <p className="text-slate-500">Choose your portal to continue</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card 
              className="flex flex-col h-full group cursor-pointer hover:border-primary/50 transition-all hover:shadow-xl border-slate-100 overflow-hidden"
              onClick={() => setRoleMode('consumer')}
            >
              <div className="h-2 bg-primary w-full" />
              <CardHeader className="text-center pt-8">
                <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Consumer Portal</CardTitle>
                <CardDescription>
                  Access your billing, service requests, and account details
                </CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto pb-8">
                <Button className="w-full" variant="outline">Enter Consumer Portal</Button>
              </CardFooter>
            </Card>

            <Card 
              className="flex flex-col h-full group cursor-pointer hover:border-slate-900/50 transition-all hover:shadow-xl border-slate-100 overflow-hidden"
              onClick={() => setRoleMode('admin')}
            >
              <div className="h-2 bg-slate-900 w-full" />
              <CardHeader className="text-center pt-8">
                <div className="mx-auto bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="h-8 w-8 text-slate-900" />
                </div>
                <CardTitle className="text-2xl">Admin Portal</CardTitle>
                <CardDescription>
                  Manage service requests, announcements, and system settings
                </CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto pb-8">
                <Button className="w-full" variant="outline">Enter Admin Portal</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-128px)] px-4 py-12">
      <Card className="w-full max-w-md shadow-xl border-slate-100">
        <CardHeader className="space-y-1 text-center relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute left-0 top-0 text-slate-400"
            onClick={() => setRoleMode('selection')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-0 top-0 text-slate-400 hover:text-red-500"
            onClick={() => navigate('/')}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {roleMode === 'admin' ? 'Admin Login' : 'Consumer Login'}
          </CardTitle>
          <CardDescription>
            {roleMode === 'admin' 
              ? (
                <div className="space-y-1">
                  <p>Authorized personnel only</p>
                  <div className="mt-2 p-2 bg-slate-100 rounded text-[10px] font-mono text-slate-600">
                    Demo Admin: admin@gov.ph / admin123
                  </div>
                </div>
              )
              : (
                <div className="space-y-1">
                  <p>Enter your credentials to access your account</p>
                  <div className="mt-2 p-2 bg-slate-100 rounded text-[10px] font-mono text-slate-600">
                    Demo Consumer: consumer@gov.ph / consumer123
                  </div>
                </div>
              )}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="#" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="focus-visible:ring-primary"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className={cn(
                "w-full text-white",
                roleMode === 'admin' ? "bg-slate-900 hover:bg-slate-800" : "bg-primary hover:bg-primary/90"
              )} 
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              Sign In as {roleMode === 'admin' ? 'Admin' : 'Consumer'}
            </Button>

            {roleMode === 'consumer' && (
              <div className="text-center text-sm text-slate-500">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary font-medium hover:underline">
                  Register here
                </Link>
              </div>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
